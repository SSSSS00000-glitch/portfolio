// ── PROJECT DATA (single source of truth) ──────────
// Backs the ProjectCard component (js/project-card.js) on every page
// that shows a "More work" row — Home shows all of them; a case study
// page passes its own slug to leave itself out of its own list.
const PROJECTS = [
  {
    slug: 'baemingo',
    image: 'assets/home-baemingo.jpg',
    alt: 'Baemingo point-of-sale tablet at a restaurant counter',
    title: 'Baemingo',
    description: 'One product. Many brands. One system to make it all work.',
    tags: ['QSR', 'B2B2C', 'White label'],
    link: 'baemingo.html',
  },
  {
    slug: 'neurosight',
    image: 'assets/home-neurosight.jpg',
    alt: 'Neurosight fNIRS session dashboard on a laptop',
    title: 'Neurosight',
    description: 'Turning consumer neurotech into a research tool.',
    tags: ['Mobile + Web', 'B2B', 'Neurotech'],
    link: 'neurosight.html',
  },
  {
    slug: 'lansforsakringar',
    image: 'assets/home-lansforsakringar.jpg',
    alt: 'Länsförsäkringar web platform on a laptop',
    title: 'Länsförsäkringar',
    description: 'Simplifying complex financial journeys within a large organisation.',
    tags: ['Insurance', 'B2B', 'B2C'],
    link: 'lansforsakringar.html',
  },
  {
    slug: 'radeito',
    image: 'assets/home-radeito.jpg',
    alt: 'Radeito mobile app showing nearby automotive service points on a map',
    title: 'Radeito',
    description: 'Giving an early idea shape, structure and direction.',
    tags: ['Automotive', 'B2C', 'Mobile app'],
    link: 'radeito.html',
  },
  {
    slug: 'caree',
    image: 'assets/home-caree.jpg',
    alt: 'Caree booking dashboard for wellness appointments on a laptop',
    title: 'Caree',
    description: 'Different products. One connected experience.',
    tags: ['Wellness SaaS', 'B2B2C', 'Platform'],
    link: 'caree.html',
  },
];

// Renders PROJECTS into containerId via the shared ProjectCard
// renderer, excluding the given slug (a case study page's own entry).
// Pass no excludeSlug to render the full list (Home).
function renderProjects(containerId, excludeSlug) {
  const items = excludeSlug ? PROJECTS.filter((p) => p.slug !== excludeSlug) : PROJECTS;
  renderProjectCards(containerId, items);
}
