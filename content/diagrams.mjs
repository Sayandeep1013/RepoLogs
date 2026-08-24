/* ------------------------------------------------------------------
   Line-art architecture diagrams.
   Flat 1px hairline, no fills, no grey — the drafting layer.
   Every stroked element carries class "d" so it can draw itself on
   via stroke-dashoffset.
   ------------------------------------------------------------------ */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---- primitives ---- */
const box = (x, y, w, h, o = {}) =>
  `<rect class="d${o.dash ? ' dash' : ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r || 0}"/>`;

const line = (x1, y1, x2, y2, o = {}) =>
  `<line class="d${o.dash ? ' dash' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;

const path = (dd, o = {}) => `<path class="d${o.dash ? ' dash' : ''}" d="${dd}"/>`;

/* arrow: horizontal or vertical, with a head */
const arrow = (x1, y1, x2, y2) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hl = 6, hw = 3.4;
  const bx = x2 - hl * Math.cos(a), by = y2 - hl * Math.sin(a);
  const p1 = [bx - hw * Math.sin(a), by + hw * Math.cos(a)];
  const p2 = [bx + hw * Math.sin(a), by - hw * Math.cos(a)];
  return (
    line(x1, y1, bx, by) +
    `<path class="d head" d="M${x2} ${y2} L${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)} Z"/>`
  );
};

/* elbow arrow: out of (x1,y1) horizontally, then vertically, into (x2,y2) */
const elbow = (x1, y1, x2, y2) =>
  line(x1, y1, x2, y1) + arrow(x2, y1, x2, y2);

const txt = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" class="t${o.cls ? ' ' + o.cls : ''}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}>${esc(s)}</text>`;

/* a labelled module: box + title + optional sub lines */
const mod = (x, y, w, h, title, subs = [], o = {}) => {
  let s = box(x, y, w, h, o);
  s += txt(x + 10, y + 19, title, { cls: 'tt' });
  subs.forEach((v, i) => (s += txt(x + 10, y + 36 + i * 13, v, { cls: 'ts' })));
  return s;
};

/* ---- the eight ---- */

export const diagrams = {
  /* 01 ReelShell */
  reelshell: {
    vb: '0 0 1020 300',
    body: `
    ${mod(10, 40, 150, 74, 'TUI', ['tabs · search', 'history'])}
    ${arrow(160, 77, 208, 77)}
    ${mod(208, 24, 170, 106, 'discovery', ['TMDB — film / TV', 'AniList — anime', 'cache + fuzzy filter'])}
    ${arrow(378, 77, 426, 77)}
    ${mod(426, 40, 168, 74, 'provider protocol', ['ordered chain', 'sub / dub fallback'])}
    ${arrow(594, 77, 642, 77)}
    ${mod(642, 40, 140, 74, 'resolve', ['stream URL', 'subtitles'])}
    ${arrow(782, 77, 830, 77)}
    ${mod(830, 40, 120, 74, 'mpv', ['playback'])}

    ${box(400, 176, 300, 96, { dash: true })}
    ${txt(410, 196, 'PRIVATE COMPANION REPO', { cls: 'tl' })}
    ${txt(410, 216, 'ReelShell-Providers', { cls: 'tt' })}
    ${txt(410, 234, 'source resolution — never published here', { cls: 'ts' })}
    ${txt(410, 250, 'public build ships a dummy provider', { cls: 'ts' })}
    ${line(510, 176, 510, 132, { dash: true })}
    ${arrow(510, 132, 510, 118)}
    `,
  },

  /* 02 DiscVault */
  discvault: {
    vb: '0 0 1020 300',
    body: `
    ${mod(10, 46, 130, 62, 'file', ['2–30 GB'])}
    ${arrow(140, 77, 186, 77)}
    ${mod(186, 32, 150, 90, 'chunker', ['streamed', 'never buffered', 'sized under cap'])}
    ${arrow(336, 77, 382, 77)}

    ${[0, 1, 2, 3].map((i) => box(382 + i * 40, 56, 32, 42)).join('')}
    ${[0, 1, 2, 3].map((i) => txt(398 + i * 40, 82, String(i), { cls: 'tt', anchor: 'middle' })).join('')}
    ${txt(382, 118, 'chunks', { cls: 'tl' })}

    ${arrow(546, 77, 592, 77)}
    ${mod(592, 32, 168, 90, 'discord channel', ['one chunk = one message', 'parallel, rate-limited', 'resumable'])}

    ${mod(592, 186, 168, 66, 'manifest', ['guild · channel · message', 'per chunk'])}
    ${line(676, 122, 676, 186, { dash: true })}

    ${arrow(760, 77, 806, 77)}
    ${mod(806, 32, 144, 90, 'rebuild', ['reassemble', 'SHA-256 verify', 'byte for byte'])}
    ${path('M760 219 L878 219 L878 130', { dash: true })}
    ${arrow(878, 130, 878, 122)}
    `,
  },

  /* 03 Rein-Bot — trust boundary */
  reinbot: {
    vb: '0 0 1020 300',
    body: `
    ${line(470, 8, 470, 292, { dash: true })}
    ${txt(456, 24, 'CLIENT CAN READ', { cls: 'tl', anchor: 'end' })}
    ${txt(484, 24, 'CLIENT CANNOT READ', { cls: 'tl' })}

    ${mod(10, 60, 176, 90, 'browser', ['static HTML + vanilla JS', 'no supabase-js', 'fetch() only'])}
    ${arrow(186, 92, 250, 92)}
    ${txt(196, 84, 'guess', { cls: 'tl' })}
    ${mod(250, 60, 150, 90, 'room', ['4-char code', 'name + connection', 'no account'])}

    ${arrow(400, 105, 512, 105)}
    ${mod(512, 42, 190, 126, 'postgres', ['grading RPC — PL/pgSQL', 'question bank', 'accepted aliases', 'no anon grant'])}

    ${mod(760, 42, 190, 74, 'storage', ['clip named by UUID', 'metadata stripped'])}
    ${arrow(702, 79, 760, 79)}

    ${mod(760, 158, 190, 90, 'github actions', ['ffmpeg · 20s cut', '480p VP9 + Opus', '~5.5 GB source'])}
    ${arrow(855, 158, 855, 120)}

    ${arrow(512, 200, 440, 200)}
    ${txt(520, 194, 'reveal only after round ends', { cls: 'ts' })}
    `,
  },

  /* 04 co-canvas */
  cocanvas: {
    vb: '0 0 1020 300',
    body: `
    ${mod(10, 26, 160, 68, 'browser A', ['notes surface'])}
    ${mod(10, 172, 160, 68, 'browser B', ['canvas surface'])}

    ${elbow(170, 60, 300, 118)}
    ${elbow(170, 206, 300, 148)}

    ${mod(300, 96, 190, 76, 'cloudflare worker', ['partyserver', 'y-partyserver'])}
    ${arrow(490, 134, 546, 134)}

    ${mod(546, 76, 200, 116, 'durable object', ['one per room slug', 'holds the Yjs doc', 'persists to DO storage', 'survives 0 clients'])}

    ${mod(806, 40, 150, 66, 'BlockNote', ['block editor'])}
    ${mod(806, 162, 150, 66, 'Excalidraw', ['infinite board'])}
    ${elbow(746, 134, 790, 73)}
    ${elbow(746, 134, 790, 195)}
    ${txt(760, 128, 'one doc', { cls: 'tl' })}
    `,
  },

  /* 05 Tessera */
  tessera: {
    vb: '0 0 1020 300',
    body: `
    ${mod(10, 96, 150, 76, 'canvas', ['Canvas 2D', 'brush · fill · shapes'])}
    ${line(160, 122, 214, 122)}${path('M214 122 L206 118 L206 126 Z')}
    ${line(214, 146, 160, 146)}${path('M160 146 L168 142 L168 150 Z')}

    ${mod(214, 78, 180, 112, 'artwork-core', ['the JSON document', 'imports only zod', 'no React'])}

    ${arrow(394, 134, 448, 134)}
    ${mod(448, 96, 150, 76, 'renderer', ['pure drawing'])}

    ${box(214, 216, 560, 66, { dash: true })}
    ${txt(224, 236, 'AI EDIT LOOP', { cls: 'tl' })}
    ${txt(224, 256, 'context → prompt → schema → validate → pixel ops → diff', { cls: 'ts' })}
    ${txt(224, 272, 'accept or reject · one undo reverses the whole thing', { cls: 'ts' })}
    ${line(304, 216, 304, 190, { dash: true })}
    ${arrow(304, 190, 304, 182)}

    ${mod(650, 32, 160, 66, 'gemini', ['free tier', 'behind an adapter'])}
    ${arrow(650, 65, 600, 65)}
    ${line(730, 98, 730, 216, { dash: true })}

    ${mod(840, 96, 120, 76, 'export', ['SVG · CSS · React', 'PNG · ASCII'])}
    ${arrow(598, 134, 840, 134)}
    `,
  },

  /* 06 TermTypo */
  termtypo: {
    vb: '0 0 1020 300',
    body: `
    ${mod(10, 40, 160, 68, 'terminal', ['pip install termtypo'])}
    ${mod(10, 176, 160, 68, 'browser', ['web client'])}
    ${elbow(170, 74, 286, 128)}
    ${elbow(170, 210, 286, 158)}

    ${mod(286, 108, 150, 70, 'queue', ['one queue', 'both clients'])}
    ${arrow(436, 143, 486, 143)}
    ${mod(486, 90, 170, 106, 'race', ['the shared protocol', 'progress · timing', '200 ms opponent tick'])}
    ${arrow(656, 143, 706, 143)}

    ${mod(706, 40, 150, 84, 'ELO', ['7 mode ratings', 'words_10 → time_60'])}
    ${mod(706, 176, 150, 68, 'leaderboard', ['per mode'])}
    ${elbow(656, 143, 690, 82)}
    ${elbow(656, 143, 690, 210)}

    ${box(892, 90, 118, 106, { dash: true })}
    ${txt(902, 110, 'PRIVATE ROOMS', { cls: 'tl' })}
    ${txt(902, 130, '6-char code', { cls: 'ts' })}
    ${txt(902, 146, 'no ELO change', { cls: 'ts' })}
    ${txt(902, 168, '45 s disconnect', { cls: 'ts' })}
    ${txt(902, 184, '→ auto-win', { cls: 'ts' })}
    `,
  },

  /* 07 DroidDoodle — redrawn from the repo's own ASCII diagram */
  droiddoodle: {
    vb: '0 0 1020 300',
    body: `
    ${mod(10, 110, 132, 60, 'user text', [])}
    ${arrow(142, 140, 190, 140)}

    ${mod(190, 84, 178, 112, ':core-agent', ['system + tools', 'board digest', 'reference table', 'history + message'])}
    ${arrow(368, 140, 416, 140)}
    ${txt(392, 52, 'prompt + GBNF', { cls: 'tl', anchor: 'middle' })}
    ${txt(392, 68, 'rebuilt each turn', { cls: 'ts', anchor: 'middle' })}

    ${mod(416, 96, 168, 88, ':inference', ['MockEngine — CI', 'llama.cpp — device'])}
    ${arrow(584, 140, 632, 140)}
    ${txt(608, 52, 'one constrained generation', { cls: 'tl', anchor: 'middle' })}
    ${txt(608, 68, '→ a plan of tool calls', { cls: 'ts', anchor: 'middle' })}

    ${mod(632, 84, 172, 112, ':core-agent', ['validate', 'confirm', 'execute', 'halt on failure'])}
    ${arrow(804, 140, 852, 140)}

    ${mod(852, 84, 158, 112, ':core-world', ['immutable Board', 'grid-snapped', 'undo by reference'])}

    ${line(931, 196, 931, 240)}
    ${arrow(931, 240, 931, 256)}
    ${txt(931, 278, 'the canvas', { cls: 'tt', anchor: 'middle' })}

    ${box(190, 232, 400, 52, { dash: true })}
    ${txt(200, 252, 'DETERMINISTIC — NOT ASKED OF THE MODEL', { cls: 'tl' })}
    ${txt(200, 270, 'coordinates · referent resolution · validation · collision', { cls: 'ts' })}
    `,
  },

  /* 08 Martini */
  martini: {
    vb: '0 0 1020 300',
    body: `
    ${mod(10, 106, 180, 96, 'target site', ['one <canvas>', '2 MB bundle', '18 named scenes'])}

    ${elbow(190, 132, 268, 66)}
    ${mod(268, 34, 190, 64, 'Ditto — DOM cloner', ['3 nodes · unsupported'])}
    ${line(452, 42, 470, 90)}${line(470, 42, 452, 90)}
    ${txt(482, 72, 'no GPU → GPU.BLOCKLIST → redirect', { cls: 'ts' })}

    ${elbow(190, 176, 268, 214)}
    ${mod(268, 182, 232, 92, 'Playwright + SwiftShader', ['__WEBGL_CONTEXT_LOSS = true', 'takes the non-redirecting branch', '205 assets recovered'])}
    ${arrow(500, 228, 556, 228)}

    ${mod(556, 182, 180, 92, 'content', ['every string, read', 'off the live DOM', '5 real woff2'])}
    ${arrow(736, 228, 792, 228)}

    ${mod(792, 106, 218, 168, 'Next.js rebuild', ['10 scroll acts', 'Lenis + GSAP', 'exact tokens + type scale', '', 'WebGL scene graph', '→ reinterpreted as DOM acts'])}
    ${line(901, 106, 901, 66)}
    ${arrow(901, 66, 901, 50)}
    ${txt(901, 34, 'tier C', { cls: 'tt', anchor: 'middle' })}
    `,
  },
  /* FTC — round resolution */
  ftc: {
    vb: '0 0 1020 300',
    body: `
    ${mod(10, 26, 150, 64, 'player A', ['calls a stat'])}
    ${mod(10, 168, 150, 64, 'player B', ['sees the same row'])}
    ${elbow(160, 58, 268, 118)}
    ${elbow(160, 200, 268, 158)}

    ${mod(268, 96, 160, 80, 'room', ['realtime channel', '2–4 seats'])}
    ${arrow(428, 136, 480, 136)}
    ${txt(454, 122, 'intent', { cls: 'tl', anchor: 'middle' })}

    ${mod(480, 54, 200, 164, 'postgres', ['compare top cards', 'tie → side pile', 'elimination check', 'write round row', '', 'the only place a', 'winner is decided'])}
    ${arrow(680, 136, 732, 136)}
    ${txt(706, 122, 'broadcast', { cls: 'tl', anchor: 'middle' })}

    ${mod(732, 96, 156, 80, 'every screen', ['renders the row', 'nothing local'])}

    ${box(268, 236, 412, 50, { dash: true })}
    ${txt(278, 256, 'ADMIN — CONTENT IS DATA', { cls: 'tl' })}
    ${txt(278, 274, 'universes · decks · stats · cards · images → storage', { cls: 'ts' })}
    ${line(474, 236, 474, 218, { dash: true })}
    ${arrow(474, 218, 474, 210)}

    ${mod(908, 96, 102, 80, 'CPU', ['fills a seat'])}
    ${arrow(908, 136, 890, 136)}
    `,
  },

  /* Solidus — match, and the two update paths */
  bingo: {
    vb: '0 0 1020 300',
    body: `
    ${mod(10, 30, 138, 66, 'queue', ['ranked, auto'])}
    ${arrow(148, 63, 196, 63)}
    ${mod(196, 30, 150, 66, 'match', ['or private code'])}
    ${arrow(346, 63, 394, 63)}
    ${mod(394, 12, 176, 102, 'edge function', ['draws the number', 'authoritative', 'Deno'])}
    ${arrow(570, 63, 618, 63)}
    ${mod(618, 30, 160, 66, 'realtime', ['broadcast to room'])}
    ${arrow(778, 63, 826, 63)}
    ${mod(826, 12, 184, 102, 'board', ['marks what it is told', 'line check', 'ELO on result'])}

    ${box(10, 150, 1000, 130, { dash: true })}
    ${txt(24, 172, 'DISTRIBUTION — SIDELOADED, SO NOTHING AUTO-UPDATES', { cls: 'tl' })}

    ${mod(24, 190, 190, 76, 'JS-only fix', ['OTA bundle', 'applied in background'])}
    ${arrow(214, 228, 262, 228)}
    ${mod(262, 190, 176, 76, 'installed apps', ['pick it up silently'])}

    ${mod(560, 190, 200, 76, 'native fix', ['signed APK', 'built on GH runners'])}
    ${arrow(760, 228, 808, 228)}
    ${mod(808, 190, 190, 76, 'version gate', ['compares versionCode', 'prompts to sideload'])}
    ${line(490, 190, 490, 266, { dash: true })}
    ${txt(490, 182, 'which lever?', { cls: 'tl', anchor: 'middle' })}
    `,
  },

  /* NoteTakerXX — what a note is */
  notetaker: {
    vb: '0 0 1020 300',
    body: `
    ${mod(10, 60, 236, 176, 'note', ['x, y  ← first-class', 'w, h, rotation, z', 'colour, body', 'locked?', '', 'position is why', 'everything else works'])}
    ${arrow(246, 148, 300, 148)}

    ${mod(300, 96, 176, 104, 'canvas', ['infinite, dot grid', 'grid-snapped drag', 'smart placement'])}

    ${mod(300, 236, 176, 52, 'zoom', ['content scales · HUD does not'])}
    ${line(388, 200, 388, 236, { dash: true })}

    ${arrow(476, 148, 530, 148)}
    ${mod(530, 60, 176, 76, 'connections', ['rope curves', 'shift-click to link'])}
    ${mod(530, 168, 176, 76, 'badges', ['favourite · hot · done', 'custom uploads'])}
    ${line(618, 136, 618, 168, { dash: true })}

    ${arrow(706, 148, 760, 148)}
    ${mod(760, 96, 150, 104, 'search', ['across title,', 'body and badge', 'jump to position'])}
    ${arrow(910, 148, 958, 148)}
    ${mod(958, 110, 52, 76, 'db', [])}
    `,
  },

  /* ValoBot — grounding path */
  valobot: {
    vb: '0 0 1020 300',
    body: `
    ${mod(10, 104, 154, 70, 'question', ['free-form'])}
    ${arrow(164, 139, 212, 139)}
    ${mod(212, 86, 168, 106, 'CYPHER', ['Groq SDK', 'fetches BEFORE', 'it answers'])}
    ${arrow(380, 139, 428, 139)}

    ${mod(428, 24, 190, 92, 'VLR.gg', ['scraped', 'matches · rosters', 'standings'])}
    ${arrow(523, 116, 523, 148)}
    ${mod(428, 148, 190, 76, 'live context', ['assembled per query'])}

    ${line(618, 186, 668, 186)}
    ${arrow(668, 186, 668, 214)}
    ${arrow(668, 186, 700, 186)}

    ${mod(700, 152, 200, 70, 'grounded answer', ['cites what it read'])}
    ${txt(686, 178, 'ok', { cls: 'tl', anchor: 'end' })}

    ${mod(560, 240, 216, 52, 'refuses, and says so', [])}
    ${line(668, 214, 668, 240)}
    ${txt(654, 232, 'fetch failed', { cls: 'tl', anchor: 'end' })}

    ${box(792, 240, 218, 52, { dash: true })}
    ${txt(802, 260, 'NEVER PARAMETRIC MEMORY', { cls: 'tl' })}
    ${txt(802, 278, 'a stale roster reads like a correct one', { cls: 'ts' })}
    `,
  },
};

export function renderDiagram(id) {
  const d = diagrams[id];
  if (!d) return '';
  return `<svg class="diagram" viewBox="${d.vb}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Architecture diagram">${d.body}</svg>`;
}
