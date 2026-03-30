// ── SCROLL REVEAL ─────────────────────────────────
// Works with .reveal, .reveal-stagger, .cs-grid > div, .cs-media, .cs-phones
(function () {
  var selectors = '.reveal, .reveal-stagger, .cs-grid > div, .cs-media, .cs-phones';
  var els = document.querySelectorAll(selectors);
  if (!els.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(function (el) { observer.observe(el); });
})();
