/* About head (DESIGN.md › About): the "Standing Post" clip loops behind the head band while it's on screen.
   Fetched whole as a Blob after window load, like the home reel: *.pages.dev ignores byte ranges and Safari won't play a
   ranged-less src. Reduced motion (also when switched on mid-visit), no JS, or a fetch/decode error: the still under it
   stands in and no clip loads. Frame 0 is the still, so a refused autoplay (Low Power Mode) looks the same.
   The pause button (WCAG 2.2.2: the loop runs past 5 s beside the copy) shows only while a clip is loaded; a pause holds
   until the visitor presses play again. */
(function () {
  var vid = document.querySelector('.pg-about-reel video'), btn = document.querySelector('.pg-about-reel button');
  if (!vid) return;
  var motion = matchMedia('(prefers-reduced-motion: reduce)'), clip = '', fetching = false, onScreen = true, held = false;
  var label = function () { btn.textContent = held ? 'Play clip' : 'Pause clip'; };
  var play = function () {
    if (!clip || !onScreen || held) return;
    var p = vid.play();
    if (p) p.catch(function (e) { if (e.name === 'NotAllowedError') { held = true; label(); } });   // autoplay refused: one tap plays
  };
  var fail = function () { vid.hidden = true; btn.hidden = true; };
  var load = function () {
    if (motion.matches || clip || fetching) return;
    fetching = true;
    fetch('/assets/video/standing-post-1080.mp4')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(function (b) {
        fetching = false;
        if (motion.matches) return;   // reduced motion switched on mid-download
        clip = URL.createObjectURL(b); vid.src = clip; vid.hidden = false; btn.hidden = false; play();
      }, function () { fetching = false; fail(); });
  };
  btn.addEventListener('click', function () {
    held = !held; label();
    if (held) vid.pause(); else play();
  });
  motion.addEventListener('change', function () {
    if (!motion.matches) { if (document.readyState === 'complete') load(); return; }
    btn.hidden = true;
    if (clip) { vid.removeAttribute('src'); vid.load(); URL.revokeObjectURL(clip); clip = ''; }
  });
  vid.addEventListener('error', function () { if (clip) fail(); });   // ignore the empty-src reset above
  new IntersectionObserver(function (es) {
    onScreen = es[0].isIntersecting;
    if (onScreen) play(); else vid.pause();
  }).observe(vid);
  if (document.readyState === 'complete') load(); else addEventListener('load', load);
})();
