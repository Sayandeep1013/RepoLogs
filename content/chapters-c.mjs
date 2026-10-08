/* ------------------------------------------------------------------
   rein.dev — chapters, third set.
   Same rules as chapters.mjs: every claim comes from the repo's own
   README, its docs, or the GitHub API. Picaku's repository is private,
   so its chapter carries no source link and no infrastructure detail.
   ------------------------------------------------------------------ */

export const chaptersC = [
  /* ══════════════════════════ SABUJ ══════════════════════════ */
  {
    slug: 'sabuj-planthouse',
    repo: 'Sabuj-PlantHouse',
    title: 'Sabuj',
    kicker: 'A shop with no backend, yet',
    accent: { light: '#275D35', dark: '#7CC48A' },
    langs: ['JavaScript'],
    topics: ['vanilla-js', 'three.js', 'e-commerce', 'procedural-art'],
    pitch:
      'The storefront of a Kolkata plant nursery — shop, checkout, OTP accounts, order tracking — where every plant has a goofy mascot drawn in code.',
    constraint: {
      q: 'The nursery has no backend yet. How much of the shop can you build anyway?',
      a: 'All of it. Every page talks to one data layer, and one flag decides whether the answers come from local files or from REST. Attaching the server is a config change, not a rewrite.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'plant',
        cols: 12,
        label: 'Seeded, not drawn',
        note: 'A small spec plus a hash of the product id — the same plant on every page, every visit. Change the pot and it is redrawn. A reconstruction of art.js, not the file itself.',
      },
      { type: 'shot', img: 'sabuj-planthouse-0', cols: 6, shape: 'lens', align: 'top', caption: 'Product page — the mascot redrawn in the chosen pot', kind: 'live' },
      {
        type: 'diagram',
        id: 'sabuj',
        cols: 13,
        label: 'One data layer, two answers',
        caption: 'The pages never know which side of the flag they are on. Response shapes are identical either way.',
      },
      {
        type: 'code',
        cols: 8,
        label: 'The whole contract, from a page',
        lang: 'js',
        body: `const { items, total } = await Api.listProducts({
  category: "flowering", pet: 1, sort: "rating"
});

Store.add({ id: "p10", name: "Red Joba", unit: 299,
            size: "s", pot: "terracotta" });

document.addEventListener("store:change", updateBadges);`,
        caption:
          'Verbatim from the README. The cart is an event, not a framework — badges, drawer and checkout all just listen for store:change.',
      },
      {
        type: 'note',
        cols: 7,
        heading: 'The goofy illustrations',
        body: [
          'Product photos show the real plant. Everywhere else a plant is drawn by code: twenty types — monstera, snake plant, palm, cactus, bonsai, tuberose spikes, even seed packets — composed from four leaf primitives and a quadratic-curve walker, with a face on the pot that blinks on a random offset and grins on hover.',
          'One SVG filter — feMorphology dilate, flood, merge — draws the sticker outline round the whole silhouette instead of stroking every leaf. The 3D hero follows the same idea in Three.js: a lathe-turned pot, and monstera leaves cut from THREE.Shape with real holes for the fenestrations.',
        ],
      },
      { type: 'slider', imgs: ['sabuj-planthouse-2', 'sabuj-planthouse-3'], cols: 9, caption: 'The Three.js monstera — light and dark', labels: ['Light', 'Dark'] },
      {
        type: 'note',
        cols: 6,
        heading: 'Kolkata, specifically',
        body: [
          'Pincode checks know 7000xx from Howrah from the rest of Bengal. The season band follows Bengal’s calendar — Grishma, Borsha, Sharat, Sheet — and opens on the current one. Plants carry their Bengali names, and the delivery map draws the Hooghly.',
          'Sabuj is Bengali for green.',
        ],
      },
      { type: 'shot', img: 'sabuj-planthouse-1', cols: 6, shape: 'slab', align: 'bottom', caption: 'Illustration library — one generator, every plant', kind: 'live' },
      {
        type: 'note',
        cols: 7,
        heading: 'Status, honestly',
        tone: 'flag',
        body: [
          'It is a frontend, and mock mode says so on the page: the OTP is always 1234, orders live in localStorage, and an order advances itself with time since it was placed so the tracker has something to show.',
          'The README specifies every endpoint the backend must implement, and the one rule it must not skip: the server recalculates prices and totals itself. The client’s figures are for display only.',
        ],
      },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ BRAINAI ══════════════════════════ */
  {
    slug: 'brainai',
    repo: 'BrainAI',
    title: 'BrainAI',
    kicker: 'A plan an agent can build from',
    accent: { light: '#085C4D', dark: '#3CD8C0' },
    langs: ['TypeScript'],
    topics: ['agents', 'planning', 'nextjs', 'local-first'],
    pitch:
      'Type one sentence and watch it grow a planning tree with live research and self-taken forks — then compile 45 agent-ready files into a folder on your machine.',
    constraint: {
      q: 'A machine thinks for forty seconds behind a spinner. Has it crashed?',
      a: 'You cannot tell — so the autonomy has to be visible. Children are drawn as dashed drafts the moment their JSON closes, the run narrates itself, and when it stops it says which of six things stopped it.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'tree',
        cols: 13,
        label: 'A wave',
        note: 'Seed, ghosts, nodes, an auto-decided fork, coverage closing. Replayed from the documented run loop.',
      },
      { type: 'shot', img: 'brainai-0', cols: 6, shape: 'slab', align: 'top', caption: 'A decision node — the recommended option, and the one chosen', kind: 'live' },
      {
        type: 'diagram',
        id: 'brainai',
        cols: 13,
        label: 'The wave, and the gate',
        caption:
          'A POST returns 202 and the work runs on the server; SSE only subscribes. A route handler that awaits minutes of model calls dies on the first navigation.',
      },
      {
        type: 'code',
        cols: 8,
        label: 'Seven ways the gateway fails',
        lang: 'text',
        body: `failure kinds
  waf · auth · model_denied · pool_exhausted
  rate_limit · network · parse

per-model failure   → advance the fallback chain
waf / auth          → stop dead
transient           → retry the same model first
truncated           → double the token budget;
                      never switch voice mid-pack`,
        caption: 'Measured against the live gateway, not guessed — written up as ADR-003.',
      },
      {
        type: 'note',
        cols: 7,
        heading: 'Compile is a gate, not a button',
        body: [
          'A pack with a hole in it is worse than no pack. The pack map declares 34 coverage keys — some accept variants, some demand a minimum file count, two carry rules: the market file needs a live citation, the legal files need named facts. Every key must point at a node with real evidence before a single file is written.',
          'Then compile is transactional: files go to a temp directory, are secret-scanned in memory, and only then copied into place. A failed scan leaves the previous pack exactly as it was.',
        ],
      },
      { type: 'shot', img: 'brainai-1', cols: 6, shape: 'lens', align: 'bottom', caption: 'Compile blocked — every key without evidence, named', kind: 'live' },
      {
        type: 'note',
        cols: 6,
        heading: 'One engine, two filesystems',
        body: [
          'Locally, projects are real folders and graph.json is a real file. The hosted build runs the same engine against IndexedDB through a small Vfs interface, so keys and projects never leave your browser. One conformance suite runs against both, so the two cannot drift.',
          'One gateway rejects any browser User-Agent — a header a page is not allowed to set. relay/ is a ~120-line worker that rewrites that one header and forwards nothing else.',
        ],
      },
      {
        type: 'note',
        cols: 7,
        heading: 'Status, honestly',
        tone: 'flag',
        body: [
          '34 of 38 requirements done, 12 of 14 tasks. One task asks for a UI rating of 8/10; two independent critic rounds scored it 6, and by its own bar it stays open.',
          'Offline mode is a deterministic planner with nothing researched or reasoned. It is labelled in the top bar, in Settings, and stamped into every file it writes — a harness for the machine, never a shipping path.',
        ],
      },
      {
        type: 'stat',
        cols: 6,
        label: 'The pack',
        items: [
          ['45', 'files compiled'],
          ['34', 'coverage keys'],
          ['13', 'ADRs'],
          ['56', 'tests'],
        ],
        caption: 'Specified before it was built. A PRD of 38 numbered requirements is still the source of truth.',
      },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ HORDE CONTROL ══════════════════════════ */
  {
    slug: 'horde-control',
    repo: 'Horde-Control',
    title: 'Horde Control',
    kicker: 'Two things to keep alive',
    accent: { light: '#4A5716', dark: '#A3B44E' },
    langs: ['GDScript'],
    topics: ['godot', 'roguelite', 'pixel-art', 'game-design'],
    pitch:
      'A top-down pixel-art survival roguelite. Defend yourself and a Tower from goblin waves, level up mid-fight, and spend each run’s Cores on a permanent skill tree.',
    constraint: {
      q: 'If the goblins chase you, why not lead them round a corner forever?',
      a: 'Because a Player Hunter is on a leash. Twenty seconds without landing a hit and it converts, permanently, into a Tower Seeker. Kiting stops being a strategy and the safe corner is designed out.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'horde',
        cols: 13,
        label: 'A wave',
        note: 'Three intents: ▲ Tower Seeker, ◆ Player Hunter, ■ Opportunist. The bow aims itself; you only move. Simulated here, not recorded.',
      },
      { type: 'shot', img: 'horde-control-0', cols: 6, shape: 'slab', align: 'top', caption: 'The Tower, a crystal drop, goblins closing from the east', kind: 'live' },
      {
        type: 'diagram',
        id: 'horde',
        cols: 13,
        label: 'One ordered tick',
        caption:
          'Every system steps inside SimLoop on one clock, so a pause or a level-up draft freezes the world in exactly one place.',
      },
      {
        type: 'note',
        cols: 7,
        heading: 'The director reads pressure, not timers',
        body: [
          'The Wave Director escalates on a Pressure Metric: threat divided by capacity times twenty seconds. 1.0 means the field would take about twenty seconds to clear at your current output. It is sampled every half second, only while a combat wave is open and outside the grace period after a draft.',
          'Attack slots ring each target — twenty-seven round the Tower for Seekers, seven round the player for Hunters. An enemy with no free slot waits outside the ring instead of piling in.',
        ],
      },
      { type: 'shot', img: 'horde-control-1', cols: 6, shape: 'lens', align: 'bottom', caption: 'Level-Up Draft — the world pauses, one of three', kind: 'live' },
      {
        type: 'note',
        cols: 6,
        heading: 'Every number is written down',
        body: [
          'Thirty design documents came before the code. Every gameplay value lives in a Provisional Values Register, and every design change has a row in a Review Decision Log.',
          'About 750 gdUnit4 cases run headless. One of them fails on purpose, to prove the runner reports failures.',
        ],
      },
      {
        type: 'stat',
        cols: 6,
        label: 'Shipped',
        items: [
          ['8', 'waves a run'],
          ['18', 'upgrade cards'],
          ['20', 'skill nodes'],
          ['~750', 'test cases'],
        ],
        caption: 'A Windows exe and an Android APK, both built and signed by GitHub Actions. No permissions, never online.',
      },
      {
        type: 'note',
        cols: 6,
        heading: 'Status, honestly',
        tone: 'flag',
        body: [
          'A playable prototype: the full run loop and meta progression on one island with three enemy types. Elites, a boss and a second biome are next. Most first runs end before wave eight.',
        ],
      },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ NO FILTER ══════════════════════════ */
  {
    slug: 'n0-filtr',
    repo: 'N0-filtr',
    title: 'No Filter',
    kicker: 'Motion, asserted',
    accent: { light: '#3A3836', dark: '#BFBAB5' },
    langs: ['TypeScript'],
    topics: ['nextjs', 'gsap', 'three.js', 'motion'],
    pitch:
      'A studio site for a studio of one — a WebGL brand mark, a Matter.js block pit, wire ropes you can drag, and a harness that gates every change.',
    constraint: {
      q: 'Animation rots quietly. How do you test something whose only output is how it feels?',
      a: 'You write the feel down — durations, eases, distances actually travelled — and assert it. npm run verify has to pass before anything is called done.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'rope',
        cols: 12,
        label: 'A wire',
        note: 'Fourteen verlet points, gravity and distance constraints, pinned at both ends. Drag either frame.',
      },
      { type: 'shot', img: 'n0-filtr-0', cols: 6, shape: 'slab', align: 'top', caption: 'Home — the Open Aperture, in WebGL', kind: 'live' },
      {
        type: 'code',
        cols: 8,
        label: 'npm run verify',
        lang: 'text',
        body: `tokens   138/138   computed styles vs the token table
motion   283/283   durations, eases, distance travelled
visual   judged    screenshot diffs, reviewed by eye
budget     7/7     bundle, route weight, triangles,
                   Lighthouse`,
        caption:
          'Two parallaxes had never once run — gsap.quickSetter(el, "yPercent", "%") silently writes nothing. 267 assertions passed the whole time; none measured distance travelled. Nine now do.',
      },
      {
        type: 'note',
        cols: 7,
        heading: 'The catch worth telling',
        body: [
          'Redrawing the card thumbnails added a few dozen elements to each card, and verify:motion reported that the custom cursor no longer lagged the pointer — pointerover fires for every element crossed, so one sweep re-pinned the disc twenty times.',
          'Fixing it failed a different assertion. Two checks had been in direct contradiction — one demanding the disc snap on a move, the other that it lag on the same move — and only the bug satisfied both. Nothing had ever been red, so nobody had read them together.',
        ],
      },
      {
        type: 'diagram',
        id: 'nofilter',
        cols: 12,
        label: 'One loop',
        caption: 'GSAP’s ticker drives Lenis, ScrollTrigger and Matter. There is no second requestAnimationFrame anywhere, and verify:motion probes for one.',
      },
      { type: 'shot', img: 'n0-filtr-1', cols: 6, shape: 'blob', align: 'bottom', caption: 'The block pit — every tile a real dependency', kind: 'live' },
      {
        type: 'note',
        cols: 6,
        heading: 'Simulate it, delete the tuning',
        body: [
          'The wires began as a Bézier with a hand-tuned sag term, which was fine until the frames became draggable. A formula has no memory: no swing, no settle.',
          'Simulating it deleted both tuned numbers. Sag is gravity on a rope cut longer than its gap, and “a stretched wire straightens” is not a rule anyone wrote.',
        ],
      },
      {
        type: 'note',
        cols: 6,
        heading: 'Every label is true',
        body: [
          'There are no stock photographs. Every thumbnail is a specimen plate drawn in code: FIG.04 is the work’s real position in the twelve, and the code is the plate’s actual seed. Where there is no real edition number the field is left out rather than invented.',
          'Several of the twelve case studies are chapters on this site.',
        ],
      },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ PICAKU ══════════════════════════ */
  {
    slug: 'picaku',
    repo: 'Picaku',
    title: 'Picaku',
    kicker: 'Every meeting, recallable',
    accent: { light: '#9C3220', dark: '#FF6F5A' },
    langs: ['Python', 'TypeScript'],
    topics: ['rag', 'fastapi', 'pgvector', 'llm'],
    pitch:
      'An AI meeting assistant. Record a meeting, get its summary, decisions and action items, then chat with everything you have ever discussed.',
    constraint: {
      q: 'A chat about one meeting. What stops the model reading the other ninety-nine?',
      a: 'Not the prompt. Scope is a SQL filter on the note, applied before the vector search — so in a scoped thread the other meetings’ chunks are never fetched, and the model physically cannot see them.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'recall',
        cols: 13,
        label: 'Scoped, then global',
        note: 'Chunks from six meetings in one vector store. A scoped thread filters before it searches. Illustrative, from the documented RAG design.',
      },
      {
        type: 'diagram',
        id: 'picaku',
        cols: 14,
        label: 'Sync answers first',
        caption:
          'The sync endpoint saves the raw transcript and returns 200 at once. Extraction and embedding run behind it, so a client never waits on a model.',
      },
      {
        type: 'note',
        cols: 7,
        heading: 'Division of labour',
        body: [
          'No single model runs the pipeline. Whisper transcribes. A reasoning model, routed through OpenRouter, turns the transcript into strict JSON — title, a summary scaled to the meeting’s length, decisions, action items — and answers chat.',
          'Embeddings run inside the backend on ONNX Runtime: 384 dimensions, no paid embedding API. Torch was removed from the production image entirely, and the new vectors were parity-checked against the old ones at cosine 1.0.',
        ],
      },
      { type: 'shot', img: 'picaku-0', cols: 6, shape: 'slab', align: 'top', caption: 'A meeting note — summary and key decisions, extracted', kind: 'live' },
      {
        type: 'note',
        cols: 7,
        heading: 'Why the model stays in the cloud',
        tone: 'quote',
        body: [
          'Elsewhere on this site a phone runs the model. This one wrote down why it can’t: a model large enough to return valid structured JSON every time does not fit in a phone’s memory once the OS has taken its share, and one that fits is not reliable enough. The transcript leaves the device for sync and embedding anyway.',
        ],
      },
      {
        type: 'note',
        cols: 6,
        heading: 'Scope belongs to the thread',
        body: [
          'A note has one long-lived thread, and its scope is fixed when the thread is created. A later message that omits the note id inherits it — a client resuming a thread by id alone used to silently widen it to every note.',
          'Short-term memory is the last ten messages, read from the database rather than from the history a client uploads. Both clients had been echoing the question back, so the model saw it twice.',
        ],
      },
      {
        type: 'note',
        cols: 6,
        heading: 'Drafts, never sends',
        body: [
          'A LangGraph agent writes the follow-up email and saves it as a Gmail draft. It runs only when asked — drafting every meeting automatically flooded inboxes — checks that the meeting has real content first, and never sends anything.',
        ],
      },
      {
        type: 'note',
        cols: 6,
        heading: 'Status, honestly',
        tone: 'flag',
        body: [
          'In production on FastAPI, Supabase Postgres with pgvector, and Google sign-in. A Flutter client is in progress against on-device speech models served from Picaku’s own CDN.',
          'The repository is private, so there is no source link here.',
        ],
      },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },
];
