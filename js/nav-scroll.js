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
