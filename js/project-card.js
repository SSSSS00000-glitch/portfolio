// ── PROJECT CARD COMPONENT ─────────────────────────
// Renders "More work, in brief" preview cards from data, reusing
// the exact .pgrid-card recipe from css/projects-grid.css. This is
// the ONLY place that markup is written — every page showing this
// row (Home included, via js/projects-data.js) calls this instead of
// hand-authoring cards, so there's exactly one ProjectCard, not one
// per page. Call with a container id and an array of
// { image, alt, title, description, tags: [], link }.
function renderProjectCards(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = items.map(({ image, alt, title, description, tags, link }) => `
    <a href="${link}" class="pgrid-card reveal">
      <img src="${image}" alt="${alt || title}" loading="lazy" />
      <div class="pgrid-chips">
        ${tags.map((tag) => `<span class="pgrid-chip">${tag}</span>`).join('')}
      </div>
      <div class="pgrid-scrim" aria-hidden="true"></div>
      <div class="pgrid-blur-zone" aria-hidden="true">
        <span class="pgrid-blur pgrid-blur-1"></span>
        <span class="pgrid-blur pgrid-blur-2"></span>
        <span class="pgrid-blur pgrid-blur-3"></span>
        <span class="pgrid-blur pgrid-blur-4"></span>
      </div>
      <div class="pgrid-info">
        <div class="pgrid-info-text">
          <h3 class="pgrid-title">${title}</h3>
          <p class="pgrid-subtitle">${description}</p>
        </div>
        <span class="pgrid-arrow-btn" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H3.5M9.5 2.5V8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </div>
    </a>
  `).join('');
}
