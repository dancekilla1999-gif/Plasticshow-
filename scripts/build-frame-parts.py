#!/usr/bin/env python3
"""Turn the ornate oval frame sculpt into two glue-together parts for 3D printing.

The source OBJ is a watertight sculpt in which the oval opening is closed by a
flat panel (the "mirror") roughly 0.012 model units thick, sitting at
z = 0.364 .. 0.376.  For printing we want the middle fully open, the surface
smooth at a size where the original tessellation would show facets, and the
whole thing split so each half fits on a printer bed.

Pipeline
--------
1. **Measure the opening.**  Slice the mesh at many z levels *outside* the
   panel band and, for every slice, take the empty region that contains the
   centre of the oval.  Intersect those regions: the result is the largest 2D
   shape that is empty at every height where the frame alone defines the
   profile - i.e. exactly the oval opening, inscribed in the frame's innermost
   lip.
2. **Smooth.**  One round of Loop subdivision.  At 380 mm the source triangles
   span ~1.5 mm and bend a median 6.9 degrees against their neighbours, which
   reads as faceting; subdivision takes that to ~0.75 mm and ~2 degrees while
   holding the volume to within 0.06 %.  It runs before the boolean so that the
   only sliver triangles in the result are the few the boolean itself makes,
   along the rim of the opening.
3. **Open the middle.**  Extrude the measured profile through the model and
   boolean-subtract it.  A small outward offset keeps the cut off the frame
   surface, which would otherwise leave zero-thickness slivers; subdivision
   shrinks the sculpt by 0.06 %, which only widens the opening, so a profile
   measured before it stays valid after.
4. **Split.**  One flat cut across the long axis.  The height is chosen so the
   cut crosses the frame in exactly two places, each with the largest possible
   inscribed circle, and so both halves fit a 220 x 220 bed.
5. **Key the joint.**  A diamond-section stud on each side of the upper half,
   a matching socket in the lower half.  Every face of a diamond prism stands
   at 45 degrees to the bed, so both the stud and the socket print without
   support and without bridging - which a round peg lying on its side does not.

Requires: trimesh, manifold3d, shapely, numpy.

    python3 scripts/build-frame-parts.py source.obj models/
"""

import os
import sys

import numpy as np
import trimesh
from shapely.geometry import Point, Polygon, box
from shapely.ops import polylabel, unary_union
from trimesh.intersections import slice_mesh_plane

# --- opening the middle, in source model units -----------------------------
# z band occupied by the panel that has to be removed
PANEL_Z = (0.3625, 0.3785)
# a point that is inside the oval opening at every height
OPENING_SEED = Point(-0.004, 0.04)
# how far the cut reaches past the frame's inner lip
CUT_OFFSET = 0.0015

# --- print geometry, in millimetres ----------------------------------------
# length of the finished frame once the two parts are glued
TARGET_LENGTH_MM = 380.0
# where to cut, as a fraction of the length measured from the centre. Found by
# scanning the section area: at this height the cut crosses the frame in two
# places with an inscribed radius of 9.1 mm, and leaves parts of 201 and 179 mm
CUT_FRACTION = 11.0 / 380.0
# half-diagonal of the diamond stud and of its socket; the 0.25 mm difference
# is the assembly clearance
STUD_HALF_DIAGONAL = 6.0
SOCKET_HALF_DIAGONAL = 6.25
# how far the stud stands out, and how deep the socket is bored
STUD_LENGTH = 5.0
SOCKET_DEPTH = 5.8
# a stud needs this much wall around it and this much material behind it
MIN_STUD_WALL = 2.5
MIN_STUD_ANCHOR = 8.0


def opening_profile(mesh):
    """The 2D region that is empty at every height outside the panel band."""
    outside = box(*(mesh.bounds[0, :2] - 0.1), *(mesh.bounds[1, :2] + 0.1))
    profile = None
    for z in np.arange(mesh.bounds[0, 2] + 0.001, mesh.bounds[1, 2] - 0.001, 0.0015):
        if PANEL_Z[0] < z < PANEL_Z[1]:
            continue
        section = mesh.section(plane_origin=[0, 0, float(z)], plane_normal=[0, 0, 1])
        if section is None:
            continue
        planar, _ = section.to_2D(to_2D=np.eye(4))
        solid = unary_union([p.buffer(0) for p in planar.polygons_full])
        empty = outside.difference(solid)
        parts = list(empty.geoms) if empty.geom_type == "MultiPolygon" else [empty]
        here = next((p for p in parts if p.contains(OPENING_SEED)), None)
        if here is None:
            continue
        profile = here if profile is None else profile.intersection(here)
    if profile is None:
        raise RuntimeError("no opening found around the seed point")
    if profile.geom_type == "MultiPolygon":
        profile = max(profile.geoms, key=lambda p: p.area)
    return profile


def open_center(mesh, profile):
    profile = profile.buffer(CUT_OFFSET, join_style=1, quad_segs=8)
    height = mesh.bounds[1, 2] - mesh.bounds[0, 2]
    cutter = trimesh.creation.extrude_polygon(profile.simplify(0.0003), height + 0.2)
    cutter.apply_translation([0, 0, mesh.bounds[0, 2] - 0.1])
    return trimesh.boolean.difference([mesh, cutter], engine="manifold")


def to_print_scale(mesh):
    mesh.apply_scale(TARGET_LENGTH_MM / mesh.extents[1])
    mesh.apply_translation(
        [
            -(mesh.bounds[0, 0] + mesh.bounds[1, 0]) / 2,
            -(mesh.bounds[0, 1] + mesh.bounds[1, 1]) / 2,
            -mesh.bounds[0, 2],
        ]
    )
    return mesh


def cut_section(mesh, y_cut):
    """The faces the cut passes through, as polygons in (x, z)."""
    # world (x, y, z) -> plane-local (x, z, y_cut - y), so the cut lies in XY
    to_2d = np.array(
        [[1, 0, 0, 0], [0, 0, 1, 0], [0, -1, 0, y_cut], [0, 0, 0, 1]], dtype=float
    )
    section = mesh.section(plane_origin=[0, y_cut, 0], plane_normal=[0, 1, 0])
    planar, _ = section.to_2D(to_2D=to_2d)
    merged = unary_union([p.buffer(0) for p in planar.polygons_full])
    pieces = list(merged.geoms) if merged.geom_type == "MultiPolygon" else [merged]
    return sorted(pieces, key=lambda p: -p.area)


def inscribed_radius(polygon, limit=25.0):
    r = 0.1
    while r < limit and polygon.buffer(-r).area > 0:
        r += 0.1
    return r - 0.1


def stud_sites(mesh, y_cut):
    """One well-anchored point per piece of the cut face."""
    sites = []
    for piece in cut_section(mesh, y_cut):
        radius = inscribed_radius(piece)
        if radius < STUD_HALF_DIAGONAL + MIN_STUD_WALL:
            continue
        point = polylabel(piece, tolerance=0.05)
        origin = np.array([[point.x, y_cut, point.y]])
        depth = []
        for direction in ([[0, 1.0, 0]], [[0, -1.0, 0]]):
            hits, _, _ = mesh.ray.intersects_location(origin, np.array(direction))
            depth.append(np.abs(hits[:, 1] - y_cut).min())
        if min(depth) < MIN_STUD_ANCHOR:
            continue
        sites.append((point.x, point.y, radius, min(depth)))
    if len(sites) < 2:
        raise RuntimeError(f"only {len(sites)} usable stud sites on the cut face")
    return sites


def diamond(x, z, y_from, y_to, half_diagonal):
    """Prism with a 45-degree diamond section in XZ, running along Y."""
    profile = Polygon(
        [(half_diagonal, 0), (0, half_diagonal), (-half_diagonal, 0), (0, -half_diagonal)]
    )
    prism = trimesh.creation.extrude_polygon(profile, height=y_to - y_from)
    prism.apply_transform(trimesh.geometry.align_vectors([0, 0, 1], [0, 1, 0]))
    b = prism.bounds
    prism.apply_translation(
        [x - (b[0, 0] + b[1, 0]) / 2, y_from - b[0, 1], z - (b[0, 2] + b[1, 2]) / 2]
    )
    return prism


def split(mesh, y_cut, sites):
    upper = slice_mesh_plane(mesh, plane_normal=[0, 1, 0], plane_origin=[0, y_cut, 0], cap=True)
    lower = slice_mesh_plane(mesh, plane_normal=[0, -1, 0], plane_origin=[0, y_cut, 0], cap=True)
    studs = [
        diamond(x, z, y_cut - STUD_LENGTH, y_cut + 6.0, STUD_HALF_DIAGONAL)
        for x, z, _, _ in sites
    ]
    sockets = [
        diamond(x, z, y_cut - SOCKET_DEPTH, y_cut + 1.0, SOCKET_HALF_DIAGONAL)
        for x, z, _, _ in sites
    ]
    upper = trimesh.boolean.union([upper] + studs, engine="manifold")
    lower = trimesh.boolean.difference([lower] + sockets, engine="manifold")
    return lower, upper


def finish(mesh, path):
    """Weld, drop degenerates, sit the part flat on the bed and write it out."""
    mesh = mesh.copy()
    # weld at 1 um: the booleans leave edges shorter than float32 can resolve,
    # and welding here keeps the exported STL manifold when it is read back
    mesh.merge_vertices(digits_vertex=3)
    f = mesh.faces
    mesh.update_faces((f[:, 0] != f[:, 1]) & (f[:, 1] != f[:, 2]) & (f[:, 0] != f[:, 2]))
    mesh.remove_unreferenced_vertices()
    mesh.fix_normals()
    mesh.apply_translation(
        [
            -(mesh.bounds[0, 0] + mesh.bounds[1, 0]) / 2,
            -(mesh.bounds[0, 1] + mesh.bounds[1, 1]) / 2,
            -mesh.bounds[0, 2],
        ]
    )
    mesh.export(path)
    return trimesh.load_mesh(path)


def check(mesh, tag):
    _, counts = np.unique(mesh.edges_sorted, axis=0, return_counts=True)
    open_edges = int((counts == 1).sum())
    non_manifold = int((counts > 2).sum())
    shells = len(mesh.split(only_watertight=False))
    print(
        f"{tag:16s} faces={len(mesh.faces):7d} {mesh.extents.round(2)} "
        f"vol={mesh.volume / 1000:6.1f}cm3 shells={shells} "
        f"open={open_edges} non-manifold={non_manifold} watertight={mesh.is_watertight}"
    )
    assert open_edges == 0 and non_manifold == 0 and shells == 1, tag
    return mesh


def main(src_path, out_dir):
    source = trimesh.load(src_path, process=False)
    print(f"source           faces={len(source.faces)}")

    profile = opening_profile(source)
    print(f"opening          area={profile.area:.4f} in source units")

    coarse = np.degrees(source.face_adjacency_angles)
    mesh = source.subdivide_loop(iterations=1)
    fine = np.degrees(mesh.face_adjacency_angles)
    print(
        f"subdivided       faces={len(mesh.faces)} "
        f"median dihedral {np.median(coarse):.2f} -> {np.median(fine):.2f} deg"
    )

    mesh = open_center(mesh, profile)
    print(f"centre opened    faces={len(mesh.faces)}")
    mesh = to_print_scale(mesh)
    clear = mesh.ray.intersects_any(
        np.array([[0.0, 20.0, mesh.bounds[1, 2] + 50], [30.0, -40.0, mesh.bounds[1, 2] + 50]]),
        np.array([[0, 0, -1.0], [0, 0, -1.0]]),
    )
    assert not clear.any(), "material left in the opening"
    y_cut = TARGET_LENGTH_MM * CUT_FRACTION
    sites = stud_sites(mesh, y_cut)
    for x, z, radius, anchor in sites:
        print(f"stud at x={x:7.2f} z={z:6.2f}  wall={radius - STUD_HALF_DIAGONAL:.1f}mm anchor={anchor:.1f}mm")

    lower, upper = split(mesh, y_cut, sites)
    part_a = check(finish(lower, os.path.join(out_dir, "frame-380mm-part-A-bottom.stl")), "part A bottom")
    part_b = check(finish(upper, os.path.join(out_dir, "frame-380mm-part-B-top.stl")), "part B top")

    # the parts must meet with no interference and add back up to the target
    overlap = trimesh.boolean.intersection([upper, lower], engine="manifold")
    assembled = trimesh.boolean.union([upper, lower], engine="manifold")
    # the two cut faces touch, so the intersection is a zero-volume contact patch
    overlap_volume = float(overlap.volume) if len(overlap.faces) else 0.0
    print(f"interference     {overlap_volume:.4f} mm3")
    print(f"glued length     {assembled.extents[1]:.3f} mm")
    assert overlap_volume < 1e-3, "parts interfere"
    assert abs(assembled.extents[1] - TARGET_LENGTH_MM) < 0.01
    assert abs(part_a.extents[1] + part_b.extents[1] - STUD_LENGTH - TARGET_LENGTH_MM) < 0.01


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
