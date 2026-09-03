document.documentElement.classList.add('js');
try {
  if (!sessionStorage.getItem('mv_seen')) {
    document.documentElement.classList.add('mv-first');
    sessionStorage.setItem('mv_seen', '1');
  }
} catch (e) {}
addEventListener('DOMContentLoaded', function () {
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
});
