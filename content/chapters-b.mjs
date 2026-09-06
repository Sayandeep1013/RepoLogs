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

  /* ══════════════════════════ DISCREC ══════════════════════════ */
  {
    slug: 'discrec',
    repo: 'DiscRec',
    title: 'DiscRec',
    kicker: 'One job, one binary',
    accent: { light: '#0A5470', dark: '#3DB8D4' },
    langs: ['Rust'],
    topics: ['audio', 'discord', 'native', 'windows'],
    pitch:
      'Records Discord’s audio. Open it, press record, get one file. The Windows release is under 1 MB.',
    constraint: {
      q: 'OBS can already capture Discord. Why does this exist?',
      a: 'Because OBS is a 200 MB video suite you configure before it records anything. DiscRec is that one job as one button in one binary.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'record',
        cols: 13,
        label: 'A session',
        note: 'Find Discord, mix two clocks, write one Ogg. Replayed from the documented pipeline.',
      },
      {
        type: 'diagram',
        id: 'discrec',
        cols: 13,
        label: 'Four parts, one of them platform-specific',
        caption:
          'Everything except the capture backend is shared. The Mac contributor writes one file against an existing trait.',
      },
      {
        type: 'code',
        cols: 8,
        label: 'The only platform conditional',
        lang: 'rust',
        body: `pub struct Frame {
    pub source: Source,     // Discord | mic
    pub sample_pos: u64,    // this stream's clock
    pub samples: Vec<f32>,
}

pub trait CaptureBackend: Send {
    fn start(&mut self, discord_pid: u32,
             sink: FrameSink) -> Result<()>;
    fn stop(&mut self) -> Result<()>;
}`,
        caption:
          'WASAPI process loopback on Windows, a Core Audio process tap on macOS. If anything else needs a cfg, that is a design smell.',
      },
      {
        type: 'note',
        cols: 7,
        heading: 'The hard part is two clocks',
        body: [
          'Discord’s output and the microphone arrive as independently clocked streams. Drift compensation happens in the mixer, before summing, using each stream’s own sample position rather than wall-clock arrival.',
          'A limiter sits after the sum, because two sources added together clip. Pages of Opus in Ogg are committed as they are made, so a crash still leaves a playable file.',
        ],
      },
      {
        type: 'note',
        cols: 6,
        heading: 'What it deliberately does not do',
        body: [
          'Auto-start, per-person tracks, video, transcription, cloud, mobile. Each was considered and cut. First launch reminds you that everyone in the call is being recorded — Discord’s Terms require you to tell them; the app cannot say it for you.',
        ],
      },
      {
        type: 'note',
        cols: 7,
        heading: 'Status, honestly',
        tone: 'flag',
        body: [
          'The Windows app works; download the exe from Releases. macOS is in the tree — clone and run the script on 14.2+ — not a packaged download.',
          'Two measurements are still outstanding, not missing features: a four-hour drift soak, and release CPU against a 3% budget.',
        ],
      },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },

  /* ══════════════════════════ TOMEVOICE ══════════════════════════ */
  {
    slug: 'tomevoice',
    repo: 'TomeVoice',
    title: 'TomeVoice',
    kicker: 'A reader that owns the audio',
    accent: { light: '#6B3A18', dark: '#E0A86A' },
    langs: ['Dart'],
    topics: ['tts', 'ebook-reader', 'epub', 'offline-first'],
    pitch:
      'A document reader with a serious text-to-speech engine — Android and Windows — that controls the gap between words.',
    constraint: {
      q: 'No TTS engine on either platform can control the gap between words. Now what?',
      a: 'You never call speak(). You synthesise to PCM, take the timings, and run your own player, scheduler and DSP chain. That one requirement is most of the architecture.',
    },
    panels: [
      { type: 'title' },
      { type: 'constraint' },
      {
        type: 'custom',
        id: 'voice',
        cols: 13,
        label: 'A sentence, spoken',
        note: 'Word-gap injection on derived timings. Replayed from the documented audio pipeline.',
      },
      {
        type: 'diagram',
        id: 'tomevoice',
        cols: 14,
        label: 'Two contracts',
        caption:
          'Every format becomes one document model. Every engine returns PCM plus word timings. Neither side knows what a PDF is.',
      },
      {
        type: 'code',
        cols: 9,
        label: 'Contract B — never speak()',
        lang: 'text',
        body: `SynthesisResult
  pcm            mono samples
  wordTimings    char range → frame range
  source         engineReported
                 | modelDurations
                 | aligned
                 | estimated

pipeline, in order
  1  edge trim
  2  time stretch
  3  word-gap injection
  4  punctuation pauses
  5  sentence pause
  6  gain

highlighting reads the
post-processed timings.`,
        caption:
          'Stage order is load-bearing. Stretch after the gaps and the gaps stretch too. Estimated timings are labelled, and the UI falls back to the sentence rather than highlighting the wrong word.',
      },
      {
        type: 'note',
        cols: 7,
        heading: 'The hard part',
        body: [
          'Neural voices return no word timings — only samples. Highlighting and gap injection both depend on them, so they are derived in stages and honestly labelled. System voices hand timings over for free.',
          'The best-sounding open model is too heavy for cheap phones. Kokoro is device-gated and never the default. PDF is not a text format: reconstructing reading order from glyph positions is the largest cost in the document pipeline, and it is never perfect, so the product lets users correct it.',
        ],
      },
      {
        type: 'note',
        cols: 6,
        heading: 'Licence as architecture',
        body: [
          'GPL-3.0 was not a formality. eSpeak-NG, Piper’s engine and the best pitch/time library are all GPL. Matching their licence turned three blockers into ordinary dependencies.',
        ],
      },
      {
        type: 'note',
        cols: 7,
        heading: 'Status, honestly',
        tone: 'flag',
        body: [
          'You can use it. The audio-engine spike is proven on a real device. The app opens EPUB, TXT and Markdown from the library and reads them aloud sentence by sentence, with the same word-gap, pause and speed controls.',
          'APKs still come from CI — there is no local Flutter install. DRM-protected books are permanently out of scope.',
        ],
      },
      {
        type: 'stat',
        cols: 6,
        label: 'The surface',
        items: [
          ['2', 'platforms'],
          ['GPL-3.0', 'licence'],
          ['PCM', 'never speak()'],
          ['0', 'accounts'],
        ],
        caption: 'Android APK with the screen off; a Windows exe with media keys. Nothing leaves the device.',
      },
      { type: 'outcome', cols: 5 },
      { type: 'handoff', cols: 6 },
    ],
  },
];
