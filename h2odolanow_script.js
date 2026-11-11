// H2Odolanów 2027 — logika strony
// Nagłówek, menu mobilne, licznik, zakładki programu, walidacja formularza.

(function () {
  'use strict';

  var CONFERENCE_START = new Date('2027-04-27T09:00:00+02:00');
  var header = null;
  var nav = null;
  var navToggle = null;

  document.addEventListener('DOMContentLoaded', function () {
    header = document.getElementById('site-header');
    initNavigation();
    initHeaderState();
    initCountdown();
    initTabs();
    initForm();
    initReveal();
    initPlaceholderLinks();
  });

  /* ------------------------------------------------------------ header */

  function syncHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  function initHeaderState() {
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
    window.addEventListener('resize', syncHeader);
  }

  /* --------------------------------------------------------------- nav */

  function initNavigation() {
    nav = document.getElementById('main-nav');
    navToggle = document.getElementById('nav-toggle');
    if (!nav || !navToggle) return;

    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      if (open) closeNav(true); else openNav();
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeNav(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) closeNav(true);
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (event.target.closest('#main-nav') || event.target.closest('#nav-toggle')) return;
      closeNav(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024 && nav.classList.contains('is-open')) closeNav(false);
    });
  }

  function openNav() {
    nav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Zamknij menu');
    document.body.style.overflow = 'hidden';
  }

  function closeNav(returnFocus) {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Otwórz menu');
    document.body.style.overflow = '';
    if (returnFocus) navToggle.focus();
  }

  /* ---------------------------------------------------------- countdown */

  function initCountdown() {
    var root = document.getElementById('countdown');
    if (!root || isNaN(CONFERENCE_START.getTime())) return;

    var cells = {
      days: root.querySelector('[data-unit="days"]'),
      hours: root.querySelector('[data-unit="hours"]'),
      minutes: root.querySelector('[data-unit="minutes"]'),
      seconds: root.querySelector('[data-unit="seconds"]')
    };
    if (!cells.days) return;

    var timer = null;

    function pad(value) {
      return String(value).padStart(2, '0');
    }

    function tick() {
      var diff = CONFERENCE_START.getTime() - Date.now();
      if (diff <= 0) {
        root.hidden = true;
        if (timer) window.clearInterval(timer);
        return;
      }

      var totalSeconds = Math.floor(diff / 1000);
      cells.days.textContent = String(Math.floor(totalSeconds / 86400));
      cells.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
      cells.minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
      cells.seconds.textContent = pad(totalSeconds % 60);
    }

    root.hidden = false;
    tick();
    timer = window.setInterval(tick, 1000);
  }

  /* --------------------------------------------------------------- tabs */

  function initTabs() {
    var tablist = document.querySelector('.tabs');
    if (!tablist) return;

    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));

    function select(tab, focus) {
      tabs.forEach(function (item) {
        var selected = item === tab;
        item.setAttribute('aria-selected', selected ? 'true' : 'false');
        item.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(item.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
        if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === 'Home') next = tabs[0];
        if (event.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        event.preventDefault();
        select(next, true);
      });
    });
  }

  /* --------------------------------------------------------------- form */

  function initForm() {
    var form = document.getElementById('registration-form');
    if (!form) return;

    var status = document.getElementById('form-status');
    var submit = document.getElementById('reg-submit');
    var honeypot = document.getElementById('reg-website');
    var loadedAt = Date.now();
    var attempted = false;

    var rules = {
      'reg-name': {
        required: true,
        message: 'Podaj imię i nazwisko.',
        validate: function (value) { return value.trim().length >= 3; }
      },
      'reg-org': {
        required: true,
        message: 'Podaj nazwę instytucji lub firmy.',
        validate: function (value) { return value.trim().length >= 2; }
      },
      'reg-email': {
        required: true,
        message: 'Podaj poprawny adres e-mail.',
        validate: function (value) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim()); }
      },
      'reg-phone': {
        required: true,
        message: 'Podaj numer telefonu (min. 9 cyfr).',
        validate: function (value) { return value.replace(/\D/g, '').length >= 9; }
      }
    };

    function errorFor(id) {
      var field = document.getElementById(id);
      if (!field) return null;
      var described = field.getAttribute('aria-describedby') || '';
      var errorId = described.split(/\s+/).filter(function (token) { return token.indexOf('err-') === 0; })[0];
      return errorId ? document.getElementById(errorId) : null;
    }

    function setError(id, message) {
      var field = document.getElementById(id);
      var error = errorFor(id);
      if (!field) return;
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        if (error) { error.textContent = message; error.hidden = false; }
      } else {
        field.removeAttribute('aria-invalid');
        if (error) { error.hidden = true; error.textContent = ''; }
      }
    }

    function validateField(id) {
      var rule = rules[id];
      var field = document.getElementById(id);
      if (!rule || !field) return true;
      var valid = rule.validate(field.value);
      setError(id, valid ? '' : rule.message);
      return valid;
    }

    function validateConsent() {
      var consent = document.getElementById('reg-consent-rodo');
      var error = document.getElementById('err-rodo');
      if (!consent) return true;
      var valid = consent.checked;
      if (valid) {
        consent.removeAttribute('aria-invalid');
        if (error) { error.hidden = true; error.textContent = ''; }
      } else {
        consent.setAttribute('aria-invalid', 'true');
        if (error) {
          error.textContent = 'Zgoda na przetwarzanie danych jest wymagana.';
          error.hidden = false;
        }
      }
      return valid;
    }

    Object.keys(rules).forEach(function (id) {
      var field = document.getElementById(id);
      if (!field) return;
      field.addEventListener('blur', function () {
        if (attempted) validateField(id);
      });
      field.addEventListener('input', function () {
        if (attempted && field.getAttribute('aria-invalid') === 'true') validateField(id);
      });
    });

    var consent = document.getElementById('reg-consent-rodo');
    if (consent) {
      consent.addEventListener('change', function () {
        if (attempted) validateConsent();
      });
    }

    function setStatus(message, state) {
      if (!status) return;
      status.textContent = message;
      if (state) status.setAttribute('data-state', state);
      else status.removeAttribute('data-state');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      attempted = true;

      // Pole-pułapka wypełnione przez bota — nie zdradzamy, że zostało wykryte.
      if (honeypot && honeypot.value.trim() !== '') {
        setStatus('Nie udało się wysłać zgłoszenia. Spróbuj ponownie później.', 'error');
        return;
      }

      // Formularz wypełniony w mgnieniu oka — typowe zachowanie automatów.
      if (Date.now() - loadedAt < 2000) {
        setStatus('Formularz został wypełniony zbyt szybko. Spróbuj ponownie.', 'error');
        return;
      }

      var valid = Object.keys(rules).map(validateField).every(Boolean);
      valid = validateConsent() && valid;

      if (!valid) {
        setStatus('Proszę poprawić zaznaczone pola formularza.', 'error');
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Wysyłanie…';
      }

      // Brak backendu: pokazujemy uczciwy komunikat zamiast udawać zapis.
      window.setTimeout(function () {
        if (submit) {
          submit.disabled = false;
          submit.textContent = 'Wyślij zgłoszenie';
        }
        form.reset();
        attempted = false;
        setStatus(
          'Dziękujemy. Formularz działa w wersji demonstracyjnej — zgłoszenie nie zostało ' +
          'jeszcze zapisane. Po podłączeniu do systemu urzędu potwierdzenie trafi na podany e-mail.',
          'success'
        );
      }, 600);
    });
  }

  /* ------------------------------------------------------------- reveal */

  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (item) { item.classList.add('is-in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (item) { observer.observe(item); });
  }

  /* --------------------------------------------------- placeholder links */

  function initPlaceholderLinks() {
    var pdf = document.querySelector('[data-pdf-download]');
    if (pdf) {
      pdf.addEventListener('click', function (event) {
        event.preventDefault();
        var note = document.getElementById('pdf-note');
        if (!note) {
          note = document.createElement('p');
          note.id = 'pdf-note';
          note.className = 'hint';
          note.setAttribute('role', 'status');
          pdf.insertAdjacentElement('afterend', note);
        }
        note.textContent = 'Wersja PDF zostanie opublikowana wraz z ostatecznym programem.';
      });
    }

    document.querySelectorAll('[data-privacy-link], [data-accessibility-link]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        link.setAttribute('title', 'Dokument w przygotowaniu');
      });
    });
  }
})();
