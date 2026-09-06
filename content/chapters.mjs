/* ------------------------------------------------------------------
   rein.dev — chapter content
   Every claim here is drawn from the repo's own README or the GitHub API.
   Where a code panel is illustrative rather than verbatim it is labelled.
   ------------------------------------------------------------------ */

export const SITE = {
  name: 'REIN',
  domain: 'rein.dev',
  owner: 'Sayandeep',
  handle: 'Sayandeep1013',
  tagline: 'Constraints are the point',
  repo: 'RepoLogs',
  live: 'https://sayandeep1013.github.io/RepoLogs/',
  blurb:
    'Fourteen projects that each take a surface which is not supposed to do the job, and make it do the job anyway.',
};

import { chaptersB } from './chapters-b.mjs';

const ALL = [
  /* ══════════════════════════ 01 ══════════════════════════ */
  {
    slug: 'reelshell',
    repo: 'ReelShell',
    title: 'ReelShell',
    kicker: 'Terminal-native streaming',
    accent: { light: '#086063', dark: '#12A5AA' },
    langs: ['Go'],
    topics: ['cli', 'tui', 'streaming', 'go'],
    pitch:
      'Browse movies, series and anime — and watch them — without leaving the shell.',
    constraint: {
      q: 'Why does watching something mean leaving the terminal?',
      a: 'It doesn’t. Discovery is just two APIs and a list; playback is just a URL handed to mpv. The hard part was never the interface.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'tui',
        cols: 13,
        label: 'The interface',
        note: 'A replay of the browse → season → play flow. Reconstructed from the repo’s described v0–v2 feature set.',
      },
      {
        type: 'diagram',
        id: 'reelshell',
        cols: 12,
        label: 'Framework, and what it deliberately excludes',
        caption:
          'The public repo is the framework only. Source-resolution providers live in a private companion repo and are never published here.',
      },
      {
        type: 'note',
        cols: 7,
        heading: 'The hard part',
        body: [
          'Search had to feel instant against two remote catalogues, so it runs twice: an immediate local fuzzy filter over what is already cached, then a debounced remote refinement that replaces the list underneath you.',
          'Playback is a chain, not a call. Providers are tried in order with automatic fallback, sub/dub resolution falls back on its own axis, and the whole thing resolves to a stream handed off to mpv.',
        ],
      },
      {
        type: 'note',
        cols: 6,
        heading: 'Status, honestly',
        tone: 'flag',
        body: [
          'v0–v2 of the framework are complete and verified end to end. No real source-resolution provider exists yet — playback currently runs through a dummy provider returning a public-domain test clip.',
          'The README says it plainly: the engineering challenges “are the real open question right now… it’s genuinely uncertain whether they’re solvable in a straightforward way.”',
        ],
      },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ 02 ══════════════════════════ */
  {
    slug: 'discvault',
    repo: 'DiscVault',
    title: 'DiscVault',
    kicker: 'A chat app as a filesystem',
    accent: { light: '#1627DF', dark: '#747EF1' },
    langs: ['TypeScript'],
    topics: ['discord', 'file-storage', 'cli'],
    pitch:
      'Unlimited large-file storage built on top of Discord’s own per-message attachment cap.',
    constraint: {
      q: 'A 30 GB file, and a host that only accepts small attachments. Now what?',
      a: 'Stop treating the cap as a limit and treat it as a block size. The file becomes chunks, the channel becomes a disk, and a manifest becomes the inode.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'chunks',
        cols: 12,
        label: 'Chunk, upload, rebuild',
        note: 'Scrub the track to move a file through the pipeline.',
      },
      { type: 'shot', img: 'discvault-2', cols: 6, shape: 'slab', align: 'top', caption: 'Chunked upload in progress', kind: 'live' },
      {
        type: 'diagram',
        id: 'discvault',
        cols: 12,
        label: 'Upload path',
        caption: 'Nothing is stored anywhere else. The manifest is the only thing that knows where a file lives.',
      },
      {
        type: 'code',
        cols: 8,
        label: 'The manifest',
        lang: 'json',
        illustrative: true,
        body: `{
  "name": "archive.mkv",
  "size": 32212254720,
  "sha256": "9f2a…c41b",
  "chunks": [
    { "i": 0, "guild": "…", "channel": "…", "message": "…" },
    { "i": 1, "guild": "…", "channel": "…", "message": "…" }
  ]
}`,
        caption:
          'Shape only — a per-file record of every chunk’s server, channel and message. It is what makes reassembly possible.',
      },
      {
        type: 'note',
        cols: 7,
        heading: 'The hard part',
        body: [
          'The file is streamed and never fully loaded into memory — a 30 GB upload cannot buffer. Chunks are pushed in parallel without tripping rate limits, and the whole upload is resumable if it dies mid-way.',
          'On download, SHA-256 verifies the rebuilt file matches the original byte for byte. Without that, silent corruption across thousands of messages would be undetectable.',
        ],
      },
      {
        type: 'note',
        cols: 6,
        heading: 'Sharing without sharing secrets',
        body: [
          'An invite code carries the server and channel IDs — not a bot token. A friend brings their own bot, joins the same channels, and sees the same vault. Nobody ever hands over a credential.',
        ],
      },
      { type: 'shot', img: 'discvault-1', cols: 6, shape: 'blob', align: 'bottom', caption: 'Vault library', kind: 'live' },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ 03 ══════════════════════════ */
  {
    slug: 'rein-bot',
    repo: 'Rein-Bot',
    title: 'ReIN Bot',
    kicker: 'Multiplayer on a free tier',
    accent: { light: '#A31F72', dark: '#DE54AB' },
    langs: ['PL/pgSQL', 'JavaScript'],
    topics: ['multiplayer', 'realtime', 'supabase', 'anime'],
    pitch:
      'Guess the anime from its opening. 2–8 players, 20-second clips, no accounts — running entirely on free tiers.',
    constraint: {
      q: 'How do you hide the answer from a browser that has to play the clip?',
      a: 'You never send it. Grading happens inside Postgres, the clip is named by a random UUID, and the tables holding answers have no anon grant at all.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'round',
        cols: 13,
        label: 'One round',
        note: 'A 20-second round, replayed. Guesses are graded server-side; the client never holds the answer.',
      },
      {
        type: 'diagram',
        id: 'reinbot',
        cols: 13,
        label: 'Trust boundary',
        caption:
          'Everything to the right of the line is unreadable by the client. That placement is the entire security model.',
      },
      {
        type: 'code',
        cols: 9,
        label: 'Answer matching — four tiers, PL/pgSQL',
        lang: 'text',
        body: `normalise both sides
  case · punctuation · long vowels · "season 2" ≡ "2nd season"

then match in tiers
  1  exact
  2  near             bounded Levenshtein
  3  season-lenient
  4  prefix

all correct tiers score the same;
the tier is only reveal flavour.`,
        caption:
          'Biased deliberately toward false negatives — wrongly rejecting a right answer is a smaller sin than accepting a wrong one.',
      },
      {
        type: 'note',
        cols: 7,
        heading: 'Clips are curated in CI, not at request time',
        body: [
          'A GitHub Actions workflow reads a manifest of credit-free openings, pulls each from AnimeThemes, cuts 20 seconds, re-encodes to 480p VP9 + Opus, strips every scrap of container metadata, names the file by a deterministic UUID, and uploads it.',
          'It runs on a free Ubuntu runner because the source material is ~5.5 GB and VP9 encoding is slow. None of it touches a developer machine.',
        ],
      },
      {
        type: 'note',
        cols: 7,
        heading: 'The audit',
        tone: 'flag',
        body: [
          'A supervisory audit of the finished schema found and closed two independent paths by which a client could read the answer, four correctness bugs, and three places where the curation pipeline’s spoiler filter failed open.',
          'The lesson written up in PROGRESS.md is the uncomfortable one: execution testing passed because the tests confirmed what the schema’s comments claimed, and the comments had drifted.',
        ],
      },
      {
        type: 'stat',
        cols: 6,
        label: 'Curated content',
        items: [
          ['46', 'anime'],
          ['136', 'openings'],
          ['20s', 'per clip'],
          ['4', 'char room code'],
        ],
        caption: 'Every one verified credit-free, unsubbed, non-spoiler and SFW from the source API rather than assumed.',
      },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ 04 ══════════════════════════ */
  {
    slug: 'co-canvas',
    repo: 'co-canvas',
    title: 'CanVas',
    kicker: 'The URL is the account',
    accent: { light: '#973911', dark: '#E75D23' },
    langs: ['TypeScript'],
    topics: ['realtime-collaboration', 'canvas', 'websockets'],
    pitch:
      'Realtime rooms pairing a live document with a live drawing canvas. No accounts, no passwords.',
    constraint: {
      q: 'What is the smallest possible amount of account system?',
      a: 'A room name. Type one to join it; if it doesn’t exist, typing it creates it. Share the URL and anyone with the link is in, presence cursors and all.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'presence',
        cols: 12,
        label: 'Two surfaces, one room',
        note: 'Live presence, simulated. Both surfaces are bound to the same Yjs document.',
      },
      { type: 'shot', img: 'co-canvas-0', cols: 6, shape: 'blob', align: 'top', caption: 'Landing — join by room name', kind: 'live' },
      {
        type: 'note',
        cols: 7,
        heading: 'Why two surfaces and not one',
        body: [
          'Text flows; canvas is spatial. Cramming both into one editor makes a bad version of each — you get sticky notes, or inline clip-art.',
          'So CanVas keeps them as two purpose-built surfaces bound into one synchronised room: a BlockNote block editor and an Excalidraw infinite board, both writing into the same Yjs doc.',
        ],
      },
      {
        type: 'diagram',
        id: 'cocanvas',
        cols: 12,
        label: 'Sync topology',
        caption:
          'Each room slug is its own Durable Object, persisting the Yjs doc to DO storage — so a room survives with zero connected clients.',
      },
      { type: 'shot', img: 'co-canvas-2', cols: 6, shape: 'lens', align: 'bottom', caption: 'Realtime freehand canvas', kind: 'live' },
      {
        type: 'note',
        cols: 6,
        heading: 'The hard part',
        body: [
          'Different people can be on different surfaces at the same time and still see each other. That only works because presence lives on the shared document rather than on either editor.',
        ],
      },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ 05 ══════════════════════════ */
  {
    slug: 'tessera',
    repo: 'Tessera',
    title: 'Tessera',
    kicker: 'Pixel art, code underneath',
    accent: { light: '#125C91', dark: '#2595E4' },
    langs: ['TypeScript'],
    topics: ['pixel-art', 'editor', 'ai', 'canvas'],
    pitch:
      'A pixel-art editor whose document is JSON a human can read and hand-edit — and an AI can rewrite.',
    constraint: {
      q: 'What if the drawing were a document instead of a bitmap?',
      a: 'Then every pixel is an index into a palette, the file is text, and an editing agent can propose structured operations you can diff before accepting.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'tessera',
        cols: 13,
        label: 'Canvas ↔ JSON',
        note: 'Hover either side. This is the real format, verbatim from the README.',
      },
      {
        type: 'code',
        cols: 9,
        label: 'The whole format',
        lang: 'json',
        body: `{
  "w": 16, "h": 16,
  "palette": [{ "c": "transparent" },
              { "c": "#2d1b00" },
              { "c": "#f4c430" }],
  "frames": [{ "ms": 100, "layers": [{ "n": "base", "px": [
    "................",
    ".....111111.....",
    "...1122222211...",
    "..122222222221.."
  ]}]}]
}`,
        caption:
          'One character per pixel. “.” is transparent, 1–9 and a–z are palette indices. It is the export, the code panel, and the grid the AI reads — the same text in all three places.',
      },
      { type: 'slider', imgs: ['tessera-0', 'tessera-1'], cols: 9, caption: 'Editor — light and dark', labels: ['Light', 'Dark'] },
      { type: 'shot', img: 'tessera-2', cols: 6, shape: 'slab', align: 'bottom', caption: 'Code panel — the document’s own JSON, six export formats', kind: 'live' },
      {
        type: 'note',
        cols: 7,
        heading: 'What doesn’t work yet',
        tone: 'flag',
        body: [
          '“The AI produces valid edits that are not good edits.” It reads the artwork correctly, targets the right region, stays inside the canvas — and the results still aren’t ones you’d keep.',
          'The Phase 0 probe run scored 0 of 9, written up honestly with ranked hypotheses for the fix. The plumbing is sound; the taste isn’t there yet.',
        ],
      },
      {
        type: 'diagram',
        id: 'tessera',
        cols: 11,
        label: 'Edit loop',
        caption: 'You see exactly which pixels an edit would touch, and one undo reverses the whole thing.',
      },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ 06 ══════════════════════════ */
  {
    slug: 'termtypo',
    repo: 'TermTypo',
    title: 'TermTypo',
    kicker: 'A ranked arena in a shell',
    accent: { light: '#39631D', dark: '#5C9C32' },
    langs: ['Python'],
    topics: ['terminal', 'multiplayer', 'elo', 'cli'],
    pitch:
      'Terminal-first multiplayer typing test — ranked 1v1 races, an ELO ladder, and a global leaderboard.',
    constraint: {
      q: 'Can a terminal hold a competitive ladder?',
      a: 'Yes, and it can race the browser. Terminal players and web players enter the same queue and are matched against each other.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'race',
        cols: 13,
        label: 'Live race',
        note: 'Opponent progress updates every 200 ms in the real client. Replayed here.',
      },
      {
        type: 'stat',
        cols: 7,
        label: 'Shipped',
        items: [
          ['PyPI', 'pip install termtypo'],
          ['7', 'separate mode ratings'],
          ['200ms', 'opponent tick'],
          ['45s', 'disconnect auto-win'],
        ],
        caption: 'Also distributed as standalone binaries, so it runs with no Python present.',
      },
      { type: 'shot', img: 'termtypo-1', cols: 6, shape: 'slab', align: 'top', caption: 'Live typing with keyboard visualisation', kind: 'live' },
      {
        type: 'note',
        cols: 7,
        heading: 'The hard part',
        body: [
          'Cross-platform matchmaking. A terminal client and a browser client have nothing in common except the race, so the race itself had to become the protocol — progress, timing and completion all defined independently of either front end.',
          'The ladder keeps seven separate ratings, one per mode, because a 10-word sprint and a 60-second run measure genuinely different skills.',
        ],
      },
      {
        type: 'diagram',
        id: 'termtypo',
        cols: 11,
        label: 'Matchmaking',
        caption: 'One queue, two clients, one ladder.',
      },
      { type: 'shot', img: 'termtypo-2', cols: 6, shape: 'blob', align: 'bottom', caption: 'Results — WPM, raw WPM, accuracy', kind: 'live' },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ 07 ══════════════════════════ */
  {
    slug: 'droiddoodle',
    repo: 'DroidDoodle',
    title: 'DroidDoodle',
    kicker: 'The model runs on the phone',
    accent: { light: '#6F22D3', dark: '#A36EE7' },
    langs: ['Kotlin', 'C++'],
    topics: ['on-device-ai', 'agentic-ai', 'offline-first', 'android'],
    pitch:
      'An offline Android app where a small on-device language model rearranges a structured canvas through tool calls.',
    constraint: {
      q: 'How much apparent agency can you manufacture from a 1B model?',
      a: 'A great deal — if the model only ever contributes intent and structure, and coordinates, referents, validation and collision belong to the runtime.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'agent',
        cols: 14,
        label: 'A turn',
        note: 'Sentence in, constrained plan out, board rearranged. Replayed from the documented turn lifecycle.',
      },
      {
        type: 'diagram',
        id: 'droiddoodle',
        cols: 14,
        label: 'Architecture in one picture',
        caption: 'Redrawn from the diagram in the repo’s own README.',
      },
      {
        type: 'note',
        cols: 8,
        heading: 'The governing rule',
        tone: 'quote',
        body: [
          'The model contributes intent and structure. Coordinates, referent resolution, validation and collision belong to the runtime — if it can be determined deterministically, the model is not asked to infer it.',
        ],
      },
      {
        type: 'note',
        cols: 7,
        heading: 'The hard part',
        body: [
          'The GBNF grammar is rebuilt every turn, so the model can only emit a syntactically valid plan against the ten tools and the entities currently on the board. Invalid plans are not parsed and rejected — they are made unrepresentable.',
          'Execution then validates, confirms and runs the plan, halting on the first failure, against an immutable grid-snapped Board where undo is by reference.',
        ],
      },
      {
        type: 'note',
        cols: 8,
        heading: 'What green does not mean',
        tone: 'flag',
        body: [
          'Packages P0–P6 are complete and green in CI — the whole pure-Kotlin agent core, running as JVM unit tests with no Android SDK, no emulator and no model file.',
          'And the README refuses to let that stand as more than it is: “nothing has run on a device, no real model has produced a single plan, and the GBNF grammar has never been fed to llama.cpp.” Every plan the test suite executes was written by hand.',
        ],
      },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ 08 ══════════════════════════ */
  {
    slug: 'martini',
    repo: 'Martini-Recreation',
    title: 'Santioni',
    kicker: 'Reverse-engineering a WebGL site',
    accent: { light: '#B8241F', dark: '#E25F5A' },
    langs: ['GLSL', 'TypeScript'],
    topics: ['webgl', 'glsl', 'nextjs', 'study'],
    pitch:
      'A study of santionispirits.com — a 100% WebGL experience — rebuilt at two fidelity tiers.',
    constraint: {
      q: 'How do you read a site whose entire body is one canvas tag?',
      a: 'You make its own bundle believe the GPU has already failed, and take the branch that doesn’t redirect you away.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'shader',
        cols: 12,
        label: 'A shader, running',
        note: 'Live WebGL. The chapter is about shaders, so this one is real rather than a screenshot.',
      },
      {
        type: 'note',
        cols: 8,
        heading: 'Why it couldn’t just be cloned',
        body: [
          'The target’s body holds a single canvas tag and a 2 MB bundle rendering 18 named scenes. Ditto, a DOM-and-CSS cloner, returned three nodes and a page reading “Your browser is not supported” — its headless Chrome has no GPU, and the site hard-redirects on GPU.BLOCKLIST.',
          'The content was recovered instead by rendering the site under Playwright with SwiftShader and pre-setting window.__WEBGL_CONTEXT_LOSS = true, which takes the bundle’s non-redirecting branch.',
        ],
      },
      {
        type: 'code',
        cols: 8,
        label: 'The move',
        lang: 'js',
        body: `// headless Chrome has no GPU, and the site
// hard-redirects on GPU.BLOCKLIST.
// so: tell the bundle the context is already lost.

await page.addInitScript(() => {
  window.__WEBGL_CONTEXT_LOSS = true
})

// → takes the non-redirecting branch
// → 18 scenes become readable`,
        caption: 'Ditto was still used as designed — on a DOM-rendered sibling site, to harvest a known-good Next 15 + Tailwind 4 scaffold. Its visual output was discarded.',
      },
      {
        type: 'diagram',
        id: 'martini',
        cols: 14,
        label: 'How the content was recovered',
        caption:
          'Ditto was still used as designed — on a DOM-rendered sibling site, to harvest a known-good scaffold. Its visual output was discarded.',
      },
      { type: 'shot', img: 'martini-recreation-1', cols: 6, shape: 'lens', align: 'top', caption: 'Act 1 — the hero', kind: 'live' },
      { type: 'shot', img: 'martini-recreation-3', cols: 6, shape: 'blob', align: 'bottom', caption: 'Act 3 — hold and pour', kind: 'live' },
      {
        type: 'palette',
        cols: 7,
        label: 'Design tokens, verbatim from source',
        items: [
          ['#1D1D1D', '--ink', 'body ground'],
          ['#121212', '--ink-deep', 'footer, dark acts'],
          ['#C82924', '--sacred', 'dominant red field'],
          ['#F1F0EE', '--paper', 'light acts'],
        ],
        caption: 'Fluid type reproduces the source’s exact calc() curves at 390 / 768 / 1920.',
      },
      {
        type: 'note',
        cols: 7,
        heading: 'Three tiers of honesty',
        tone: 'flag',
        body: [
          'Exact — fonts, colours, type scale, copy, overlay CSS, artwork, asset files. Recreated — scene compositions rebuilt from screenshot reference in CSS and GSAP. Reinterpreted — the WebGL scene sequence expressed as DOM acts with scroll choreography rather than a canvas scene graph.',
          'Known gaps are listed rather than hidden: the engraved characters live in .bin mesh geometry driven by hatching shaders and are not reproduced.',
        ],
      },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },
];

/* Reading order. Chapter numbers are derived from this, so re-sequencing the
   site is a one-line change and the labels can never drift out of sync. */
const ORDER = [
  'reelshell', 'termtypo',                    // the terminal is a real surface
  'discvault', 'discrec',                     // a platform limit / one Discord job
  'rein-bot', 'ftc-game', 'solidus-bingo',    // realtime multiplayer on free tiers
  'co-canvas', 'tessera', 'notetakerxx',      // the document is the interesting object
  'tomevoice',                                // the document, spoken
  'valobot', 'droiddoodle',                   // grounded, or local
  'martini',                                  // reading a closed system
];

const POOL = ALL.concat(chaptersB);

export const chapters = ORDER.map((slug, i) => {
  const c = POOL.find((x) => x.slug === slug);
  if (!c) throw new Error('ORDER references an unknown chapter: ' + slug);
  return { ...c, n: String(i + 1).padStart(2, '0') };
});

if (POOL.length !== ORDER.length) {
  throw new Error(`ORDER lists ${ORDER.length} chapters but ${POOL.length} are defined`);
}

/* Repos that are not chapters — the index. Pulled from the GitHub API audit. */
export const index = [
  ['puzzled', 'TypeScript', 'Offline-first jigsaw for Android/iOS — Expo SDK 57 + Skia.'],
  ['mubitracker-watchdeck', 'TypeScript', 'Swipe-based tracker for film, TV and anime — one decision per title.'],
  ['ReelSharing', 'TypeScript', 'AI memory vault for saved videos — summary, transcript, key frames, tags.'],
  ['Trans_Cribed', 'Dart', 'On-device English speech-to-text benchmarking. Flutter + sherpa-onnx.'],
  ['Church-Voice-app', 'TypeScript', 'Scripture recording platform with verse-level highlighting and auto-advance.'],
  ['ReactGamePortal', 'JavaScript', 'Ten browser games behind one shell with GSAP page transitions.'],
  ['Symbiote', 'JavaScript', 'The Venom symbiote, rendered in three.js.'],
  ['PanelWeaver', '—', 'Manga and manhwa panels converted into video.'],
  ['vlc-skins', '—', 'Curated, tested VLC skins with .vlt builds.'],
  ['DroidDoodle-notes', 'Kotlin', 'See chapter 07.'],
  ['dashboard-main', 'TypeScript', 'Earlier dashboard work.'],
  ['TerminalPyGames', 'Python', 'Small terminal games.'],
  ['Image_Manipulation', 'HTML', 'Browser image processing experiments.'],
  ['Recommendation-System', 'Jupyter', 'Collaborative filtering coursework.'],
  ['Disease-prediction', 'Python', 'Classification coursework.'],
  ['ReactNoteApp', 'JavaScript', 'Early React note app.'],
  ['Flutter-Calculator', 'Dart', 'Early Flutter build.'],
  ['notion_widgets', 'HTML', 'First public repo, 2023.'],
];
