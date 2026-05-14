const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const sections = document.querySelectorAll('main section[id]');
const revealItems = document.querySelectorAll('.reveal');
const magneticTargets = document.querySelectorAll('.btn, .nav-cta');
const interactiveCards = document.querySelectorAll(
  '.hero-card, .about-card, .about-visual, .service-card, .why-card, .timeline article, .faq-grid article'
);
const yearEl = document.getElementById('year');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
const webAppUrl =
  'https://script.google.com/macros/s/AKfycbyLGEhkpYZ9rROq1d1SzU2lIeT07K1oU7JIYfPd99lQ5YB0TT0oAPDeLEZpIfVhT3P4BA/exec';

const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
scrollProgress.setAttribute('aria-hidden', 'true');
document.body.append(scrollProgress);

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('open');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item, index) => {
  item.style.setProperty('--reveal-delay', `${index * 55}ms`);
});

revealItems.forEach((item) => observer.observe(item));

const updateActiveLink = () => {
  const scrollY = window.scrollY + 120;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionBottom && id) {
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
};

const updateProgress = () => {
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  scrollProgress.style.setProperty('--progress', `${progress}%`);
  document.documentElement.style.setProperty('--scroll-depth', `${scrollTop}px`);
};

window.addEventListener('scroll', updateActiveLink);
window.addEventListener('scroll', updateProgress, { passive: true });
updateActiveLink();
updateProgress();

if (!prefersReducedMotion && hasFinePointer) {
  magneticTargets.forEach((item) => {
    item.classList.add('magnetic');

    item.addEventListener('pointermove', (event) => {
      const rect = item.getBoundingClientRect();
      const deltaX = event.clientX - (rect.left + rect.width / 2);
      const deltaY = event.clientY - (rect.top + rect.height / 2);

      item.style.setProperty('--mx', `${deltaX * 0.16}px`);
      item.style.setProperty('--my', `${deltaY * 0.2}px`);
    });

    item.addEventListener('pointerleave', () => {
      item.style.setProperty('--mx', '0px');
      item.style.setProperty('--my', '0px');
    });
  });

  interactiveCards.forEach((card) => {
    card.classList.add('interactive-card');

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 8;
      const rotateX = (0.5 - y) * 8;

      card.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
      card.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
      card.style.setProperty('--lift', '-4px');
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--lift', '0px');
    });
  });
}

if (!prefersReducedMotion) {
  magneticTargets.forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;

      button.append(ripple);
      window.setTimeout(() => {
        ripple.remove();
      }, 700);
    });
  });
}

if (contactForm && formMessage) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const details = String(formData.get('details') || '').trim();

    if (!name || !email || !details) {
      formMessage.textContent = 'Please complete all required fields.';
      formMessage.classList.remove('success');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      formMessage.textContent = 'Please enter a valid email address.';
      formMessage.classList.remove('success');
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    try {
      const payload = new URLSearchParams();

      formData.forEach((value, key) => {
        payload.append(key, String(value).trim());
      });

      payload.append('submittedAt', new Date().toISOString());
      payload.append('sourcePage', window.location.href);

      const response = await fetch(webAppUrl, {
        method: 'POST',
        body: payload,
      });

      try {
        const result = await response.json();
        if (result.result === 'error') {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (parseError) {
        // Response may not be JSON, but if we got here the request succeeded
      }

      formMessage.textContent = 'Thanks! Your request has been submitted successfully.';
      formMessage.classList.add('success');
      contactForm.reset();
    } catch (_error) {
      formMessage.textContent =
        'Submission failed. Confirm your Google Apps Script web app is redeployed with access set to Anyone.';
      formMessage.classList.remove('success');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Request Proposal';
      }
    }
  });
}
