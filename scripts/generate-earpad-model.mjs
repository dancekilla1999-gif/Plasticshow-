/**
 * Builds the 3D models of the silicone ear-cup covers for AirPods Max —
 * left and right, with the raised "PLASTIC SHOW" wordmark on the outer face and
 * openings for the headband arm, the controls, the charging port and the mics.
 *
 * Everything is parametric and dependency-free. The cup is a surface of
 * revolution over an elliptical footprint; the cover is that surface offset
 * outwards by the fit clearance and the wall thickness. Openings are cut on the
 * grid-cell level and stitched with a wall between the outer and the inner
 * shell, so the result stays watertight. The wordmark is a stroke font turned
 * into a distance field and pushed out along the surface normal.
 *
 * Run with `npm run model`. Outputs into assets/3d/:
 *   airpods-max-cover-<side>.stl        накладка, миллиметры, готова к печати
 *   airpods-max-cover-gauge-<side>.stl  шаблон-кольцо для примерки
 *   airpods-max-cover.png               рендер-превью, четыре ракурса
 *
 * ВАЖНО: CAD-модели Apple в открытом доступе нет. Габариты чашки взяты по
 * опубликованным размерам и по размерам сменных амбушюр (100 × 85 мм), а
 * положения органов управления — оценочные. Поэтому сначала печатается шаблон
 * (`*-gauge-*.stl`): он проверяет и обхват, и совпадение вырезов. Все числа,
 * которые может понадобиться поправить, собраны в CUP / FIT / CUTOUTS ниже.
 *
 * Useful flags:
 *   --text="OTHER WORDS"   заменить надпись
 *   --side=right|left|both какую сторону собирать (по умолчанию обе)
 *   --quality=high|med|low плотность сетки (по умолчанию med)
 *   --no-mics              не резать окна под микрофоны
 *   --no-preview           не рендерить PNG
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

/**
 * Чашка AirPods Max, все размеры в миллиметрах. Ось X — передне-задняя (короткая),
 * ось Y — вертикальная в надетом положении (длинная), Z — наружу от головы.
 */
const CUP = {
  width: 85, // передне-задний размер чашки
  height: 100, // вертикальный размер чашки
  faceSpan: 0.72, // доля радиуса под плоской лицевой площадкой
  faceSag: 2.2, // насколько площадка завалена к краю
  shoulderDrop: 6.5, // высота скругления от площадки до самого широкого места
  sideHeight: 13, // прямая боковина от широкого места до стыка с амбушюрой
  sideTaper: 0.022, // боковина сужается книзу — за это накладка и держится
};

/** Посадка накладки на чашку. */
const FIT = {
  clearance: 0.35, // зазор между чашкой и накладкой
  wall: 1.6, // толщина стенки
  coverSide: 11, // сколько боковины закрывает накладка: меньше sideHeight,
  // чтобы кромка не упиралась в амбушюру
  bead: 0.45, // натяг прижимного бортика по кромке
  beadSpan: 2.6, // высота, на которой бортик набирает натяг
};

const TEXT_CFG = {
  text: typeof args.text === 'string' ? args.text : 'PLASTIC SHOW',
  capHeight: 6.6, // высота прописных букв
  strokeWidth: 1.4, // толщина штриха
  letterSpacing: 0.06, // в долях кегля
  embossHeight: 0.75, // насколько надпись выступает над площадкой
  embossEdge: 0.8, // доля штриха, уходящая в скруглённую фаску
  centerY: 0, // сдвиг надписи по вертикали
  maxWidth: 54, // строка длиннее — кегль ужимается
};

/**
 * Вырезы. Положение задаётся «по циферблату» вокруг чашки, если смотреть на неё
 * снаружи: 0° — верх, 90° — перёд (к лицу), 180° — низ, 270° — затылок. Для левой
 * накладки перёд зеркалится автоматически. `width` — ширина окна по кромке в мм,
 * `top` и `bottom` — границы по высоте, где 0 — самое широкое место чашки, а
 * кромка накладки лежит на −11 мм. bottom: −99 означает «до самого низа», то есть
 * открытый вырез в кромке.
 */
const CUTOUTS = [
  {
    id: 'arm',
    label: 'дуга оголовья',
    clock: 0,
    width: 22,
    top: 4,
    bottom: -99,
    radius: 5,
    sides: ['left', 'right'],
  },
  {
    // Digital Crown и кнопка шумоподавления стоят рядом на верхнем торце правой
    // чашки. Точное расстояние между ними проверить не на чем, поэтому окно одно
    // и с запасом: так доступны оба органа управления при любой их раскладке.
    // Если промерить реальные позиции, окно легко разбить на два круглых.
    // Между этим окном и вырезом под дугу остаётся перемычка около 10 мм: у́же
    // делать не стоит, силикон в этом месте начинает заворачиваться.
    id: 'controls',
    label: 'Digital Crown + кнопка шума',
    clock: -44, // верхний торец, ближе к затылочной стороне
    width: 32,
    top: 4,
    bottom: -9.5,
    radius: 6,
    sides: ['right'],
  },
  {
    id: 'port',
    label: 'разъём зарядки',
    clock: 180,
    width: 18,
    top: -2.5,
    bottom: -99,
    radius: 4,
    sides: ['right'],
  },
  {
    id: 'mic-top',
    label: 'микрофон, верх',
    clock: 68,
    width: 9,
    top: -1.5,
    bottom: -6,
    radius: 2.2,
    sides: ['left', 'right'],
    optional: true,
  },
  {
    id: 'mic-bottom',
    label: 'микрофон, низ',
    clock: 128,
    width: 9,
    top: -4,
    bottom: -8.5,
    radius: 2.2,
    sides: ['left', 'right'],
    optional: true,
  },
];

const QUALITY = { low: [256, 62], med: [416, 100], high: [704, 168] };
const [NU, NS] = QUALITY[args.quality] ?? QUALITY.med;
const WITH_MICS = !args['no-mics'];
const SIDES = args.side === 'left' || args.side === 'right' ? [args.side] : ['right', 'left'];

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
function layoutText(cfg) {
  const glyphs = [...cfg.text.toUpperCase()].map((ch) => {
    const g = FONT[ch];
    if (!g) throw new Error(`Нет глифы для «${ch}» — добавьте её в FONT`);
    return g;
  });

  const advance = glyphs.reduce((sum, g) => sum + g.adv + cfg.letterSpacing, 0) - cfg.letterSpacing;
  // Кегль ужимается, если строка не влезает в отведённую ширину площадки.
  const em = Math.min(cfg.capHeight, cfg.maxWidth / advance);
  const width = advance * em;

  const segments = [];
  let pen = -width / 2;
  const baseline = cfg.centerY - em / 2;

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

const TEXT = layoutText(TEXT_CFG);

// Габарит надписи с запасом на штрих — по нему быстро отсекаются точки сетки,
// которые к буквам заведомо не относятся.
const PAD = TEXT_CFG.strokeWidth / 2 + 0.5;
const BOX = TEXT.segments
  .reduce(
    (b, [x0, y0, x1, y1]) => [
      Math.min(b[0], x0, x1),
      Math.min(b[1], y0, y1),
      Math.max(b[2], x0, x1),
      Math.max(b[3], y0, y1),
    ],
    [Infinity, Infinity, -Infinity, -Infinity],
  )
  .map((v, i) => (i < 2 ? v - PAD : v + PAD));

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

/** Высота рельефа надписи в точке (x, y) лицевой площадки. */
function embossAt(x, y) {
  if (x < BOX[0] || x > BOX[2] || y < BOX[1] || y > BOX[3]) return 0;

  const r = TEXT_CFG.strokeWidth / 2;
  let d = Infinity;
  for (const s of TEXT.segments) {
    const dist = distToSegment(x, y, s[0], s[1], s[2], s[3]);
    if (dist < d) d = dist;
  }
  if (d >= r) return 0;

  // Плоская вершина штриха и скруглённый спуск к поверхности — так буквы
  // печатаются без нависаний и приятно ловят свет. Фаска специально шире шага
  // сетки: иначе край буквы попадает между вершинами и получается «лесенка».
  return TEXT_CFG.embossHeight * smoothstep((1 - d / r) / TEXT_CFG.embossEdge);
}

// ---------------------------------------------------------------------------
// Поверхность чашки
// ---------------------------------------------------------------------------

const A = CUP.width / 2;
const B = CUP.height / 2;
const RIM_Z = -FIT.coverSide;

/**
 * Профиль чашки в координатах (доля радиуса, высота в мм): плоская площадка,
 * скругление плеча, прямая боковина. Считается один раз и перепараметризуется
 * по длине дуги, чтобы кольца сетки ложились равномерно.
 */
const PROFILE = (() => {
  const pts = [];
  const zTop = CUP.faceSag + CUP.shoulderDrop;
  const push = (rho, z) => pts.push([rho, z]);

  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    push(t * CUP.faceSpan, zTop - CUP.faceSag * t * t);
  }
  for (let i = 1; i <= 40; i++) {
    const a = ((i / 40) * Math.PI) / 2;
    push(CUP.faceSpan + (1 - CUP.faceSpan) * Math.sin(a), CUP.shoulderDrop * Math.cos(a));
  }
  for (let i = 1; i <= 40; i++) {
    const m = i / 40;
    push(1 - CUP.sideTaper * m, -FIT.coverSide * m);
  }

  // Длина дуги считается по среднему радиусу: эллипс отличается от окружности
  // не настолько, чтобы это влияло на раскладку колец.
  const scale = (A + B) / 2;
  const arcs = [0];
  for (let i = 1; i < pts.length; i++) {
    const dr = (pts[i][0] - pts[i - 1][0]) * scale;
    const dz = pts[i][1] - pts[i - 1][1];
    arcs.push(arcs[i - 1] + Math.hypot(dr, dz));
  }
  return { pts, arcs, total: arcs[arcs.length - 1] };
})();

/** Точка профиля по нормированной длине дуги s ∈ [0, 1]. */
function profile(s) {
  const target = s * PROFILE.total;
  const { pts, arcs } = PROFILE;
  let lo = 0;
  let hi = arcs.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (arcs[mid] <= target) lo = mid;
    else hi = mid;
  }
  const span = arcs[hi] - arcs[lo] || 1;
  const t = (target - arcs[lo]) / span;
  return {
    rho: pts[lo][0] + (pts[hi][0] - pts[lo][0]) * t,
    z: pts[lo][1] + (pts[hi][1] - pts[lo][1]) * t,
  };
}

function cupPoint(s, u) {
  const { rho, z } = profile(s);
  return [A * rho * Math.cos(u), B * rho * Math.sin(u), z];
}

const EPS = 1e-4;

/** Нормаль к чашке. ds × du смотрит наружу: s растёт от центра к кромке. */
function cupNormal(s, u) {
  if (s < EPS) return [0, 0, 1];
  const p0 = cupPoint(Math.max(0, s - EPS), u);
  const p1 = cupPoint(Math.min(1, s + EPS), u);
  const q0 = cupPoint(s, u - EPS);
  const q1 = cupPoint(s, u + EPS);
  const ds = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
  const du = [q1[0] - q0[0], q1[1] - q0[1], q1[2] - q0[2]];
  const n = [
    ds[1] * du[2] - ds[2] * du[1],
    ds[2] * du[0] - ds[0] * du[2],
    ds[0] * du[1] - ds[1] * du[0],
  ];
  const len = Math.hypot(n[0], n[1], n[2]) || 1;
  return [n[0] / len, n[1] / len, n[2] / len];
}

/** Внутренний зазор: у кромки переходит в натяг, за счёт него накладка сидит. */
function innerOffset(z) {
  const grip = smoothstep((RIM_Z + FIT.beadSpan - z) / FIT.beadSpan);
  return FIT.clearance - (FIT.clearance + FIT.bead) * grip;
}

// ---------------------------------------------------------------------------
// Вырезы
// ---------------------------------------------------------------------------

const wrapPi = (a) => {
  let v = a;
  while (v > Math.PI) v -= 2 * Math.PI;
  while (v < -Math.PI) v += 2 * Math.PI;
  return v;
};

/** Длина дуги кромки от верхней точки чашки до параметра u, со знаком. */
function rimArcLength(u) {
  const from = Math.PI / 2;
  const delta = wrapPi(u - from);
  const steps = 400;
  let len = 0;
  for (let i = 0; i < steps; i++) {
    const a = from + (delta * i) / steps;
    const b = from + (delta * (i + 1)) / steps;
    len += Math.hypot(A * (Math.cos(b) - Math.cos(a)), B * (Math.sin(b) - Math.sin(a)));
  }
  return delta < 0 ? len : -len;
}

/**
 * Готовит вырезы для одной стороны: положение «по циферблату» переводится в
 * параметр эллипса, ширина в мм — в угловую через местный масштаб кромки.
 */
function prepareCutouts(side) {
  const dir = side === 'right' ? 1 : -1;
  return CUTOUTS.filter((c) => c.sides.includes(side))
    .filter((c) => WITH_MICS || !c.optional)
    .map((c) => {
      const a = (c.clock * Math.PI) / 180;
      const u0 = Math.atan2(Math.cos(a) / B, (Math.sin(a) * dir) / A);
      const bottom = Math.max(c.bottom, RIM_Z - 8);
      return {
        ...c,
        u0,
        scale: Math.hypot(A * Math.sin(u0), B * Math.cos(u0)), // мм на радиан
        zc: (c.top + bottom) / 2,
        halfH: (c.top - bottom) / 2,
        halfW: c.width / 2,
        // Расстояние по кромке от верхней точки — по нему удобно сверяться с
        // реальной чашкой линейкой.
        rimArc: rimArcLength(u0),
      };
    });
}

/** Попадает ли точка поверхности в окно (скруглённый прямоугольник). */
function isCut(cutouts, u, z) {
  for (const c of cutouts) {
    const t = wrapPi(u - c.u0) * c.scale;
    const dx = Math.max(Math.abs(t) - (c.halfW - c.radius), 0);
    const dy = Math.max(Math.abs(z - c.zc) - (c.halfH - c.radius), 0);
    if (Math.hypot(dx, dy) <= c.radius) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Сетка
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

/**
 * Собирает накладку. Ячейки сетки, попавшие в вырезы, выбрасываются, а по краю
 * оставшихся между наружной и внутренней оболочкой встаёт стенка — поэтому
 * деталь с окнами остаётся замкнутой.
 */
function buildCover(side, { band = false } = {}) {
  const cutouts = prepareCutouts(side);
  const verts = [];
  const tris = [];
  const push = (p) => verts.push(p) - 1;

  const sAt = (i) => i / NS;
  const uAt = (j) => (2 * Math.PI * j) / NU;

  const outer = new Int32Array((NS + 1) * NU).fill(-1);
  const inner = new Int32Array((NS + 1) * NU).fill(-1);
  const apexZ = profile(0).z;
  const outerApex = push([0, 0, apexZ + FIT.clearance + FIT.wall + embossAt(0, 0)]);
  const innerApex = push([0, 0, apexZ + innerOffset(apexZ)]);

  for (let i = 1; i <= NS; i++) {
    const s = sAt(i);
    for (let j = 0; j < NU; j++) {
      const u = uAt(j);
      const p = cupPoint(s, u);
      const n = cupNormal(s, u);
      // Надпись живёт только на лицевой площадке, до начала скругления плеча.
      const h = p[2] > CUP.shoulderDrop - 0.01 ? embossAt(p[0], p[1]) : 0;
      const out = FIT.clearance + FIT.wall + h;
      const inn = innerOffset(p[2]);
      outer[i * NU + j] = push([p[0] + n[0] * out, p[1] + n[1] * out, p[2] + n[2] * out]);
      inner[i * NU + j] = push([p[0] + n[0] * inn, p[1] + n[1] * inn, p[2] + n[2] * inn]);
    }
  }

  const outerAt = (i, j) => (i === 0 ? outerApex : outer[i * NU + j]);
  const innerAt = (i, j) => (i === 0 ? innerApex : inner[i * NU + j]);

  // Маска ячеек. Ячейка i лежит между кольцами i и i+1; нулевая — треугольная,
  // она упирается в полюс.
  const keep = new Uint8Array(NS * NU);
  const centers = new Float64Array(NS * NU * 3);
  for (let i = 0; i < NS; i++) {
    const s = (sAt(i) + sAt(i + 1)) / 2;
    for (let j = 0; j < NU; j++) {
      const u = uAt(j) + Math.PI / NU;
      const p = cupPoint(s, u);
      // Шаблон для примерки — та же деталь, но обрезанная до пояска по кромке.
      const cut = isCut(cutouts, u, p[2]) || (band && p[2] > 1.5);
      keep[i * NU + j] = cut ? 0 : 1;
      centers.set(p, (i * NU + j) * 3);
    }
  }

  const kept = (i, j) => i >= 0 && i < NS && keep[i * NU + ((j + NU) % NU)] === 1;
  const quad = (a, b, c, d) => tris.push([a, b, c], [a, c, d]);

  for (let i = 0; i < NS; i++) {
    for (let j = 0; j < NU; j++) {
      if (!keep[i * NU + j]) continue;
      const k = (j + 1) % NU;

      // Наружная и внутренняя поверхности ячейки. Обход подобран так, чтобы
      // нормали смотрели наружу детали; проверяется объёмом в validate().
      if (i === 0) {
        tris.push([outerApex, outerAt(1, j), outerAt(1, k)]);
        tris.push([innerApex, innerAt(1, k), innerAt(1, j)]);
      } else {
        quad(outerAt(i, j), outerAt(i + 1, j), outerAt(i + 1, k), outerAt(i, k));
        quad(innerAt(i, k), innerAt(i + 1, k), innerAt(i + 1, j), innerAt(i, j));
      }

      // Стенка по краю выреза и по кромке накладки.
      const cx = centers[(i * NU + j) * 3];
      const cy = centers[(i * NU + j) * 3 + 1];
      const cz = centers[(i * NU + j) * 3 + 2];
      const edges = [
        [i > 0 && !kept(i - 1, j), [i, j], [i, k]],
        [!kept(i + 1, j), [i + 1, j], [i + 1, k]],
        [!kept(i, j - 1), [i, j], [i + 1, j]],
        [!kept(i, j + 1), [i, k], [i + 1, k]],
      ];

      for (const [isBoundary, ea, eb] of edges) {
        if (!isBoundary) continue;
        const oa = outerAt(ea[0], ea[1]);
        const ob = outerAt(eb[0], eb[1]);
        if (oa === ob) continue; // вырожденное ребро у полюса
        const ia = innerAt(ea[0], ea[1]);
        const ib = innerAt(eb[0], eb[1]);

        // Направление «наружу материала» — от центра ячейки к середине ребра.
        const refX = (verts[oa][0] + verts[ob][0]) / 2 - cx;
        const refY = (verts[oa][1] + verts[ob][1]) / 2 - cy;
        const refZ = (verts[oa][2] + verts[ob][2]) / 2 - cz;
        const n = faceNormal(verts[oa], verts[ob], verts[ib]);
        if (n[0] * refX + n[1] * refY + n[2] * refZ >= 0) quad(oa, ob, ib, ia);
        else quad(ob, oa, ia, ib);
      }
    }
  }

  return { verts, tris, cutouts };
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
      seen.set(key, (seen.get(key) ?? 0) + (a < b ? 1 : -1));
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
 * Софтверный рендер: z-буфер и затенение по усреднённым нормалям. Без GPU и
 * библиотек — ровно столько, чтобы увидеть силуэт, вырезы и блик на буквах.
 */
function renderView({ verts, tris, vn }, cam, outWidth, outHeight, ss = 2) {
  // Кадр рендерится в двойном разрешении и усредняется — дешёвое сглаживание.
  const width = outWidth * ss;
  const height = outHeight * ss;
  const { eye, target, up = [0, 0, 1], zoom = 1 } = cam;

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
    const cz = -dot(d, zAxis); // глубина: положительная перед камерой
    if (cz <= 1) return null;
    return [width / 2 + (focal * dot(d, xAxis)) / cz, height / 2 - (focal * dot(d, yAxis)) / cz, cz];
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
    // Оболочка открыта снизу и в вырезах, поэтому грани не отбрасываются:
    // изнанка подсвечивается по вывернутой нормали, глубину решает z-буфер.
    const inside = dot(faceNormal(a, b, c), norm(sub(eye, a))) <= 0;
    const tint = inside ? 0.74 : 1;

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
        const spec = Math.pow(Math.max(0, nd(halfVec)), 46) * 0.5;
        const light = 0.32 + 0.6 * Math.max(0, nd(key)) + 0.18 * Math.max(0, nd(fill));
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

/** Нормали усредняются по вершинам: иначе поверхность выглядит гранёной. */
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

/**
 * Пять кадров в одну картинку: общий вид, лицо с надписью, верхний торец с
 * вырезами под дугу и органы управления, изнанка с прижимным бортиком и
 * шаблон для примерки.
 */
function renderPreview(cover, gauge, tileW = 560, tileH = 620) {
  const coverScene = { ...cover, vn: vertexNormals(cover) };
  const gaugeScene = { ...gauge, vn: vertexNormals(gauge) };
  const shots = [
    [coverScene, { eye: [78, -96, 92], target: [0, 0, -2], zoom: 1.62 }],
    [coverScene, { eye: [0, -10, 190], target: [0, 0, 4], up: [0, 1, 0], zoom: 1.7 }],
    [coverScene, { eye: [58, 132, 96], target: [0, 26, -3], zoom: 1.7 }],
    [coverScene, { eye: [70, -88, -84], target: [0, 0, -8], zoom: 1.62 }],
    [gaugeScene, { eye: [72, -92, 78], target: [0, 0, -6], zoom: 1.7 }],
  ];

  const tiles = shots.map(([scene, cam]) => renderView(scene, cam, tileW, tileH));
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
await mkdir(OUT, { recursive: true });

const HALF_RIM = Math.abs(rimArcLength(-Math.PI / 2)); // полпериметра кромки
const report = [];

for (const side of SIDES) {
  const cover = buildCover(side);
  const { volume } = validate(cover);
  const stl = toBinaryStl(cover, `PLASTIC SHOW - AirPods Max cover, ${side}`);
  await writeFile(`${OUT}airpods-max-cover-${side}.stl`, stl);

  const gauge = buildCover(side, { band: true });
  validate(gauge);
  const gaugeStl = toBinaryStl(gauge, `PLASTIC SHOW - fit gauge, ${side}`);
  await writeFile(`${OUT}airpods-max-cover-gauge-${side}.stl`, gaugeStl);

  report.push(
    `${side === 'right' ? 'Правая' : 'Левая'} накладка: ${cover.tris.length} треугольников, ` +
      `${volume.toFixed(1)} см³ (≈ ${(volume * 1.15).toFixed(0)} г), ` +
      `${(stl.length / 1048576).toFixed(1)} МБ; шаблон ${(gaugeStl.length / 1048576).toFixed(1)} МБ`,
  );
  for (const c of cover.cutouts) {
    // Направление называется по циферблату, а не по модели: у левой накладки
    // ось X зеркальная, и «вперёд» в её координатах — это затылок.
    const forward = ((c.clock % 360) + 360) % 360 < 180;
    const arc = Math.abs(c.rimArc);
    const where =
      arc < 3
        ? 'на верхней точке'
        : arc > HALF_RIM - 6
          ? 'на нижней точке'
          : `${forward ? 'вперёд' : 'назад'} на ${arc.toFixed(0)} мм`;
    report.push(
      `   ${c.label.padEnd(28)} по кромке ${(where + ',').padEnd(20)} окно ${String(c.width).padStart(2)} мм`,
    );
  }

  if (side === SIDES[0] && !args['no-preview']) {
    await writeFile(`${OUT}airpods-max-cover.png`, renderPreview(cover, gauge));
  }
}

console.log(
  [
    `Чашка:     ${CUP.width} × ${CUP.height} мм, боковина ${CUP.sideHeight} мм`,
    `Накладка:  ${(CUP.width + 2 * (FIT.clearance + FIT.wall)).toFixed(1)} × ` +
      `${(CUP.height + 2 * (FIT.clearance + FIT.wall)).toFixed(1)} мм снаружи, стенка ${FIT.wall} мм, ` +
      `закрывает ${FIT.coverSide} мм боковины`,
    `Посадка:   зазор ${FIT.clearance} мм, натяг по кромке ${FIT.bead} мм`,
    `Надпись:   «${TEXT_CFG.text}» — ${TEXT.width.toFixed(1)} мм, кегль ${TEXT.em.toFixed(1)} мм, ` +
      `рельеф ${TEXT_CFG.embossHeight} мм`,
    ...report,
    `Время:     ${((Date.now() - started) / 1000).toFixed(1)} с`,
    '',
    'Сначала напечатайте шаблон airpods-max-cover-gauge-*.stl и примерьте на чашку:',
    'он проверяет и обхват, и совпадение вырезов. Размеры правятся в CUP / FIT / CUTOUTS.',
  ].join('\n'),
);
