// ── TESTIMONIAL DOT INDICATORS ────────────────────
(function () {
  const scroll = document.getElementById('testimonials-scroll');
  const dotsContainer = document.getElementById('testimonials-dots');
  if (!scroll || !dotsContainer) return;

  const cards = scroll.querySelectorAll('.testimonial-card');
  if (!cards.length) return;

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => {
      cards[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.dot');

  // Update active dot on scroll
  let ticking = false;
  scroll.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollCenter = scroll.scrollLeft + scroll.offsetWidth / 2;
        let closest = 0;
        let minDist = Infinity;
        cards.forEach((card, i) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const dist = Math.abs(scrollCenter - cardCenter);
          if (dist < minDist) { minDist = dist; closest = i; }
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === closest));
        ticking = false;
      });
      ticking = true;
    }
  });
})();
