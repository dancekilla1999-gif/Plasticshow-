/**
 * Builds the 3D model of the silicone ear-pad cover (накладка на амбушюру)
 * with the raised "PLASTIC SHOW" wordmark on the outer dome.
 *
 * Everything is parametric and dependency-free: the shell is a surface of
 * revolution over an elliptical footprint, the lettering is a stroke font that
 * is turned into a distance field and pushed out along the surface normal, so
 * the wordmark follows the curvature of the dome instead of sitting on a flat
 * patch.
 *
 * Run with `npm run model`. Outputs into assets/3d/:
 *   plastic-show-earpad-cover.stl  — watertight mesh, millimetres, print-ready
 *   plastic-show-earpad-cover.png  — software-rendered preview (no GPU needed)
 *
 * Useful flags:
 *   --text="OTHER WORDS"   swap the wordmark
 *   --quality=high|med|low mesh density (default med)
 *   --no-preview           skip the PNG render
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';

const OUT = new URL('../assets/3d/', import.meta.url).pathname;

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);

/** Все размеры в миллиметрах. Габарит подобран под чашку AirPods Max. */
const CFG = {
  outerWidth: 100, // по оси X (длинная ось эллипса)
  outerDepth: 86, // по оси Y
  domeHeight: 14, // высота купола над линией стыка
  skirtHeight: 9.5, // прямая юбка, которой накладка надевается на чашку
  skirtFlare: 0.015, // лёгкий развал юбки, чтобы силикон налезал
  wall: 1.6, // толщина стенки
  lip: 0.7, // утолщение по краю — за него накладка держится
  text: typeof args.text === 'string' ? args.text : 'PLASTIC SHOW',
  capHeight: 7.6, // высота прописных букв
  strokeWidth: 1.6, // толщина штриха шрифта
  letterSpacing: 0.06, // в долях кегля
  embossHeight: 0.85, // насколько надпись выступает над куполом
  embossEdge: 0.75, // доля штриха, уходящая в скруглённую фаску
  textCenterY: 0, // сдвиг надписи по короткой оси
  maxTextWidth: 66, // если строка длиннее — кегль ужимается
};

const QUALITY = { low: [192, 110, 28], med: [448, 260, 36], high: [704, 400, 56] };
const [NU, NS_OUT, NS_IN] = QUALITY[args.quality] ?? QUALITY.med;

const DOME_SPLIT = 0.68; // доля параметра s, приходящаяся на купол

// ---------------------------------------------------------------------------
// Штриховой шрифт. Каждая глифа — набор полилиний в квадрате кегля: базовая
// линия y=0, высота прописной y=1. Круглые формы задаются дугами эллипса.
// ---------------------------------------------------------------------------

const arc = (cx, cy, rx, ry, a0, a1, steps = 28) => {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return pts;
};

const FONT = {
  ' ': { adv: 0.34, strokes: [] },
  A: { adv: 0.68, strokes: [[[0.04, 0], [0.33, 1], [0.62, 0]], [[0.155, 0.36], [0.505, 0.36]]] },
  C: { adv: 0.74, strokes: [arc(0.35, 0.5, 0.31, 0.5, 55, 305)] },
  E: { adv: 0.64, strokes: [[[0.58, 1], [0.06, 1], [0.06, 0], [0.58, 0]], [[0.06, 0.5], [0.5, 0.5]]] },
  H: { adv: 0.72, strokes: [[[0.06, 1], [0.06, 0]], [[0.6, 1], [0.6, 0]], [[0.06, 0.5], [0.6, 0.5]]] },
  I: { adv: 0.26, strokes: [[[0.09, 1], [0.09, 0]]] },
  L: { adv: 0.6, strokes: [[[0.06, 1], [0.06, 0], [0.52, 0]]] },
  O: { adv: 0.76, strokes: [arc(0.35, 0.5, 0.31, 0.5, 0, 360, 44)] },
  P: {
    adv: 0.7,
    strokes: [
      [[0.06, 0], [0.06, 1]],
      [[0.06, 1], ...arc(0.3, 0.77, 0.3, 0.23, 90, -90, 20), [0.06, 0.54]],
    ],
  },
  R: {
    adv: 0.72,
    strokes: [
      [[0.06, 0], [0.06, 1]],
      [[0.06, 1], ...arc(0.3, 0.77, 0.29, 0.23, 90, -90, 20), [0.06, 0.54]],
      [[0.3, 0.54], [0.63, 0]],
    ],
  },
  S: {
    adv: 0.7,
    strokes: [[...arc(0.32, 0.755, 0.26, 0.245, 5, 270, 30), ...arc(0.32, 0.255, 0.26, 0.255, 90, -175, 30)]],
  },
  T: { adv: 0.64, strokes: [[[0.02, 1], [0.62, 1]], [[0.32, 1], [0.32, 0]]] },
  W: { adv: 0.78, strokes: [[[0.03, 1], [0.2, 0], [0.365, 0.62], [0.53, 0], [0.7, 1]]] },
};

/** Раскладывает строку в отрезки-осевые линии штрихов (единицы — мм). */
function layoutText(text, cfg) {
  const glyphs = [...text.toUpperCase()].map((ch) => {
    const g = FONT[ch];
    if (!g) throw new Error(`Нет глифы для «${ch}» — добавьте её в FONT`);
    return g;
  });

  const advance = glyphs.reduce((sum, g) => sum + g.adv + cfg.letterSpacing, 0) - cfg.letterSpacing;
  // Кегль ужимается, если строка не влезает в отведённую ширину купола.
  const em = Math.min(cfg.capHeight, cfg.maxTextWidth / advance);
  const width = advance * em;

  const segments = [];
  let pen = -width / 2;
  const baseline = cfg.textCenterY - em / 2;

  for (const g of glyphs) {
    for (const stroke of g.strokes) {
      for (let i = 1; i < stroke.length; i++) {
        const [x0, y0] = stroke[i - 1];
        const [x1, y1] = stroke[i];
        segments.push([pen + x0 * em, baseline + y0 * em, pen + x1 * em, baseline + y1 * em]);
      }
    }
    pen += (g.adv + cfg.letterSpacing) * em;
  }

  return { segments, em, width };
}

const TEXT = layoutText(CFG.text, CFG);

// Габарит надписи с запасом на штрих — по нему быстро отсекаются точки сетки,
// которые к буквам заведомо не относятся.
const half = CFG.strokeWidth / 2 + 0.5;
const BOX = TEXT.segments.reduce(
  (b, [x0, y0, x1, y1]) => [
    Math.min(b[0], x0, x1) - 0,
    Math.min(b[1], y0, y1) - 0,
    Math.max(b[2], x0, x1),
    Math.max(b[3], y0, y1),
  ],
  [Infinity, Infinity, -Infinity, -Infinity],
).map((v, i) => (i < 2 ? v - half : v + half));

function distToSegment(px, py, x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy;
  let t = len2 > 0 ? ((px - x0) * dx + (py - y0) * dy) / len2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const ex = px - (x0 + t * dx);
  const ey = py - (y0 + t * dy);
  return Math.hypot(ex, ey);
}

const smoothstep = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/** Высота рельефа надписи в точке (x, y) плоскости XY. */
function embossAt(x, y) {
  if (x < BOX[0] || x > BOX[2] || y < BOX[1] || y > BOX[3]) return 0;

  const r = CFG.strokeWidth / 2;
  let d = Infinity;
  for (const s of TEXT.segments) {
    const dist = distToSegment(x, y, s[0], s[1], s[2], s[3]);
    if (dist < d) d = dist;
    if (d === 0) break;
  }
  if (d >= r) return 0;

  // Плоская вершина штриха и скруглённый спуск к поверхности — так буквы
  // печатаются без нависаний и приятно ловят свет. Фаска специально шире шага
  // сетки: иначе край буквы попадает между вершинами и получается «лесенка».
  return CFG.embossHeight * smoothstep((1 - d / r) / CFG.embossEdge);
}

// ---------------------------------------------------------------------------
// Поверхность накладки
// ---------------------------------------------------------------------------

const A = CFG.outerWidth / 2;
const B = CFG.outerDepth / 2;

/** Профиль оболочки: s = 0 — макушка, s = 1 — нижняя кромка. */
function profile(s) {
  if (s <= DOME_SPLIT) {
    const k = s / DOME_SPLIT;
    return { rho: k, z: CFG.domeHeight * Math.pow(Math.max(0, 1 - k * k), 0.65) };
  }
  const m = (s - DOME_SPLIT) / (1 - DOME_SPLIT);
  return { rho: 1 + CFG.skirtFlare * m, z: -CFG.skirtHeight * m };
}

function basePoint(s, u) {
  const { rho, z } = profile(s);
  return [A * rho * Math.cos(u), B * rho * Math.sin(u), z];
}

const EPS = 1e-4;

/** Нормаль считается численно: профиль кусочный, аналитика тут только мешает. */
function normalAt(s, u) {
  if (s < EPS) return [0, 0, 1];
  const sa = Math.max(0, s - EPS);
  const sb = Math.min(1, s + EPS);
  const p0 = basePoint(sa, u);
  const p1 = basePoint(sb, u);
  const q0 = basePoint(s, u - EPS);
  const q1 = basePoint(s, u + EPS);
  const ds = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
  const du = [q1[0] - q0[0], q1[1] - q0[1], q1[2] - q0[2]];
  // ds × du смотрит наружу оболочки: s растёт от макушки к кромке, u — против
  // часовой стрелки. Порядок здесь важен, от него зависит, куда выдавится
  // надпись и в какую сторону отступает внутренняя поверхность.
  const n = [
    ds[1] * du[2] - ds[2] * du[1],
    ds[2] * du[0] - ds[0] * du[2],
    ds[0] * du[1] - ds[1] * du[0],
  ];
  const len = Math.hypot(n[0], n[1], n[2]) || 1;
  return [n[0] / len, n[1] / len, n[2] / len];
}

/** Толщина стенки: у кромки добавляется внутренний прижимной буртик. */
function wallAt(s) {
  const lipStart = 0.86;
  const t = s <= lipStart ? 0 : (s - lipStart) / (1 - lipStart);
  return CFG.wall + CFG.lip * smoothstep(t);
}

/** Неравномерное распределение колец: купол с надписью гуще, юбка реже. */
function sSamples(rows) {
  const domeRows = Math.round(rows * 0.78);
  const out = [];
  for (let i = 1; i <= domeRows; i++) out.push((DOME_SPLIT * i) / domeRows);
  for (let i = 1; i <= rows - domeRows; i++) {
    out.push(DOME_SPLIT + ((1 - DOME_SPLIT) * i) / (rows - domeRows));
  }
  return out;
}

function buildMesh() {
  const verts = [];
  const tris = [];
  const push = (p) => verts.push(p) - 1;

  const outerS = sSamples(NS_OUT);
  const innerS = sSamples(NS_IN);

  // --- внешняя поверхность с рельефом --------------------------------------
  const outerApex = push([0, 0, CFG.domeHeight + embossAt(0, 0)]);
  const outerRings = outerS.map((s) => {
    const ring = [];
    for (let j = 0; j < NU; j++) {
      const u = (2 * Math.PI * j) / NU;
      const p = basePoint(s, u);
      const h = s <= DOME_SPLIT ? embossAt(p[0], p[1]) : 0;
      if (h > 0) {
        const n = normalAt(s, u);
        ring.push(push([p[0] + n[0] * h, p[1] + n[1] * h, p[2] + n[2] * h]));
      } else {
        ring.push(push(p));
      }
    }
    return ring;
  });

  // --- внутренняя поверхность (гладкая, эквидистанта наружной) --------------
  const innerApex = push([0, 0, CFG.domeHeight - CFG.wall]);
  const innerRings = innerS.map((s) => {
    const ring = [];
    const t = wallAt(s);
    for (let j = 0; j < NU; j++) {
      const u = (2 * Math.PI * j) / NU;
      const p = basePoint(s, u);
      const n = normalAt(s, u);
      ring.push(push([p[0] - n[0] * t, p[1] - n[1] * t, p[2] - n[2] * t]));
    }
    return ring;
  });

  const quad = (a, b, c, d) => {
    tris.push([a, b, c], [a, c, d]);
  };

  // Веер у макушки и лента квадов между кольцами. Обход подобран так, чтобы
  // нормали треугольников смотрели наружу детали.
  for (let j = 0; j < NU; j++) {
    tris.push([outerApex, outerRings[0][j], outerRings[0][(j + 1) % NU]]);
    tris.push([innerApex, innerRings[0][(j + 1) % NU], innerRings[0][j]]);
  }
  for (let i = 0; i < outerRings.length - 1; i++) {
    for (let j = 0; j < NU; j++) {
      const k = (j + 1) % NU;
      quad(outerRings[i][j], outerRings[i + 1][j], outerRings[i + 1][k], outerRings[i][k]);
    }
  }
  for (let i = 0; i < innerRings.length - 1; i++) {
    for (let j = 0; j < NU; j++) {
      const k = (j + 1) % NU;
      quad(innerRings[i][k], innerRings[i + 1][k], innerRings[i + 1][j], innerRings[i][j]);
    }
  }

  // --- торец кромки ---------------------------------------------------------
  const outerRim = outerRings[outerRings.length - 1];
  const innerRim = innerRings[innerRings.length - 1];
  for (let j = 0; j < NU; j++) {
    const k = (j + 1) % NU;
    quad(outerRim[j], innerRim[j], innerRim[k], outerRim[k]);
  }

  return { verts, tris };
}

/**
 * Проверка сетки перед экспортом: замкнутость (каждое ребро ровно в двух
 * треугольниках и в противоположных направлениях) и положительный объём —
 * то есть нормали наружу. Слайсеры на вывернутой сетке молча печатают ерунду.
 */
function validate({ verts, tris }) {
  const seen = new Map();
  let boundary = 0;
  let flipped = 0;

  for (const t of tris) {
    for (let i = 0; i < 3; i++) {
      const a = t[i];
      const b = t[(i + 1) % 3];
      const key = a < b ? `${a}_${b}` : `${b}_${a}`;
      const dir = a < b ? 1 : -1;
      seen.set(key, (seen.get(key) ?? 0) + dir);
    }
  }
  for (const balance of seen.values()) {
    if (balance !== 0) (balance % 2 === 0 ? flipped++ : boundary++);
  }

  let volume = 0;
  for (const [ia, ib, ic] of tris) {
    const a = verts[ia];
    const b = verts[ib];
    const c = verts[ic];
    volume +=
      (a[0] * (b[1] * c[2] - b[2] * c[1]) +
        a[1] * (b[2] * c[0] - b[0] * c[2]) +
        a[2] * (b[0] * c[1] - b[1] * c[0])) /
      6;
  }

  const problems = [];
  if (boundary) problems.push(`${boundary} открытых рёбер`);
  if (flipped) problems.push(`${flipped} рёбер с одинаковым обходом (вывернутые грани)`);
  if (volume <= 0) problems.push('отрицательный объём — сетка вывернута наизнанку');
  if (problems.length) throw new Error(`Сетка не прошла проверку: ${problems.join(', ')}`);

  return { volume: volume / 1000 }; // мм³ → см³
}

// ---------------------------------------------------------------------------
// Экспорт и превью
// ---------------------------------------------------------------------------

function faceNormal(a, b, c) {
  const ux = b[0] - a[0];
  const uy = b[1] - a[1];
  const uz = b[2] - a[2];
  const vx = c[0] - a[0];
  const vy = c[1] - a[1];
  const vz = c[2] - a[2];
  const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
  const len = Math.hypot(n[0], n[1], n[2]) || 1;
  return [n[0] / len, n[1] / len, n[2] / len];
}

function toBinaryStl({ verts, tris }, title) {
  const buf = Buffer.alloc(84 + tris.length * 50);
  buf.write(title.slice(0, 79), 0, 'ascii');
  buf.writeUInt32LE(tris.length, 80);
  let o = 84;
  for (const [ia, ib, ic] of tris) {
    const a = verts[ia];
    const b = verts[ib];
    const c = verts[ic];
    const n = faceNormal(a, b, c);
    for (const v of [n, a, b, c]) {
      buf.writeFloatLE(v[0], o);
      buf.writeFloatLE(v[1], o + 4);
      buf.writeFloatLE(v[2], o + 8);
      o += 12;
    }
    buf.writeUInt16LE(0, o);
    o += 2;
  }
  return buf;
}

function writePng(width, height, rgb) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0; // фильтр строки: none
    rgb.copy(raw, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3);
  }
  const chunk = (type, data) => {
    const out = Buffer.alloc(data.length + 12);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, 'ascii');
    data.copy(out, 8);
    out.writeInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
    return out;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // бит на канал
  ihdr[9] = 2; // truecolor
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

/**
 * Софтверный рендер превью: z-буфер и плоское затенение. Без GPU и библиотек —
 * ровно столько, чтобы увидеть силуэт и блик на буквах.
 */
function renderView({ verts, tris, vn }, cam, outWidth, outHeight, ss = 2) {
  // Кадр рендерится в двойном разрешении и усредняется — дешёвое сглаживание.
  const width = outWidth * ss;
  const height = outHeight * ss;
  const { eye, target, zoom = 1 } = cam;
  const up = [0, 0, 1];

  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const norm = (v) => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  const zAxis = norm(sub(eye, target));
  const xAxis = norm(cross(up, zAxis));
  const yAxis = cross(zAxis, xAxis);
  const focal = 1.55 * zoom * Math.min(width, height) * 0.5;

  const project = (p) => {
    const d = sub(p, eye);
    const cx = dot(d, xAxis);
    const cy = dot(d, yAxis);
    const cz = -dot(d, zAxis); // глубина: положительная перед камерой
    if (cz <= 1) return null;
    return [width / 2 + (focal * cx) / cz, height / 2 - (focal * cy) / cz, cz];
  };

  const rgb = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    // Мягкий вертикальный градиент фона — светлая студия.
    const t = y / height;
    const r = 246 - 26 * t;
    const g = 242 - 26 * t;
    const b = 244 - 24 * t;
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 3;
      rgb[o] = r;
      rgb[o + 1] = g;
      rgb[o + 2] = b;
    }
  }
  const zbuf = new Float32Array(width * height).fill(Infinity);

  const key = norm([-0.45, -0.7, 0.8]);
  const fill = norm([0.8, -0.2, 0.25]);
  const view = norm(sub(eye, target));
  const base = [238, 150, 176]; // розовый силикон, как на референсе

  const halfVec = norm([key[0] + view[0], key[1] + view[1], key[2] + view[2]]);

  for (const [ia, ib, ic] of tris) {
    const a = verts[ia];
    const b = verts[ib];
    const c = verts[ic];
    // Оболочка открыта снизу, поэтому грани не отбрасываются: изнанка просто
    // подсвечивается по вывернутой нормали, а глубину разруливает z-буфер.
    const inside = dot(faceNormal(a, b, c), norm(sub(eye, a))) <= 0;
    const tint = inside ? 0.74 : 1; // внутренняя сторона в тени

    const pa = project(a);
    const pb = project(b);
    const pc = project(c);
    if (!pa || !pb || !pc) continue;

    const area = (pb[0] - pa[0]) * (pc[1] - pa[1]) - (pb[1] - pa[1]) * (pc[0] - pa[0]);
    if (area === 0) continue;

    const minX = Math.max(0, Math.floor(Math.min(pa[0], pb[0], pc[0])));
    const maxX = Math.min(width - 1, Math.ceil(Math.max(pa[0], pb[0], pc[0])));
    const minY = Math.max(0, Math.floor(Math.min(pa[1], pb[1], pc[1])));
    const maxY = Math.min(height - 1, Math.ceil(Math.max(pa[1], pb[1], pc[1])));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const w0 = ((pb[0] - pa[0]) * (py - pa[1]) - (pb[1] - pa[1]) * (px - pa[0])) / area;
        const w1 = ((px - pa[0]) * (pc[1] - pa[1]) - (py - pa[1]) * (pc[0] - pa[0])) / area;
        if (w0 < 0 || w1 < 0 || w0 + w1 > 1) continue;
        const z = pa[2] + w1 * (pb[2] - pa[2]) + w0 * (pc[2] - pa[2]);
        const idx = y * width + x;
        if (z >= zbuf[idx]) continue;
        zbuf[idx] = z;

        // Затенение по интерполированной нормали (Фонг).
        const w2 = 1 - w0 - w1;
        let nx = w2 * vn[ia * 3] + w1 * vn[ib * 3] + w0 * vn[ic * 3];
        let ny = w2 * vn[ia * 3 + 1] + w1 * vn[ib * 3 + 1] + w0 * vn[ic * 3 + 1];
        let nz = w2 * vn[ia * 3 + 2] + w1 * vn[ib * 3 + 2] + w0 * vn[ic * 3 + 2];
        const nl = Math.hypot(nx, ny, nz) || 1;
        nx /= nl;
        ny /= nl;
        nz /= nl;
        if (inside) {
          nx = -nx;
          ny = -ny;
          nz = -nz;
        }
        const nd = (v) => nx * v[0] + ny * v[1] + nz * v[2];
        const spec = Math.pow(Math.max(0, nd(halfVec)), 46) * 0.9;
        const light = 0.34 + 0.7 * Math.max(0, nd(key)) + 0.22 * Math.max(0, nd(fill));
        const shade = (ch) => Math.max(0, Math.min(255, (ch * light + 255 * spec) * tint));

        const o = idx * 3;
        rgb[o] = shade(base[0]);
        rgb[o + 1] = shade(base[1]);
        rgb[o + 2] = shade(base[2]);
      }
    }
  }

  // Даунсэмплинг до итогового размера кадра.
  const out = Buffer.alloc(outWidth * outHeight * 3);
  const n = ss * ss;
  for (let y = 0; y < outHeight; y++) {
    for (let x = 0; x < outWidth; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const o = ((y * ss + sy) * width + x * ss + sx) * 3;
          r += rgb[o];
          g += rgb[o + 1];
          b += rgb[o + 2];
        }
      }
      const o = (y * outWidth + x) * 3;
      out[o] = r / n;
      out[o + 1] = g / n;
      out[o + 2] = b / n;
    }
  }

  return out;
}

/** Нормали усредняются по вершинам: иначе купол гранёный, а буквы в фасетках. */
function vertexNormals({ verts, tris }) {
  const vn = new Float64Array(verts.length * 3);
  for (const [ia, ib, ic] of tris) {
    const n = faceNormal(verts[ia], verts[ib], verts[ic]);
    for (const i of [ia, ib, ic]) {
      vn[i * 3] += n[0];
      vn[i * 3 + 1] += n[1];
      vn[i * 3 + 2] += n[2];
    }
  }
  for (let i = 0; i < verts.length; i++) {
    const l = Math.hypot(vn[i * 3], vn[i * 3 + 1], vn[i * 3 + 2]) || 1;
    vn[i * 3] /= l;
    vn[i * 3 + 1] /= l;
    vn[i * 3 + 2] /= l;
  }
  return vn;
}

/** Три ракурса в одну картинку: общий вид, вид сверху и изнанка с буртиком. */
function renderPreview(mesh, tileW = 660, tileH = 640) {
  const scene = { ...mesh, vn: vertexNormals(mesh) };
  const cams = [
    { eye: [52, -92, 66], target: [0, 0, 2], zoom: 1.5 },
    { eye: [0, -26, 132], target: [0, 0, 6], zoom: 1.4 },
    { eye: [46, -84, -62], target: [0, 0, -4], zoom: 1.5 },
  ];

  const tiles = cams.map((cam) => renderView(scene, cam, tileW, tileH));
  const width = tileW * tiles.length;
  const out = Buffer.alloc(width * tileH * 3);
  tiles.forEach((tile, i) => {
    for (let y = 0; y < tileH; y++) {
      tile.copy(out, (y * width + i * tileW) * 3, y * tileW * 3, (y + 1) * tileW * 3);
    }
  });

  return writePng(width, tileH, out);
}

// ---------------------------------------------------------------------------

const started = Date.now();
const mesh = buildMesh();
const { volume } = validate(mesh);
await mkdir(OUT, { recursive: true });

const stl = toBinaryStl(mesh, `Plastic Show ear-pad cover — ${CFG.text}`);
await writeFile(`${OUT}plastic-show-earpad-cover.stl`, stl);

if (!args['no-preview']) {
  await writeFile(`${OUT}plastic-show-earpad-cover.png`, renderPreview(mesh));
}

console.log(
  [
    `Надпись:     «${CFG.text}» — ширина ${TEXT.width.toFixed(1)} мм, кегль ${TEXT.em.toFixed(1)} мм,`,
    `             рельеф ${CFG.embossHeight} мм`,
    `Габарит:     ${CFG.outerWidth} × ${CFG.outerDepth} × ${(CFG.domeHeight + CFG.skirtHeight).toFixed(1)} мм`,
    `Стенка:      ${CFG.wall} мм, буртик по кромке +${CFG.lip} мм`,
    `Сетка:       ${mesh.verts.length} вершин, ${mesh.tris.length} треугольников, замкнута`,
    `Объём:       ${volume.toFixed(1)} см³ (≈ ${(volume * 1.15).toFixed(0)} г силикона)`,
    `Файлы:       assets/3d/plastic-show-earpad-cover.stl (${(stl.length / 1048576).toFixed(1)} МБ)`,
    `Время:       ${((Date.now() - started) / 1000).toFixed(1)} с`,
  ].join('\n'),
);
