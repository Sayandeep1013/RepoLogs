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

  var SVGNS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  /* small deterministic PRNG, seeded by a string — the same id always draws the same thing */
  function seeded(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    var s = h >>> 0;
    var fn = function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    fn.hash = h >>> 0;
    return fn;
  }
  /* read a theme token, so canvases follow the theme toggle */
  function tok(node, name) {
    return getComputedStyle(node).getPropertyValue(name).trim();
  }

  /* ═════════════ Sabuj — seeded plant mascots ═════════════ */
  C.plant = function (host) {
    var PLANTS = [
      { id: 'p03', name: 'Monstera Deliciosa', type: 'monstera', leaf: '#3C7A3E', mood: 'grin' },
      { id: 'p10', name: 'Red Joba', type: 'bush', leaf: '#3C7A3E', flower: '#D9342B', mood: 'tongue' },
      { id: 'p07', name: 'Snake Plant', type: 'snake', leaf: '#4F7F3A', mood: 'smile' },
      { id: 'p21', name: 'Barrel Cactus', type: 'cactus', leaf: '#5E8F4A', flower: '#E8B546', mood: 'wow' },
    ];
    var POTS = [
      ['terracotta', '#C2653F', false], ['indigo', '#3D5A8F', true],
      ['cream', '#EDE3CC', false], ['charcoal', '#2E2E2E', true],
    ];
    var uid = 'pl' + Math.random().toString(36).slice(2, 8);
    host.innerHTML = '';
    var w = el('div', 'plant');
    var art = el('div', 'plant__art');
    var svg = sv('svg', { viewBox: '-10 0 220 230', 'aria-hidden': 'true' });
    var defs = sv('defs', {});
    /* the sticker outline: dilate the silhouette, flood it with ink, merge the art on top */
    var f = sv('filter', { id: uid + 'f', x: '-20%', y: '-20%', width: '140%', height: '140%' });
    f.appendChild(sv('feMorphology', { in: 'SourceAlpha', operator: 'dilate', radius: '2.4', result: 'd' }));
    var fl = sv('feFlood', { result: 'f' });
    fl.setAttribute('class', 'plant__ink');
    f.appendChild(fl);
    f.appendChild(sv('feComposite', { in: 'f', in2: 'd', operator: 'in', result: 'o' }));
    var mg = sv('feMerge', {});
    mg.appendChild(sv('feMergeNode', { in: 'o' }));
    mg.appendChild(sv('feMergeNode', { in: 'SourceGraphic' }));
    f.appendChild(mg);
    defs.appendChild(f);
    svg.appendChild(defs);
    svg.appendChild(sv('circle', { cx: 100, cy: 112, r: 92, class: 'plant__disc' }));
    svg.appendChild(sv('ellipse', { cx: 100, cy: 214, rx: 52, ry: 6, class: 'plant__shadow' }));
    var g = sv('g', { id: uid, filter: 'url(#' + uid + 'f)' });
    svg.appendChild(g);
    art.appendChild(svg);
    w.appendChild(art);

    var side = el('div', 'plant__side');
    var nm = el('div', 'plant__name');
    var spec = el('pre', 'plant__spec');
    var pots = el('div', 'plant__pots');
    var potEls = POTS.map(function (p) {
      var b = el('span', 'plant__pot');
      b.style.background = p[1];
      b.title = p[0];
      pots.appendChild(b);
      return b;
    });
    /* the proof: the same id, drawn again on three other pages */
    var again = sv('svg', { class: 'plant__again', viewBox: '0 0 330 104', 'aria-hidden': 'true' });
    ['shop card', 'cart', 'tracker'].forEach(function (lab, i) {
      var x = i * 112;
      again.appendChild(sv('rect', { x: x + 0.5, y: 0.5, width: 104, height: 84, class: 'plant__tile' }));
      var u = sv('use', { href: '#' + uid, transform: 'translate(' + (x + 22) + ' 4) scale(0.33)' });
      again.appendChild(u);
      var t = sv('text', { x: x, y: 100, class: 'plant__lab' });
      t.textContent = lab;
      again.appendChild(t);
    });
    side.appendChild(el('div', 'pres__lab', 'THE SPEC'));
    side.appendChild(nm);
    side.appendChild(spec);
    side.appendChild(el('div', 'pres__lab', 'POT'));
    side.appendChild(pots);
    side.appendChild(el('div', 'pres__lab', 'SAME ID, ELSEWHERE'));
    side.appendChild(again);
    w.appendChild(side);
    host.appendChild(w);

    var eyes = [], mouth = null, hover = false, feat = '#15281C';
    function at(node, x, y, rot, s) {
      node.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')' + (s ? ' scale(' + s + ')' : ''));
      return node;
    }
    var SLIT = '#E9EFE4';
    function monsteraLeaf(x, y, rot, s, fill) {
      var gg = sv('g', {});
      gg.appendChild(sv('path', { d: 'M0 0 C-20 -4 -30 -30 -14 -48 C-7 -55 7 -55 14 -48 C30 -30 20 -4 0 0 Z', fill: fill }));
      gg.appendChild(sv('path', { d: 'M0 -2 L0 -50', stroke: '#2A5A2C', 'stroke-width': 1.4, fill: 'none' }));
      /* fenestrations: slits from the edge toward the midrib */
      [[-1, -14], [-1, -28], [-1, -40], [1, -18], [1, -32], [1, -43]].forEach(function (q) {
        gg.appendChild(sv('path', { d: 'M' + (q[0] * 19) + ' ' + q[1] + ' L' + (q[0] * 7) + ' ' + (q[1] - 3), stroke: SLIT, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
      });
      return at(gg, x, y, rot, s);
    }
    function blade(x, h, tilt, fill) {
      var gg = sv('g', {});
      gg.appendChild(sv('path', { d: 'M-7 0 Q-10 ' + (-h * 0.55) + ' ' + tilt + ' ' + (-h) + ' Q10 ' + (-h * 0.55) + ' 7 0 Z', fill: fill }));
      for (var b = 1; b < 5; b++) {
        var y = -h * b / 5;
        gg.appendChild(sv('path', { d: 'M-5 ' + y + ' q5 -4 10 0', stroke: '#C9D27A', 'stroke-width': 1.3, fill: 'none', opacity: 0.8 }));
      }
      return at(gg, x, 146, 0);
    }
    function draw(p, pot) {
      var r = seeded(p.id);
      while (g.firstChild) g.removeChild(g.firstChild);
      var stemC = '#2A5A2C';
      if (p.type === 'monstera') {
        for (var i = 0; i < 5; i++) {
          var a = -90 + (i - 2) * 30 + (r() - 0.5) * 10;
          var len = 48 + r() * 26;
          var rad = a * Math.PI / 180;
          var x = 100 + Math.cos(rad) * len, y = 144 + Math.sin(rad) * len;
          g.appendChild(sv('path', { d: 'M100 146 Q' + (100 + Math.cos(rad) * len * 0.4 + (r() - 0.5) * 12) + ' ' + (140 + Math.sin(rad) * len * 0.6) + ' ' + x + ' ' + y,
            fill: 'none', stroke: stemC, 'stroke-width': 3.2, 'stroke-linecap': 'round' }));
          g.appendChild(monsteraLeaf(x, y, a + 90, 0.9 + r() * 0.2, i % 2 ? p.leaf : '#347036'));
        }
      } else if (p.type === 'snake') {
        for (var j = 0; j < 5; j++) {
          g.appendChild(blade(76 + j * 12 + (r() - 0.5) * 4, 72 + r() * 50, (j - 2) * 8 + (r() - 0.5) * 6, j % 2 ? p.leaf : '#3E6B2E'));
        }
      } else if (p.type === 'cactus') {
        var arm = r() > 0.5 ? 1 : -1;
        g.appendChild(sv('path', { d: arm > 0 ? 'M122 112 H136 Q146 112 146 100 V80' : 'M78 112 H64 Q54 112 54 100 V80',
          fill: 'none', stroke: p.leaf, 'stroke-width': 14, 'stroke-linecap': 'round' }));
        g.appendChild(sv('rect', { x: 74, y: 52, width: 52, height: 96, rx: 26, fill: p.leaf }));
        [86, 100, 114].forEach(function (rx) { g.appendChild(sv('path', { d: 'M' + rx + ' 62 V142', stroke: '#4C7A3A', 'stroke-width': 1.4 })); });
        for (var q = 0; q < 12; q++) g.appendChild(sv('circle', { cx: 80 + r() * 40, cy: 64 + r() * 74, r: 1.3, fill: '#F4EFE3' }));
        for (var fp = 0; fp < 5; fp++) {
          var fa = fp * 72 * Math.PI / 180;
          g.appendChild(sv('ellipse', { cx: 100 + Math.cos(fa) * 6, cy: 50 + Math.sin(fa) * 6, rx: 6, ry: 4, fill: p.flower,
            transform: 'rotate(' + (fp * 72) + ' ' + (100 + Math.cos(fa) * 6) + ' ' + (50 + Math.sin(fa) * 6) + ')' }));
        }
        g.appendChild(sv('circle', { cx: 100, cy: 50, r: 3.4, fill: '#D9342B' }));
      } else {
        g.appendChild(sv('path', { d: 'M100 146 V104', stroke: stemC, 'stroke-width': 4 }));
        for (var b = 0; b < 14; b++) {
          var ang = r() * Math.PI * 2, rr = 14 + r() * 30;
          var lx = 100 + Math.cos(ang) * rr * 1.1, ly = 98 + Math.sin(ang) * rr * 0.75;
          g.appendChild(at(sv('path', { d: 'M0 0 C-8 -4 -8 -18 0 -24 C8 -18 8 -4 0 0 Z', fill: b % 2 ? p.leaf : '#2F6B3F' }), lx, ly, ang * 57.3 + 90));
        }
        for (var fI = 0; fI < 5; fI++) {
          var fx = 66 + r() * 68, fy = 66 + r() * 52;
          for (var pe = 0; pe < 5; pe++) {
            var pa = pe * 72 * Math.PI / 180;
            g.appendChild(sv('circle', { cx: fx + Math.cos(pa) * 5.2, cy: fy + Math.sin(pa) * 5.2, r: 4.6, fill: p.flower }));
          }
          g.appendChild(sv('circle', { cx: fx, cy: fy, r: 2.4, fill: '#F0C25C' }));
        }
      }
      /* the pot, and the face on it */
      g.appendChild(sv('path', { d: 'M48 156 H152 L141 208 Q140 212 136 212 H64 Q60 212 59 208 Z', fill: pot[1] }));
      g.appendChild(sv('rect', { x: 42, y: 142, width: 116, height: 18, rx: 5, fill: pot[1] }));
      g.appendChild(sv('rect', { x: 42, y: 154, width: 116, height: 6, fill: '#000', opacity: 0.14 }));
      feat = pot[2] ? '#F4EFE3' : '#15281C';
      eyes = [sv('ellipse', { cx: 86, cy: 178, rx: 3.8, ry: 4.8, fill: feat }), sv('ellipse', { cx: 114, cy: 178, rx: 3.8, ry: 4.8, fill: feat })];
      eyes.forEach(function (e) { g.appendChild(e); });
      g.appendChild(sv('ellipse', { cx: 76, cy: 188, rx: 5, ry: 3.4, fill: '#E07E55', opacity: 0.55 }));
      g.appendChild(sv('ellipse', { cx: 124, cy: 188, rx: 5, ry: 3.4, fill: '#E07E55', opacity: 0.55 }));
      mouth = sv('path', { stroke: feat, 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      g.appendChild(mouth);
      setMouth(p.mood);

      nm.textContent = p.name;
      spec.textContent =
        '{ id: "' + p.id + '", type: "' + p.type + '",\n' +
        '  leaf: "' + p.leaf + '"' + (p.flower ? ', flower: "' + p.flower + '"' : '') + ',\n' +
        '  mood: "' + p.mood + '", pot: "' + pot[0] + '" }\n' +
        'seed = hash("' + p.id + '") → 0x' + ('00000000' + r.hash.toString(16)).slice(-8);
      potEls.forEach(function (e, i) { e.classList.toggle('on', POTS[i] === pot); });
    }
    function setMouth(mood) {
      if (!mouth) return;
      var m = hover ? 'grin' : mood;
      var d = m === 'wow' ? 'M96 194 a4 5 0 1 0 8 0 a4 5 0 1 0 -8 0'
        : m === 'grin' ? 'M89 190 Q100 204 111 190 Z'
        : m === 'tongue' ? 'M90 191 Q100 200 110 191'
        : 'M91 191 Q100 198 109 191';
      mouth.setAttribute('d', d);
      mouth.setAttribute('fill', m === 'grin' || m === 'wow' ? feat : 'none');
    }
    host.addEventListener('pointerenter', function () { hover = true; setMouth(cur.mood); });
    host.addEventListener('pointerleave', function () { hover = false; setMouth(cur.mood); });

    var cur = PLANTS[0], pi = -1, potI = 0, t0 = null, lastBlink = 0;
    draw(cur, POTS[0]);
    loop(host, function (t) {
      if (t0 === null) t0 = t;
      var e = t - t0;
      /* a plant every 4 s; halfway through, the pot changes and the plant is redrawn in it */
      var step = Math.floor(e / 2000);
      if (step !== pi) {
        pi = step;
        if (step % 2 === 0) { cur = PLANTS[(step / 2) % PLANTS.length]; potI = (step / 2) % POTS.length; }
        else potI = (potI + 1 + (Math.floor(step / 2) % 2)) % POTS.length;
        if (!reduce || step % 2 === 0) { draw(cur, POTS[potI]); art.classList.remove('pop'); void art.offsetWidth; art.classList.add('pop'); }
      }
      /* blink on a seeded offset */
      if (!reduce && t - lastBlink > 2400 + (seeded(cur.id + pi)() * 1400)) {
        lastBlink = t;
        eyes.forEach(function (ey) { ey.setAttribute('ry', '0.8'); });
        setTimeout(function () { eyes.forEach(function (ey) { ey.setAttribute('ry', '4.8'); }); }, 130);
      }
    });
  };

  /* ═════════════ BrainAI — a wave ═════════════ */
  C.tree = function (host) {
    var N = [
      { id: 'seed', x: 3, y: 42, k: 'SEED', t: 'a lending library for board games', at: 300 },
      { id: 's1', p: 'seed', x: 35, y: 4, k: 'SECTION', t: 'Product definition', ghost: 1200, at: 2700 },
      { id: 's2', p: 'seed', x: 35, y: 27, k: 'SECTION', t: 'Technical architecture', ghost: 1500, at: 2900 },
      { id: 's3', p: 'seed', x: 35, y: 50, k: 'SECTION', t: 'Build plan', ghost: 1800, at: 3100 },
      { id: 's4', p: 'seed', x: 35, y: 73, k: 'SECTION', t: 'Launch and legal', ghost: 2100, at: 3300 },
      { id: 'r1', p: 's1', x: 68, y: 4, k: 'RESEARCH', t: 'Market · 5 sources', ghost: 3900, at: 4600 },
      { id: 'd1', p: 's2', x: 68, y: 27, k: 'DECISION', t: 'Agents approach', ghost: 5000, at: 5600, auto: 1 },
      { id: 'a1', p: 's3', x: 68, y: 50, k: 'ARTIFACT', t: 'Manifest for tool', ghost: 6300, at: 6900 },
      { id: 'a2', p: 's4', x: 68, y: 73, k: 'ARTIFACT', t: 'Legal for tool', ghost: 6800, at: 7400 },
    ];
    var LOG = [
      [400, 'plan', 'seeded · planner streaming'],
      [1200, 'plan', 'drafting sections — children as they close'],
      [3400, 'node', 'added 4 sections'],
      [3900, 'search', 'tavily · basic · 5 results'],
      [5600, 'decision', 'auto-accepted · reversible fork'],
      [6400, 'gap', 'gap-fill · 2 keys still open'],
      [8200, 'coverage', '34/34 keys — complete'],
      [8800, 'pack', 'compile → 45 files · secret scan clean'],
    ];
    host.innerHTML = '';
    var w = el('div', 'tree');
    var board = el('div', 'tree__board');
    var edges = sv('svg', { class: 'tree__edges', viewBox: '0 0 100 100', preserveAspectRatio: 'none' });
    board.appendChild(edges);
    var log = el('div', 'tree__log');
    var cov = el('div', 'tree__cov');
    cov.innerHTML = '<span class="tree__covk">coverage</span><span class="tree__bar"><i></i></span><b>0/34</b>';
    w.appendChild(board);
    var side = el('div', 'tree__side');
    side.appendChild(el('div', 'pres__lab', 'THE RUN, NARRATED'));
    side.appendChild(log);
    side.appendChild(cov);
    w.appendChild(side);
    host.appendChild(w);

    var W = 27, H = 17;
    var nodes = N.map(function (n) {
      var d = el('div', 'tree__n');
      d.style.left = n.x + '%'; d.style.top = n.y + '%';
      d.style.width = W + '%'; d.style.height = H + '%';
      d.innerHTML = '<span class="tree__k">' + n.k + (n.auto ? ' · auto-decided' : '') + '</span><span class="tree__t">' + n.t + '</span>';
      board.appendChild(d);
      var path = null;
      if (n.p) {
        var P = N.filter(function (m) { return m.id === n.p; })[0];
        var x1 = P.x + W, y1 = P.y + H / 2, x2 = n.x, y2 = n.y + H / 2, mx = (x1 + x2) / 2;
        path = sv('path', { d: 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2,
          'vector-effect': 'non-scaling-stroke', class: n.auto ? 'auto' : '' });
        edges.appendChild(path);
      }
      return { n: n, d: d, path: path };
    });
    var logEls = LOG.map(function (l) {
      var r = el('div', 'tree__l');
      r.innerHTML = '<b>' + l[1] + '</b>' + l[2];
      log.appendChild(r);
      return r;
    });
    var bar = cov.querySelector('i'), covN = cov.querySelector('b');

    var t0 = null;
    loop(host, function (t) {
      if (t0 === null) t0 = t;
      var e = (t - t0) % 11500;
      nodes.forEach(function (o) {
        var n = o.n;
        var ghost = n.ghost != null ? e > n.ghost && e <= n.at : false;
        var real = e > n.at;
        o.d.classList.toggle('ghost', ghost);
        o.d.classList.toggle('on', real || ghost);
        o.d.classList.toggle('auto', !!n.auto && real);
        if (o.path) o.path.classList.toggle('on', real || ghost), o.path.classList.toggle('dash', ghost);
      });
      logEls.forEach(function (l, i) { l.classList.toggle('on', e > LOG[i][0]); });
      var k = e < 3300 ? 0 : Math.min(34, Math.round(9 + Math.max(0, (e - 3300) / 4900) * 25));
      if (e < 3300) k = 0;
      bar.style.width = (k / 34 * 100) + '%';
      covN.textContent = k + '/34';
      cov.classList.toggle('done', k >= 34);
    });
  };

  /* ═════════════ Horde Control — a wave ═════════════ */
  C.horde = function (host) {
    host.innerHTML = '';
    var w = el('div', 'horde');
    var cv = el('canvas');
    w.appendChild(cv);
    var hud = el('div', 'horde__hud');
    hud.innerHTML =
      '<span class="horde__bar"><em>you</em><span class="horde__trk"><i class="hp"></i></span></span>' +
      '<span class="horde__bar"><em>tower</em><span class="horde__trk"><i class="tw"></i></span></span>' +
      '<span class="horde__legend"><b>▲</b> seeker <b>◆</b> hunter <b>■</b> opportunist</span>' +
      '<span class="horde__wave">wave <b>1</b> / 8</span>';
    w.appendChild(hud);
    var xp = el('div', 'horde__xp');
    xp.innerHTML = '<em>xp</em><span class="horde__trk"><i></i></span>';
    w.appendChild(xp);
    var draft = el('div', 'horde__draft');
    draft.innerHTML = '<div class="horde__dk">Level-up draft · the world is paused</div><div class="horde__cards">' +
      '<span><em>player · common</em>Rapid Fire<small>+15% fire rate</small></span>' +
      '<span class="pick"><em>tower · rare</em>Caliber<small>+10% tower damage</small></span>' +
      '<span><em>tower · epic</em>Tower Volley<small>unlocked by achievement</small></span></div>';
    w.appendChild(draft);
    var flash = el('div', 'horde__flash');
    w.appendChild(flash);
    host.appendChild(w);

    var ctx = cv.getContext('2d');
    if (!ctx) return;
    var W = 0, Hh = 0, dpr = 1;
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      var cw = cv.clientWidth, ch = cv.clientHeight;
      if (Math.round(cw * dpr) !== cv.width || Math.round(ch * dpr) !== cv.height) {
        cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
      }
      W = cw; Hh = ch;
    }
    var rnd = seeded('horde-control');
    var S;
    function reset() {
      S = { foes: [], arrows: [], gems: [], puffs: [], player: { a: 0.6, x: 0, y: 0 }, php: 1, thp: 1, xp: 0.35, wave: 1,
        spawn: 0, shot: 0, tshot: 0.5, paused: 0, clock: 0, leashShown: 0 };
    }
    reset();
    var T = function () { return { x: W / 2, y: Hh / 2 + 10 }; };
    function spawn() {
      /* from just outside the visible edge, so they arrive within a couple of seconds */
      var a = rnd() * Math.PI * 2;
      var rx = Math.min(W / 2 + 20, 440), ry = Hh / 2 + 20;
      var k = Math.min(rx / Math.abs(Math.cos(a) || 1e-6), ry / Math.abs(Math.sin(a) || 1e-6));
      var r = rnd(), kind = r < 0.42 ? 'seeker' : r < 0.74 ? 'hunter' : 'opp';
      var c = T();
      S.foes.push({ x: c.x + Math.cos(a) * k, y: c.y + Math.sin(a) * k, kind: kind, leash: 0, hp: 4, conv: 0, hit: 0, bob: rnd() * 6 });
    }
    function targetOf(f) {
      if (f.kind === 'hunter') return S.player;
      if (f.kind === 'opp') {
        var c = T();
        var dp = Math.hypot(f.x - S.player.x, f.y - S.player.y), dt = Math.hypot(f.x - c.x, f.y - c.y) - 26;
        return dp < dt ? S.player : c;
      }
      return T();
    }
    function step(dt) {
      S.clock += dt;
      var c = T();
      /* the player strafes round the Tower; only movement is theirs, aim is not */
      S.player.a += dt * 0.5;
      S.player.x = c.x + Math.cos(S.player.a) * Math.min(W * 0.3, 260);
      S.player.y = c.y + Math.sin(S.player.a * 2) * Hh * 0.2;
      S.spawn -= dt;
      var cap = 18 + S.wave * 3;
      if (S.spawn <= 0 && S.foes.length < cap) { spawn(); S.spawn = 0.12 + rnd() * 0.16; }
      S.foes.forEach(function (f) {
        var t = targetOf(f);
        var dx = t.x - f.x, dy = t.y - f.y, d = Math.hypot(dx, dy) || 1;
        var reach = t === S.player ? 12 : 36;
        var sp = f.kind === 'hunter' ? 62 : f.kind === 'opp' ? 52 : 44;
        if (d > reach) { f.x += dx / d * sp * dt; f.y += dy / d * sp * dt; }
        else if (t === S.player) { S.php = Math.max(0.15, S.php - dt * 0.05); f.leash = 0; }
        else S.thp = Math.max(0.2, S.thp - dt * 0.02);
        /* separation, so they ring a target rather than stack on it */
        S.foes.forEach(function (o) {
          if (o === f) return;
          var ex = f.x - o.x, ey = f.y - o.y, e = Math.hypot(ex, ey);
          if (e > 0 && e < 16) { f.x += ex / e * (16 - e) * 0.5; f.y += ey / e * (16 - e) * 0.5; }
        });
        /* the leash: a Hunter that can't land a hit converts into a Seeker, for good */
        if (f.kind === 'hunter') {
          f.leash += dt;
          if (f.leash > 3.2) {
            f.kind = 'seeker'; f.conv = 1.4;
            if (S.clock - S.leashShown > 2.5) {
              S.leashShown = S.clock;
              flash.textContent = 'leash · 20 s without a hit → hunter becomes a seeker';
              flash.classList.add('on');
              setTimeout(function () { flash.classList.remove('on'); }, 1500);
            }
          }
        }
        if (f.conv > 0) f.conv -= dt;
        if (f.hit > 0) f.hit -= dt;
      });
      /* the bow aims itself: nearest goblin in range */
      S.shot -= dt;
      if (S.shot <= 0) {
        var best = null, bd = 190;
        S.foes.forEach(function (f) { var d = Math.hypot(f.x - S.player.x, f.y - S.player.y); if (d < bd) { bd = d; best = f; } });
        if (best) { S.arrows.push({ x: S.player.x, y: S.player.y, f: best, tower: 0 }); S.shot = 0.3; }
      }
      S.tshot -= dt;
      if (S.tshot <= 0) {
        var tb = null, td = 170;
        S.foes.forEach(function (f) { var d = Math.hypot(f.x - c.x, f.y - c.y); if (d < td) { td = d; tb = f; } });
        if (tb) { S.arrows.push({ x: c.x, y: c.y - 30, f: tb, tower: 1 }); S.tshot = 0.7; }
      }
      S.arrows.forEach(function (a) {
        var dx = a.f.x - a.x, dy = a.f.y - a.y, d = Math.hypot(dx, dy) || 1;
        var sp = 520 * dt;
        if (d < sp + 4) {
          a.dead = 1; a.f.hp -= 1; a.f.hit = 0.12;
          if (a.f.hp <= 0) { S.gems.push({ x: a.f.x, y: a.f.y, t: 0 }); S.puffs.push({ x: a.f.x, y: a.f.y, t: 0 }); }
        } else { a.x += dx / d * sp; a.y += dy / d * sp; }
      });
      S.arrows = S.arrows.filter(function (a) { return !a.dead && a.f.hp > 0; });
      S.foes = S.foes.filter(function (f) { return f.hp > 0; });
      S.puffs.forEach(function (p) { p.t += dt; });
      S.puffs = S.puffs.filter(function (p) { return p.t < 0.35; });
      S.gems.forEach(function (g) {
        g.t += dt;
        if (g.t < 0.5) return; /* crystals sit a moment, then fly to the player */
        var dx = S.player.x - g.x, dy = S.player.y - g.y, d = Math.hypot(dx, dy) || 1;
        var sp = Math.min(d, 380 * dt);
        g.x += dx / d * sp; g.y += dy / d * sp;
        if (d < 9) { g.dead = 1; S.xp += 0.05; }
      });
      S.gems = S.gems.filter(function (g) { return !g.dead; });
      if (S.xp >= 1) { S.xp = 0; S.paused = 2.2; S.wave = Math.min(8, S.wave + 1); }
      if (S.clock > 46) reset();
    }
    function glyph(kind, x, y, r) {
      ctx.beginPath();
      if (kind === 'seeker') { ctx.moveTo(x, y - r); ctx.lineTo(x + r, y + r * 0.8); ctx.lineTo(x - r, y + r * 0.8); ctx.closePath(); }
      else if (kind === 'hunter') { ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); }
      else ctx.rect(x - r * 0.8, y - r * 0.8, r * 1.6, r * 1.6);
    }
    function render(t) {
      var ink = tok(host, '--ink'), ink2 = tok(host, '--ink-2'), acc = tok(host, '--accent'), rule = tok(host, '--rule-2'), gr = tok(host, '--ground');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, Hh);
      var c = T();
      /* the island's paths, as hairlines */
      ctx.strokeStyle = rule; ctx.lineWidth = 1; ctx.setLineDash([]); ctx.globalAlpha = 0.5;
      [[-1, 0.18, 1, 0.86], [0.12, 1.05, 0.92, -0.05]].forEach(function (p) {
        for (var s = -1; s <= 1; s += 2) {
          ctx.beginPath();
          ctx.moveTo(p[0] * W, p[1] * Hh + s * 22);
          ctx.quadraticCurveTo(c.x, c.y + s * 22, p[2] * W, p[3] * Hh + s * 22);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
      /* attack-slot ring round the Tower */
      ctx.setLineDash([2, 4]); ctx.strokeStyle = ink2;
      ctx.beginPath(); ctx.arc(c.x, c.y, 36, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      /* the Tower, in line art */
      ctx.fillStyle = gr; ctx.strokeStyle = ink; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.rect(c.x - 12, c.y - 22, 24, 34); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c.x - 16, c.y - 22); ctx.lineTo(c.x - 16, c.y - 32); ctx.lineTo(c.x - 9, c.y - 32); ctx.lineTo(c.x - 9, c.y - 27);
      ctx.lineTo(c.x - 3, c.y - 27); ctx.lineTo(c.x - 3, c.y - 32); ctx.lineTo(c.x + 3, c.y - 32); ctx.lineTo(c.x + 3, c.y - 27);
      ctx.lineTo(c.x + 9, c.y - 27); ctx.lineTo(c.x + 9, c.y - 32); ctx.lineTo(c.x + 16, c.y - 32); ctx.lineTo(c.x + 16, c.y - 22); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(c.x, c.y + 12, 6, Math.PI, 0); ctx.stroke();
      /* goblins */
      S.foes.forEach(function (f) {
        var y = f.y + Math.sin(t / 120 + f.bob) * 1.2;
        glyph(f.kind, f.x, y, 9);
        ctx.fillStyle = f.hit > 0 ? gr : (f.conv > 0 ? acc : ink2);
        ctx.fill();
        ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.stroke();
        if (f.conv > 0) { ctx.strokeStyle = acc; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(f.x, y, 13 + (1.4 - f.conv) * 6, 0, Math.PI * 2); ctx.stroke(); }
      });
      /* puffs where a goblin falls */
      S.puffs.forEach(function (p) {
        ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.globalAlpha = 1 - p.t / 0.35;
        ctx.beginPath(); ctx.arc(p.x, p.y, 6 + p.t * 40, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      });
      /* XP crystals */
      ctx.fillStyle = acc; ctx.strokeStyle = ink; ctx.lineWidth = 0.8;
      S.gems.forEach(function (g) { glyph('hunter', g.x, g.y, 3.5); ctx.fill(); ctx.stroke(); });
      /* arrows */
      S.arrows.forEach(function (a) {
        var dx = a.f.x - a.x, dy = a.f.y - a.y, d = Math.hypot(dx, dy) || 1;
        ctx.strokeStyle = a.tower ? acc : ink; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(a.x - dx / d * 10, a.y - dy / d * 10); ctx.lineTo(a.x, a.y); ctx.stroke();
      });
      /* the player, with a bow arc facing the current target */
      var p = S.player;
      ctx.fillStyle = acc; ctx.strokeStyle = ink; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(p.x, p.y, 7.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.strokeStyle = rule; ctx.lineWidth = 1; ctx.stroke();
    }
    var hp = hud.querySelector('.hp'), tw = hud.querySelector('.tw'), wv = hud.querySelector('.horde__wave b'), xpi = xp.querySelector('i');
    loop(host, function (t, dt) {
      size();
      if (!W || !Hh) return;
      /* fixed sub-steps, so a slow frame costs smoothness rather than speed */
      var s = Math.min(0.25, Math.max(0, dt / 1000));
      while (s > 0) {
        var h = Math.min(s, 0.04);
        if (S.paused > 0) S.paused -= h;
        else if (!reduce) step(h);
        s -= h;
      }
      draft.classList.toggle('on', S.paused > 0);
      render(t);
      hp.style.width = (S.php * 100) + '%';
      tw.style.width = (S.thp * 100) + '%';
      wv.textContent = S.wave;
      xpi.style.width = (S.xp * 100) + '%';
    });
  };

  /* ═════════════ No Filter — a wire you can drag ═════════════ */
  C.rope = function (host) {
    host.innerHTML = '';
    var w = el('div', 'rope');
    var cards = [el('div', 'rope__card'), el('div', 'rope__card')];
    cards[0].innerHTML = '<span class="rope__fig">FIG.01</span><span class="rope__cap">the desk, most days</span>';
    cards[1].innerHTML = '<span class="rope__fig">FIG.02</span><span class="rope__cap">reading a closed system</span>';
    cards.forEach(function (c) { c.setAttribute('aria-hidden', 'true'); w.appendChild(c); });
    var svg = sv('svg', { class: 'rope__svg' });
    var poles = [sv('path', { class: 'pole' }), sv('path', { class: 'pole' })];
    poles.forEach(function (p) { svg.appendChild(p); });
    /* three wires, as in the real rig: upper to upper, lower to lower, and one crossing */
    var SPECS = [
      { a: 'up', b: 'up', slack: 1.05 },
      { a: 'lo', b: 'lo', slack: 1.09 },
      { a: 'up', b: 'lo', slack: 1.14 },
    ];
    var wires = SPECS.map(function (s, i) { var p = sv('path', { class: 'w' + i }); svg.appendChild(p); return p; });
    w.appendChild(svg);
    var read = el('div', 'rope__read');
    w.appendChild(read);
    var hint = el('div', 'rope__hint', 'drag a frame');
    w.appendChild(hint);
    host.appendChild(w);

    var N = 14, ITER = 12, G = 1400;
    var CW = 210, CH = 150, POLE_X = [0.74, 0.28], RISE = 46;
    var pos = [{ x: 0.06, y: 0.34 }, { x: 0.56, y: 0.46 }];
    var Wd = 0, Hd = 0;
    function poleX(i) { return pos[i].x * Wd + CW * POLE_X[i]; }
    function arm(i, which) {
      /* the arm end that faces the other frame */
      var x = poleX(i), top = pos[i].y * Hd - RISE;
      var dir = i === 0 ? 1 : -1;
      return which === 'up' ? { x: x + dir * 30, y: top + 12 } : { x: x + dir * 20, y: top + 30 };
    }
    var ropes = SPECS.map(function (s) {
      var pts = [];
      for (var j = 0; j < N; j++) pts.push({ x: 0, y: 0, px: 0, py: 0 });
      return { pts: pts, spec: s, init: false, rest: 0 };
    });
    function layout() {
      Wd = w.clientWidth; Hd = w.clientHeight;
      cards.forEach(function (c, i) { c.style.transform = 'translate(' + (pos[i].x * Wd) + 'px,' + (pos[i].y * Hd) + 'px)'; });
      [0, 1].forEach(function (i) {
        var x = poleX(i), bottom = pos[i].y * Hd + CH - 18, top = pos[i].y * Hd - RISE;
        poles[i].setAttribute('d',
          'M' + x + ' ' + bottom + ' V' + top +
          ' M' + (x - 30) + ' ' + (top + 12) + ' H' + (x + 30) + ' M' + (x - 30) + ' ' + (top + 12) + ' v4 M' + (x + 30) + ' ' + (top + 12) + ' v4' +
          ' M' + (x - 20) + ' ' + (top + 30) + ' H' + (x + 20) + ' M' + (x - 20) + ' ' + (top + 30) + ' v4 M' + (x + 20) + ' ' + (top + 30) + ' v4');
      });
    }
    function sim(dt) {
      ropes.forEach(function (r) {
        var A = arm(0, r.spec.a), B = arm(1, r.spec.b);
        var gap = Math.hypot(B.x - A.x, B.y - A.y);
        /* cut longer than the gap: the sag is gravity, not a tuned number */
        r.rest = gap * r.spec.slack / (N - 1);
        if (!r.init) {
          r.pts.forEach(function (p, j) {
            var k = j / (N - 1);
            p.x = p.px = A.x + (B.x - A.x) * k;
            p.y = p.py = A.y + (B.y - A.y) * k;
          });
          r.init = true;
        }
        for (var j = 1; j < N - 1; j++) {
          var p = r.pts[j];
          var vx = (p.x - p.px) * 0.99, vy = (p.y - p.py) * 0.99;
          p.px = p.x; p.py = p.y;
          p.x += vx; p.y += vy + G * dt * dt;
        }
        for (var it = 0; it < ITER; it++) {
          r.pts[0].x = A.x; r.pts[0].y = A.y;
          r.pts[N - 1].x = B.x; r.pts[N - 1].y = B.y;
          for (var k2 = 0; k2 < N - 1; k2++) {
            var P = r.pts[k2], Q = r.pts[k2 + 1];
            var dx = Q.x - P.x, dy = Q.y - P.y, d = Math.hypot(dx, dy) || 1;
            if (d <= r.rest) continue; /* a rope only resists stretching */
            var fa = k2 === 0 ? 0 : 1, fb = k2 + 1 === N - 1 ? 0 : 1, sum = fa + fb;
            if (!sum) continue;
            var m = (d - r.rest) / d;
            P.x += dx * m * fa / sum; P.y += dy * m * fa / sum;
            Q.x -= dx * m * fb / sum; Q.y -= dy * m * fb / sum;
          }
        }
      });
    }
    function draw() {
      ropes.forEach(function (r, ri) {
        var p = r.pts, d = 'M' + p[0].x.toFixed(1) + ' ' + p[0].y.toFixed(1);
        for (var j = 1; j < N - 1; j++) {
          var mx = (p[j].x + p[j + 1].x) / 2, my = (p[j].y + p[j + 1].y) / 2;
          d += ' Q' + p[j].x.toFixed(1) + ' ' + p[j].y.toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1);
        }
        d += ' L' + p[N - 1].x.toFixed(1) + ' ' + p[N - 1].y.toFixed(1);
        wires[ri].setAttribute('d', d);
      });
    }

    var drag = null, touched = false;
    cards.forEach(function (c, i) {
      c.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        touched = true; hint.classList.add('gone');
        var r = w.getBoundingClientRect();
        drag = { i: i, dx: e.clientX - r.left - pos[i].x * Wd, dy: e.clientY - r.top - pos[i].y * Hd };
        c.classList.add('grab');
        try { c.setPointerCapture(e.pointerId); } catch (er) {}
      });
      c.addEventListener('pointermove', function (e) {
        if (!drag || drag.i !== i) return;
        var r = w.getBoundingClientRect();
        pos[i].x = Math.max(0.01, Math.min(1 - (CW + 8) / Wd, (e.clientX - r.left - drag.dx) / Wd));
        pos[i].y = Math.max((RISE + 10) / Hd, Math.min(1 - (CH + 30) / Hd, (e.clientY - r.top - drag.dy) / Hd));
      });
      function up() { drag = null; c.classList.remove('grab'); }
      c.addEventListener('pointerup', up);
      c.addEventListener('pointercancel', up);
    });

    var t0 = null;
    loop(host, function (t, dt) {
      if (t0 === null) t0 = t;
      /* until someone grabs a frame, the second one is carried about, then let go, so the wire swings and settles */
      if (!touched && !reduce) {
        var e = ((t - t0) / 1000) % 7;
        if (e < 2.2) {
          var k = e / 2.2, ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          var phase = Math.floor(((t - t0) / 1000) / 7) % 2;
          var from = phase ? { x: 0.66, y: 0.24 } : { x: 0.56, y: 0.46 };
          var to = phase ? { x: 0.56, y: 0.46 } : { x: 0.66, y: 0.24 };
          pos[1].x = from.x + (to.x - from.x) * ease;
          pos[1].y = from.y + (to.y - from.y) * ease;
        }
      }
      layout();
      var s = Math.min(0.2, Math.max(1 / 240, dt / 1000));
      while (s > 0) { var h = Math.min(s, 1 / 60); sim(h); s -= h; }
      draw();
      var A = arm(0, 'up'), B = arm(1, 'up');
      read.innerHTML = 'points <b>' + N + '</b> · iterations <b>' + ITER + '</b> · gap <b>' + Math.round(Math.hypot(B.x - A.x, B.y - A.y)) +
        'px</b> · sag is <b>gravity</b>, not a tuned number';
    });
  };

  /* ═════════════ Picaku — scoped, then global ═════════════ */
  C.recall = function (host) {
    /* six meetings, each already chunked: summary, decisions, actions and raw transcript become separate vectors */
    var MEET = [
      ['Q3 roadmap', ['summary · onboarding ships this month', 'decision · billing redesign → Q4', 'action · mockups by Friday', 'raw · “resource constraints on billing”', 'raw · review meeting next Tuesday']],
      ['DB migration', ['summary · move to managed Postgres', 'decision · freeze schema changes', 'raw · “billing tables block cut-over”', 'action · dry run on staging', 'raw · rollback plan agreed']],
      ['Design crit', ['summary · onboarding flow, v3', 'raw · empty states need copy', 'decision · drop the carousel', 'action · redraw the icons', 'raw · contrast on dark']],
      ['Hiring loop', ['summary · two backend finalists', 'decision · offer to candidate B', 'raw · take-home runs too long', 'action · references by Thursday', 'raw · start date in November']],
      ['Vendor call', ['summary · payments renewal', 'raw · “billing API changes in Q4”', 'decision · renew for one year', 'action · ask for volume pricing', 'raw · webhook retries']],
      ['Weekly sync', ['summary · velocity steady', 'raw · on-call swap', 'action · update the roadmap doc', 'raw · demo-day prep', 'decision · skip next week']],
    ];
    var Q = [
      { q: 'what did we decide about billing?', scope: 0, where: 'WHERE user_id = :me AND note_id = :q3_roadmap',
        hits: [[0, 1, '0.84'], [0, 3, '0.79'], [0, 0, '0.61']],
        a: 'The billing redesign moved to Q4, because of resource constraints.', meta: 'scoped thread · 1 meeting searched · 5 never fetched' },
      { q: 'across everything — what keeps slipping?', scope: -1, where: 'WHERE user_id = :me',
        hits: [[0, 1, '0.81'], [1, 2, '0.77'], [4, 1, '0.74']],
        a: 'Billing. Deferred in the roadmap, blocking the migration, and changing again on the vendor side.', meta: 'overall chat · 6 meetings searched · top 3 kept' },
    ];
    host.innerHTML = '';
    var w = el('div', 'recall');
    var space = el('div', 'recall__space');
    var cards = MEET.map(function (m) {
      var c = el('div', 'recall__card');
      var h = el('div', 'recall__h');
      h.appendChild(el('b', '', m[0]));
      var tag = el('span', 'recall__tag', 'not fetched');
      h.appendChild(tag);
      c.appendChild(h);
      var rows = m[1].map(function (t) {
        var r = el('div', 'recall__row');
        r.appendChild(el('span', 'recall__tx', t));
        r.appendChild(el('span', 'recall__sc', ''));
        c.appendChild(r);
        return r;
      });
      space.appendChild(c);
      return { c: c, rows: rows };
    });
    w.appendChild(space);

    var chat = el('div', 'recall__chat');
    var ask = el('div', 'recall__ask');
    var sql = el('div', 'recall__sql');
    var step = el('div', 'recall__step');
    var ans = el('div', 'recall__ans');
    var meta = el('div', 'recall__meta');
    chat.appendChild(el('div', 'pres__lab', 'THREAD'));
    chat.appendChild(ask); chat.appendChild(sql); chat.appendChild(step); chat.appendChild(ans); chat.appendChild(meta);
    w.appendChild(chat);
    host.appendChild(w);

    var t0 = null, shown = -1;
    loop(host, function (t) {
      if (t0 === null) t0 = t;
      var e = (t - t0) % 14000;
      var qi = e < 7000 ? 0 : 1, le = e - qi * 7000, q = Q[qi];
      if (shown !== qi) {
        shown = qi;
        ask.innerHTML = '<span>›</span> ' + q.q;
        sql.textContent = q.where;
        ans.textContent = q.a;
        meta.textContent = q.meta;
      }
      ask.classList.toggle('on', le > 300);
      sql.classList.toggle('on', le > 1100);
      var filtered = le > 1500;
      cards.forEach(function (c, i) {
        var out = filtered && q.scope >= 0 && i !== q.scope;
        c.c.classList.toggle('out', out);
        c.rows.forEach(function (r) { r.classList.remove('hit', 'scan'); r.lastChild.textContent = ''; });
      });
      /* the vector search sweeps only what survived the filter */
      var scanning = le > 2000 && le < 3100;
      step.textContent = le < 1500 ? '' : le < 2000 ? '1 · filter by owner' + (q.scope >= 0 ? ' and note' : '') :
        le < 3100 ? '2 · nearest chunks · pgvector' : '3 · top 3 into the prompt, with the last 10 messages';
      step.classList.toggle('on', le > 1500);
      if (scanning) {
        var k = Math.floor((le - 2000) / 110);
        cards.forEach(function (c, i) {
          if (q.scope >= 0 && i !== q.scope) return;
          c.rows[k % 5].classList.add('scan');
        });
      }
      if (le > 3100) {
        q.hits.forEach(function (h) {
          var r = cards[h[0]].rows[h[1]];
          r.classList.add('hit');
          r.lastChild.textContent = h[2];
        });
      }
      ans.classList.toggle('on', le > 4000);
      meta.classList.toggle('on', le > 4400);
    });
  };
})();
