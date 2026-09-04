#!/usr/bin/env python3
"""
Cobra X — параметрическая накладка-«паутина» на чашки AirPods Max.

Модель строится как поле расстояний (SDF) на воксельной сетке и вынимается
марширующими кубами, поэтому геометрия получается замкнутой, водонепроницаемой
и пригодной для печати без ремонта в сторонних программах.

Состав детали:
  * органическая сеть «оплавленных» жил на внешней поверхности чашки;
  * юбка по борту с посадочным пояском (rim) и внутренним буртиком-защёлкой;
  * окно сверху под дужку, колесо Digital Crown и кнопку шумоподавления.

Все размеры чашки вынесены в параметры: под свой экземпляр наушников
достаточно поменять --cup-w / --cup-h / --clearance и перегенерировать.
"""

from __future__ import annotations

import argparse
import math
import struct
import time

import numpy as np
from scipy import ndimage
from scipy.spatial import Delaunay
from skimage import measure


# --------------------------------------------------------------------------
# параметры чашки AirPods Max (по внешнему алюминиевому колпаку)
# --------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Генератор Cobra X для AirPods Max")

    # геометрия чашки
    p.add_argument("--cup-w", type=float, default=84.0, help="ширина чашки, мм (ось X)")
    p.add_argument("--cup-h", type=float, default=98.0, help="высота чашки, мм (ось Y)")
    p.add_argument("--cup-n", type=float, default=2.35, help="показатель суперэллипса контура")
    p.add_argument("--dome", type=float, default=9.0, help="выпуклость внешней поверхности, мм")
    p.add_argument("--cup-depth", type=float, default=16.0, help="глубина боковой стенки чашки, мм")

    # посадка
    p.add_argument("--clearance", type=float, default=0.35, help="зазор до чашки, мм")
    p.add_argument("--thickness", type=float, default=3.0, help="толщина пояска и юбки, мм")
    p.add_argument("--rib-core", type=float, default=1.05,
                   help="подъём оси жилы над чашкой, мм (больше — жила круглее)")
    p.add_argument("--skirt", type=float, default=7.0, help="глубина захода юбки на борт, мм")
    p.add_argument("--rim", type=float, default=3.0, help="высота сплошного пояска по краю, мм")
    p.add_argument("--lip", type=float, default=0.45, help="буртик-защёлка внутрь, мм (0 — без защёлки)")

    # окно под дужку / колесо / кнопку
    p.add_argument("--window", type=float, default=22.0, help="полуширина верхнего окна, мм (0 — без окна)")
    p.add_argument("--window-top", type=float, default=1.0, help="до какой высоты Z поднимается окно, мм")

    # стиль
    p.add_argument("--style", choices=["cobra", "roses"], default="cobra",
                   help="cobra — потёкший металл, roses — розы на шипастой лозе")
    p.add_argument("--roses", type=float, default=0.70,
                   help="доля узлов лозы, где распускается роза")
    p.add_argument("--rose-size", type=float, default=8.0, help="радиус розы, мм")
    p.add_argument("--petal", type=float, default=1.4, help="толщина лепестка, мм")
    p.add_argument("--leaves", type=int, default=22, help="число листьев на лозе")
    p.add_argument("--thorns", type=int, default=38, help="число шипов на лозе")

    # рисунок
    p.add_argument("--cell", type=float, default=15.0, help="средний размер ячейки сети, мм")
    p.add_argument("--strut", type=float, default=2.4, help="средний радиус жилы, мм")
    p.add_argument("--strut-var", type=float, default=0.62, help="разброс радиуса жил, 0..1")
    p.add_argument("--prune", type=float, default=0.28, help="доля выброшенных рёбер (крупные ячейки)")
    p.add_argument("--drips", type=int, default=18, help="число висящих «капель»")
    p.add_argument("--blend", type=float, default=1.45,
                   help="радиус наплыва в стыках, мм — металл «натекает» в узлах")
    p.add_argument("--node-blob", type=float, default=1.18,
                   help="во сколько раз узел толще жилы (наплыв металла)")
    p.add_argument("--seed", type=int, default=7, help="зерно генератора рисунка")

    # сетка/вывод
    p.add_argument("--voxel", type=float, default=0.40, help="шаг воксельной сетки, мм")
    p.add_argument("--side", choices=["left", "right", "both", "gauge"], default="both")
    p.add_argument("--out", default="stl", help="каталог вывода")
    p.add_argument("--format", choices=["stl", "3mf", "both"], default="both",
                   help="формат файлов модели")
    p.add_argument("--preview", action="store_true", help="отрисовать PNG-превью")
    return p


ROSES_PRESET = {
    "cell": 26.0,      # крупные проёмы, как у лозы
    "strut": 2.9,      # толстая гладкая лоза
    "strut_var": 0.30,
    "prune": 0.12,
    "blend": 1.2,
    "node_blob": 1.0,
    "drips": 0,
    "rib_core": 1.4,
    "thickness": 3.2,
    "rim": 3.4,
}


def apply_style(args, argv):
    """Стиль roses меняет умолчания; всё, что задано явно, остаётся."""
    if args.style != "roses":
        return args
    given = {a.lstrip("-").replace("-", "_").split("=")[0] for a in argv if a.startswith("--")}
    for key, value in ROSES_PRESET.items():
        if key not in given:
            setattr(args, key, value)
    return args


# --------------------------------------------------------------------------
# вспомогательное
# --------------------------------------------------------------------------

def smin(a, b, k):
    """Гладкое объединение (polynomial smooth-min)."""
    if k <= 0:
        return np.minimum(a, b)
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b * (1.0 - h) + a * h - k * h * (1.0 - h)


def smax(a, b, k):
    """Гладкое пересечение."""
    return -smin(-a, -b, k)


def sdf_from_mask(mask: np.ndarray, voxel: float) -> np.ndarray:
    """Знаковое евклидово расстояние до маски, в миллиметрах."""
    out = ndimage.distance_transform_edt(~mask, sampling=voxel)
    inn = ndimage.distance_transform_edt(mask, sampling=voxel)
    return (out - inn).astype(np.float32)


def round_mask(mask: np.ndarray, voxel: float, radius: float) -> np.ndarray:
    """Морфологическое открытие сферой — скругляет выпуклые рёбра."""
    if radius <= 0:
        return mask
    eroded = sdf_from_mask(mask, voxel) <= -radius
    if not eroded.any():
        return mask
    return sdf_from_mask(eroded, voxel) <= radius


# --------------------------------------------------------------------------
# форма чашки
# --------------------------------------------------------------------------

class Cup:
    """Внешняя поверхность чашки: суперэллипс в плане + купол + вертикальный борт."""

    def __init__(self, args):
        self.a = args.cup_w / 2.0
        self.b = args.cup_h / 2.0
        self.n = args.cup_n
        self.rise = args.dome
        self.depth = args.cup_depth

    def q(self, x, y):
        """Нормированный радиус: 1.0 — кромка чашки."""
        return (np.abs(x / self.a) ** self.n + np.abs(y / self.b) ** self.n) ** (1.0 / self.n)

    def top(self, q):
        """Высота купола на нормированном радиусе q."""
        t = np.clip(1.0 - np.clip(q, 0.0, 1.0) ** 2.5, 0.0, 1.0)
        return self.rise * np.sqrt(t)

    def point(self, phi, q):
        """Точка поверхности по направлению phi и нормированному радиусу q."""
        c, s = np.cos(phi), np.sin(phi)
        m = (np.abs(c) ** self.n + np.abs(s) ** self.n) ** (1.0 / self.n)
        x = q * self.a * c / m
        y = q * self.b * s / m
        return x, y

    def mask(self, X, Y, Z):
        q = self.q(X, Y)
        return (q <= 1.0) & (Z <= self.top(q)) & (Z >= -self.depth)


def unwrap_tables(cup: Cup, offset: float, skirt: float, n_phi: int = 256):
    """
    Развёртка средней поверхности накладки в плоский диск.

    Для каждого направления phi считаем длину дуги s от макушки вдоль меридиана
    (купол, затем борт). Возвращаем таблицы s(phi, i) и 3D-точек, чтобы уметь
    переводить точку плоского диска (U, V) в точку на поверхности.
    """
    phis = np.linspace(0.0, 2.0 * np.pi, n_phi, endpoint=False)
    qs = np.linspace(0.0, 1.0, 700)

    s_tab, pt_tab = [], []
    for phi in phis:
        xs, ys = cup.point(phi, qs)
        zs = cup.top(qs)
        # борт вниз по стенке — ровно до нижней кромки юбки
        z_wall = np.linspace(0.0, -skirt, 120)[1:]
        xw = np.full_like(z_wall, xs[-1])
        yw = np.full_like(z_wall, ys[-1])

        px = np.concatenate([xs, xw])
        py = np.concatenate([ys, yw])
        pz = np.concatenate([zs, z_wall])

        # смещение наружу по нормали меридиана — грубая заготовка,
        # точное положение потом добирается притяжением к изоповерхности SDF
        nrm = np.hypot(np.hypot(np.gradient(px), np.gradient(py)), np.gradient(pz))
        nrm[nrm == 0] = 1e-9
        tx, ty, tz = np.gradient(px) / nrm, np.gradient(py) / nrm, np.gradient(pz) / nrm
        rad = np.hypot(px, py)
        rad[rad == 0] = 1e-9
        # нормаль меридиана в плоскости (радиус, z)
        ur, uz = px / rad, py / rad
        t_rad = tx * ur + ty * uz
        nx = -tz * ur
        ny = -tz * uz
        nz = t_rad
        px = px + offset * nx
        py = py + offset * ny
        pz = pz + offset * nz

        d = np.sqrt(np.diff(px) ** 2 + np.diff(py) ** 2 + np.diff(pz) ** 2)
        s = np.concatenate([[0.0], np.cumsum(d)])

        s_tab.append(s)
        pt_tab.append(np.stack([px, py, pz], axis=1))

    return phis, np.array(s_tab), np.array(pt_tab)


def disc_to_surface(U, V, phis, s_tab, pt_tab):
    """(U, V) плоского диска -> 3D-точка на средней поверхности."""
    phi = np.mod(np.arctan2(V, U), 2.0 * np.pi)
    s = np.hypot(U, V)
    k = np.rint(phi / (2.0 * np.pi) * len(phis)).astype(int) % len(phis)

    pts = np.empty((len(U), 3))
    for i in range(len(U)):
        row = s_tab[k[i]]
        j = np.searchsorted(row, s[i])
        j = min(max(j, 1), len(row) - 1)
        t = (s[i] - row[j - 1]) / max(row[j] - row[j - 1], 1e-9)
        pts[i] = pt_tab[k[i], j - 1] * (1 - t) + pt_tab[k[i], j] * t
    return pts


# --------------------------------------------------------------------------
# рисунок сети
# --------------------------------------------------------------------------

def poisson_disc(radius: float, r_max: float, rng, k: int = 24, preset=None):
    """Выборка Бридсона в круге радиуса r_max; preset — уже зафиксированные точки."""
    cell = radius / math.sqrt(2.0)
    n = int(math.ceil(2 * r_max / cell)) + 1
    grid = -np.ones((n, n), dtype=int)
    pts, active = [], []

    def add(p):
        pts.append(p)
        active.append(len(pts) - 1)
        gx = int((p[0] + r_max) / cell)
        gy = int((p[1] + r_max) / cell)
        grid[gx, gy] = len(pts) - 1

    def ok(p):
        if p[0] ** 2 + p[1] ** 2 > r_max ** 2:
            return False
        gx = int((p[0] + r_max) / cell)
        gy = int((p[1] + r_max) / cell)
        for i in range(max(gx - 2, 0), min(gx + 3, n)):
            for j in range(max(gy - 2, 0), min(gy + 3, n)):
                idx = grid[i, j]
                if idx >= 0:
                    q = pts[idx]
                    if (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 < radius ** 2:
                        return False
        return True

    n_preset = 0
    if preset is not None and len(preset):
        for q in preset:
            add(np.asarray(q, dtype=float))
        n_preset = len(preset)
    add(np.array([0.0, 0.0]))
    while active:
        i = active[rng.integers(len(active))]
        base = pts[i]
        placed = False
        for _ in range(k):
            ang = rng.uniform(0, 2 * np.pi)
            rad = radius * (1.0 + rng.random())
            cand = base + np.array([math.cos(ang), math.sin(ang)]) * rad
            if ok(cand):
                add(cand)
                placed = True
                break
        if not placed:
            active.remove(i)
    return np.array(pts), n_preset


def build_web(args, phis, s_tab, pt_tab, rng):
    """Строит список сегментов (p0, p1, r0, r1) органической сети."""
    s_rim = np.array([row[-1] for row in s_tab])   # длина дуги до нижней кромки юбки
    r_max = float(s_rim.max())

    # опорное кольцо узлов ровно по нижней кромке: сеть гарантированно
    # срастается со сплошным пояском по всему периметру
    n_ring = max(int(round(2 * np.pi * float(s_rim.mean()) / args.cell)), 8)
    ring_phi = np.linspace(0.0, 2 * np.pi, n_ring, endpoint=False)
    ring_phi = ring_phi + rng.uniform(-0.35, 0.35, n_ring) * (2 * np.pi / n_ring)
    kk = np.rint(ring_phi / (2 * np.pi) * len(phis)).astype(int) % len(phis)
    ring_s = s_rim[kk] - 0.6
    ring = np.stack([ring_s * np.cos(ring_phi), ring_s * np.sin(ring_phi)], axis=1)

    pts, n_fixed = poisson_disc(args.cell, r_max, rng, preset=ring)

    # выбрасываем внутренние точки, вышедшие за фактическую кромку
    phi = np.mod(np.arctan2(pts[:, 1], pts[:, 0]), 2 * np.pi)
    k = np.rint(phi / (2 * np.pi) * len(phis)).astype(int) % len(phis)
    keep = np.hypot(pts[:, 0], pts[:, 1]) <= s_rim[k] - 0.4
    keep[:n_fixed] = True
    seeds = pts[keep]

    fixed = np.zeros(len(seeds), dtype=bool)
    fixed[:n_fixed] = True

    # релаксация Ллойда только для внутренних узлов — кромка остаётся на месте
    for _ in range(3):
        tri = Delaunay(seeds)
        acc = seeds.copy()
        cnt = np.ones(len(seeds))
        for simplex in tri.simplices:
            c = seeds[simplex].mean(axis=0)
            for v in simplex:
                acc[v] += c
                cnt[v] += 1
        relaxed = acc / cnt[:, None]
        seeds = np.where(fixed[:, None], seeds, relaxed)

    tri = Delaunay(seeds)
    edges = set()
    for simplex in tri.simplices:
        for i in range(3):
            u, v = simplex[i], simplex[(i + 1) % 3]
            edges.add((min(u, v), max(u, v)))
    edges = np.array(sorted(edges))

    # хорды снаружи кромки Delaunay соединяет напрямую — такие рёбра убираем
    mid = (seeds[edges[:, 0]] + seeds[edges[:, 1]]) / 2.0
    mphi = np.mod(np.arctan2(mid[:, 1], mid[:, 0]), 2 * np.pi)
    mk = np.rint(mphi / (2 * np.pi) * len(phis)).astype(int) % len(phis)
    inside = np.hypot(mid[:, 0], mid[:, 1]) <= s_rim[mk] - 0.2
    length = np.linalg.norm(seeds[edges[:, 0]] - seeds[edges[:, 1]], axis=1)
    edges = edges[inside & (length < args.cell * 2.1)]

    # прореживание: ячейки становятся крупнее и неправильнее, граф остаётся связным
    degree = np.zeros(len(seeds), dtype=int)
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    drop = np.zeros(len(edges), dtype=bool)
    target = int(len(edges) * args.prune)
    dropped = 0
    for e in rng.permutation(len(edges)):
        if dropped >= target:
            break
        u, v = edges[e]
        if degree[u] > 2 and degree[v] > 2:
            drop[e] = True
            degree[u] -= 1
            degree[v] -= 1
            dropped += 1
    edges = edges[~drop]
    edges = connected_edges(edges, len(seeds))

    node_r = args.strut * (1.0 + args.strut_var * (rng.random(len(seeds)) - 0.5))

    sub = 6
    ts = np.linspace(0.0, 1.0, sub + 1)
    segments = []
    for u, v in edges:
        pu, pv = seeds[u], seeds[v]
        d = pv - pu
        ln = float(np.hypot(*d))
        nrm = np.array([-d[1], d[0]]) / max(ln, 1e-9)
        # квадратичная кривая: жила идёт дугой, а не по линейке
        ctrl = (pu + pv) / 2.0 + nrm * ln * rng.uniform(-0.16, 0.16)
        curve = np.array([(1 - t) ** 2 * pu + 2 * (1 - t) * t * ctrl + t ** 2 * pv for t in ts])
        pts3 = disc_to_surface(curve[:, 0], curve[:, 1], phis, s_tab, pt_tab)
        radii = node_r[u] * (1 - ts) + node_r[v] * ts
        radii = radii * (0.78 + 0.22 * np.abs(2 * ts - 1) ** 1.4)
        segments.append([(pts3[i], pts3[i + 1], radii[i], radii[i + 1])
                         for i in range(sub)])

    # наплыв металла в узлах: шар чуть толще сходящихся жил
    used_nodes = np.unique(edges)
    for idx in used_nodes:
        p = disc_to_surface(seeds[idx:idx + 1, 0], seeds[idx:idx + 1, 1],
                            phis, s_tab, pt_tab)[0]
        r = node_r[idx] * args.node_blob
        segments.append([(p, p.copy(), r, r)])

    # висящие «капли» — короткий отросток с утолщением на конце
    inner_nodes = np.flatnonzero(~fixed)
    if args.drips > 0 and len(inner_nodes) > 4:
        picks = rng.choice(inner_nodes, size=min(args.drips, len(inner_nodes)), replace=False)
        for idx in picks:
            # потёк идёт преимущественно наружу — как стекающий по куполу металл
            base = math.atan2(seeds[idx][1], seeds[idx][0])
            ang = base + rng.uniform(-0.9, 0.9)
            tip = seeds[idx] + np.array([math.cos(ang), math.sin(ang)]) * rng.uniform(5.0, 10.0)
            phi_t = np.mod(math.atan2(tip[1], tip[0]), 2 * np.pi)
            kt = int(round(phi_t / (2 * np.pi) * len(phis))) % len(phis)
            if np.hypot(*tip) > s_rim[kt] - 1.2:
                continue
            path = np.array([seeds[idx] * (1 - t) + tip * t for t in np.linspace(0, 1, 4)])
            pts3 = disc_to_surface(path[:, 0], path[:, 1], phis, s_tab, pt_tab)
            rr = np.linspace(node_r[idx] * 0.72, args.strut * rng.uniform(1.1, 1.5), 4)
            segments.append([(pts3[i], pts3[i + 1], rr[i], rr[i + 1])
                             for i in range(3)])
    return segments, seeds, edges, fixed


def connected_edges(edges, n_nodes):
    """Оставляет только рёбра наибольшей связной компоненты графа."""
    parent = np.arange(n_nodes)

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[rv] = ru
    roots = np.array([find(i) for i in range(n_nodes)])
    used = np.array([find(u) for u, _ in edges])
    vals, counts = np.unique(roots[np.unique(edges)], return_counts=True)
    main = vals[np.argmax(counts)]
    return edges[used == main]


# --------------------------------------------------------------------------
# розы, листья и шипы
# --------------------------------------------------------------------------

def decor_placements(args, seeds, edges, fixed, rng):
    """Где на лозе распускаются розы, где сидят листья и шипы (в развёртке)."""
    roses, leaves, thorns = [], [], []
    if args.style != "roses":
        return roses, leaves, thorns

    def in_window(p):
        """Верхнее окно под дужку и колесо — там декор не растёт."""
        r = float(np.hypot(*p))
        return r > 30.0 and p[1] > 0.0 and abs(p[0]) < 0.5 * r

    nodes = [n for n in np.unique(edges) if not in_window(seeds[n])]
    k = max(int(round(len(nodes) * args.roses)), 1)
    for n in rng.choice(nodes, size=min(k, len(nodes)), replace=False):
        p = seeds[n].copy()
        if fixed[n]:
            # роза на кромке съезжает внутрь, иначе лепестки свисают за поясок
            r = float(np.hypot(*p))
            p *= max(1.0 - 5.0 / max(r, 1e-9), 0.0)
        roses.append((p, float(rng.uniform(0.82, 1.18))))

    def on_edge(lo=0.18, hi=0.82):
        for _ in range(12):
            e = edges[rng.integers(len(edges))]
            t = rng.uniform(lo, hi)
            p = seeds[e[0]] * (1 - t) + seeds[e[1]] * t
            if in_window(p):
                continue
            d = seeds[e[1]] - seeds[e[0]]
            return p, d / max(np.linalg.norm(d), 1e-9)
        return p, np.array([1.0, 0.0])

    for _ in range(args.leaves):
        p, d = on_edge()
        leaves.append((p, d, float(rng.uniform(0.85, 1.25)),
                       float(rng.choice([-1.0, 1.0])) * float(rng.uniform(0.7, 1.4))))
    for _ in range(args.thorns):
        p, d = on_edge(0.12, 0.88)
        thorns.append((p, d, float(rng.uniform(0.8, 1.3)),
                       float(rng.uniform(-1.0, 1.0))))
    return roses, leaves, thorns


def frames_on_surface(disc_pts, disc_dirs, phis, s_tab, pt_tab, d_cup, origin, voxel, level):
    """
    Точки развёртки -> положение на поверхности + локальный базис.

    Возвращает центры, нормали и касательные вдоль лозы: по ним ставятся
    розы, листья и шипы.
    """
    if len(disc_pts) == 0:
        return np.zeros((0, 3)), np.zeros((0, 3)), np.zeros((0, 3))
    eps = 0.6
    base = np.asarray(disc_pts, dtype=float)
    ahead = base + np.asarray(disc_dirs, dtype=float) * eps

    p0 = disc_to_surface(base[:, 0], base[:, 1], phis, s_tab, pt_tab)
    p1 = disc_to_surface(ahead[:, 0], ahead[:, 1], phis, s_tab, pt_tab)
    p0 = snap_to_surface(p0, d_cup, origin, voxel, level)
    p1 = snap_to_surface(p1, d_cup, origin, voxel, level)

    gz, gy, gx = np.gradient(d_cup, voxel)

    def sample(vol, p):
        return ndimage.map_coordinates(vol, ((p - origin) / voxel).T[::-1],
                                       order=1, mode="nearest")

    n = np.stack([sample(gx, p0), sample(gy, p0), sample(gz, p0)], axis=1)
    n /= np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-9)
    t = p1 - p0
    t -= n * np.einsum("ij,ij->i", t, n)[:, None]
    t /= np.maximum(np.linalg.norm(t, axis=1, keepdims=True), 1e-9)
    return p0, n, t


def local_axes(normal, tangent):
    """Матрица мир -> локальные координаты (строки: x, y, z=нормаль)."""
    z = normal / max(np.linalg.norm(normal), 1e-9)
    x = tangent - z * float(tangent @ z)
    if np.linalg.norm(x) < 1e-6:
        x = np.array([1.0, 0.0, 0.0]) - z * z[0]
    x /= max(np.linalg.norm(x), 1e-9)
    y = np.cross(z, x)
    return np.stack([x, y, z], axis=0)


def rose_sdf(Xl, Yl, Zl, size, petal_t):
    """
    Роза: три яруса лепестков вокруг бутона, ось цветка — локальная Z.

    Лепесток — вытянутый кусок сферической оболочки радиуса Rp, вогнутой
    стороной к оси. Центр сферы отнесён на Rp + зазор, поэтому лепесток
    обнимает середину, а не затягивает её. Пятно лепестка эллиптическое:
    широкое по завитку (alpha_up) и узкое по кругу (alpha_side) — между
    соседними лепестками остаётся канавка, иначе ярус слипается в блин.
    Каждый лепесток довёрнут по завитку, ярусы раскрываются наружу.
    """
    d = np.full_like(Xl, 30.0)
    axis = np.array([0.0, 0.0, 1.0])
    # (радиус, зазор, сколько, поворот яруса, наклон, alpha_up, alpha_side)
    layers = ((0.42, 0.06, 4, 0.00, 0.30, 0.92, 0.40),
              (0.60, 0.24, 5, 0.62, 0.78, 0.92, 0.38),
              (0.76, 0.42, 6, 1.24, 1.12, 0.86, 0.38))
    for rp_f, gap_f, count, phase, tilt, a_up, a_side in layers:
        Rp = size * rp_f
        D = Rp + size * gap_f
        for i in range(count):
            phi = phase + i * 2.0 * np.pi / count
            dirv = np.array([np.sin(tilt) * np.cos(phi),
                             np.sin(tilt) * np.sin(phi),
                             np.cos(tilt)])
            u = -dirv
            up = axis - u * float(axis @ u)
            if np.linalg.norm(up) < 1e-6:
                up = np.array([1.0, 0.0, 0.0]) - u * u[0]
            up /= np.linalg.norm(up)
            side = np.cross(u, up)
            # лёгкий доворот лепестка — завиток идёт по спирали
            tw = 0.28
            up, side = (up * math.cos(tw) + side * math.sin(tw),
                        side * math.cos(tw) - up * math.sin(tw))

            step = 1.0 + 0.06 * ((i % 2) * 2 - 1)   # соседние лепестки чуть разной высоты
            cx, cy, cz = dirv * (D * step)
            px, py, pz = Xl - cx, Yl - cy, Zl - cz
            r = np.sqrt(px * px + py * py + pz * pz) + 1e-9
            qx, qy, qz = px / r, py / r, pz / r
            shell = np.abs(r - Rp) - petal_t / 2.0

            k_up = np.arcsin(np.clip(qx * up[0] + qy * up[1] + qz * up[2], -1, 1)) / a_up
            k_sd = np.arcsin(np.clip(qx * side[0] + qy * side[1] + qz * side[2], -1, 1)) / a_side
            front = qx * u[0] + qy * u[1] + qz * u[2]
            patch = (np.sqrt(k_up ** 2 + k_sd ** 2) - 1.0) * (Rp * a_side)
            patch = np.maximum(patch, -front * Rp)      # только ближняя сторона сферы

            petal = smax(shell, patch, 0.28)
            d = smin(d, petal, 0.20)
    bud = np.sqrt(Xl ** 2 + Yl ** 2 + (Zl - size * 0.14) ** 2) - size * 0.20
    return smin(d, bud, 0.28)


def leaf_sdf(Xl, Yl, Zl, length, width, thick):
    """Лист: заострённая линза с центральной жилкой."""
    e = ((np.abs(Xl) / length) ** 1.8
         + (np.abs(Yl) / width) ** 1.8
         + (np.abs(Zl) / thick) ** 2.0) ** (1.0 / 1.8)
    blade = (e - 1.0) * (thick * 1.6)
    v = np.clip(Xl / (length * 0.92), -1.0, 1.0)
    vein = np.sqrt(Yl ** 2 + (Zl - thick * 0.35) ** 2) - (0.55 - 0.35 * np.abs(v)) * width * 0.28
    vein = np.maximum(vein, np.abs(Xl) - length * 0.92)
    return smin(blade, vein, 0.35)


def stamp_local(field, origin, voxel, center, R, half, fn, blend):
    """Считает локальный примитив в его системе координат и вливает в поле."""
    nz, ny, nx = field.shape
    lo = center - half
    hi = center + half
    i0 = np.maximum(((lo - origin) / voxel).astype(int), 0)
    i1 = np.minimum(((hi - origin) / voxel).astype(int) + 2, [nx, ny, nz])
    if np.any(i1 <= i0):
        return
    xs = origin[0] + np.arange(i0[0], i1[0]) * voxel
    ys = origin[1] + np.arange(i0[1], i1[1]) * voxel
    zs = origin[2] + np.arange(i0[2], i1[2]) * voxel
    Z, Y, X = np.meshgrid(zs, ys, xs, indexing="ij")
    dx, dy, dz = X - center[0], Y - center[1], Z - center[2]
    Xl = R[0, 0] * dx + R[0, 1] * dy + R[0, 2] * dz
    Yl = R[1, 0] * dx + R[1, 1] * dy + R[1, 2] * dz
    Zl = R[2, 0] * dx + R[2, 1] * dy + R[2, 2] * dz
    d = fn(Xl, Yl, Zl).astype(np.float32)
    sub = field[i0[2]:i1[2], i0[1]:i1[1], i0[0]:i1[0]]
    field[i0[2]:i1[2], i0[1]:i1[1], i0[0]:i1[0]] = smin(sub, d, blend)


# --------------------------------------------------------------------------
# поле и сетка
# --------------------------------------------------------------------------

def snap_to_surface(pts, d_cup, origin, voxel, level, iters=3):
    """Притягивает точки к изоповерхности d_cup = level по градиенту поля."""
    gz, gy, gx = np.gradient(d_cup, voxel)

    def sample(vol, p):
        idx = ((p - origin) / voxel).T[::-1]  # -> (z, y, x)
        return ndimage.map_coordinates(vol, idx, order=1, mode="nearest")

    p = pts.copy()
    for _ in range(iters):
        d = sample(d_cup, p)
        n = np.stack([sample(gx, p), sample(gy, p), sample(gz, p)], axis=1)
        ln = np.linalg.norm(n, axis=1, keepdims=True)
        ln[ln < 1e-6] = 1e-6
        p = p - (d - level)[:, None] * n / ln
    return p


def segment_field(shape, origin, voxel, chains, blend):
    """
    Поле расстояний до сети конических капсул.

    Каждая жила приходит цепочкой сегментов. Внутри цепочки берётся обычный
    минимум: соседние звенья лежат на одной оси, и плавное объединение
    надувало бы на каждом стыке горбик. Между разными жилами — плавный
    минимум, он и даёт наплыв в узлах.
    """
    field = np.full(shape, 40.0, dtype=np.float32)
    nz, ny, nx = shape

    def bounds(items):
        lo = np.minimum.reduce([np.minimum(p0, p1) - (max(r0, r1) + blend + 1.2)
                                for p0, p1, r0, r1 in items])
        hi = np.maximum.reduce([np.maximum(p0, p1) + (max(r0, r1) + blend + 1.2)
                                for p0, p1, r0, r1 in items])
        i0 = np.maximum(((lo - origin) / voxel).astype(int), 0)
        i1 = np.minimum(((hi - origin) / voxel).astype(int) + 2, [nx, ny, nz])
        return i0, i1

    for chain in chains:
        if not chain:
            continue
        i0, i1 = bounds(chain)
        if np.any(i1 <= i0):
            continue
        xs = origin[0] + np.arange(i0[0], i1[0]) * voxel
        ys = origin[1] + np.arange(i0[1], i1[1]) * voxel
        zs = origin[2] + np.arange(i0[2], i1[2]) * voxel
        Z, Y, X = np.meshgrid(zs, ys, xs, indexing="ij")

        local = np.full(Z.shape, 40.0, dtype=np.float32)
        for p0, p1, r0, r1 in chain:
            v = p1 - p0
            L2 = float(v @ v)
            wx, wy, wz = X - p0[0], Y - p0[1], Z - p0[2]
            if L2 < 1e-9:
                t = np.zeros_like(wx)          # вырожденный сегмент — шар в узле
            else:
                t = np.clip((wx * v[0] + wy * v[1] + wz * v[2]) / L2, 0.0, 1.0)
            dx = wx - t * v[0]
            dy = wy - t * v[1]
            dz = wz - t * v[2]
            d = np.sqrt(dx * dx + dy * dy + dz * dz) - (r0 + t * (r1 - r0))
            np.minimum(local, d.astype(np.float32), out=local)

        sub = field[i0[2]:i1[2], i0[1]:i1[1], i0[0]:i1[0]]
        field[i0[2]:i1[2], i0[1]:i1[1], i0[0]:i1[0]] = smin(sub, local, blend)
    return field


def box_sdf(X, Y, Z, center, half):
    dx = np.abs(X - center[0]) - half[0]
    dy = np.abs(Y - center[1]) - half[1]
    dz = np.abs(Z - center[2]) - half[2]
    outside = np.sqrt(np.maximum(dx, 0) ** 2 + np.maximum(dy, 0) ** 2 + np.maximum(dz, 0) ** 2)
    inside = np.minimum(np.maximum(np.maximum(dx, dy), dz), 0.0)
    return outside + inside


def cut_window(field, args, cup, X, Y, Z, z_bot):
    """Вырезает верхнее окно под дужку, колесо Digital Crown и кнопку."""
    if args.window <= 0:
        return field
    z_top = args.window_top
    z_lo = z_bot - 6.0
    win = box_sdf(X, Y, Z, (0.0, cup.b + 8.0, (z_top + z_lo) / 2.0),
                  (args.window, 14.0, (z_top - z_lo) / 2.0))
    return smax(field, -win.astype(np.float32), 0.6)


def build_field(args, mode: str, rng):
    """Собирает итоговое SDF детали. mode: 'case' или 'gauge'."""
    cup = Cup(args)
    clr, thk = args.clearance, args.thickness
    pad = clr + thk + 3.0

    x_hi = cup.a + pad
    y_hi = cup.b + pad
    z_hi = cup.rise + pad
    z_lo = -(args.skirt + pad + 2.0)

    vx = args.voxel
    xs = np.arange(-x_hi, x_hi + vx, vx)
    ys = np.arange(-y_hi, y_hi + vx, vx)
    zs = np.arange(z_lo, z_hi + vx, vx)
    origin = np.array([xs[0], ys[0], zs[0]])
    Z, Y, X = np.meshgrid(zs, ys, xs, indexing="ij")

    t0 = time.time()
    cup_mask = cup.mask(X, Y, Z)
    cup_mask = round_mask(cup_mask, vx, 2.0)
    d_cup = sdf_from_mask(cup_mask, vx)
    print(f"    поле чашки {d_cup.shape} за {time.time() - t0:.1f} c")

    # внутренняя граница с буртиком-защёлкой у самого низа юбки
    z_bot = -args.skirt
    inner = np.full_like(d_cup, clr)
    if args.lip > 0:
        w = np.clip((z_bot + 2.6 - Z) / 2.2, 0.0, 1.0).astype(np.float32)
        inner = inner - args.lip * w
    outer = clr + thk

    band = np.maximum(inner - d_cup, d_cup - outer).astype(np.float32)
    # обрезаем сверху и снизу по высоте детали
    band = np.maximum(band, (z_bot - Z).astype(np.float32))

    if mode == "gauge":
        gauge = np.maximum(inner - d_cup, d_cup - (clr + 1.2)).astype(np.float32)
        gauge = np.maximum(gauge, (z_bot - Z).astype(np.float32))
        gauge = np.maximum(gauge, (Z - 1.5).astype(np.float32))
        gauge = cut_window(gauge, args, cup, X, Y, Z, z_bot)
        return gauge, origin, vx, (X, Y, Z)

    # ось жил идёт чуть выше поверхности чашки: сечение получается круглым
    core = clr + args.rib_core
    phis, s_tab, pt_tab = unwrap_tables(cup, core, args.skirt)
    segments, seeds, edges, fixed = build_web(args, phis, s_tab, pt_tab, rng)
    roses, leaves, thorns = decor_placements(args, seeds, edges, fixed, rng)

    # притягиваем узлы сегментов к точной средней поверхности
    flat = [seg for chain in segments for seg in chain]
    allp = snap_to_surface(
        np.array([p for seg in flat for p in (seg[0], seg[1])]),
        d_cup, origin, vx, core)
    k = 0
    snapped = []
    for chain in segments:
        out = []
        for seg in chain:
            out.append((allp[k], allp[k + 1], seg[2], seg[3]))
            k += 2
        snapped.append(out)
    segments = snapped
    print(f"    сеть: {len(seeds)} узлов, {len(edges)} рёбер, {len(flat)} сегментов")

    # положение и базис для всего декора считаем заранее: стебли роз и шипы
    # должны попасть в общий растр вместе с лозой, иначе цветок улетает отдельно
    rose_frames = leaf_frames = None
    if roses:
        rose_frames = frames_on_surface(
            [r[0] for r in roses], [np.array([1.0, 0.0]) for _ in roses],
            phis, s_tab, pt_tab, d_cup, origin, vx, core)
    if leaves:
        leaf_frames = frames_on_surface(
            [l[0] for l in leaves], [l[1] for l in leaves],
            phis, s_tab, pt_tab, d_cup, origin, vx, core)
    if thorns:
        pts, nrm, tan = frames_on_surface(
            [t[0] for t in thorns], [t[1] for t in thorns],
            phis, s_tab, pt_tab, d_cup, origin, vx, core)
        for (p, base, scale, lean), c, n, t in zip(thorns, pts, nrm, tan):
            side = np.cross(n, t)
            direction = n * 0.72 + t * (0.5 * lean) + side * (0.3 * lean)
            direction /= max(np.linalg.norm(direction), 1e-9)
            segments.append([(c, c + direction * (5.4 * scale),
                              1.5 * scale, 0.32 * scale)])

    rose_spots = []
    if rose_frames is not None:
        for (p, scale), c, n, t in zip(roses, *rose_frames):
            size = args.rose_size * scale
            centre = c + n * (args.strut * 0.75 + size * 0.36)
            # стебель: роза всегда приросла к лозе
            segments.append([(c, centre, args.strut * 0.62, size * 0.30)])
            rose_spots.append((centre, local_axes(n, t), size))

    t0 = time.time()
    web = segment_field(d_cup.shape, origin, vx, segments, args.blend)

    for centre, R, size in rose_spots:
        stamp_local(web, origin, vx, centre, R, np.full(3, size * 2.0),
                    lambda X, Y, Z, sz=size: rose_sdf(X, Y, Z, sz, args.petal),
                    0.25)

    if leaf_frames is not None:
        for (p, d0, scale, lean), c, n, t in zip(leaves, *leaf_frames):
            side = np.cross(n, t)
            axis = t * math.cos(lean) + side * math.sin(lean)
            axis = axis + n * 0.28                     # кончик чуть приподнят
            axis /= max(np.linalg.norm(axis), 1e-9)
            L, W, T = 8.0 * scale, 3.2 * scale, 0.95
            stamp_local(web, origin, vx,
                        c + axis * (L * 0.40) + n * 0.22,
                        local_axes(n, axis), np.full(3, L * 1.2),
                        lambda X, Y, Z, a=L, b=W, c_=T: leaf_sdf(X, Y, Z, a, b, c_),
                        0.45)
    print(f"    лоза, розы и шипы за {time.time() - t0:.1f} c")

    # жилы и декор ограничены только поверхностью чашки: сверху они остаются
    # круглыми, снизу срезаны по офсету — там плоская посадочная площадка
    r_top = args.rib_core + args.strut * (1.0 + args.strut_var / 2.0) * 1.5 + 0.5
    if args.style == "roses":
        r_top = max(r_top, args.rib_core + args.strut + args.rose_size * 1.9 + 1.0)
    band_rib = np.maximum(inner - d_cup, d_cup - (clr + r_top)).astype(np.float32)
    band_rib = np.maximum(band_rib, (z_bot - Z).astype(np.float32))

    part = smax(web, band_rib, 0.45)

    # сплошной поясок по нижнему краю юбки
    ring = np.maximum(band, (Z - (z_bot + args.rim)).astype(np.float32))
    part = smin(part, ring, 0.6)

    # окно сверху: дужка, Digital Crown, кнопка
    part = cut_window(part, args, cup, X, Y, Z, z_bot)

    return part.astype(np.float32), origin, vx, (X, Y, Z)


# --------------------------------------------------------------------------
# сетка -> STL
# --------------------------------------------------------------------------

def field_to_mesh(field, origin, voxel):
    padded = np.pad(field, 1, mode="constant", constant_values=10.0)
    verts, faces, _, _ = measure.marching_cubes(padded, level=0.0, spacing=(voxel,) * 3)
    verts = verts - voxel  # компенсация паддинга
    # marching_cubes отдаёт (z, y, x)
    verts = verts[:, ::-1] + origin
    return verts.astype(np.float32), faces.astype(np.int32)


def smooth_mesh(verts, faces, iterations=5, lam=0.58, mu=-0.60):
    """
    Сглаживание Тобина (lambda/mu): снимает воксельную лесенку и оставляет
    поверхность непрерывной, но, в отличие от лапласова, не ужимает деталь —
    жилы не худеют, а блики на них ложатся ровно.
    """
    if iterations <= 0:
        return verts
    e = np.vstack([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]])
    e = np.vstack([e, e[:, ::-1]])
    counts = np.bincount(e[:, 0], minlength=len(verts)).astype(np.float32)
    counts[counts == 0] = 1.0
    v = verts.astype(np.float64)

    def step(v, w):
        acc = np.zeros_like(v)
        np.add.at(acc, e[:, 0], v[e[:, 1]])
        return v + w * (acc / counts[:, None] - v)

    for _ in range(iterations):
        v = step(v, lam)
        v = step(v, mu)
    return v.astype(np.float32)


def place_on_bed(verts):
    """Ставит деталь на стол: пояском в Z=0, по центру стола в X/Y.

    Ориентация уже печатная — купол вверх, поясок вниз, — поэтому в слайсере
    модель не надо ни крутить, ни опускать.
    """
    v = verts.copy()
    lo, hi = v.min(axis=0), v.max(axis=0)
    v[:, 0] -= (lo[0] + hi[0]) / 2.0
    v[:, 1] -= (lo[1] + hi[1]) / 2.0
    v[:, 2] -= lo[2]
    return v


def mirror_x(verts, faces):
    v = verts.copy()
    v[:, 0] *= -1.0
    return v, faces[:, ::-1].copy()


def write_stl(path, verts, faces, name="cobra-x"):
    tri = verts[faces]
    n = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    ln = np.linalg.norm(n, axis=1, keepdims=True)
    ln[ln == 0] = 1.0
    n = (n / ln).astype(np.float32)
    with open(path, "wb") as f:
        f.write(name.encode("ascii", "ignore").ljust(80, b"\0"))
        f.write(struct.pack("<I", len(faces)))
        data = np.zeros((len(faces), 12), dtype=np.float32)
        data[:, 0:3] = n
        data[:, 3:6] = tri[:, 0]
        data[:, 6:9] = tri[:, 1]
        data[:, 9:12] = tri[:, 2]
        buf = np.zeros((len(faces), 50), dtype=np.uint8)
        buf[:, :48] = data.view(np.uint8).reshape(len(faces), 48)
        f.write(buf.tobytes())


def largest_component(verts, faces):
    """Оставляет наибольшую связную компоненту (страховка от плавающих кусочков)."""
    parent = np.arange(len(verts))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    for tri in faces:
        r = [find(int(t)) for t in tri]
        for x in r[1:]:
            if x != r[0]:
                parent[x] = r[0]
    roots = np.array([find(i) for i in range(len(verts))])
    vals, counts = np.unique(roots, return_counts=True)
    main = vals[np.argmax(counts)]
    keep_v = roots == main
    dropped = int((~keep_v).sum())
    if dropped == 0:
        return verts, faces, 0
    remap = -np.ones(len(verts), dtype=np.int64)
    remap[keep_v] = np.arange(keep_v.sum())
    keep_f = keep_v[faces[:, 0]]
    return verts[keep_v], remap[faces[keep_f]].astype(np.int32), dropped


def write_3mf(path, verts, faces, name="cobra-x"):
    """3MF — тот же меш, но в 5-6 раз компактнее STL; понимают все слайсеры."""
    import zipfile

    v = "".join(
        '<vertex x="%.3f" y="%.3f" z="%.3f"/>' % tuple(p) for p in verts.astype(float)
    )
    t = "".join(
        '<triangle v1="%d" v2="%d" v3="%d"/>' % tuple(f) for f in faces.astype(int)
    )
    model = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<model unit="millimeter" xml:lang="en-US" '
        'xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">'
        f'<metadata name="Title">{name}</metadata>'
        '<resources><object id="1" type="model" name="' + name + '"><mesh>'
        f"<vertices>{v}</vertices><triangles>{t}</triangles>"
        "</mesh></object></resources>"
        '<build><item objectid="1"/></build></model>'
    )
    rels = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rel0" Target="/3D/3dmodel.model" '
        'Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'
    )
    ctypes = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>'
        "</Types>"
    )
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.writestr("[Content_Types].xml", ctypes)
        z.writestr("_rels/.rels", rels)
        z.writestr("3D/3dmodel.model", model)


def mesh_stats(verts, faces):
    tri = verts[faces]
    v = np.einsum("ij,ij->i", tri[:, 0], np.cross(tri[:, 1], tri[:, 2])) / 6.0
    return {
        "tris": len(faces),
        "volume_cm3": abs(v.sum()) / 1000.0,
        "bbox": verts.max(axis=0) - verts.min(axis=0),
    }


# --------------------------------------------------------------------------
# превью
# --------------------------------------------------------------------------

def render_preview(path, verts, faces, size=900, yaw=-0.55, pitch=0.60, density=9.0):
    """
    Превью с настоящими нормалями меша.

    Точки набрасываются по треугольникам плотностью, пропорциональной их
    площади на экране, и вместе с глубиной в буфер кладётся нормаль грани.
    Освещение считается по ней, а не по градиенту глубины: рябь буфера больше
    не превращается в несуществующую шагрень.
    """
    tri = verts[faces].astype(np.float64)

    c = (verts.max(axis=0) + verts.min(axis=0)) / 2.0
    cy, sy = math.cos(yaw), math.sin(yaw)
    cp, sp = math.cos(pitch), math.sin(pitch)
    M = np.array([
        [cy, sy, 0.0],
        [-sy * cp, cy * cp, -sp],
        [-sy * sp, cy * sp, cp],
    ])

    span = 1e-9
    for k in range(3):
        pv = (verts - c) @ M.T
        span = max(span, np.ptp(pv[:, 0]), np.ptp(pv[:, 1]))
        break
    span *= 1.12
    scale = size / span

    n = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    ln = np.linalg.norm(n, axis=1, keepdims=True)
    ln[ln == 0] = 1.0
    n = (n / ln) @ M.T

    p = (tri - c) @ M.T
    area = 0.5 * np.abs(
        (p[:, 1, 0] - p[:, 0, 0]) * (p[:, 2, 1] - p[:, 0, 1])
        - (p[:, 2, 0] - p[:, 0, 0]) * (p[:, 1, 1] - p[:, 0, 1])
    ) * scale * scale
    counts = np.maximum(np.ceil(area * density), 1).astype(np.int64)
    counts = np.minimum(counts, 400)

    idx = np.repeat(np.arange(len(faces)), counts)
    rng = np.random.default_rng(0)
    w = rng.random((len(idx), 3))
    w /= w.sum(axis=1, keepdims=True)
    pts = (p[idx] * w[:, :, None]).sum(axis=1)

    px = ((pts[:, 0] / span + 0.5) * size).astype(np.int64)
    py = ((-pts[:, 1] / span + 0.5) * size).astype(np.int64)
    ok = (px >= 0) & (px < size) & (py >= 0) & (py < size)
    px, py, idx = px[ok], py[ok], idx[ok]
    depth = (-pts[ok, 2]).astype(np.float32)

    flat = py * size + px
    zbuf = np.full(size * size, 1e9, dtype=np.float32)
    np.minimum.at(zbuf, flat, depth)

    win = depth <= zbuf[flat] + 1e-4
    nrm = np.zeros((size * size, 3), dtype=np.float32)
    nrm[flat[win]] = n[idx[win]]

    mask = (zbuf < 1e8).reshape(size, size)
    nrm = nrm.reshape(size, size, 3)
    ln = np.linalg.norm(nrm, axis=2, keepdims=True)
    nrm = nrm / np.where(ln < 1e-6, 1.0, ln)

    light = np.array([-0.62, 0.55, 0.56])
    light /= np.linalg.norm(light)
    fill_dir = np.array([0.70, -0.45, 0.55])
    fill_dir /= np.linalg.norm(fill_dir)
    lam = np.clip(nrm @ light, 0.0, 1.0)
    fill = np.clip(nrm @ fill_dir, 0.0, 1.0)
    spec = lam ** 22
    fres = (1.0 - np.clip(nrm[..., 2], 0.0, 1.0)) ** 2.0

    img = np.clip(0.07 + 0.72 * lam ** 1.15 + 0.26 * fill + 0.55 * spec + 0.20 * fres,
                  0.0, 1.0)
    rgb = np.stack([img * 0.98, img * 0.99, np.minimum(img * 1.03, 1.0)], axis=-1)
    bg = np.array([0.10, 0.10, 0.11])
    out = np.where(mask[..., None], rgb, bg)
    _write_png(path, (np.clip(out, 0, 1) * 255).astype(np.uint8))


def _write_png(path, rgb):
    import zlib
    h, w, _ = rgb.shape
    raw = b"".join(b"\0" + rgb[i].tobytes() for i in range(h))

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)))
        f.write(chunk(b"IDAT", zlib.compress(raw, 6)))
        f.write(chunk(b"IEND", b""))


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------

def make_part(args, mode, seed, out_dir, base_name, mirror=False):
    rng = np.random.default_rng(seed)
    print(f"  [{base_name}]")
    field, origin, vx, _ = build_field(args, mode, rng)

    t0 = time.time()
    verts, faces = field_to_mesh(field, origin, vx)
    verts, faces, dropped = largest_component(verts, faces)
    if dropped:
        print(f"    отброшено {dropped} вершин несвязанных кусочков")
    verts = smooth_mesh(verts, faces, iterations=5)
    if mirror:
        verts, faces = mirror_x(verts, faces)
    verts = place_on_bed(verts)
    print(f"    марш-кубы + сглаживание за {time.time() - t0:.1f} c")

    st = mesh_stats(verts, faces)
    if args.format in ("stl", "both"):
        write_stl(f"{out_dir}/{base_name}.stl", verts, faces, base_name)
    if args.format in ("3mf", "both"):
        write_3mf(f"{out_dir}/{base_name}.3mf", verts, faces, base_name)
    bb = st["bbox"]
    print(f"    {base_name}: {st['tris']} треуг., объём {st['volume_cm3']:.1f} см³, "
          f"габарит {bb[0]:.1f} x {bb[1]:.1f} x {bb[2]:.1f} мм")

    if args.preview:
        render_preview(f"{out_dir}/{base_name}.png", verts, faces)
        print(f"    превью: {out_dir}/{base_name}.png")
    return st


def main():
    import sys
    args = apply_style(build_parser().parse_args(), sys.argv[1:])
    import os
    os.makedirs(args.out, exist_ok=True)

    name = "cobra-x" if args.style == "cobra" else "roses"
    if args.side in ("right", "both"):
        make_part(args, "case", args.seed, args.out, f"{name}_right")
    if args.side in ("left", "both"):
        make_part(args, "case", args.seed + 101, args.out, f"{name}_left", mirror=True)
    if args.side == "gauge":
        make_part(args, "gauge", args.seed, args.out, f"{name}_fit-gauge")


if __name__ == "__main__":
    main()
