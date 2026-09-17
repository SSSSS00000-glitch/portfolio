// ── PHONE MOCKUP COMPONENT ─────────────────────────
// One reusable renderer so the markup isn't hand-duplicated per
// screenshot. Each image is a full "iPhone 14 Pro" export straight
// from Figma (device chrome + screen composited together — see
// css/phone-mockup.css) rather than a hand-built CSS frame around a
// separate screen image, so it's pixel-exact to the design. Call
// with a container id and an array of { image, caption } — used by
// the "Selected work" phone row on case study pages.
function renderPhoneMockups(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = items.map(({ image, caption }) => `
    <div class="phone-mockup">
      <img class="phone-mockup-frame" src="${image}" alt="${caption} screen" loading="lazy" />
      <span class="phone-mockup-caption">${caption}</span>
    </div>
  `).join('');
}
