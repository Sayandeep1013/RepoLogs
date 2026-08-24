/* Hand-drawn circle vocabulary. Nothing here is a perfect circle. */

/* the irregular ring, from ikony's own SVG path data (viewBox 0 0 110 106) */
export const RING_D =
  'M109 53C109 15.0693 84.5945 1 54.943 1C25.4055 1 1 16.5325 1 53.2251C1 90.7056 25.4055 105 54.943 105C84.5945 105 109 90.7056 109 53Z';

/* a second, differently-wobbled ring (viewBox 0 0 51 49) for small buttons */
export const RING_SM_D =
  'M25.7,0.8c13.2,0,24,6.4,24,23.5c0,17-10.8,23.5-24,23.5c-13.1,0-24-6.5-24-23.4C1.7,7.8,12.6,0.8,25.7,0.8z';

export const ring = (cls = '') =>
  `<svg class="ring ${cls}" viewBox="0 0 110 106" aria-hidden="true"><path d="${RING_D}"/></svg>`;

export const ringSm = (cls = '') =>
  `<svg class="ring-sm ${cls}" viewBox="0 0 51 49" aria-hidden="true"><path d="${RING_SM_D}"/></svg>`;

/* circled numeral — the chapter mark */
export const numeral = (n, big = false) =>
  `<span class="numeral${big ? ' numeral--big' : ''}">${ring()}<b>${n}</b></span>`;

/* circled icon buttons, each on its wobbled ring */
const glyphs = {
  play: 'M20 14 L35 24.5 L20 35 Z',
  arrow: 'M15 24.5 H34 M28 18 L35 24.5 L28 31',
  ext: 'M18 31 L33 17 M23 17 H33 V27',
  plus: 'M25.5 16 V33 M17 24.5 H34',
};

export const iconBtn = (glyph, label, href = null, cls = '', attrs = '') => {
  const g = glyphs[glyph] || glyphs.arrow;
  const filled = glyph === 'play';
  const inner = `<svg viewBox="0 0 51 49" aria-hidden="true"><path class="o" d="${RING_SM_D}"/><path class="g${
    filled ? ' fill' : ''
  }" d="${g}"/></svg>`;
  const extra = attrs ? ' ' + attrs : '';
  return href
    ? `<a class="icon-btn ${cls}" href="${href}" aria-label="${label}"${extra}${
        href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''
      }>${inner}</a>`
    : `<button class="icon-btn ${cls}" type="button" aria-label="${label}"${extra}>${inner}</button>`;
};

/* ------------------------------------------------------------------
   The D of .DEV, drawn as a letterform and used as a window. Media goes
   inside the clip; the edges are stroked on top so it still reads as a D.
   ------------------------------------------------------------------ */
/* A slab-serif D, to sit with the display serif the loader is set in.
   The notch on the left of the outer path is what makes the serifs. */
export const D_OUTER =
  'M12 12 H66 C95 12 110 34 110 64 C110 94 95 116 66 116 H12 V107 H29 V21 H12 Z';
export const D_INNER = 'M57 45 H63 C73 45 79 53 79 64 C79 75 73 83 63 83 H57 Z';

export const dWindow = (id = 'dwin') => `<svg class="dwin" viewBox="0 0 124 130" aria-hidden="true">
  <defs>
    <clipPath id="${id}" clipPathUnits="userSpaceOnUse">
      <path d="${D_OUTER} ${D_INNER}" clip-rule="evenodd"/>
    </clipPath>
  </defs>
  <g class="dwin__media" clip-path="url(#${id})"></g>
  <path class="dwin__edge" d="${D_OUTER}"/>
  <path class="dwin__edge" d="${D_INNER}"/>
</svg>`;

/* Printer's registration marks. One small SVG per corner rather than one
   stretched box — a single viewBox scaled to the viewport would give the
   horizontal and vertical arms wildly different lengths. */
const CORNERS = ['tl', 'tr', 'bl', 'br'];
export const cropMarks = () =>
  `<div class="crops" aria-hidden="true">` +
  CORNERS.map(
    (c) =>
      `<svg class="crop crop--${c}" viewBox="0 0 26 26"><path class="c" d="M0 6 H6 M6 0 V6"/></svg>`
  ).join('') +
  `</div>`;

/* ------------------------------------------------------------------
   The frieze — a long technical elevation along the base of a track,
   drawn progressively as you scroll. Deterministic from the chapter
   slug, so each chapter has its own silhouette and it never changes
   between builds.
   ------------------------------------------------------------------ */
function seeded(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function frieze(slug, units) {
  const rnd = seeded(slug);
  const W = Math.max(240, units * 10);
  const BASE = 104;
  let d = `M0 ${BASE}`;
  const detail = [];
  let x = 0;
  while (x < W) {
    const w = 3 + Math.floor(rnd() * 10);
    const h = 10 + Math.floor(rnd() * 62);
    const y = BASE - h;
    d += ` L${x} ${y} L${x + w} ${y}`;
    /* occasional roof furniture, so it reads as drawn rather than generated */
    const r = rnd();
    if (r > 0.82 && h > 34) {
      detail.push(`M${(x + w / 2).toFixed(1)} ${y} V${(y - 9 - rnd() * 8).toFixed(1)}`);
    } else if (r < 0.14 && w > 7) {
      const yy = (y + h * 0.45).toFixed(1);
      detail.push(`M${(x + 1).toFixed(1)} ${yy} H${(x + w - 1).toFixed(1)}`);
    }
    x += w;
    d += ` L${x} ${BASE}`;
  }
  d += ` L${W} ${BASE}`;
  return `<svg class="frieze" viewBox="0 0 ${W} 116" preserveAspectRatio="none" aria-hidden="true">
    <path class="frieze__line" d="${d}"/>
    ${detail.length ? `<path class="frieze__detail" d="${detail.join(' ')}"/>` : ''}
    <path class="frieze__base" d="M0 ${BASE + 8} H${W}"/>
  </svg>`;
}

/* the wordmark — REIN.DEV, with the D as the window */
export const wordmark = () =>
  `<span class="wordmark"><span class="wordmark__a">REIN.</span>${dWindow(
    'dwin-load'
  )}<span class="wordmark__b">EV</span></span>`;
