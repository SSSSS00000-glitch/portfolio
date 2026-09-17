// ── QUOTE SUBTITLE ALIGNMENT ──────────────────────
// The quote headline is center-set, so its text start shifts with
// viewport/content width — measure where the first letter of the
// weight-light span actually lands and align the paragraph below
// it to that same x-position.
(function () {
  function align() {
    var span = document.querySelector('.quote-headline .weight-light');
    var subtitle = document.querySelector('.quote-subtitle');
    var container = document.querySelector('.quote-text');
    if (!span || !subtitle || !container) return;
    var offset = span.getBoundingClientRect().left - container.getBoundingClientRect().left;
    subtitle.style.marginLeft = Math.max(0, offset) + 'px';
  }
  window.addEventListener('load', align);
  window.addEventListener('resize', align);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(align);
  }
  document.addEventListener('DOMContentLoaded', align);
})();
