// H2O!dolanów 2027 — logika strony
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
    var live = false;

    // Sprawdzamy, czy podstrona działa z modułem rejestracji. Bez backendu
    // formularz pozostaje w trybie demonstracyjnym i mówi o tym wprost.
    var ready = fetch('/api/health', { cache: 'no-store', headers: { accept: 'application/json' } })
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (payload) {
        if (!payload || payload.ok !== true || payload.service !== 'h2odolanow-registration') return false;
        live = true;
        return fetch('/api/registration-status', { cache: 'no-store' })
          .then(function (response) { return response.ok ? response.json() : null; })
          .then(function (state) {
            if (state && state.open === false) {
              setStatus(
                'Rejestracja jest chwilowo zamknięta. Informacje: sekretariat@odolanow.pl, tel. 62 733 15 81.',
                'error'
              );
            }
            return true;
          });
      })
      .catch(function () { return false; });

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

    function setBusy(busy) {
      if (!submit) return;
      submit.disabled = busy;
      submit.textContent = busy ? 'Wysyłanie…' : 'Wyślij zgłoszenie';
    }

    function collect() {
      function value(id) {
        var field = document.getElementById(id);
        return field ? field.value : '';
      }
      function checked(id) {
        var field = document.getElementById(id);
        return Boolean(field && field.checked);
      }
      return {
        name: value('reg-name'),
        organization: value('reg-org'),
        position: value('reg-position'),
        email: value('reg-email'),
        phone: value('reg-phone'),
        city: value('reg-city'),
        type: value('reg-type') || 'uczestnik',
        notes: value('reg-notes'),
        consent_rodo: checked('reg-consent-rodo'),
        consent_contact: checked('reg-consent-contact'),
        website: honeypot ? honeypot.value : '',
        form_loaded_at: new Date(loadedAt).toISOString()
      };
    }

    var ERROR_FIELDS = {
      name: 'reg-name',
      organization: 'reg-org',
      email: 'reg-email',
      phone: 'reg-phone',
      consent_rodo: 'reg-consent-rodo'
    };

    function applyServerErrors(errors) {
      var first = null;
      Object.keys(errors).forEach(function (key) {
        var id = ERROR_FIELDS[key];
        if (!id) return;
        setError(id, errors[key]);
        if (!first) first = document.getElementById(id);
      });
      if (first) first.focus();
    }

    function finishAfterSuccess(message) {
      setBusy(false);
      form.reset();
      attempted = false;
      loadedAt = Date.now();
      setStatus(
        message ||
          'Dziękujemy. Zgłoszenie zostało zapisane, potwierdzenie wysłaliśmy na podany adres e-mail.',
        'success'
      );
    }

    function sendLive() {
      return fetch('/api/registrations', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(collect())
      })
        .then(function (response) {
          return response
            .json()
            .catch(function () { return {}; })
            .then(function (payload) { return { status: response.status, payload: payload || {} }; });
        })
        .then(function (result) {
          var payload = result.payload;

          if (result.status === 201 || result.status === 202) {
            finishAfterSuccess(payload.message);
            return;
          }

          setBusy(false);

          if (result.status === 400 && payload.errors) {
            applyServerErrors(payload.errors);
            setStatus('Proszę poprawić zaznaczone pola formularza.', 'error');
            return;
          }

          if (result.status === 409) {
            setError('reg-email', payload.message || 'Ten adres e-mail jest już zapisany.');
            var email = document.getElementById('reg-email');
            if (email) email.focus();
          }

          setStatus(
            payload.message || 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie później.',
            'error'
          );
        })
        .catch(function () {
          setBusy(false);
          setStatus(
            'Nie udało się połączyć z serwerem. Sprawdź połączenie i spróbuj ponownie.',
            'error'
          );
        });
    }

    function sendDemo() {
      // Brak backendu: pokazujemy uczciwy komunikat zamiast udawać zapis.
      window.setTimeout(function () {
        setBusy(false);
        form.reset();
        attempted = false;
        loadedAt = Date.now();
        setStatus(
          'Dziękujemy. Formularz działa w wersji demonstracyjnej — zgłoszenie nie zostało ' +
          'jeszcze zapisane. Po podłączeniu do systemu urzędu potwierdzenie trafi na podany e-mail.',
          'success'
        );
      }, 600);
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

      setBusy(true);
      ready
        .then(function (isLive) {
          if (isLive && live) return sendLive();
          sendDemo();
          return null;
        })
        .catch(function () {
          setBusy(false);
          setStatus('Nie udało się wysłać zgłoszenia. Spróbuj ponownie później.', 'error');
        });
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
