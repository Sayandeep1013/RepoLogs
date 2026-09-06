/* ==================================================================
   rein.dev — static build
   node build.mjs        → writes dist/
   ================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chapters, index as repoIndex, SITE } from './content/chapters.mjs';
import { renderDiagram } from './content/diagrams.mjs';
import { ring, iconBtn, wordmark, cropMarks, frieze, RING_D } from './content/shapes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'dist');
/* GitHub Pages serves a project site from /<repo>/, so every internal URL is
   prefixed. BASE='' locally, BASE=/RepoLogs for the deploy. */
const BASE = (process.env.BASE || '').replace(/\/$/, '');
const U = (p) => BASE + p;
const GH = (r) => `https://github.com/${SITE.handle}/${r}`;

/* per-chapter outbound links, verified responding during the audit */
const LINKS = {
  reelshell: [['repo', GH('ReelShell')], ['spec', GH('ReelShell') + '/blob/main/SPEC.md']],
  discvault: [['live', 'https://discvault.onrender.com'], ['repo', GH('DiscVault')]],
  'rein-bot': [['play', 'https://sayandeep1013.github.io/Rein-Bot/'], ['repo', GH('Rein-Bot')]],
  'co-canvas': [['live', 'https://co-canvas-web.vercel.app'], ['repo', GH('co-canvas')]],
  tessera: [['repo', GH('Tessera')], ['findings', GH('Tessera') + '/blob/main/docs/PHASE-0-FINDINGS.md']],
  termtypo: [['pypi', 'https://pypi.org/project/termtypo/'], ['repo', GH('TermTypo')]],
  droiddoodle: [['repo', GH('DroidDoodle')], ['handoff', GH('DroidDoodle') + '/blob/main/docs/HANDOFF.md']],
  martini: [['repo', GH('Martini-Recreation')], ['fidelity', GH('Martini-Recreation') + '/blob/main/FIDELITY.md']],
  'ftc-game': [['live', 'https://ftc-game.vercel.app'], ['repo', GH('FTC-Game')]],
  'solidus-bingo': [['releases', GH('Solidus-Bingo') + '/releases'], ['repo', GH('Solidus-Bingo')]],
  notetakerxx: [['repo', GH('NoteTakerXx')]],
  valobot: [['live', 'https://valobot.vercel.app'], ['repo', GH('ValoBot')]],
  discrec: [['releases', GH('DiscRec') + '/releases'], ['repo', GH('DiscRec')]],
  tomevoice: [['repo', GH('TomeVoice')], ['handoff', GH('TomeVoice') + '/blob/main/docs/16-session-handoff.md']],
};

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const href = (i) => (i === 0 ? U('/') : U(`/${chapters[i].slug}/`));
const cols = (n) => `style="width:calc(var(--col) * ${n})"`;

/* the widths renderPanel falls back to, so the frieze can span the whole track */
function defaultCols(p) {
  switch (p.type) {
    case 'title': return 11;
    case 'constraint': return 9;
    case 'custom': return 12;
    case 'diagram': return 12;
    case 'code': return 8;
    case 'note': return 7;
    case 'stat': return 6;
    case 'palette': return 7;
    case 'shot': return 6;
    case 'slider': return 9;
    case 'outcome': return 5;
    case 'handoff': return 6;
    default: return 6;
  }
}

/* ------------------------------ panels ------------------------------ */

function pTitle(ch, i) {
  const list = chapters
    .map(
      (c, j) =>
        `<li><a href="${href(j)}"${j === i ? ' class="on" aria-current="page"' : ''}>` +
        `<span class="numeral">${ring()}<b>${c.n}</b></span>${esc(c.title)}</a></li>`
    )
    .join('');
  const lower = ch.langs.map((l) => l.toLowerCase().replace(/[^a-z+]/g, ''));
  const topics = ch.topics.filter((t) => !lower.includes(t.toLowerCase())).slice(0, 4);
  return `<section class="panel tc rv" ${cols(11)}>
  <div class="tc__top">
    <ul class="tc__list">${list}</ul>
  </div>
  <div class="tc__group">
    <span class="tc__num">${ring()}<b>${ch.n}</b></span>
    <div class="tc__bot">
      <div class="kicker">${esc(ch.kicker)}</div>
      <h1 class="tc__h">${esc(ch.title)}</h1>
      <p class="tc__p">${esc(ch.pitch)}</p>
      <div class="tc__meta">
        ${ch.langs.map((l) => `<span class="chip chip--acc">${esc(l)}</span>`).join('')}
        ${topics.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}
      </div>
    </div>
  </div>
</section>`;
}

function pConstraint(ch) {
  return `<section class="panel cons rv" ${cols(9)}>
  <div class="cons__wrap">
    ${iconBtn('play', 'The constraint')}
    <span class="cons__lead"></span>
    <button class="cons__flip blob" type="button" aria-pressed="false" aria-label="Flip: question and answer">
      <span class="cons__in">
        <span class="cons__f blob"><q>${esc(ch.constraint.q)}</q></span>
        <span class="cons__b blob"><p>${esc(ch.constraint.a)}</p></span>
      </span>
    </button>
    <span class="cons__hint">click to turn</span>
  </div>
</section>`;
}

function pCustom(p) {
  return `<section class="panel custom rv" ${cols(p.cols || 12)}>
  <div class="plabel">${esc(p.label || '')}</div>
  <div class="custom__stage" data-custom="${esc(p.id)}" style="height:min(62vh,460px)"></div>
  ${p.note ? `<p class="custom__note">${esc(p.note)}</p>` : ''}
</section>`;
}

function pDiagram(p) {
  return `<section class="panel diag rv" ${cols(p.cols || 12)}>
  <div class="plabel">${esc(p.label || 'Architecture')}</div>
  ${renderDiagram(p.id)}
  ${p.caption ? `<p class="cap">${esc(p.caption)}</p>` : ''}
</section>`;
}

function pCode(p) {
  return `<section class="panel code rv" ${cols(p.cols || 8)}>
  <div class="plabel">${esc(p.label || 'Code')}${
    p.illustrative ? '<span class="tag-ill">shape, not source</span>' : ''
  }</div>
  <pre><code>${esc(p.body)}</code></pre>
  ${p.caption ? `<p class="cap">${esc(p.caption)}</p>` : ''}
</section>`;
}

function pNote(p) {
  const tone = p.tone === 'flag' ? ' note--flag' : p.tone === 'quote' ? ' note--quote' : '';
  return `<section class="panel note${tone} rv" ${cols(p.cols || 7)}>
  <div class="note__in">
    ${p.heading ? `<h3 class="ptitle">${esc(p.heading)}</h3>` : ''}
    ${p.body.map((b) => `<p class="pbody">${esc(b)}</p>`).join('')}
  </div>
</section>`;
}

function pStat(p) {
  return `<section class="panel stat rv" ${cols(p.cols || 6)}>
  <div class="plabel">${esc(p.label || '')}</div>
  <div class="stat__grid">
    ${p.items.map(([v, k]) => `<div class="stat__cell"><b>${esc(v)}</b><span>${esc(k)}</span></div>`).join('')}
  </div>
  ${p.caption ? `<p class="cap">${esc(p.caption)}</p>` : ''}
</section>`;
}

function pPalette(p) {
  return `<section class="panel pal rv" ${cols(p.cols || 7)}>
  <div class="plabel">${esc(p.label || 'Tokens')}</div>
  ${p.items
    .map(
      ([hex, name, use]) =>
        `<div class="pal__row"><span class="pal__sw" style="background:${hex}"></span><code>${esc(
          name
        )}</code><span>${esc(use)}</span></div>`
    )
    .join('')}
  ${p.caption ? `<p class="cap">${esc(p.caption)}</p>` : ''}
</section>`;
}

/* the offset outline that sits behind each shot, drawn on reveal */
function ghost(shape) {
  if (shape === 'lens')
    return `<svg class="shot__ghost" viewBox="0 0 250 340" preserveAspectRatio="none" aria-hidden="true">
      <path class="g" d="M125 1 C193 1 249 46 249 118 V332 a8 8 0 0 1-8 8 H9 a8 8 0 0 1-8-8 V118 C1 46 57 1 125 1 Z"/>
    </svg>`;
  if (shape === 'slab')
    return `<svg class="shot__ghost" viewBox="0 0 330 216" preserveAspectRatio="none" aria-hidden="true">
      <rect class="g" x="1" y="1" width="328" height="214"/>
    </svg>`;
  return `<svg class="shot__ghost" viewBox="0 0 110 106" preserveAspectRatio="none" aria-hidden="true">
      <path class="g" d="${RING_D}"/>
    </svg>`;
}

function pShot(p) {
  const shape = p.shape || 'blob';
  const align = p.align ? ` shot--${p.align}` : '';
  return `<section class="panel shot${align} rv" ${cols(p.cols || 6)}>
  <div class="shot__wrap">
    <figure class="shot__fig shot__fig--${shape}">
      ${ghost(shape)}
      <div class="shot__frame">
        <img src="${U(`/assets/img/${p.img}.webp`)}" alt="${esc(p.caption || '')}" decoding="async" data-px="0.16">
      </div>
    </figure>
    <figcaption class="shot__cap">
      <span class="mark">${esc(p.kind === 'archive' ? 'built' : 'running')}</span>
      <span>${esc(p.caption || '')}</span>
    </figcaption>
  </div>
</section>`;
}

function pSlider(p) {
  return `<section class="panel slider rv" ${cols(p.cols || 9)}>
  <div class="plabel">${esc(p.caption || '')}</div>
  <div class="slider__box">
    ${p.imgs
      .map(
        (im, i) =>
          `<img src="${U(`/assets/img/${im}.webp`)}" alt="" class="${i ? 'off' : ''}" decoding="async">`
      )
      .join('')}
  </div>
  <div class="slider__tabs">
    ${(p.labels || p.imgs).map((l, i) => `<button type="button" aria-pressed="${i === 0}">${esc(l)}</button>`).join('')}
  </div>
</section>`;
}

function pOutcome(ch, p) {
  const links = LINKS[ch.slug] || [['repo', GH(ch.repo)]];
  return `<section class="panel out rv" ${cols(p.cols || 5)}>
  <div class="plabel">Outcome</div>
  <h3 class="ptitle">${esc(ch.repo)}</h3>
  <div class="out__links">
    ${links
      .map(
        ([k, u]) =>
          `<a class="out__link" href="${u}" target="_blank" rel="noopener"><span class="k">${esc(
            k
          )}</span><span class="v">${esc(u.replace(/^https?:\/\//, ''))}</span></a>`
      )
      .join('')}
  </div>
</section>`;
}

function pHandoff(ch, i, p) {
  const next = chapters[(i + 1) % chapters.length];
  const isWrap = i === chapters.length - 1;
  return `<section class="panel hand rv" ${cols(p.cols || 6)}>
  <div class="hand__k">${isWrap ? 'Back to the start' : 'Chapter ' + next.n}</div>
  <div class="hand__t">${esc(next.title)}</div>
  <p class="hand__p">${esc(next.pitch)}</p>
  <a class="go" href="${href((i + 1) % chapters.length)}" data-go-next>
    ${iconBtn('arrow', 'Next chapter')}
    <span class="mono" style="font-size:11px;letter-spacing:.14em;text-transform:uppercase">continue</span>
  </a>
</section>`;
}

function renderPanel(p, ch, i) {
  switch (p.type) {
    case 'title': return pTitle(ch, i);
    case 'constraint': return pConstraint(ch);
    case 'custom': return pCustom(p);
    case 'diagram': return pDiagram(p);
    case 'code': return pCode(p);
    case 'note': return pNote(p);
    case 'stat': return pStat(p);
    case 'palette': return pPalette(p);
    case 'shot': return pShot(p);
    case 'slider': return pSlider(p);
    case 'outcome': return pOutcome(ch, p);
    case 'handoff': return pHandoff(ch, i, p);
    default: return '';
  }
}

/* ------------------------------ chrome ------------------------------ */

function rail(activeIdx) {
  const nav = chapters
    .map(
      (c, j) =>
        `<a class="rail__n" href="${href(j)}" title="${esc(c.title)}"${
          j === activeIdx ? ' aria-current="page"' : ''
        }>${ring()}<span>${c.n}</span></a>`
    )
    .join('');
  return `<nav class="rail" aria-label="Chapters">
  <a class="rail__mark" href="${U('/')}">${SITE.name}.dev</a>
  <div class="rail__mid">
    <div class="rail__nav">${nav}</div>
    <a class="rail__link" href="${U('/index/')}">Index</a>
    <a class="rail__link" href="${U('/about/')}">About</a>
  </div>
  <div class="rail__bot">
    <button class="rail__toggle" type="button" aria-label="Change colour theme">concrete</button>
  </div>
</nav>`;
}

function shell({ title, desc, accent, bodyClass = '', chrome, main, boot, loader = false, slug = '' }) {
  slug = slug || (boot && boot.slug) || '';
  return `<!doctype html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#CED1D3">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap">
<link rel="stylesheet" href="${U('/assets/css/site.css')}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23CED1D3'/%3E%3Cpath d='M16 5c8 0 11 3.5 11 11s-3 11-11 11S5 23.5 5 16 8 5 16 5z' fill='${encodeURIComponent(
    accent || '#086063'
  )}'/%3E%3C/svg%3E">
<script>(function(){try{var d=document.documentElement,
t=localStorage.getItem('rein-theme');
if(t&&/^(paper|concrete|dark)$/.test(t))d.setAttribute('data-theme',t);
var k=t==='dark';
d.style.setProperty('--accent',k?'${(boot && boot.accent && boot.accent.dark) || '#12A5AA'}':'${
      (boot && boot.accent && boot.accent.light) || '#086063'
    }');
d.style.setProperty('--on-accent',k?'#17110E':'#F4F2F0');
if(sessionStorage.getItem('rein-transit')==='${slug}')d.setAttribute('data-transit','');
}catch(e){}})();</script>
</head>
<body class="${bodyClass}">
${loader ? loaderMarkup(slug) : ''}
${transitMarkup(boot && boot.chapter)}
${chrome}
${main}
<script>window.__REIN__=${JSON.stringify(boot)};</script>
<script src="${U('/assets/js/chapters.js')}" defer></script>
<script src="${U('/assets/js/engine.js')}" defer></script>
</body>
</html>`;
}

function loaderMarkup() {
  const first = chapters[0];
  const ticks = chapters
    .map((c) => `<span class="loader__tick" data-n="${c.n}">${ring()}<b>${c.n}</b></span>`)
    .join('');
  return `<div class="loader" role="status" aria-label="Loading">
  ${cropMarks()}
  <div class="loader__inner">
    ${wordmark()}
    <div class="loader__meta">
      <span>${chapters.length} chapters</span>
      <span class="loader__rule"><i></i></span>
      <span>${esc(SITE.tagline.toLowerCase())}</span>
    </div>
    <div class="loader__ticks">${ticks}</div>
    <div class="loader__go">
      ${iconBtn('play', 'Begin chapter ' + first.title)}
      <span class="loader__go-copy">
        <span class="loader__go-k">Chapter ${first.n}</span>
        <span class="loader__go-t">${esc(first.title)}</span>
      </span>
      <span class="loader__go-lab">begin</span>
    </div>
  </div>
  ${frieze('intro', 42, 'loader__frieze')}
  <div class="loader__count"><b>00</b><span>/ 100</span></div>
  <button class="loader__skip" type="button">skip</button>
</div>`;
}

/* the between-chapters loader — same family, smaller, carries the next
   chapter's number and accent so the colour lands before the page does */
function transitMarkup(ch) {
  /* Pre-filled with this page's own chapter: on arrival the overlay is already
     correct with no JS, so nothing pops in. Leaving, JS overwrites it with the
     next chapter before the cover animation runs. */
  const n = ch ? ch.n : '';
  const t = ch ? ch.title : '';
  return `<div class="transit" aria-hidden="true">
  <div class="transit__in">
    <span class="transit__num">${ring()}<b>${esc(n)}</b></span>
    <div class="transit__meta">
      <span class="transit__k">${n ? 'Chapter ' + esc(n) : ''}</span>
      <span class="transit__t">${esc(t)}</span>
    </div>
  </div>
</div>`;
}

/* ------------------------------ pages ------------------------------ */

function chapterPage(ch, i) {
  const next = chapters[(i + 1) % chapters.length];
  const panels = ch.panels.map((p) => renderPanel(p, ch, i)).join('\n');
  const totalCols = ch.panels.reduce((n, p) => n + (p.cols || defaultCols(p)), 0);
  const main = `<main class="stage" id="stage">
  <div class="track">${frieze(ch.slug, totalCols)}${panels}</div>
</main>
<div class="topbar">
  <div class="chapter-tag"><b>${ch.n}</b> — ${esc(ch.title)}</div>
  ${iconBtn('arrow', 'Next chapter', href((i + 1) % chapters.length), 'go-next', 'data-go-next')}
</div>
<div class="progress"><i></i></div>
<div class="hint"><span>scroll · drag · ← →</span></div>`;
  return shell({
    title: `${ch.title} — ${SITE.name}.dev`,
    desc: ch.pitch,
    accent: ch.accent.light,
    chrome: rail(i),
    main,
    loader: i === 0,
    slug: ch.slug,
    boot: {
      slug: ch.slug,
      n: ch.n,
      title: ch.title,
      accent: ch.accent,
      chapter: { n: ch.n, title: ch.title },
      next: {
        href: href((i + 1) % chapters.length),
        slug: next.slug,
        n: next.n,
        title: next.title,
        accent: next.accent,
      },
    },
  });
}

function indexPage() {
  const rows = repoIndex
    .map(
      ([name, lang, desc]) =>
        `<li><a href="${GH(name)}" target="_blank" rel="noopener">${esc(name)}</a>` +
        `<span class="l">${esc(lang)}</span><span class="d">${esc(desc)}</span></li>`
    )
    .join('');
  const main = `<main class="stage" id="stage">
  <div class="track">
    <section class="panel doc rv" style="width:calc(var(--col) * 9)">
      <div class="kicker">Everything else</div>
      <h2>The index</h2>
      <p class="pbody">Fourteen repos became chapters. These are the rest — coursework, experiments, and work that is real but did not need eight screens to explain.</p>
      <p class="pbody">Ordered roughly newest first.</p>
    </section>
    <section class="panel doc rv" style="width:calc(var(--col) * 7)">
      <ul class="idx">${rows.slice(0, Math.ceil(rows.length / 2))}</ul>
    </section>
  </div>
</main>
<div class="topbar"><div class="chapter-tag"><b>—</b> Index</div></div>
<div class="progress"><i></i></div>`;
  /* split the list across two panels so the track reads horizontally */
  const half = Math.ceil(repoIndex.length / 2);
  const mk = (arr) =>
    arr
      .map(
        ([name, lang, desc]) =>
          `<li><a href="${GH(name)}" target="_blank" rel="noopener">${esc(name)}</a>` +
          `<span class="l">${esc(lang)}</span><span class="d">${esc(desc)}</span></li>`
      )
      .join('');
  const real = `<main class="stage" id="stage">
  <div class="track">
    <section class="panel doc rv" style="width:calc(var(--col) * 8)">
      <div class="kicker">Everything else</div>
      <h2>The index</h2>
      <p class="pbody">Fourteen repos became chapters. These are the rest — coursework, experiments, and work that is real but did not need eight screens to explain.</p>
      <p class="pbody">Roughly newest first. All of them are public.</p>
    </section>
    <section class="panel doc rv" style="width:calc(var(--col) * 6.4)"><ul class="idx">${mk(
      repoIndex.slice(0, half)
    )}</ul></section>
    <section class="panel doc rv" style="width:calc(var(--col) * 6.4)"><ul class="idx">${mk(
      repoIndex.slice(half)
    )}</ul></section>
    <section class="panel hand rv" style="width:calc(var(--col) * 6)">
      <div class="hand__k">Chapter 01</div>
      <div class="hand__t">${esc(chapters[0].title)}</div>
      <p class="hand__p">${esc(chapters[0].pitch)}</p>
      <a class="go" href="${U('/')}">${iconBtn('arrow', 'Start')}<span class="mono" style="font-size:11px;letter-spacing:.14em;text-transform:uppercase">start</span></a>
    </section>
  </div>
</main>
<div class="topbar"><div class="chapter-tag"><b>—</b> Index</div></div>
<div class="progress"><i></i></div>
<div class="hint"><span>scroll · drag · ← →</span></div>`;
  return shell({
    title: `Index — ${SITE.name}.dev`,
    desc: 'Every other public repository.',
    accent: '#655148',
    chrome: rail(-1),
    main: real,
    boot: { slug: 'index', accent: { light: '#655148', dark: '#A08B7C' }, next: { href: '/', title: chapters[0].title } },
  });
}

function aboutPage() {
  const main = `<main class="stage" id="stage">
  <div class="track">
    <section class="panel doc rv" style="width:calc(var(--col) * 9)">
      <div class="kicker">About</div>
      <h2>${esc(SITE.owner)}</h2>
      <p class="pbody">${esc(SITE.blurb)}</p>
      <p class="pbody">The pattern is not deliberate, but it is consistent: a terminal that streams video, a chat app's attachment cap used as a filesystem, a recorder that is not a video suite, a free tier running realtime multiplayer for eight people, a reader that owns the audio buffer, a phone running the model itself.</p>
      <p class="pbody">Most of these are built to a spec written before the code, and most of them carry an honest account of what does not work yet. That second part matters more than the first.</p>
    </section>
    <section class="panel doc rv" style="width:calc(var(--col) * 7)">
      <div class="plabel">Recurring</div>
      <ul class="idx" style="width:420px">
        <li><a href="#" onclick="return false">Terminal as a real surface</a><span class="l">01 · 02</span><span class="d">Go TUI, Python TUI on PyPI</span></li>
        <li><a href="#" onclick="return false">Discord as a surface</a><span class="l">03 · 04</span><span class="d">An attachment cap, and one job that is not OBS</span></li>
        <li><a href="#" onclick="return false">Realtime on free tiers</a><span class="l">05 · 06 · 07</span><span class="d">Postgres-side logic, one row, two update paths</span></li>
        <li><a href="#" onclick="return false">Documents, not bitmaps</a><span class="l">09 · 10 · 11</span><span class="d">JSON, coordinates, a document model for speech</span></li>
        <li><a href="#" onclick="return false">On-device inference</a><span class="l">11 · 13</span><span class="d">Neural TTS on the phone, llama.cpp on the canvas</span></li>
        <li><a href="#" onclick="return false">Reading closed systems</a><span class="l">03 · 14</span><span class="d">Attachment caps, WebGL bundles</span></li>
      </ul>
    </section>
    <section class="panel out rv" style="width:calc(var(--col) * 6)">
      <div class="plabel">Elsewhere</div>
      <div class="out__links">
        <a class="out__link" href="${SITE.live}" target="_blank" rel="noopener"><span class="k">live</span><span class="v">${SITE.live.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span></a>
        <a class="out__link" href="${GH(SITE.repo)}" target="_blank" rel="noopener"><span class="k">source</span><span class="v">github.com/${SITE.handle}/${SITE.repo}</span></a>
        <a class="out__link" href="https://github.com/${SITE.handle}" target="_blank" rel="noopener"><span class="k">github</span><span class="v">github.com/${SITE.handle}</span></a>
        <a class="out__link" href="${U('/index/')}"><span class="k">index</span><span class="v">every other repo</span></a>
        <a class="out__link" href="${U('/')}"><span class="k">start</span><span class="v">chapter 01</span></a>
      </div>
    </section>
  </div>
</main>
<div class="topbar"><div class="chapter-tag"><b>—</b> About</div></div>
<div class="progress"><i></i></div>
<div class="hint"><span>scroll · drag · ← →</span></div>`;
  return shell({
    title: `About — ${SITE.name}.dev`,
    desc: SITE.blurb,
    accent: '#655148',
    chrome: rail(-1),
    main,
    boot: { slug: 'about', accent: { light: '#655148', dark: '#A08B7C' }, next: { href: '/', title: chapters[0].title } },
  });
}

/* ------------------------------ write ------------------------------ */

function rmrf(p) { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); }
function write(rel, content) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
  return Buffer.byteLength(content);
}
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

rmrf(OUT);
fs.mkdirSync(OUT, { recursive: true });

/* assets, with the blob spliced into the stylesheet */
copyDir(path.join(__dirname, 'assets'), path.join(OUT, 'assets'));
const blob = fs.readFileSync(path.join(__dirname, 'content', 'blob.txt'), 'utf8').trim();
const cssPath = path.join(OUT, 'assets', 'css', 'site.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('__BLOB__')) console.warn('  ! __BLOB__ placeholder not found in site.css');
css = css.split('__BLOB__').join(blob);
fs.writeFileSync(cssPath, css);

let total = 0;
chapters.forEach((ch, i) => {
  const rel = i === 0 ? 'index.html' : `${ch.slug}/index.html`;
  total += write(rel, chapterPage(ch, i));
  console.log(`  ${ch.n}  ${(i === 0 ? '/' : '/' + ch.slug + '/').padEnd(16)} ${ch.panels.length} panels`);
});
total += write('index/index.html', indexPage());
total += write('about/index.html', aboutPage());
write('_headers', `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`);
write('robots.txt', 'User-agent: *\nAllow: /\n');

console.log(`\n  index/ about/`);

/* Prune images nothing references. Sources stay in assets/ for future chapters;
   only what the built pages actually ask for ships. */
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name.endsWith('.html')) pages.push(fs.readFileSync(f, 'utf8'));
  }
})(OUT);
const scripts = fs
  .readdirSync(path.join(OUT, 'assets', 'js'))
  .map((f) => fs.readFileSync(path.join(OUT, 'assets', 'js', f), 'utf8'));
const haystack = pages.concat(scripts).join('');
const imgDir = path.join(OUT, 'assets', 'img');
let pruned = 0, freed = 0, kept = 0;
for (const f of fs.readdirSync(imgDir)) {
  if (haystack.includes(f)) { kept++; continue; }
  freed += fs.statSync(path.join(imgDir, f)).size;
  fs.unlinkSync(path.join(imgDir, f));
  pruned++;
}

const imgBytes = fs
  .readdirSync(imgDir)
  .reduce((n, f) => n + fs.statSync(path.join(imgDir, f)).size, 0);
const jsBytes = scripts.reduce((n, s) => n + Buffer.byteLength(s), 0);

console.log(`  images ${kept} kept, ${pruned} pruned (${(freed / 1024).toFixed(0)} kB unused)`);
console.log(
  `  html ${(total / 1024).toFixed(1)} kB · css ${(css.length / 1024).toFixed(1)} kB · ` +
    `js ${(jsBytes / 1024).toFixed(1)} kB · img ${(imgBytes / 1024).toFixed(0)} kB`
);
console.log(`  → ${path.relative(process.cwd(), OUT)}\n`);
