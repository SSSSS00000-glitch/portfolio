// ── PROJECT CARD BLUR-ZONE ALIGNMENT ──────────────
// The progressive-blur layers should end exactly where .pgrid-info
// starts (its padding-top edge) — but info's height is driven by
// its text content, not a fixed value, so match it in JS rather
// than guess a percentage that only happens to line up sometimes.
(function () {
  function align() {
    document.querySelectorAll('.pgrid-card').forEach(function (card) {
      var info = card.querySelector('.pgrid-info');
      var scrim = card.querySelector('.pgrid-scrim');
      var blurZone = card.querySelector('.pgrid-blur-zone');
      if (!info || !scrim || !blurZone) return;
      var height = info.getBoundingClientRect().height + 'px';
      scrim.style.height = height;
      blurZone.style.height = height;
    });
  }
  window.addEventListener('load', align);
  window.addEventListener('resize', align);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(align);
  }
  document.addEventListener('DOMContentLoaded', align);
})();
