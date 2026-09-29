/* Home page motion (DESIGN.md › Home motion). Loaded on / only, after motion.js.
   1. Halftone field: dot size carries tone, rings travel out from behind the portrait, dots swell under
      the pointer, and a patch periodically coheres into a bracketed read. The figure mask keeps dots off the portrait.
   2. Thesis line inks in word by word with scroll.
   3. Flagship chapter: scroll position picks the step; the dial flips the readout to its failed state.
   4. Specimen lines type in on first view.
   Nothing is hidden without JS. Reduced motion (also when switched on mid-visit): one still field frame, no brackets,
   everything at its end state. If the figure mask fails to load the hero field does not run. */
(function () {
  var motion = matchMedia('(prefers-reduced-motion: reduce)'), calm = motion.matches, onCalm = [];
  motion.addEventListener('change', function () { calm = motion.matches; onCalm.forEach(function (f) { f(); }); });
  var css = getComputedStyle(document.documentElement);
  var token = function (n) { return css.getPropertyValue(n).trim(); };
  var LEMON = token('--lemon'), INK = token('--ink'), ON_DARK = token('--on-dark');
  var MONO = '500 10.5px ' + token('--font-mono');
  var LABELS = ['SIG OK  …9f2a', 'CHAIN OK  3/3', 'FRAME 00:12:41.033', 'SIGNER AXIS-Q6358', 'VERIFIED'];

  function field(canvas, o) {
    var host = canvas.parentElement, ctx = canvas.getContext('2d');
    var W = 0, H = 0, R = 1, dots = [], rect = null, maskData = null, mw = 0, mh = 0;
    var ptr = null, running = false, raf = 0, t0 = performance.now(), box = null, nextBox = 5.5;

    function imageRect() {
      var hb = host.getBoundingClientRect();
      if (!o.img) return { x: 0, y: 0, w: hb.width, h: hb.height };
      var b = o.img.getBoundingClientRect(), x = b.left - hb.left, y = b.top - hb.top;
      if (getComputedStyle(o.img).objectFit !== 'cover') return { x: x, y: y, w: b.width, h: b.height };
      var iw = o.img.naturalWidth, ih = o.img.naturalHeight;
      var s = Math.max(b.width / iw, b.height / ih), dw = iw * s, dh = ih * s;
      return { x: x + (b.width - dw), y: y + (b.height - dh) / 2, w: dw, h: dh };   // object-position: right center
    }
    function inFigure(x, y) {
      if (!maskData) return false;
      var u = (x - rect.x) / rect.w, v = (y - rect.y) / rect.h;
      if (u < 0 || v < 0 || u >= 1 || v >= 1) return false;
      return maskData[(Math.floor(v * mh) * mw + Math.floor(u * mw)) * 4] > 90;
    }
    function build() {
      var hb = host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      W = hb.width; H = hb.height; R = Math.max(W, H);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rect = imageRect();
      var fx = rect.x + rect.w * o.focal[0], fy = rect.y + rect.h * o.focal[1];
      var s = W < 640 ? 11 : 13, a = 32 * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), n = Math.ceil((W + H) / s);
      dots = [];
      for (var i = -n; i <= n; i++) for (var j = -n; j <= n; j++) {
        var x = W / 2 + (i * ca - j * sa) * s, y = H / 2 + (i * sa + j * ca) * s;
        if (x < -s || y < -s || x > W + s || y > H + s || inFigure(x, y)) continue;
        var d = Math.hypot(x - fx, y - fy);
        dots.push({ x: x, y: y, d: d, halo: Math.exp(-d / (0.42 * R)), reach: Math.exp(-d / (0.95 * R)) });
      }
    }
    function freeSpot() {
      var hb = host.getBoundingClientRect();
      var blocks = [].map.call(host.querySelectorAll('h1, h2, p, a'), function (el) {
        var b = el.getBoundingClientRect();
        return { l: b.left - hb.left - 16, t: b.top - hb.top - 16, r: b.right - hb.left + 16, b: b.bottom - hb.top + 16 };
      });
      for (var k = 0; k < 40; k++) {
        var u = Math.random(), w = Math.min(W * 0.4, 84 + u * u * 150), h = w * 0.62;
        var x = 20 + Math.random() * (W - Math.max(w, 170) - 40), y = 20 + Math.random() * (H - h - 60);
        if (blocks.some(function (b) { return x < b.r && x + w > b.l && y < b.b && y + h + 22 > b.t; })) continue;
        var pts = [[x, y], [x + w, y], [x, y + h], [x + w, y + h], [x + w / 2, y + h / 2], [x + w / 2, y], [x + w, y + h / 2], [x + 160, y + h + 16], [x + 80, y + h + 16]];
        if (pts.some(function (p) { return inFigure(p[0], p[1]); })) continue;
        return { x: x, y: y, w: w, h: h, born: 0, label: LABELS[Math.floor(Math.random() * LABELS.length)] };
      }
      return null;
    }
    function ease(v) { v = Math.min(1, Math.max(0, v)); return 1 - Math.pow(1 - v, 3); }

    function frame(now) {
      var t = (now - t0) / 1000, k = 0, age = 0;
      ctx.clearRect(0, 0, W, H);
      // bracket life: cohere .6 · corners .4 · label .5 · hold · dissolve .7
      if (o.brackets && !calm) {
        if (!box && t > nextBox) { box = freeSpot(); if (box) box.born = t; else nextBox = t + 1; }
        if (box) {
          age = t - box.born;
          k = age < 3.7 ? ease(age / 0.6) : 1 - ease((age - 3.7) / 0.7);
          if (age > 4.4) { box = null; nextBox = t + 3 + Math.random() * 3; k = 0; }
        }
      }
      ctx.fillStyle = LEMON; ctx.globalAlpha = o.alpha; ctx.beginPath();
      for (var i = 0; i < dots.length; i++) {
        var p = dots[i];
        var crest = Math.pow(0.5 + 0.5 * Math.sin(p.d * 0.0105 - t * 0.85), 6);
        var drift = 0.5 + 0.5 * Math.sin(p.x * 0.004 + t * 0.23) * Math.cos(p.y * 0.005 - t * 0.17);
        var r = o.rMin + o.rMax * (0.34 * p.halo + 0.5 * crest * p.reach + 0.16 * drift * p.reach);
        if (ptr && !calm) { var c = 1 - Math.hypot(p.x - ptr.x, p.y - ptr.y) / 150; if (c > 0) r += 2.6 * c * c; }
        if (box && k > 0 && p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h) r += (2.7 - r) * k;
        if (r < 0.3) continue;
        ctx.moveTo(p.x + r, p.y); ctx.arc(p.x, p.y, r, 0, 6.2832);
      }
      ctx.fill();
      if (box && k > 0) {
        var fade = age < 3.7 ? 1 : k, L = 14 * ease((age - 0.5) / 0.4), b = box;
        ctx.globalAlpha = 0.10 * k; ctx.fillRect(b.x, b.y, b.w, b.h);
        if (L > 0) {
          ctx.globalAlpha = 0.9 * fade; ctx.strokeStyle = o.ink; ctx.lineWidth = 1.5; ctx.beginPath();
          [[b.x, b.y, 1, 1], [b.x + b.w, b.y, -1, 1], [b.x, b.y + b.h, 1, -1], [b.x + b.w, b.y + b.h, -1, -1]].forEach(function (q) {
            ctx.moveTo(q[0] + L * q[2], q[1]); ctx.lineTo(q[0], q[1]); ctx.lineTo(q[0], q[1] + L * q[3]);
          });
          ctx.stroke();
          var chars = Math.floor(ease((age - 0.9) / 0.5) * b.label.length);
          if (chars > 0) {
            ctx.font = MONO; ctx.textBaseline = 'top';
            ctx.beginPath(); ctx.arc(b.x + 4, b.y + b.h + 13, 3.5, 0, 6.2832); ctx.fill();
            ctx.lineWidth = 1; ctx.stroke();
            ctx.fillStyle = o.ink; ctx.fillText(b.label.slice(0, chars), b.x + 13, b.y + b.h + 8);
          }
        }
      }
      ctx.globalAlpha = 1;
      if (running) raf = requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    function still() { t0 = performance.now() - 2000; box = null; nextBox = 5.5; frame(performance.now()); }

    function ready() {
      if (o.mask && !maskData) return;   // never draw over the portrait
      if (o.img && !o.img.naturalWidth) return;
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
    var waits = [];
    if (o.img && !o.img.complete) waits.push(new Promise(function (ok) { o.img.addEventListener('load', ok); o.img.addEventListener('error', ok); }));
    if (o.mask) waits.push(new Promise(function (ok) {
      var m = new Image();
      m.onload = function () {
        var c = document.createElement('canvas'); mw = c.width = m.width; mh = c.height = m.height;
        try { var x = c.getContext('2d'); x.drawImage(m, 0, 0); maskData = x.getImageData(0, 0, mw, mh).data; } catch (e) {}
        ok();
      };
      m.onerror = ok; m.src = o.mask;
    }));
    Promise.all(waits).then(ready);
  }

  var hero = document.querySelector('.hm-hero .hm-field');
  if (hero) field(hero, { img: document.querySelector('.hm-hero__art img'), mask: '/assets/img/figure-mask.png', focal: [0.78, 0.34], alpha: 0.9, rMin: 0.35, rMax: 3.1, brackets: true, ink: INK });
  var close = document.querySelector('.hm-close .hm-field');
  if (close) field(close, { focal: [0.5, 1.15], alpha: 0.5, rMin: 0.3, rMax: 2.6, brackets: false, ink: ON_DARK });

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
      var q = calm ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.88 - line.getBoundingClientRect().top) / (innerHeight * 0.5)));
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
