// ── LEFT FADE APPEARS ON SCROLL ───────────────────
(function () {
  const scroll = document.querySelector('.testimonials-scroll');
  const slider = document.querySelector('.testimonials-slider');
  if (!scroll || !slider) return;

  scroll.addEventListener('scroll', () => {
    if (scroll.scrollLeft > 10) {
      slider.classList.add('has-scroll');
    } else {
      slider.classList.remove('has-scroll');
    }
  });
})();
