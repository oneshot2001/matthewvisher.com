/* Home page motion (DESIGN.md › Home motion). Loaded on / only, after motion.js.
   1. Hero reel: the "Into the Lens" clip is the page background while the hero, proof strip and thesis scroll over it;
      scroll scrubs it from the stare to the look-up.
   2. Thesis line inks in word by word with scroll.
   3. Flagship chapter: scroll position picks the step; the dial flips the readout to its failed state.
   4. Specimen lines type in on first view.
   5. Halftone field (closing band): dot size carries tone, rings travel out from the focal point, dots swell under the pointer.
   Nothing is hidden without JS. Reduced motion (also when switched on mid-visit): the reel shows the stare still,
   one still field frame, everything at its end state. */
(function () {
  var motion = matchMedia('(prefers-reduced-motion: reduce)'), calm = motion.matches, onCalm = [];
  motion.addEventListener('change', function () { calm = motion.matches; onCalm.forEach(function (f) { f(); }); });
  var LEMON = getComputedStyle(document.documentElement).getPropertyValue('--lemon').trim();

  function field(canvas, o) {
    var host = canvas.parentElement, ctx = canvas.getContext('2d');
    var W = 0, H = 0, R = 1, dots = [], ptr = null, running = false, raf = 0, t0 = performance.now();

    function build() {
      var hb = host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      W = hb.width; H = hb.height; R = Math.max(W, H);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var fx = W * o.focal[0], fy = H * o.focal[1];
      var s = W < 640 ? 11 : 13, a = 32 * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), n = Math.ceil((W + H) / s);
      dots = [];
      for (var i = -n; i <= n; i++) for (var j = -n; j <= n; j++) {
        var x = W / 2 + (i * ca - j * sa) * s, y = H / 2 + (i * sa + j * ca) * s;
        if (x < -s || y < -s || x > W + s || y > H + s) continue;
        var d = Math.hypot(x - fx, y - fy);
        dots.push({ x: x, y: y, d: d, halo: Math.exp(-d / (0.42 * R)), reach: Math.exp(-d / (0.95 * R)) });
      }
    }
    function frame(now) {
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = LEMON; ctx.globalAlpha = o.alpha; ctx.beginPath();
      for (var i = 0; i < dots.length; i++) {
        var p = dots[i];
        var crest = Math.pow(0.5 + 0.5 * Math.sin(p.d * 0.0105 - t * 0.85), 6);
        var drift = 0.5 + 0.5 * Math.sin(p.x * 0.004 + t * 0.23) * Math.cos(p.y * 0.005 - t * 0.17);
        var r = o.rMin + o.rMax * (0.34 * p.halo + 0.5 * crest * p.reach + 0.16 * drift * p.reach);
        if (ptr && !calm) { var c = 1 - Math.hypot(p.x - ptr.x, p.y - ptr.y) / 150; if (c > 0) r += 2.6 * c * c; }
        if (r < 0.3) continue;
        ctx.moveTo(p.x + r, p.y); ctx.arc(p.x, p.y, r, 0, 6.2832);
      }
      ctx.fill();
      ctx.globalAlpha = 1;
      if (running) raf = requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    function still() { t0 = performance.now() - 2000; frame(performance.now()); }

    var rz; new ResizeObserver(function () {   // host height follows its content (font swap, rotation), not just the window
      clearTimeout(rz); rz = setTimeout(function () { build(); if (calm) still(); }, 120);
    }).observe(host);
    var seen = false, sync = function () { if (calm) { stop(); still(); } else if (seen && !document.hidden) start(); else stop(); };
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; sync(); }).observe(host);
    document.addEventListener('visibilitychange', sync);
    onCalm.push(sync);
    host.addEventListener('pointermove', function (e) { var hb = host.getBoundingClientRect(); ptr = { x: e.clientX - hb.left, y: e.clientY - hb.top }; });
    host.addEventListener('pointerleave', function () { ptr = null; });
  }

  var close = document.querySelector('.hm-close .hm-field');
  if (close) field(close, { focal: [0.5, 1.15], alpha: 0.5, rMin: 0.3, rMax: 2.6 });

  // Hero reel — the stage pins for the whole reel while the copy scrolls over it; scroll scrubs the clip.
  var reel = document.querySelector('.hm-reel');
  if (reel) {
    var stage = reel.querySelector('.hm-reel__bg'), vid = stage.querySelector('video'), still = stage.querySelector('img');
    var glow = stage.querySelector('canvas').getContext('2d');
    var FPS = 24, KNOTS = [[0, 0], [0.28, 24], [0.31, 29], [0.52, 64], [0.85, 136], [1, 154]];   // scroll → frame; the 4-frame whip passes in 3%
    var shown = 0, live = false, onScreen = false, broken = false, loop = 0, clip = '', fetching = false;
    var frameAt = function (p) {
      for (var i = 1; i < KNOTS.length - 1 && p > KNOTS[i][0]; i++);
      var a = KNOTS[i - 1], b = KNOTS[i];
      return a[1] + (b[1] - a[1]) * Math.min(1, Math.max(0, (p - a[0]) / (b[0] - a[0])));
    };
    // Wide screens: the blurred fill beside the clip is the current frame, squeezed into a tiny canvas
    var paint = function (src) { glow.drawImage(src, 0, 0, glow.canvas.width, glow.canvas.height); };
    var paintLoaded = function (im) {   // a broken still leaves the glow blank (drawImage would throw)
      if (!im.complete) im.addEventListener('load', function () { paint(im); }, { once: true }); else if (im.naturalWidth) paint(im);
    };
    var tick = function () {
      loop = 0;
      if (!live) return;   // a frame queued before reduced motion switched on
      var r = reel.getBoundingClientRect(), span = r.height - stage.offsetHeight;
      var target = frameAt(span > 0 ? Math.min(1, Math.max(0, -(r.top - 52) / span)) : 0);
      shown += (target - shown) * 0.2;
      if (Math.abs(target - shown) < 0.05) shown = target;
      var t = Math.min((Math.round(shown) + 0.5) / FPS, vid.duration - 0.01);
      var behind = vid.readyState >= 1 && Math.abs(vid.currentTime - t) > 0.5 / FPS;
      if (behind && !vid.seeking) vid.currentTime = t;
      if (shown !== target || behind) loop = requestAnimationFrame(tick);   // until the frame on screen is the target
    };
    var kick = function () { if (live && onScreen && !loop) loop = requestAnimationFrame(tick); };
    var fail = function () { broken = true; vid.hidden = true; sync(); };   // the stare still stands in
    var load = function () {   // the whole clip as a Blob, so seeking works even where the host ignores byte ranges (pages.dev)
      if (calm || broken || clip || fetching) return;
      fetching = true;
      fetch('/assets/video/into-the-lens-1080.mp4')
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); })
        .then(function (b) {
          fetching = false;
          if (calm || broken) return;   // reduced motion switched on mid-download
          clip = URL.createObjectURL(b); vid.preload = 'auto'; vid.src = clip;
        }, function () { fetching = false; fail(); });
    };
    var sync = function () {
      live = !calm && !broken;
      if (!live && clip) { vid.removeAttribute('src'); vid.load(); URL.revokeObjectURL(clip); clip = ''; }   // motion back on reloads it
      if (!live || vid.readyState < 2) paintLoaded(still);
      if (document.readyState === 'complete') load();
      kick();
    };
    vid.addEventListener('loadeddata', function () {   // iOS paints seeked frames only once a muted video has played
      var p = vid.play();
      if (p) p.then(function () { vid.pause(); kick(); }, kick); else kick();
    });
    vid.addEventListener('seeked', function () { paint(vid); kick(); });
    vid.addEventListener('error', function () { if (clip) fail(); });   // ignore the empty-src reset in sync()
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; kick(); }).observe(reel);
    addEventListener('scroll', kick, { passive: true }); addEventListener('resize', kick);
    addEventListener('load', load); onCalm.push(sync); sync();
  }

  // Thesis — words ink in with scroll
  var thesis = document.querySelector('.hm-thesis'), line = thesis && thesis.querySelector('p');
  if (line) {
    var dot = line.querySelector('i'), words = line.firstChild.textContent.trim().split(/\s+/);
    line.removeChild(line.firstChild);
    var spans = words.map(function (w, i) {
      var s = document.createElement('span'); s.textContent = w; s.className = 'w';
      line.insertBefore(s, dot); if (i < words.length - 1) line.insertBefore(document.createTextNode(' '), dot);
      return s;
    });
    thesis.classList.add('live');
    var ink = function () {
      var q = calm ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.9 - line.getBoundingClientRect().top) / (innerHeight * 0.3)));
      spans.forEach(function (s, i) { s.style.opacity = 0.13 + 0.87 * Math.min(1, Math.max(0, q * (spans.length + 1) - i)); });
      dot.classList.toggle('on', q >= 1);
    };
    addEventListener('scroll', ink, { passive: true }); addEventListener('resize', ink); onCalm.push(ink); ink();
  }

  // Flagship chapter — pinned ≥900; scroll picks the step
  var ch = document.querySelector('.hm-chapter');
  if (ch) {
    var wide = matchMedia('(min-width: 900px) and (min-height: 780px)');
    var step = function () {
      if (!wide.matches || calm) { ch.classList.remove('pinned'); ch.dataset.step = 3; return; }
      ch.classList.add('pinned');
      var r = ch.getBoundingClientRect(), p = Math.min(1, Math.max(0, -(r.top - 52) / (r.height - innerHeight)));
      ch.dataset.step = p < 0.3 ? 1 : p < 0.62 ? 2 : 3;
    };
    addEventListener('scroll', step, { passive: true }); addEventListener('resize', step); onCalm.push(step); step();
    wide.addEventListener('change', step);
    ch.querySelector('.hm-rig__foot').hidden = false;
    var dial = document.getElementById('hm-dial'), status = document.getElementById('hm-status');
    dial.addEventListener('click', function () {
      var bad = ch.classList.toggle('tampered');
      dial.textContent = bad ? 'Restore the file' : 'Flip one byte';
      status.textContent = bad ? 'Verification failed. Chain broken at segment 2.' : 'Verified. Chain intact.';
    });
  }

  // Specimens — lines type in on first view
  var specs = document.querySelectorAll('.hm-spec');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  [].forEach.call(specs, function (pre) {
    pre.innerHTML = pre.innerHTML.split('\n').map(function (l, n) {
      return '<span class="ln" style="--n:' + n + '">' + (l || ' ') + '</span>';
    }).join('');
    pre.classList.add('typed'); io.observe(pre);
  });
})();
