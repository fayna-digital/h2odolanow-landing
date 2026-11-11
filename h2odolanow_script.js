// H2Odolanów – landing page
// Nawigacja mobilna, walidacja formularza rejestracji, drobne ulepszenia a11y.

(function () {
  'use strict';

  var MOBILE_QUERY = '(max-width: 768px)';

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHeaderShadow();
    initFormValidation();
  });

  /* ---------------------------------------------------------------- nav */

  function initNavigation() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('main-nav');
    if (!toggle || !nav) return;

    function open() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Zamknij menu nawigacyjne');
    }

    function close(returnFocus) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Otwórz menu nawigacyjne');
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) close(false); else open();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        close(true);
      }
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      close(false);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) close(false);
    });

    // Widok desktopowy nie potrzebuje stanu "otwarte".
    var mql = window.matchMedia(MOBILE_QUERY);
    function onBreakpointChange(event) {
      if (!event.matches) close(false);
    }
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onBreakpointChange);
    } else if (typeof mql.addListener === 'function') {
      mql.addListener(onBreakpointChange);
    }
  }

  function initHeaderShadow() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* --------------------------------------------------------------- form */

  function initFormValidation() {
    var form = document.getElementById('registration-form');
    if (!form) return;

    var status = document.getElementById('form-status');

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var invalid = validateForm(form);
      if (invalid.length > 0) {
        setStatus(status, 'error', 'Proszę poprawić zaznaczone pola formularza.');
        invalid[0].focus();
        return;
      }

      submitForm(form, status);
    });

    // Komunikaty pojawiają się dopiero po pierwszej próbie wysłania formularza.
    // Wcześniejsze wstawianie/usuwanie węzłów z błędem zmieniało wysokość formularza
    // w trakcie kliknięcia, przez co kliknięcie w pole potrafiło nie zadziałać.
    Array.prototype.forEach.call(form.querySelectorAll('input'), function (field) {
      function revalidateIfShown() {
        if (fieldHasError(field)) validateField(field);
      }
      field.addEventListener('blur', revalidateIfShown);
      field.addEventListener('input', revalidateIfShown);
    });
  }

  function validateForm(form) {
    var invalid = [];
    Array.prototype.forEach.call(form.querySelectorAll('input'), function (field) {
      if (!validateField(field)) invalid.push(field);
    });
    return invalid;
  }

  function validateField(field) {
    var message = '';
    var value = (field.value || '').trim();

    if (field.hasAttribute('required')) {
      if (field.type === 'checkbox' && !field.checked) {
        message = 'To pole jest wymagane.';
      } else if (field.type !== 'checkbox' && value === '') {
        message = 'To pole jest wymagane.';
      }
    }

    if (!message && field.type === 'email' && value !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        message = 'Podaj poprawny adres e-mail.';
      }
    }

    if (!message && field.type === 'tel' && value !== '') {
      if (!/^[+0-9\s()-]{7,20}$/.test(value)) {
        message = 'Podaj poprawny numer telefonu.';
      }
    }

    setFieldError(field, message);
    return message === '';
  }

  function fieldHasError(field) {
    return field.id !== '' && document.getElementById(field.id + '-error') !== null;
  }

  function setFieldError(field, message) {
    var errorId = field.id + '-error';
    var error = document.getElementById(errorId);

    if (!message) {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
      if (error) error.parentNode.removeChild(error);
      return;
    }

    field.setAttribute('aria-invalid', 'true');

    if (!error) {
      error = document.createElement('p');
      error.id = errorId;
      error.className = 'field-error';
      field.insertAdjacentElement('afterend', error);
    }
    error.textContent = message;
    field.setAttribute('aria-describedby', errorId);
  }

  function setStatus(node, state, text) {
    if (!node) return;
    node.setAttribute('data-state', state);
    node.textContent = text;
  }

  function submitForm(form, status) {
    var button = form.querySelector('button[type="submit"]');
    var endpoint = form.getAttribute('action');

    // Formularz nie jest jeszcze podłączony do backendu – mówimy to wprost
    // zamiast pokazywać fałszywe "zarejestrowano".
    if (!endpoint || endpoint === '#' || endpoint === '') {
      setStatus(status, 'info',
        'Formularz nie jest jeszcze podłączony do systemu zapisów. Skontaktuj się z organizatorem.');
      return;
    }

    if (button) button.disabled = true;
    setStatus(status, 'info', 'Wysyłanie zgłoszenia…');

    fetch(endpoint, {
      method: form.getAttribute('method') || 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        form.reset();
        setStatus(status, 'success', 'Dziękujemy za rejestrację. Potwierdzenie otrzymasz e-mailem.');
      })
      .catch(function () {
        setStatus(status, 'error', 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie lub napisz do organizatora.');
      })
      .then(function () {
        if (button) button.disabled = false;
      });
  }
})();
