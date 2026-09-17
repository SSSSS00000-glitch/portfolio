// ── CONTACT LINK: SCROLL TO PAGE BOTTOM ───────────
// #contact is the <footer>, and .footer-contact-row sits at its very
// bottom — the footer is tall enough (934px at desktop) that the
// default #contact anchor (top of the footer + scroll-margin-top)
// can leave the contact row below the fold on viewports shorter than
// ~830px. Scrolling to the true document bottom instead guarantees
// the contact row is in view, since the footer is always the last
// thing on the page.
(function () {
  var contactLinks = document.querySelectorAll('a[href="#contact"]');
  contactLinks.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
      history.pushState(null, '', '#contact');
    });
  });
})();

// ── NAV GLASS ON SCROLL + ACTIVE SECTION ──────────
(function () {
  var navRight = document.getElementById('nav-buttons');
  var closeBtn = document.querySelector('.cs-topbar-close');
  var target = navRight || closeBtn;
  if (!target) return;

  var links = navRight ? navRight.querySelectorAll('a[href^="#"]') : [];
  var sections = [];
  links.forEach(function (a) {
    var id = a.getAttribute('href').replace('#', '');
    var el = document.getElementById(id);
    if (el) sections.push({ link: a, el: el });
  });

  var ticking = false;
  var threshold = 40;

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        if (window.scrollY > threshold) {
          target.classList.add('scrolled');
        } else {
          target.classList.remove('scrolled');
        }

        // Active section
        var scrollY = window.scrollY + 200;
        var active = null;
        sections.forEach(function (s) {
          if (s.el.offsetTop <= scrollY) active = s;
        });
        links.forEach(function (a) { a.classList.remove('active'); });
        if (active) active.link.classList.add('active');

        ticking = false;
      });
      ticking = true;
    }
  });
})();
