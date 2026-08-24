/* ------------------------------------------------------------------
   rein.dev — chapters, second set.
   Same rules as chapters.mjs: every claim comes from the repo's own
   README or the GitHub API.
   ------------------------------------------------------------------ */

export const chaptersB = [
  /* ══════════════════════════ FTC ══════════════════════════ */
  {
    slug: 'ftc-game',
    repo: 'FTC-Game',
    title: 'FTC',
    kicker: 'Top trumps, in real time',
    accent: { light: '#7F4F0A', dark: '#C67A10' },
    langs: ['TypeScript'],
    topics: ['realtime', 'multiplayer', 'nextjs', 'supabase'],
    pitch:
      'Pick a universe, pick a deck, call the strongest stat on your top card. Two to four players, live.',
    constraint: {
      q: 'Four players, one deck — and everyone has to see the same flip at the same instant.',
      a: 'No client decides anything. The round resolves in Postgres and the result is broadcast, so every screen is reading the same row.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'trumps',
        cols: 12,
        label: 'A round',
        note: 'Stat called, cards compared, pile taken. Replayed from the documented rules.',
      },
      { type: 'shot', img: 'ftc-game-1', cols: 6, shape: 'slab', align: 'top', caption: 'Universe browser', kind: 'live' },
      {
        type: 'diagram',
        id: 'ftc',
        cols: 12,
        label: 'Round resolution',
        caption: 'The client sends an intent, never an outcome.',
      },
      {
        type: 'note',
        cols: 7,
        heading: 'The hard part is the edge cases',
        body: [
          'Top trumps is trivial until two cards tie. Then you need a side pile, a rule for who calls next, and a definition of elimination that still terminates when three of four players are already out.',
          'All of it sits server-side beside the comparison, because a tie resolved differently on two clients is a game that cannot continue.',
        ],
      },
      {
        type: 'note',
        cols: 6,
        heading: 'Content is data, not code',
        body: [
          'Universes, decks, stats, cards and images are editable through an admin manager backed by Supabase Storage. Adding a universe ships no code.',
          'Deck covers double as the in-game card backs, so one upload does two jobs.',
        ],
      },
      { type: 'shot', img: 'ftc-game-3', cols: 6, shape: 'blob', align: 'bottom', caption: 'Battle — calling a stat', kind: 'live' },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ SOLIDUS ══════════════════════════ */
  {
    slug: 'solidus-bingo',
    repo: 'Solidus-Bingo',
    title: 'Solidus',
    kicker: 'Ranked bingo you sideload',
    accent: { light: '#106534', dark: '#1BA755' },
    langs: ['TypeScript'],
    topics: ['expo', 'realtime', 'supabase', 'multiplayer'],
    pitch:
      'Real-time multiplayer Bingo — ranked auto-matchmaking, private rooms, bots. Every ranked result feeds the ladder.',
    constraint: {
      q: 'You shipped a bug to an app Android will never auto-update. Now what?',
      a: 'Two levers, covering different things: an OTA JavaScript bundle for anything in JS, a fresh signed APK for anything native — and a version gate that knows which one a given fix needs.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'bingo',
        cols: 12,
        label: 'A board, filling',
        note: 'Numbers are drawn server-side and broadcast. The board only marks what it is told.',
      },
      { type: 'shot', img: 'solidus-bingo-1', cols: 6, shape: 'lens', align: 'top', caption: 'Live board', kind: 'live' },
      {
        type: 'diagram',
        id: 'bingo',
        cols: 13,
        label: 'Match, and the two update paths',
        caption: 'The distribution problem is drawn here too, because on a sideloaded app it is part of the architecture.',
      },
      {
        type: 'note',
        cols: 7,
        heading: 'Releases run on someone else’s machines',
        body: [
          'Pushing a v* tag lints, tests, then builds a signed APK on GitHub’s own runners and publishes it as a Release. A second workflow does the same through EAS and exists as the fallback for when the Gradle path is what broke.',
          'Bump both expo.version and expo.android.versionCode first — Android refuses to install over a build with a higher versionCode, and the in-app update gate compares the same numbers.',
        ],
      },
      {
        type: 'note',
        cols: 6,
        heading: 'Tested by a robot, on a real phone',
        body: [
          'mobile-qa/ holds Maestro flows plus a multi-player simulation, so a realtime game with four participants can be exercised on-device without four humans holding four phones.',
        ],
      },
      { type: 'shot', img: 'solidus-bingo-3', cols: 6, shape: 'lens', align: 'bottom', caption: 'Leaderboard', kind: 'live' },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ NOTETAKERXX ══════════════════════════ */
  {
    slug: 'notetakerxx',
    repo: 'NoteTakerXx',
    title: 'NoteTakerXX',
    kicker: 'Notes with coordinates',
    accent: { light: '#6A570C', dark: '#A58812' },
    langs: ['TypeScript'],
    topics: ['canvas', 'note-taking', 'productivity'],
    pitch:
      'Spatial note-taking on an infinite canvas — place a note anywhere, connect it to another, tag it, find it again.',
    constraint: {
      q: 'Why does every notes app flatten your thinking into a list?',
      a: 'Because a list is easy to store. Give notes coordinates instead and the spatial memory you already have starts doing the filing for you.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'canvas',
        cols: 13,
        label: 'The canvas',
        note: 'Notes placed, then linked with rope-style curves. Shift-click picks the second note.',
      },
      { type: 'shot', img: 'notetakerxx-0', cols: 6, shape: 'slab', align: 'top', caption: 'Canvas workspace', kind: 'live' },
      {
        type: 'diagram',
        id: 'notetaker',
        cols: 12,
        label: 'What a note is',
        caption: 'Position is a first-class field, which is what makes everything else spatial.',
      },
      {
        type: 'note',
        cols: 7,
        heading: 'The details that make it feel physical',
        body: [
          'A new note lands in an open visible spot rather than under your cursor or on top of something else. Dragging snaps to a grid. Selecting brings to front. Zoom scales canvas content while the dock and HUD stay fixed-size, the way Excalidraw does it.',
          'Ctrl or Cmd plus wheel zooms around the pointer; plain wheel keeps panning. Getting that split right is most of what separates a canvas that feels good from one that fights you.',
        ],
      },
      {
        type: 'note',
        cols: 6,
        heading: 'Structure without a rich-text editor',
        body: [
          'Bullets from "- ", numbered lists that continue themselves, todos from "[ ] " with checkboxes you can tick in read mode, and a slash-command menu — none of which required pulling in an editor framework.',
        ],
      },
      { type: 'shot', img: 'notetakerxx-3', cols: 6, shape: 'blob', align: 'bottom', caption: 'Full-screen note view', kind: 'live' },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ VALOBOT ══════════════════════════ */
  {
    slug: 'valobot',
    repo: 'ValoBot',
    title: 'ValoBot',
    kicker: 'An analyst with no cutoff',
    accent: { light: '#AB1C40', dark: '#E4587B' },
    langs: ['TypeScript'],
    topics: ['llm', 'esports', 'nextjs', 'scraping'],
    pitch:
      'Valorant esports intelligence — live match, team and player data from VLR.gg, paired with CYPHER, an analyst grounded in it.',
    constraint: {
      q: 'How does a model answer a question about a match that finished an hour ago?',
      a: 'It doesn’t know, so it fetches. CYPHER pulls live context before it answers — and when that fetch fails it says so and stops, rather than filling the gap with something plausible.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'cypher',
        cols: 13,
        label: 'Two questions',
        note: 'The second one is the point: when grounding fails, the refusal is the correct answer.',
      },
      {
        type: 'diagram',
        id: 'valobot',
        cols: 13,
        label: 'Grounding path',
        caption: 'There is no route from the model to an answer that does not pass through fetched context.',
      },
      {
        type: 'note',
        cols: 8,
        heading: 'The refusal is the feature',
        tone: 'flag',
        body: [
          'Most LLM products treat a failed retrieval as a degraded case and answer anyway from parametric memory. For esports that is worse than useless — a confident roster two transfer windows out of date reads exactly like a correct one.',
          'CYPHER refuses to fabricate when the fetch fails. That is a product decision before it is an engineering one, and it is the reason anything else on the page can be trusted.',
        ],
      },
      { type: 'shot', img: 'valobot-1', cols: 6, shape: 'slab', align: 'top', caption: 'Team intel — 12 VCT partner orgs', kind: 'live' },
      {
        type: 'note',
        cols: 7,
        heading: 'Where the data comes from',
        body: [
          'Results, fixtures, rosters and regional standings are scraped from VLR.gg rather than licensed, which makes the scraper the fragile part of the system and the thing most worth monitoring.',
          'Playstyle summaries and per-player scouting blurbs are written by a model on top of that scraped base, and labelled as such.',
        ],
      },
      { type: 'shot', img: 'valobot-2', cols: 6, shape: 'blob', align: 'bottom', caption: 'Player profiles — role, agent pool, scouting blurb', kind: 'live' },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },
];
