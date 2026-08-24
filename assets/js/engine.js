/* ==================================================================
   rein.dev — engine
   Vertical wheel delta remapped to horizontal travel, damped in rAF.
   Releases the wheel at both edges so the page is never a trap.
   ================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var stage = document.querySelector('.stage');
  var track = document.querySelector('.track');
  if (!stage || !track) return;

  var CH = window.__REIN__ || {};

  /* ---------------- theme ---------------- */
  var THEMES = ['paper', 'concrete', 'dark'];
  function currentTheme() {
    var s = root.getAttribute('data-theme');
    if (THEMES.indexOf(s) !== -1) return s;
    return 'concrete';   /* dark is opt-in; the OS does not choose */
  }
  function isDark() { return currentTheme() === 'dark'; }
  function paintAccent() {
    if (!CH.accent) return;
    root.style.setProperty('--accent', isDark() ? CH.accent.dark : CH.accent.light);
    root.style.setProperty('--on-accent', isDark() ? '#17110E' : '#F4F2F0');
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', getComputedStyle(root).getPropertyValue('--ground').trim());
  }
  try {
    var saved = localStorage.getItem('rein-theme');
    if (saved) root.setAttribute('data-theme', saved);
  } catch (e) {}
  paintAccent();

  var tbtn = document.querySelector('.rail__toggle');
  function labelTheme() {
    if (tbtn) tbtn.textContent = currentTheme();
  }
  labelTheme();
  if (tbtn) {
    tbtn.addEventListener('click', function () {
      var next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('rein-theme', next); } catch (e) {}
      paintAccent();
      labelTheme();
    });
  }

  /* ---------------- scroll engine ---------------- */
  var target = 0, cur = 0, max = 0;
  var DAMP = reduce ? 1 : 0.1;
  var touching = false;

  function measure() {
    max = Math.max(0, track.scrollWidth - stage.clientWidth);
    target = Math.min(target, max);
  }
  measure();
  window.addEventListener('resize', function () { measure(); initLinked(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  window.addEventListener('load', measure);

  stage.addEventListener('wheel', function (e) {
    if (locked) return;
    var dy = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if ((dy > 0 && target < max - 0.5) || (dy < 0 && target > 0.5)) {
      e.preventDefault();
      target = Math.max(0, Math.min(max, target + dy));
      overscroll = 0;
    } else if (dy > 0 && target >= max - 0.5) {
      e.preventDefault();
      bumpEnd(dy);
    }
  }, { passive: false });

  /* keyboard */
  window.addEventListener('keydown', function (e) {
    if (locked) return;
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    var step = stage.clientWidth * 0.82, handled = true;
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ':
        if (target >= max - 1) { nextChapter(); return; }
        target = Math.min(max, target + step); break;
      case 'ArrowLeft': case 'PageUp':
        target = Math.max(0, target - step); break;
      case 'Home': target = 0; break;
      case 'End': target = max; break;
      default: handled = false;
    }
    if (handled) e.preventDefault();
  });

  /* drag */
  var drag = false, sx = 0, st = 0, moved = 0;
  stage.addEventListener('pointerdown', function (e) {
    if (locked) return;
    if (e.target.closest('button,a,input,.custom__stage')) return;
    drag = true; sx = e.clientX; st = target; moved = 0;
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag) return;
    moved = Math.abs(e.clientX - sx);
    target = Math.max(0, Math.min(max, st - (e.clientX - sx)));
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
    stage.addEventListener(ev, function () { drag = false; });
  });

  /* touch — damping raised so dragging feels direct */
  stage.addEventListener('touchstart', function () { touching = true; DAMP = reduce ? 1 : 0.42; }, { passive: true });
  stage.addEventListener('touchend', function () {
    touching = false;
    setTimeout(function () { DAMP = reduce ? 1 : 0.1; }, 380);
  }, { passive: true });

  /* ---------------- end-of-track handoff ---------------- */
  var overscroll = 0, locked = false, lastBump = 0, armedAt = 0;
  /* Overscroll-to-advance is deliberately hard to trigger by accident:
     it needs sustained intent at the very end, and it is disarmed for a
     moment after load so momentum carried over from the previous page
     cannot chain straight through several chapters. */
  var OVERSCROLL_TRIGGER = 1100;
  var atEndSince = 0;
  function bumpEnd(dy) {
    var now = performance.now();
    if (now < armedAt) { overscroll = 0; return; }
    /* the track must have visually settled at the end, not merely been
       aimed there — otherwise a hard flick advances before you see it land */
    if (cur < max - 2) { overscroll = 0; atEndSince = 0; return; }
    if (!atEndSince) { atEndSince = now; return; }
    if (now - atEndSince < 320) return;
    if (now - lastBump > 220) overscroll = 0;   /* must be one continuous gesture */
    lastBump = now;
    overscroll += dy;
    if (overscroll > OVERSCROLL_TRIGGER) { overscroll = 0; nextChapter(); }
  }
  /* ---------------- between-chapter loader ---------------- */
  var transit = document.querySelector('.transit');
  function paintTransit(next) {
    if (!transit || !next) return;
    var acc = isDark() ? next.accent.dark : next.accent.light;
    transit.style.setProperty('--transit-accent', acc);
    transit.style.setProperty('--transit-on', isDark() ? '#17110E' : '#F4F2F0');
    var b = transit.querySelector('.transit__num b');
    var k = transit.querySelector('.transit__k');
    var t = transit.querySelector('.transit__t');
    if (b) b.textContent = next.n;
    if (k) k.textContent = 'Chapter ' + next.n;
    if (t) t.textContent = next.title;
  }

  function nextChapter() {
    if (locked || !CH.next) return;
    locked = true;
    stage.classList.add('leaving');
    track.style.transform = 'translate3d(' + (-(max + stage.clientWidth * 0.45)) + 'px,0,0)';
    var l = document.querySelector('.progress i'); if (l) l.style.width = '100%';

    if (transit && !reduce) {
      paintTransit(CH.next);
      requestAnimationFrame(function () {
        transit.classList.add('cover');
        /* one frame later so the ring starts from zero as the field arrives */
        requestAnimationFrame(function () { transit.classList.add('draw'); });
      });
      try { sessionStorage.setItem('rein-transit', CH.next.slug); } catch (e) {}
      setTimeout(function () { location.href = CH.next.href; }, 980);
    } else {
      try { sessionStorage.setItem('rein-transit', CH.next.slug); } catch (e) {}
      setTimeout(function () { location.href = CH.next.href; }, 260);
    }
  }

  /* arriving mid-transition: the overlay is already the right colour, so
     hold it for a beat and wipe it off rather than flashing the new page */
  function clearTransit(done) {
    /* The head script already stamped data-transit before first paint, so the
       overlay is sitting exactly where the previous page left it. Wipe it off
       — never animate it in again, or the loader is seen twice. */
    var held = root.hasAttribute('data-transit');
    try { sessionStorage.removeItem('rein-transit'); } catch (e) {}
    if (!transit || !held || reduce) {
      root.removeAttribute('data-transit');
      done();
      return;
    }
    paintTransit({ n: CH.n, title: CH.title, accent: CH.accent });
    /* The ring already drew on the outgoing page. Hold it finished — do not
       replay it — then wipe the field off. .done keeps that state once
       data-transit is released. */
    transit.classList.add('done');
    setTimeout(function () {
      root.removeAttribute('data-transit');   /* releases transition:none */
      transit.classList.add('leave');
      done();
      setTimeout(function () {
        transit.classList.remove('leave');
        transit.classList.remove('done');
      }, 820);
    }, 520);
  }
  var goBtns = document.querySelectorAll('[data-go-next]');
  for (var i = 0; i < goBtns.length; i++) {
    goBtns[i].addEventListener('click', function (e) { e.preventDefault(); nextChapter(); });
  }

  /* ---------------- rAF ---------------- */
  var bar = document.querySelector('.progress i');
  var hint = document.querySelector('.hint');
  var hintGone = false;

  /* ----------------------------------------------------------------
     Scroll-linked line art. These are not one-shot reveals: the stroke
     length is a pure function of how far the panel has crossed the
     viewport, so scrolling back un-draws them. Nothing has "already
     happened" by the time you arrive, and nothing is stuck once passed.
     ---------------------------------------------------------------- */
  var linked = [], linkedPanels = [];
  function panelGroup(el) {
    for (var i = 0; i < linkedPanels.length; i++) if (linkedPanels[i].el === el) return linkedPanels[i];
    var g = { el: el, p: 0 };
    linkedPanels.push(g);
    return g;
  }
  function initLinked() {
    linked = []; linkedPanels = [];
    var groups = [
      ['.diagram .d:not(.dash)', 0.12, 0.66, 0.055],  /* [sel, from, to, stagger] */
      ['.shot__ghost .g', 0.14, 0.62, 0],
      ['.tc__num .ring path', 0.10, 0.55, 0],
    ];
    groups.forEach(function (g) {
      var els = document.querySelectorAll(g[0]);
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        var panel = el.closest('.panel');
        if (!panel) continue;
        var svg = el.ownerSVGElement;
        var scale = 1;
        if (svg && svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width) {
          var r = svg.getBoundingClientRect();
          if (r.width) scale = r.width / svg.viewBox.baseVal.width;
        }
        var len = 0;
        try {
          len = el.tagName === 'rect'
            ? (function (b) { return (b.width + b.height) * 2; })(el.getBBox())
            : el.getTotalLength();
        } catch (e) { len = 0; }
        if (!len) len = 400;
        len = Math.ceil(len * scale * 1.3) + 12;
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = reduce ? 0 : len;
        var grp = panelGroup(panel);
        linked.push({
          el: el, group: grp, len: len, last: -1,
          from: g[1], to: g[2], delay: Math.min(i, 22) * g[3],
        });
      }
    });
  }
  /* Anything already on screen at load has nothing to scroll into, so a purely
     position-driven value would start fully drawn. Ramp the whole system up
     once on arrival; off-screen elements sit at 0 regardless, so this is only
     visible where it should be. */
  var introFrom = 0;
  function driveLinked() {
    if (reduce) return;
    if (!introFrom) introFrom = performance.now();
    var ramp = Math.min(1, (performance.now() - introFrom) / 1500);
    ramp = 1 - Math.pow(1 - ramp, 3);        /* ease out */
    var vw = stage.clientWidth;
    /* a diagram is ~30 paths in one panel — read each panel's rect once */
    for (var g = 0; g < linkedPanels.length; g++) {
      var lp = linkedPanels[g];
      var pr = lp.el.getBoundingClientRect();
      lp.p = (vw - pr.left) / (vw + pr.width);
    }
    for (var i = 0; i < linked.length; i++) {
      var o = linked[i];
      /* 0 when the panel's left edge is at the right of the stage,
         1 when its right edge has left on the other side */
      var p = o.group.p;
      var a = o.from + o.delay, b = o.to + o.delay;
      var k = (p - a) / (b - a);
      k = k < 0 ? 0 : k > 1 ? 1 : k;
      var off = Math.round(o.len * (1 - k * ramp));
      if (off !== o.last) { o.el.style.strokeDashoffset = off; o.last = off; }
    }
  }

  /* the frieze draws itself in step with how far you have travelled */
  var friezePaths = [];
  function initFrieze() {
    var svg = document.querySelector('.frieze');
    if (!svg) return;
    var vb = svg.viewBox && svg.viewBox.baseVal;
    var r = svg.getBoundingClientRect();
    var scale = vb && vb.width && r.width ? r.width / vb.width : 1;
    friezePaths = [].slice.call(svg.querySelectorAll('path')).map(function (el) {
      var len = 0;
      try { len = el.getTotalLength(); } catch (e) { len = 0; }
      len = Math.ceil((len || 1000) * scale * 1.06) + 8;
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = reduce ? 0 : len;
      return { el: el, len: len, last: -1 };
    });
  }

  function frame() {
    cur += (target - cur) * DAMP;
    if (Math.abs(target - cur) < 0.06) cur = target;
    if (!locked) track.style.transform = 'translate3d(' + (-cur).toFixed(2) + 'px,0,0)';
    var p = max ? cur / max : 0;
    if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
    if (!hintGone && cur > 120 && hint) { hint.classList.add('gone'); hintGone = true; }
    if (!reduce) {
      /* run slightly ahead of the viewport so the line is already drawn
         by the time that stretch of it is on screen. Only write when the
         value actually moved — repainting a track-wide SVG every frame for
         a sub-pixel change is the one thing here that costs real time. */
      var f = Math.max(0, Math.min(1, p * 1.12 + 0.06));
      for (var i = 0; i < friezePaths.length; i++) {
        var fp = friezePaths[i];
        var off = Math.round(fp.len * (1 - f));
        if (off !== fp.last) { fp.el.style.strokeDashoffset = off; fp.last = off; }
      }
    }
    parallax(cur);
    driveLinked();
    requestAnimationFrame(frame);
  }

  /* ---------------- parallax inside masks ---------------- */
  var pxEls = [];
  function collectParallax() {
    pxEls = [].slice.call(document.querySelectorAll('[data-px]')).map(function (el) {
      return { el: el, rate: parseFloat(el.getAttribute('data-px')) || 0.1, home: el.parentElement };
    });
  }
  collectParallax();
  function parallax(x) {
    for (var i = 0; i < pxEls.length; i++) {
      var o = pxEls[i];
      var r = o.home.getBoundingClientRect();
      var mid = r.left + r.width / 2;
      var off = (mid - stage.clientWidth / 2) * o.rate;
      o.el.style.transform = 'translate3d(' + (-off * 0.35).toFixed(1) + 'px,0,0)';
    }
  }

  /* ---------------- reveals + diagram draw-on ---------------- */
  var revealed = new WeakSet();
  function initReveals() {
    var items = document.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window) || reduce) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('in');
      document.querySelectorAll('.diagram').forEach(function (d) { d.classList.add('drawn'); });
      document.querySelectorAll('[data-custom]').forEach(bootCustom);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
        var d = en.target.querySelector('.diagram');
        if (d) drawDiagram(d);
        var c = en.target.querySelector('[data-custom]');
        if (c && !revealed.has(c)) { revealed.add(c); bootCustom(c); }
      });
    }, { root: stage, rootMargin: '0px -14% 0px -14%', threshold: 0.01 });
    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }

  function drawDiagram(svg) {
    /* the strokes are driven by driveLinked(); this only brings the labels up */
    if (svg.classList.contains('drawn')) return;
    requestAnimationFrame(function () { svg.classList.add('drawn'); });
  }

  function bootCustom(el) {
    var id = el.getAttribute('data-custom');
    if (window.REIN_CUSTOM && window.REIN_CUSTOM[id]) {
      try { window.REIN_CUSTOM[id](el, { progress: progressOf }); } catch (e) { /* never break the page */ }
    }
  }
  /* 0..1 of how far a panel has travelled through the viewport */
  function progressOf(el) {
    var r = el.getBoundingClientRect();
    var vw = stage.clientWidth;
    return Math.max(0, Math.min(1, (vw - r.left) / (vw + r.width)));
  }
  window.__reinProgress = progressOf;

  /* ---------------- constraint flip ---------------- */
  document.querySelectorAll('.cons__flip').forEach(function (b) {
    b.addEventListener('click', function () {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });

  /* ---------------- slider ---------------- */
  document.querySelectorAll('.slider').forEach(function (s) {
    var imgs = s.querySelectorAll('.slider__box img');
    var tabs = s.querySelectorAll('.slider__tabs button');
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x, j) { x.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
        imgs.forEach(function (im, j) { im.classList.toggle('off', i !== j); });
      });
    });
  });

  /* ---------------- loader ---------------- */
  function runLoader() {
    var loader = document.querySelector('.loader');
    if (!loader) { clearTransit(start); return; }
    var seen = false;
    try { seen = sessionStorage.getItem('rein-seen') === '1'; } catch (e) {}

    if (seen || reduce) {
      loader.style.transition = 'opacity .4s';
      loader.style.opacity = '0';
      setTimeout(function () { loader.remove(); }, 420);
      clearTransit(start);
      return;
    }

    /* fill the D with cycling project frames */
    var media = loader.querySelector('.dwin__media');
    var frames = (CH.loaderFrames || []).slice(0, 8);
    var NS = 'http://www.w3.org/2000/svg';
    var imgs = frames.map(function (src) {
      var im = document.createElementNS(NS, 'image');
      im.setAttribute('href', src);
      im.setAttribute('x', '0'); im.setAttribute('y', '0');
      im.setAttribute('width', '124'); im.setAttribute('height', '130');
      im.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      media.appendChild(im);
      var pre = new Image(); pre.src = src;   /* warm the cache */
      return im;
    });

    requestAnimationFrame(function () { loader.classList.add('lit'); });

    var idx = 0, cycler = null;
    if (imgs.length) {
      imgs[0].classList.add('on');
      cycler = setInterval(function () {
        idx++;
        imgs.forEach(function (im, i) { im.classList.toggle('on', i === idx % imgs.length); });
      }, 620);
    }

    /* progress counter + chapter ticks */
    var countEl = loader.querySelector('.loader__count b');
    var ticks = [].slice.call(loader.querySelectorAll('.loader__tick'));
    var t0 = performance.now(), DUR = 5200, raf = null;
    (function tick() {
      var p = Math.min(1, (performance.now() - t0) / DUR);
      if (countEl) countEl.textContent = String(Math.round(p * 100)).padStart(2, '0');
      var k = Math.floor(p * ticks.length);
      ticks.forEach(function (el, i) { el.classList.toggle('done', i < k); });
      if (p < 1) raf = requestAnimationFrame(tick);
    })();

    var done = false;
    function finish() {
      if (done) return;
      done = true;
      if (cycler) clearInterval(cycler);
      if (raf) cancelAnimationFrame(raf);
      if (countEl) countEl.textContent = '100';
      ticks.forEach(function (el) { el.classList.add('done'); });
      try { sessionStorage.setItem('rein-seen', '1'); } catch (e) {}
      loader.classList.add('out');
      setTimeout(function () { loader.remove(); }, 1050);
      start();
    }
    var t = setTimeout(finish, 5400);
    loader.addEventListener('click', function () { clearTimeout(t); finish(); });
    var skip = loader.querySelector('.loader__skip');
    if (skip) skip.addEventListener('click', function (e) { e.stopPropagation(); clearTimeout(t); finish(); });
    window.addEventListener('keydown', function k() { clearTimeout(t); finish(); window.removeEventListener('keydown', k); });
    window.addEventListener('wheel', function w() { clearTimeout(t); finish(); window.removeEventListener('wheel', w); }, { passive: true });
  }

  var started = false;
  function start() {
    if (started) return;
    started = true;
    armedAt = performance.now() + 1200;   /* disarm the handoff briefly on arrival */
    measure();
    collectParallax();
    initFrieze();
    initLinked();
    initReveals();
    /* entering transition */
    if (!reduce) {
      track.style.transform = 'translate3d(' + (stage.clientWidth * 0.38) + 'px,0,0)';
      stage.classList.add('entering');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          track.style.transform = 'translate3d(0,0,0)';
          setTimeout(function () { stage.classList.remove('entering'); frame(); }, 1000);
        });
      });
    } else {
      frame();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runLoader);
  else runLoader();
})();
