(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var nav = document.getElementById('site-nav');
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);
  var toast = document.querySelector('.toast');
  var toastTimer;
  var ticking = false;

  /* Footer year */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Header state + scrollspy */
  function updateActiveLink() {
    if (!sections.length) return;

    var offset = window.scrollY + (header ? header.offsetHeight : 0) + 140;
    var current = null;

    sections.forEach(function (section) {
      if (section.offsetTop <= offset) current = section;
    });

    var atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;

    if (atBottom) current = sections[sections.length - 1];

    navLinks.forEach(function (link) {
      if (current && link.getAttribute('href') === '#' + current.id) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 6);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateHeader();
      updateActiveLink();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateHeader();
  updateActiveLink();

  /* Mobile navigation */
  function setNavOpen(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      setNavOpen(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setNavOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setNavOpen(false);
        navToggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (
        nav.classList.contains('is-open') &&
        !event.target.closest('.site-header')
      ) {
        setNavOpen(false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setNavOpen(false);
    });
  }

  /* Scroll reveal */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* Copy email */
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2400);
  }

  function fallbackCopy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '-1000px';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();

    var copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (error) {
      copied = false;
    }

    document.body.removeChild(field);
    showToast(copied ? 'Email copied to clipboard' : 'Copy failed — ' + text);
  }

  var copyButton = document.getElementById('copy-email');
  if (copyButton) {
    copyButton.addEventListener('click', function () {
      var email = copyButton.getAttribute('data-email');
      if (!email) return;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(
          function () { showToast('Email copied to clipboard'); },
          function () { fallbackCopy(email); }
        );
      } else {
        fallbackCopy(email);
      }
    });
  }
})();
