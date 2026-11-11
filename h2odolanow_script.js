// H2Odolanów Landing Page JavaScript
// Navigation, form validation, accessibility enhancements

document.addEventListener('DOMContentLoaded', function() {
  // Initialize navigation
  initNavigation();
  
  // Initialize form validation
  initFormValidation();
  
  // Initialize smooth scrolling for anchor links
  initSmoothScrolling();
  
  // Initialize accessibility features
  initAccessibility();
});

function initNavigation() {
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  
  if (!navToggle || !mainNav) return;
  
  navToggle.addEventListener('click', function() {
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
    mainNav.style.display = isExpanded ? 'none' : 'block';
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!navToggle.contains(event.target) && !mainNav.contains(event.target)) {
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.style.display = 'none';
    }
  });
  
  // Handle navigation links
  const navLinks = mainNav.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      // Close mobile menu on link click
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.style.display = 'none';
    });
  });
}

function initFormValidation() {
  const form = document.getElementById('registration-form');
  if (!form) return;
  
  // Form validation
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    let isValid = true;
    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.setAttribute('aria-invalid', 'true');
        field.focus();
      } else {
        field.setAttribute('aria-invalid', 'false');
      }
    });
    
    // Email validation
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailField.value)) {
        isValid = false;
        emailField.setAttribute('aria-invalid', 'true');
        emailField.focus();
      } else {
        emailField.setAttribute('aria-invalid', 'false');
      }
    }
    
    // RODO consent validation
    const rodoConsent = form.querySelector('input[name="consent_rodo"]');
    if (rodoConsent && !rodoConsent.checked) {
      isValid = false;
      rodoConsent.setAttribute('aria-invalid', 'true');
      rodoConsent.focus();
    } else if (rodoConsent) {
      rodoConsent.setAttribute('aria-invalid', 'false');
    }
    
    if (isValid) {
      // Show success message
      showFormSuccess();
      // In production, you would submit the form data here
      console.log('Form submitted successfully');
    } else {
      showFormError('Proszę wypełnić wszystkie wymagane pola.');
    }
  });
  
  // Real-time validation
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });
  });
}

function validateField(field) {
  const isRequired = field.hasAttribute('required');
  const isValid = field.value.trim() !== '';
  
  if (isRequired && !isValid) {
    field.setAttribute('aria-invalid', 'true');
    return false;
  }
  
  if (field.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(field.value)) {
      field.setAttribute('aria-invalid', 'true');
      return false;
    }
  }
  
  field.setAttribute('aria-invalid', 'false');
  return true;
}

function initSmoothScrolling() {
  // Smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(event) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        event.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

function initAccessibility() {
  // Skip link functionality
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', function(event) {
      event.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus();
      }
    });
  }
  
  // Keyboard navigation for hero actions
  const heroActions = document.querySelectorAll('.hero-actions .btn');
  heroActions.forEach((btn, index) => {
    btn.setAttribute('tabindex', '0');
    btn.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.click();
      }
    });
  });
  
  // Form field focus styles
  const formFields = document.querySelectorAll('.form-field input, .form-field select, .form-field textarea');
  formFields.forEach(field => {
    field.addEventListener('focus', function() {
      this.closest('.form-field').classList.add('focused');
    });
    
    field.addEventListener('blur', function() {
      this.closest('.form-field').classList.remove('focused');
    });
  });
}

function showFormSuccess() {
  // Create success message
  const successMessage = document.createElement('div');
  successMessage.className = 'form-success';
  successMessage.setAttribute('role', 'alert');
  successMessage.innerHTML = `
    <div class="success-content">
      <h3>✅ Rejestracja udana!</h3>
      <p>Dziękujemy za zapisanie się na konferencję H2Odolanów. 
         Skontaktujemy się z Tobą wkrótce w celu potwierdzenia uczestnictwa.</p>
    </div>
  `;
  
  // Insert after form
  const form = document.getElementById('registration-form');
  form.parentNode.insertBefore(successMessage, form.nextSibling);
  
  // Scroll to success message
  successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Remove success message after 5 seconds
  setTimeout(() => {
    if (successMessage.parentNode) {
      successMessage.parentNode.removeChild(successMessage);
    }
  }, 5000);
}

function showFormError(message) {
  // Create error message
  const errorMessage = document.createElement('div');
  errorMessage.className = 'form-error';
  errorMessage.setAttribute('role', 'alert');
  errorMessage.innerHTML = `
    <div class="error-content">
      <h3>❌ Błąd w formularzu</h3>
      <p>${message}</p>
    </div>
  `;
  
  // Insert after form
  const form = document.getElementById('registration-form');
  form.parentNode.insertBefore(errorMessage, form.nextSibling);
  
  // Scroll to error message
  errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Remove error message after 5 seconds
  setTimeout(() => {
    if (errorMessage.parentNode) {
      errorMessage.parentNode.removeChild(errorMessage);
    }
  }, 5000);
}

// Export functions for testing
window.H2Odolanow = {
  validateField: validate
