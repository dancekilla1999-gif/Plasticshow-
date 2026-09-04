#!/usr/bin/env python3
"""Remove the solid panel from the middle of the ornate oval frame and export a
print-ready STL.

The source OBJ is a watertight sculpt in which the oval opening is closed by a
flat panel (the "mirror") roughly 0.012 model units thick, sitting at
z = 0.364 .. 0.376.  For 3D printing we want the middle fully open, so the
panel has to go while the frame itself stays untouched.

Method
------
1. Slice the mesh horizontally at many z levels *outside* the panel band and,
   for every slice, take the empty region that contains the centre of the oval.
2. Intersect those regions.  The result is the largest 2D shape that is empty
   at every height where the frame alone defines the profile - i.e. exactly the
   oval opening, inscribed in the frame's innermost lip.
3. Extrude that shape through the whole model and boolean-subtract it.  A small
   outward offset keeps the cut from running tangent to the frame surface,
   which would otherwise leave zero-thickness slivers.
4. Scale to the print size, weld vertices at 1 um so the float32 STL round-trip
   stays manifold, and export.

Requires: trimesh, manifold3d, shapely, numpy.

    python3 scripts/open-frame-center.py input.obj models/frame-openwork-200mm.stl
"""

import sys

import numpy as np
import trimesh
from shapely.geometry import Point, box
from shapely.ops import unary_union

# z band occupied by the panel that has to be removed, in source model units
PANEL_Z = (0.3625, 0.3785)
# a point that is inside the oval opening at every height
OPENING_SEED = Point(-0.004, 0.04)
# how far the cut reaches past the frame's inner lip, in source model units
CUT_OFFSET = 0.0015
# target height of the printed frame along Y, in millimetres
TARGET_HEIGHT_MM = 200.0


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


def open_center(mesh):
    profile = opening_profile(mesh).buffer(CUT_OFFSET, join_style=1, quad_segs=8)
    profile = profile.simplify(0.0003)
    height = mesh.bounds[1, 2] - mesh.bounds[0, 2]
    cutter = trimesh.creation.extrude_polygon(profile, height=height + 0.2)
    cutter.apply_translation([0, 0, mesh.bounds[0, 2] - 0.1])
    return trimesh.boolean.difference([mesh, cutter], engine="manifold")


def prepare_for_print(mesh):
    mesh.apply_scale(TARGET_HEIGHT_MM / mesh.extents[1])
    # weld at 1 um: the boolean leaves edges shorter than float32 can resolve,
    # and welding here keeps the exported STL manifold when it is read back
    mesh.merge_vertices(digits_vertex=3)
    faces = mesh.faces
    mesh.update_faces(
        (faces[:, 0] != faces[:, 1])
        & (faces[:, 1] != faces[:, 2])
        & (faces[:, 0] != faces[:, 2])
    )
    mesh.remove_unreferenced_vertices()
    mesh.fix_normals()
    # centred on the bed, resting at z = 0
    mesh.apply_translation(
        [
            -(mesh.bounds[0, 0] + mesh.bounds[1, 0]) / 2,
            -(mesh.bounds[0, 1] + mesh.bounds[1, 1]) / 2,
            -mesh.bounds[0, 2],
        ]
    )
    return mesh


def main(src_path, out_path):
    source = trimesh.load(src_path, process=False)
    result = prepare_for_print(open_center(source))

    edges, counts = np.unique(result.edges_sorted, axis=0, return_counts=True)
    print(f"faces      {len(result.faces)}")
    print(f"extents mm {result.extents.round(2)}")
    print(f"volume cm3 {result.volume / 1000:.2f}")
    print(f"open edges {int((counts == 1).sum())}")
    print(f"non-manif  {int((counts > 2).sum())}")
    print(f"watertight {result.is_watertight}")

    result.export(out_path)
    print(f"wrote      {out_path}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
