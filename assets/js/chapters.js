/* ==================================================================
   rein.dev — per-chapter set pieces
   One for each chapter. Each is handed its panel element and a
   progress() helper (0..1 as the panel crosses the viewport).
   All are decorative: nothing here gates content.
   ================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var C = (window.REIN_CUSTOM = window.REIN_CUSTOM || {});

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  /* a rAF loop that only ticks while the element is near the viewport */
  function loop(node, fn, margin) {
    var m = margin == null ? 400 : margin;
    var last = 0;
    function step(t) {
      var r = node.getBoundingClientRect();
      var near = r.right > -m && r.left < innerWidth + m;
      if (near) fn(t, t - last);
      last = t;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ═════════════ 01 · ReelShell — TUI replay ═════════════ */
  C.tui = function (host) {
    var TITLES = [
      ['Perfect Blue', '1997'], ['Paprika', '2006'], ['Akira', '1988'],
      ['Ghost in the Shell', '1995'], ['Millennium Actress', '2001'], ['Angel\'s Egg', '1985'],
    ];
    var TABS = ['MOVIES', 'SERIES', 'ANIME'];
    host.innerHTML = '';
    var box = el('div', 'tui');
    var bar = el('div', 'tui__bar');
    TABS.forEach(function (t, i) { var b = el('span', 'tui__tab' + (i === 2 ? ' on' : ''), t); bar.appendChild(b); });
    box.appendChild(bar);

    var q = el('div', 'tui__q'); box.appendChild(q);
    var list = el('div'); box.appendChild(list);
    var status = el('div', 'tui__status'); box.appendChild(status);
    host.appendChild(box);

    var rows = TITLES.map(function (t) {
      var r = el('div', 'tui__row');
      r.appendChild(el('span', 'yr', t[1]));
      r.appendChild(el('span', 'nm', t[0]));
      list.appendChild(r);
      return r;
    });

    var SEARCH = 'perfect';
    var script = [];
    /* type the query */
    for (var i = 1; i <= SEARCH.length; i++) script.push({ at: 300 + i * 95, q: SEARCH.slice(0, i) });
    script.push({ at: 1500, filter: true, status: 'local fuzzy filter — 1 match' });
    script.push({ at: 2100, status: 'remote refine · TMDB + AniList …' });
    script.push({ at: 2900, sel: 0, status: '1 result · cached' });
    script.push({ at: 3700, season: true, status: 'season 1 · 13 episodes · sub / dub' });
    script.push({ at: 4700, status: 'provider 1 → timeout · falling back' });
    script.push({ at: 5500, status: 'provider 2 → resolved · 1080p · subs: en, ja' });
    script.push({ at: 6300, playing: true, status: '▶ handing stream to mpv' });
    script.push({ at: 8600, reset: true });

    var t0 = null, done = -1;
    loop(host, function (t) {
      if (t0 === null) t0 = t;
      var e = t - t0;
      for (var i = 0; i < script.length; i++) {
        if (i <= done) continue;
        var s = script[i];
        if (e < s.at) break;
        done = i;
        if (s.q != null) q.innerHTML = '/ ' + s.q + '<i class="tui__cur"></i>';
        if (s.filter) rows.forEach(function (r, j) { r.style.display = j === 0 ? '' : 'none'; });
        if (s.sel != null) rows[s.sel].classList.add('sel');
        if (s.season) {
          rows.forEach(function (r, j) { if (j > 0) { r.style.display = j <= 3 ? '' : 'none'; r.classList.remove('sel'); } });
          rows[1].querySelector('.yr').textContent = 'S1';
          rows[1].querySelector('.nm').textContent = 'E01 · Mania Performance';
          rows[2].querySelector('.yr').textContent = 'S1';
          rows[2].querySelector('.nm').textContent = 'E02 · Sound of Silence';
          rows[3].querySelector('.yr').textContent = 'S1';
          rows[3].querySelector('.nm').textContent = 'E03 · Double Bind';
          rows[1].classList.add('sel');
        }
        if (s.playing) box.style.opacity = '.72';
        if (s.status) status.textContent = s.status;
        if (s.reset) {
          t0 = t; done = -1; box.style.opacity = '';
          q.innerHTML = '/ <i class="tui__cur"></i>';
          rows.forEach(function (r, j) {
            r.style.display = ''; r.classList.remove('sel');
            r.querySelector('.yr').textContent = TITLES[j][1];
            r.querySelector('.nm').textContent = TITLES[j][0];
          });
          status.textContent = '';
        }
      }
    });
  };

  /* ═════════════ 02 · DiscVault — chunk pipeline ═════════════ */
  C.chunks = function (host, api) {
    var N = 24;
    host.innerHTML = '';
    var w = el('div', 'chunks');
    w.appendChild(el('div', 'chunks__lab', 'FILE — 30 GB, STREAMED'));
    var file = el('div', 'chunks__file');
    for (var i = 0; i < N; i++) file.appendChild(el('i'));
    w.appendChild(file);
    w.appendChild(el('div', 'chunks__lab', 'DISCORD MESSAGES'));
    var msgs = el('div', 'chunks__msgs');
    for (var j = 0; j < N; j++) { var m = el('div', 'chunks__msg', String(j)); msgs.appendChild(m); }
    w.appendChild(msgs);
    var hash = el('div', 'chunks__hash');
    hash.innerHTML = 'SHA-256 &nbsp;<b>—</b>';
    w.appendChild(hash);
    host.appendChild(w);

    var bits = file.querySelectorAll('i'), cells = msgs.querySelectorAll('.chunks__msg');
    loop(host, function () {
      var p = api.progress(host.closest('.panel') || host);
      var k = Math.round(Math.max(0, Math.min(1, (p - 0.12) / 0.62)) * N);
      for (var i = 0; i < N; i++) {
        bits[i].style.opacity = i < k ? '1' : '0';
        cells[i].classList.toggle('on', i < k);
      }
      hash.innerHTML = k >= N
        ? 'SHA-256 &nbsp;<b>verified · byte for byte</b>'
        : 'SHA-256 &nbsp;<b>' + (k ? 'hashing… ' + Math.round((k / N) * 100) + '%' : '—') + '</b>';
    });
  };

  /* ═════════════ 03 · Rein-Bot — one round ═════════════ */
  C.round = function (host) {
    var GUESSES = [
      ['kira', 'cowboy bebop', false, 900],
      ['sen', 'bepop', false, 1800],
      ['mika', 'cowboy beebop', false, 3000],
      ['rin', 'カウボーイビバップ', false, 4200],
      ['kira', 'Cowboy Bebop', true, 6400],
    ];
    host.innerHTML = '';
    var w = el('div', 'round');
    var top = el('div', 'round__top');
    var ring = el('div', 'round__ring');
    ring.innerHTML =
      '<svg viewBox="0 0 40 40"><circle class="bg" cx="20" cy="20" r="18"/>' +
      '<circle class="fg" cx="20" cy="20" r="18" stroke-dasharray="113" stroke-dashoffset="0"/></svg><b>20</b>';
    top.appendChild(ring);
    var meta = el('div');
    meta.innerHTML = '<div class="chunks__lab">ROOM 7K2Q · 5 PLAYERS</div>' +
      '<div class="chunks__hash" style="margin-top:4px">clip · <b>a3f81c…-uuid.webm</b></div>';
    top.appendChild(meta);
    w.appendChild(top);
    var feed = el('div', 'round__feed'); w.appendChild(feed);
    var rev = el('div', 'round__reveal');
    rev.innerHTML = 'graded in postgres · tier <b>near</b> — bounded Levenshtein · answer never left the server';
    w.appendChild(rev);
    host.appendChild(w);

    var fg = ring.querySelector('.fg'), num = ring.querySelector('b');
    var nodes = GUESSES.map(function (g) {
      var r = el('div', 'round__g');
      r.appendChild(el('span', 'who', g[0]));
      r.appendChild(el('span', g[2] ? 'yes' : 'no', g[1]));
      feed.appendChild(r);
      return r;
    });

    var t0 = null;
    loop(host, function (t) {
      if (t0 === null) t0 = t;
      var e = (t - t0) % 11000;
      var secs = Math.max(0, 20 - Math.floor(e / 400));
      num.textContent = secs;
      fg.setAttribute('stroke-dashoffset', String(113 * (1 - secs / 20)));
      nodes.forEach(function (n, i) { n.classList.toggle('on', e > GUESSES[i][3]); });
      rev.classList.toggle('on', e > 7100);
    });
  };

  /* ═════════════ 04 · co-canvas — presence ═════════════ */
  C.presence = function (host, api) {
    host.innerHTML = '';
    var w = el('div', 'pres');
    var a = el('div', 'pres__half'), b = el('div', 'pres__half');
    a.appendChild(el('div', 'pres__lab', 'NOTES — BLOCKNOTE'));
    b.appendChild(el('div', 'pres__lab', 'CANVAS — EXCALIDRAW'));
    var lines = [];
    for (var i = 0; i < 7; i++) { var L = el('div', 'pres__line'); a.appendChild(L); lines.push(L); }
    var ink = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ink.setAttribute('class', 'pres__ink'); ink.setAttribute('viewBox', '0 0 200 160');
    ink.setAttribute('preserveAspectRatio', 'none');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M24 118 C48 42, 86 132, 108 68 S158 26, 180 96');
    ink.appendChild(p); b.appendChild(ink);
    var c1 = el('div', 'pres__cur'); c1.innerHTML = '<i></i><b>mira</b>';
    var c2 = el('div', 'pres__cur'); c2.innerHTML = '<i></i><b>dev</b>';
    a.appendChild(c1); b.appendChild(c2);
    w.appendChild(a); w.appendChild(b); host.appendChild(w);

    var len = 0;
    try { len = p.getTotalLength(); } catch (e) { len = 420; }
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;

    var WID = [72, 96, 58, 88, 44, 80, 36];
    loop(host, function (t) {
      var pr = api.progress(host.closest('.panel') || host);
      var k = Math.max(0, Math.min(1, (pr - 0.14) / 0.6));
      lines.forEach(function (L, i) {
        var s = Math.max(0, Math.min(1, k * 7 - i));
        L.style.width = (WID[i] * s) + '%';
      });
      p.style.strokeDashoffset = String(len * (1 - k));
      var osc = Math.sin(t / 900);
      c1.style.transform = 'translate(' + (18 + k * 130) + 'px,' + (26 + k * 120 + osc * 5) + 'px)';
      c2.style.transform = 'translate(' + (30 + k * 120) + 'px,' + (110 - k * 60 - osc * 8) + 'px)';
    });
  };

  /* ═════════════ 05 · Tessera — canvas ↔ JSON ═════════════ */
  C.tessera = function (host) {
    /* first four rows are verbatim from the repo README; the rest complete a demo sprite */
    var PX = [
      '................', '.....111111.....', '...1122222211...', '..122222222221..',
      '..122222222221..', '..112222222211..', '...1122222211...', '....11222211....',
      '.....112211.....', '......1221......', '......1221......', '......1221......',
      '.....112211.....', '....11111111....', '...111111111....', '................',
    ];
    var PAL = { '.': 'transparent', '1': '#2d1b00', '2': '#f4c430' };
    host.innerHTML = '';
    var w = el('div', 'tess');
    var left = el('div', 'tess__side'), right = el('div', 'tess__side');
    left.appendChild(el('div', 'pres__lab', 'CANVAS'));
    right.appendChild(el('div', 'pres__lab', 'THE DOCUMENT'));
    var grid = el('div', 'tess__grid');
    var cells = [];
    PX.forEach(function (row, y) {
      for (var x = 0; x < 16; x++) {
        var c = el('div', 'tess__px');
        c.style.background = PAL[row[x]] || 'transparent';
        c.dataset.y = y;
        grid.appendChild(c);
        cells.push(c);
      }
    });
    left.appendChild(grid);
    var json = el('div', 'tess__json');
    var rows = PX.map(function (row, y) {
      var r = el('span', 'r', '  "' + row + '",');
      r.dataset.y = y;
      json.appendChild(r);
      return r;
    });
    right.appendChild(json);
    w.appendChild(left); w.appendChild(right); host.appendChild(w);

    function hl(y) {
      cells.forEach(function (c) { c.classList.toggle('hl', +c.dataset.y === y); });
      rows.forEach(function (r) { r.classList.toggle('hl', +r.dataset.y === y); });
    }
    grid.addEventListener('pointermove', function (e) {
      var c = e.target.closest('.tess__px'); if (c) hl(+c.dataset.y);
    });
    json.addEventListener('pointermove', function (e) {
      var r = e.target.closest('.r'); if (r) hl(+r.dataset.y);
    });
    host.addEventListener('pointerleave', function () { hl(-1); });

    if (!reduce) {
      var y = 0, t0 = null, touched = false;
      host.addEventListener('pointerenter', function () { touched = true; });
      loop(host, function (t) {
        if (touched) return;
        if (t0 === null) t0 = t;
        if (t - t0 > 420) { t0 = t; y = (y + 1) % 16; hl(y); }
      });
    }
  };

  /* ═════════════ 06 · TermTypo — live race ═════════════ */
  C.race = function (host) {
    var TEXT = 'the quick brown fox jumps over the lazy dog and keeps on running';
    var words = TEXT.split(' ');
    host.innerHTML = '';
    var w = el('div', 'race');
    function lane(name, cls) {
      var L = el('div', 'race__lane' + (cls ? ' ' + cls : ''));
      L.appendChild(el('span', 'race__who', name));
      var bar = el('div', 'race__bar'); bar.appendChild(el('i')); L.appendChild(bar);
      L.appendChild(el('span', 'race__wpm', '0 wpm'));
      w.appendChild(L);
      return { bar: bar.querySelector('i'), wpm: L.querySelector('.race__wpm') };
    }
    var you = lane('you · term', '');
    var opp = lane('rival · web', 'b');
    var txt = el('div', 'race__text'); w.appendChild(txt);
    var elo = el('div', 'race__elo'); w.appendChild(elo);
    host.appendChild(w);

    var t0 = null;
    loop(host, function (t) {
      if (t0 === null) t0 = t;
      var e = (t - t0) % 12000;
      var run = Math.min(e, 9000) / 9000;
      var pa = Math.min(1, run * 1.06);
      var pb = Math.min(1, run * 0.94 + Math.sin(run * 7) * 0.02);
      you.bar.style.width = (pa * 100) + '%';
      opp.bar.style.width = (pb * 100) + '%';
      var secs = Math.max(0.2, (e / 1000));
      var mins = Math.max(secs, 0.6) / 60;
      you.wpm.textContent = Math.round((pa * TEXT.length) / 5 / mins) + ' wpm';
      opp.wpm.textContent = Math.round((pb * TEXT.length) / 5 / mins) + ' wpm';
      var done = Math.floor(pa * words.length);
      txt.innerHTML = words.map(function (word, i) {
        if (i < done) return '<b>' + word + '</b>';
        if (i === done) return '<u>' + word + '</u>';
        return word;
      }).join(' ');
      var over = e > 9200;
      elo.classList.toggle('on', over);
      if (over) elo.innerHTML = 'words_50 · <b>+14 ELO</b> — 1482 → 1496 · rival −14';
    });
  };

  /* ═════════════ 07 · DroidDoodle — a turn ═════════════ */
  C.agent = function (host) {
    var PROMPT = 'put a tree left of the house and a bird above it';
    var CALLS = [
      ['find_node', '"house"', '→ n2 @ (4,3)'],
      ['place_node', '"tree", left_of: n2', '→ n7 @ (2,3)'],
      ['place_node', '"bird", above: n7', '→ n8 @ (2,1)'],
      ['commit', '3 ops', '→ board v14'],
    ];
    var NODES = [
      { id: 'house', x: 58, y: 46, w: 26, h: 26, at: 0 },
      { id: 'tree', x: 22, y: 46, w: 20, h: 26, at: 1 },
      { id: 'bird', x: 24, y: 12, w: 16, h: 18, at: 2 },
    ];
    host.innerHTML = '';
    var w = el('div', 'agent');
    var inp = el('div', 'agent__in');
    inp.innerHTML = '<span>&gt;</span> ' + PROMPT;
    w.appendChild(inp);
    var body = el('div', 'agent__body');
    var plan = el('div', 'agent__plan'); body.appendChild(plan);
    var board = el('div', 'agent__board');
    board.appendChild(el('div', 'agent__grid'));
    body.appendChild(board);
    w.appendChild(body); host.appendChild(w);

    var callEls = CALLS.map(function (c) {
      var s = el('span', 'agent__call');
      s.innerHTML = '<b>' + c[0] + '</b>(' + c[1] + ') <em>' + c[2] + '</em>';
      plan.appendChild(s);
      return s;
    });
    var nodeEls = NODES.map(function (n) {
      var d = el('div', 'agent__node', n.id);
      d.style.left = n.x + '%'; d.style.top = n.y + '%';
      d.style.width = n.w + '%'; d.style.height = n.h + '%';
      board.appendChild(d);
      return d;
    });

    var t0 = null;
    loop(host, function (t) {
      if (t0 === null) t0 = t;
      var e = (t - t0) % 9000;
      callEls.forEach(function (c, i) { c.classList.toggle('on', e > 700 + i * 850); });
      nodeEls.forEach(function (n, i) { n.classList.toggle('on', e > 900 + NODES[i].at * 850); });
    });
  };

  /* ═════════════ FTC — a round of trumps ═════════════ */
  C.trumps = function (host) {
    var STATS = [
      ['POWER', 88, 71], ['SPEED', 62, 79], ['RANGE', 45, 45], ['INTELLECT', 93, 58],
    ];
    var CALL = 3; /* intellect */
    host.innerHTML = '';
    var w = el('div', 'trumps');
    function card(name, side) {
      var c = el('div', 'trumps__card ' + side);
      c.appendChild(el('div', 'trumps__name', name));
      var ul = el('div', 'trumps__stats');
      STATS.forEach(function (s, i) {
        var r = el('div', 'trumps__stat');
        r.appendChild(el('span', 'k', s[0]));
        r.appendChild(el('span', 'v', String(side === 'a' ? s[1] : s[2])));
        ul.appendChild(r);
      });
      c.appendChild(ul);
      return c;
    }
    var a = card('VANGUARD-07', 'a');
    var vs = el('div', 'trumps__vs', 'vs');
    var b = card('HALCYON-12', 'b');
    w.appendChild(a); w.appendChild(vs); w.appendChild(b);
    var out = el('div', 'trumps__out');
    w.appendChild(out);
    host.appendChild(w);

    var rowsA = a.querySelectorAll('.trumps__stat'), rowsB = b.querySelectorAll('.trumps__stat');
    var t0 = null;
    loop(host, function (t) {
      if (t0 === null) t0 = t;
      var e = (t - t0) % 8000;
      rowsA.forEach(function (r, i) { r.classList.toggle('called', e > 1400 && i === CALL); });
      rowsB.forEach(function (r, i) { r.classList.toggle('called', e > 2200 && i === CALL); });
      a.classList.toggle('win', e > 3200);
      b.classList.toggle('lose', e > 3200);
      vs.textContent = e > 3200 ? '>' : 'vs';
      out.classList.toggle('on', e > 3600);
      out.textContent = e > 3600 ? 'resolved in postgres · A takes the pile · B draws next' : '';
    });
  };

  /* ═════════════ Solidus — a board filling ═════════════ */
  C.bingo = function (host) {
    var N = 25;
    var nums = [];
    for (var i = 0; i < N; i++) nums.push(1 + ((i * 7 + 3) % 75));
    /* a deterministic call order that completes the middle row */
    var ORDER = [10, 11, 12, 13, 14, 0, 6, 18, 24, 3, 21, 7, 17, 1, 23];
    host.innerHTML = '';
    var w = el('div', 'bingo');
    var head = el('div', 'bingo__head');
    head.innerHTML = '<span class="bingo__lab">ROOM · RANKED</span><span class="bingo__call">—</span>';
    w.appendChild(head);
    var grid = el('div', 'bingo__grid');
    var cells = nums.map(function (n, i) {
      var c = el('div', 'bingo__c', i === 12 ? '★' : String(n));
      grid.appendChild(c);
      return c;
    });
    w.appendChild(grid);
    var line = el('div', 'bingo__line');
    w.appendChild(line);
    host.appendChild(w);

    var callEl = head.querySelector('.bingo__call');
    var t0 = null;
    loop(host, function (t) {
      if (t0 === null) t0 = t;
      var e = (t - t0) % 11000;
      var k = Math.floor(Math.max(0, e - 600) / 620);
      for (var i = 0; i < N; i++) cells[i].classList.remove('on');
      for (var j = 0; j < Math.min(k, ORDER.length); j++) cells[ORDER[j]].classList.add('on');
      var last = ORDER[Math.min(k, ORDER.length) - 1];
      callEl.textContent = k > 0 ? (last === 12 ? 'FREE' : nums[last]) : '—';
      var won = k >= 5;
      line.classList.toggle('on', won);
      line.textContent = won ? 'line · row 3 · +18 ELO' : '';
      for (var m = 10; m <= 14; m++) cells[m].classList.toggle('lit', won);
    });
  };

  /* ═════════════ NoteTakerXX — the canvas ═════════════ */
  C.canvas = function (host) {
    var NOTES = [
      { x: 8, y: 14, w: 26, h: 30, t: 'source', at: 400 },
      { x: 44, y: 46, w: 26, h: 30, t: 'method', at: 1300 },
      { x: 74, y: 12, w: 22, h: 26, t: 'result', at: 2200 },
      { x: 18, y: 62, w: 24, h: 26, t: 'todo', at: 3100 },
    ];
    var LINKS = [[0, 1, 4000], [1, 2, 4800], [1, 3, 5600]];
    host.innerHTML = '';
    var w = el('div', 'ncanvas');
    w.appendChild(el('div', 'ncanvas__grid'));
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ncanvas__ropes');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    w.appendChild(svg);
    var nodes = NOTES.map(function (n) {
      var d = el('div', 'ncanvas__n');
      d.style.left = n.x + '%'; d.style.top = n.y + '%';
      d.style.width = n.w + '%'; d.style.height = n.h + '%';
      d.appendChild(el('span', '', n.t));
      w.appendChild(d);
      return d;
    });
    var ropes = LINKS.map(function (l) {
      var A = NOTES[l[0]], B = NOTES[l[1]];
      var x1 = A.x + A.w / 2, y1 = A.y + A.h / 2, x2 = B.x + B.w / 2, y2 = B.y + B.h / 2;
      var sag = Math.max(6, Math.abs(x2 - x1) * 0.28);
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', 'M' + x1 + ' ' + y1 + ' Q' + (x1 + x2) / 2 + ' ' + ((y1 + y2) / 2 + sag) + ' ' + x2 + ' ' + y2);
      p.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(p);
      var len = 0;
      try { len = p.getTotalLength(); } catch (e) { len = 100; }
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      return { p: p, len: len, at: l[2] };
    });
    host.appendChild(w);

    var t0 = null;
    loop(host, function (t) {
      if (t0 === null) t0 = t;
      var e = (t - t0) % 9000;
      nodes.forEach(function (n, i) { n.classList.toggle('on', e > NOTES[i].at); });
      ropes.forEach(function (r) {
        var k = Math.max(0, Math.min(1, (e - r.at) / 700));
        r.p.style.strokeDashoffset = String(r.len * (1 - k));
      });
    });
  };

  /* ═════════════ ValoBot — two questions ═════════════ */
  C.cypher = function (host) {
    var SCRIPT = [
      { at: 300, who: 'q', text: 'who won the last SEN match?' },
      { at: 1100, who: 's', text: 'fetching live context — vlr.gg …' },
      { at: 2100, who: 'ctx', text: '3 sources · match 412088 · map pool · roster' },
      { at: 3000, who: 'a', text: 'SEN beat 100T 2–1. Ascent 13–11, Sunset 8–13, Lotus 13–9.' },
      { at: 5200, who: 'q', text: 'and their roster for next split?' },
      { at: 6000, who: 's', text: 'fetching live context — vlr.gg …' },
      { at: 7200, who: 'err', text: 'fetch failed · 0 sources' },
      { at: 8100, who: 'refuse', text: 'I can’t answer that without live data, and I won’t guess a roster.' },
    ];
    host.innerHTML = '';
    var w = el('div', 'cypher');
    var feed = el('div', 'cypher__feed');
    w.appendChild(feed);
    host.appendChild(w);
    var lines = SCRIPT.map(function (s) {
      var d = el('div', 'cypher__l cypher__l--' + s.who);
      d.appendChild(el('span', 'who', s.who === 'q' ? '›' : s.who === 'a' ? 'CYPHER' : s.who === 'refuse' ? 'CYPHER' : '·'));
      d.appendChild(el('span', 'tx', s.text));
      feed.appendChild(d);
      return d;
    });
    var t0 = null;
    loop(host, function (t) {
      if (t0 === null) t0 = t;
      var e = (t - t0) % 11500;
      lines.forEach(function (l, i) { l.classList.toggle('on', e > SCRIPT[i].at); });
    });
  };

  /* ═════════════ 08 · Martini — a real shader ═════════════ */
  C.shader = function (host) {
    host.innerHTML = '';
    var wrap = el('div', 'shader');
    var cv = el('canvas');
    wrap.appendChild(cv);
    var tier = el('div', 'shader__tier');
    ['Tier C', 'Tier A'].forEach(function (t, i) {
      var b = el('button', '', t);
      b.type = 'button';
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      tier.appendChild(b);
    });
    wrap.appendChild(tier);
    host.appendChild(wrap);

    var gl = null;
    try { gl = cv.getContext('webgl', { antialias: false, alpha: false }); } catch (e) {}
    if (!gl) {
      var fb = el('div', 'shader__fb', 'WEBGL UNAVAILABLE — WHICH IS EXACTLY THE FAILURE THIS CHAPTER IS ABOUT');
      wrap.appendChild(fb);
      return;
    }

    var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var FS = [
      'precision mediump float;',
      'uniform vec2 r;uniform float t;uniform float q;',
      'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
      ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
      'float fbm(vec2 p){float s=0.,a=.5;',
      ' for(int i=0;i<6;i++){ if(float(i)>=q) break; s+=a*n(p); p*=2.03; a*=.5;} return s;}',
      'void main(){',
      ' vec2 uv=(gl_FragCoord.xy-.5*r)/r.y;',
      ' vec2 w=uv*1.6;',
      ' float d=fbm(w+vec2(t*.045,t*.02));',
      ' float e=fbm(w*1.3+vec2(d*1.6-t*.03,d*1.2));',
      ' float v=fbm(w+vec2(e*1.4,e*1.1-t*.015));',
      ' float m=smoothstep(.18,.92,v);',
      ' vec3 ink=vec3(.055,.043,.039);',
      ' vec3 red=vec3(.784,.161,.141);',
      ' vec3 warm=vec3(.945,.941,.933);',
      ' vec3 c=mix(ink,red,pow(m,1.35));',
      ' c=mix(c,warm,pow(smoothstep(.68,1.,v),3.2)*.5);',
      ' float vg=1.-dot(uv,uv)*.42;',
      ' gl_FragColor=vec4(c*vg,1.);',
      '}',
    ].join('\n');

    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;
    var pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uQ = gl.getUniformLocation(pr, 'q');

    var quality = 5;
    tier.querySelectorAll('button').forEach(function (b, i) {
      b.addEventListener('click', function () {
        tier.querySelectorAll('button').forEach(function (x, j) { x.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
        quality = i === 0 ? 6 : 2;
      });
    });

    var dprCap = 1.15;
    function size(force) {
      var dpr = Math.min(devicePixelRatio || 1, dprCap);
      var w = Math.max(1, Math.round(cv.clientWidth * dpr));
      var h = Math.max(1, Math.round(cv.clientHeight * dpr));
      if (force || cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    }
    var start = performance.now();
    /* Adaptive quality: this shader is the most expensive thing on the site.
       On a software renderer or a weak GPU, quietly drop octaves and
       resolution rather than dragging the whole page below 60fps. */
    var samples = 0, slow = 0, degraded = false, lastLeft = null;
    /* margin 0: only run while actually visible, not while merely approaching */
    loop(host, function (t, dt) {
      /* While the track is gliding, the canvas is a texture flying past — nobody
         is reading its motion. Hold the last frame and give those milliseconds
         back to the scroll, which people DO notice. */
      var left = host.getBoundingClientRect().left;
      var moving = lastLeft !== null && Math.abs(left - lastLeft) > 0.5;
      lastLeft = left;
      if (moving) return;

      if (!degraded && dt > 0 && dt < 500) {
        samples++;
        if (dt > 22) slow++;
        if (samples > 45) {
          if (slow / samples > 0.4) { degraded = true; quality = 2; dprCap = 0.85; size(true); }
          samples = 0; slow = 0;
        }
      }
      size();
      gl.uniform2f(uR, cv.width, cv.height);
      gl.uniform1f(uT, reduce ? 8 : (performance.now() - start) / 1000);
      gl.uniform1f(uQ, quality);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }, 0);
  };

  /* ═════════════ DiscRec — a session ═════════════ */
  C.record = function (host) {
    var SCRIPT = [
      { at: 280, status: 'find Discord · stable client · pid 18420' },
      { at: 1100, rec: true, status: 'record · WASAPI loopback + default mic' },
      { at: 5200, status: 'mix · two clocks · limiter on the sum' },
      { at: 6400, file: true, status: 'write · Opus in Ogg · page committed' },
      { at: 7800, status: 'Downloads/DiscRec/session.ogg · playable if we crash' },
      { at: 10200, reset: true },
    ];
    host.innerHTML = '';
    var w = el('div', 'rec');
    var top = el('div', 'rec__top');
    var lamp = el('span', 'rec__lamp');
    top.appendChild(lamp);
    top.appendChild(el('span', 'rec__lab', 'DiscRec'));
    top.appendChild(el('span', 'rec__time', '00:00'));
    w.appendChild(top);

    function meter(name) {
      var row = el('div', 'rec__meter');
      row.appendChild(el('span', 'rec__who', name));
      var bar = el('div', 'rec__bar');
      bar.appendChild(el('i'));
      row.appendChild(bar);
      w.appendChild(row);
      return bar.querySelector('i');
    }
    var disc = meter('discord');
    var mic = meter('mic');
    var file = el('div', 'rec__file');
    file.appendChild(el('span', 'k', 'file'));
    file.appendChild(el('span', 'v', 'session.ogg'));
    w.appendChild(file);
    var status = el('div', 'rec__status');
    w.appendChild(status);
    host.appendChild(w);

    var t0 = null, done = -1, recOn = false, fileOn = false;
    loop(host, function (t) {
      if (t0 === null) t0 = t;
      var e = (t - t0) % 11500;
      if (e < 80) { done = -1; recOn = false; fileOn = false; }
      for (var i = 0; i < SCRIPT.length; i++) {
        if (i <= done) continue;
        var s = SCRIPT[i];
        if (e < s.at) break;
        done = i;
        if (s.reset) { recOn = false; fileOn = false; status.textContent = ''; continue; }
        if (s.rec) recOn = true;
        if (s.file) fileOn = true;
        if (s.status) status.textContent = s.status;
      }
      lamp.classList.toggle('on', recOn);
      file.classList.toggle('on', fileOn);
      var secs = recOn ? Math.min(99, Math.floor((e - 1100) / 1000)) : 0;
      top.querySelector('.rec__time').textContent = '00:' + String(Math.max(0, secs)).padStart(2, '0');
      var pulse = recOn ? 0.35 + Math.abs(Math.sin(t / 180)) * 0.55 : 0.06;
      var pulse2 = recOn ? 0.22 + Math.abs(Math.sin(t / 230 + 1.2)) * 0.4 : 0.06;
      disc.style.width = (pulse * 100) + '%';
      mic.style.width = (pulse2 * 100) + '%';
    });
  };

  /* ═════════════ TomeVoice — a sentence, spoken ═════════════ */
  C.voice = function (host) {
    var WORDS = ['The', 'gap', 'between', 'words', 'is', 'not', 'a', 'pause', 'the', 'engine', 'will', 'give', 'you.'];
    host.innerHTML = '';
    var w = el('div', 'voice');
    var line = el('div', 'voice__line');
    var nodes = WORDS.map(function (word) {
      var wrap = el('span', 'voice__w');
      wrap.appendChild(el('b', '', word));
      var gap = el('i', 'voice__gap');
      wrap.appendChild(gap);
      line.appendChild(wrap);
      return wrap;
    });
    w.appendChild(line);
    var meta = el('div', 'voice__meta');
    w.appendChild(meta);
    host.appendChild(w);

    var t0 = null;
    loop(host, function (t) {
      if (t0 === null) t0 = t;
      var e = (t - t0) % 11000;
      var speaking = e > 700 && e < 8200;
      var idx = speaking ? Math.min(WORDS.length - 1, Math.floor((e - 700) / 520)) : -1;
      nodes.forEach(function (n, i) {
        n.classList.toggle('on', i === idx);
        n.classList.toggle('done', i < idx);
        n.classList.toggle('gap', speaking && i === idx);
      });
      if (!speaking) {
        meta.textContent = e < 700
          ? 'synthesise → PCM · timings: estimated'
          : 'sentence pause · lookahead primed';
      } else {
        meta.innerHTML = 'word ' + (idx + 1) + ' / ' + WORDS.length +
          ' · gap inject <b>80 ms</b> · highlight uses post-process timings';
      }
    });
  };
})();
