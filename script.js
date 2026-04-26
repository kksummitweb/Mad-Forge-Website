/* ============================================
   MAD WEBSITES — MULTI-PAGE SCRIPT
   ============================================ */

const menuToggle = document.querySelector('.menu-toggle');
const siteNav    = document.querySelector('.site-nav');
const navLinks   = document.querySelectorAll('.site-nav a:not(.nav-cta)');
const topbar     = document.querySelector('.topbar');
const revealItems    = document.querySelectorAll('.reveal');
const magneticTargets  = document.querySelectorAll('.btn, .nav-cta');
const interactiveCards = document.querySelectorAll(
  '.hero-card, .about-card, .about-visual, .service-card, .why-card, .timeline article, .faq-item'
);
const yearEl      = document.getElementById('year');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer       = window.matchMedia('(pointer: fine)').matches;

const webAppUrl = 'https://script.google.com/macros/s/AKfycbxrOSd04c4SzMXN_6BUHFywyCzEAXd6S25QHCm06bmBg5r77a_mRqXg1PqRsZKt33at3w/exec';

/* ─── SCROLL PROGRESS ─────────────────────── */
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
scrollProgress.setAttribute('aria-hidden', 'true');
document.body.appendChild(scrollProgress);

/* ─── YEAR ────────────────────────────────── */
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* ─── MOBILE NAV ──────────────────────────── */
if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('open');
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ─── SCROLL EVENTS ───────────────────────── */
const onScroll = () => {
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

  scrollProgress.style.setProperty('--progress', `${progress}%`);

  if (topbar) {
    topbar.classList.toggle('scrolled', scrollTop > 20);
  }
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ─── REVEAL ON SCROLL ────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  },
  { threshold: 0.1 }
);

revealItems.forEach((item, index) => {
  if (!item.style.getPropertyValue('--reveal-delay')) {
    item.style.setProperty('--reveal-delay', `${index * 45}ms`);
  }
  revealObserver.observe(item);
});

/* ─── 3D CARD TILT ────────────────────────── */
if (!prefersReducedMotion && hasFinePointer) {
  interactiveCards.forEach((card) => {
    card.classList.add('interactive-card');

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      card.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${((x - 0.5) * 7).toFixed(2)}deg`);
      card.style.setProperty('--lift', '-4px');
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--lift', '0px');
    });
  });
}

/* ─── MAGNETIC BUTTONS ────────────────────── */
if (!prefersReducedMotion && hasFinePointer) {
  magneticTargets.forEach((item) => {
    item.classList.add('magnetic');

    item.addEventListener('pointermove', (e) => {
      const rect = item.getBoundingClientRect();
      item.style.setProperty('--mx', `${(e.clientX - (rect.left + rect.width / 2)) * 0.15}px`);
      item.style.setProperty('--my', `${(e.clientY - (rect.top + rect.height / 2)) * 0.18}px`);
    });

    item.addEventListener('pointerleave', () => {
      item.style.setProperty('--mx', '0px');
      item.style.setProperty('--my', '0px');
    });
  });
}

/* ─── RIPPLE ON CLICK ─────────────────────── */
if (!prefersReducedMotion) {
  magneticTargets.forEach((button) => {
    button.addEventListener('pointerdown', (e) => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top  = `${e.clientY - rect.top}px`;
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });
}

/* ─── CONTACT FORM ────────────────────────── */
if (contactForm && formMessage) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const name    = String(formData.get('name')    || '').trim();
    const email   = String(formData.get('email')   || '').trim();
    const details = String(formData.get('details') || '').trim();

    if (!name || !email || !details) {
      formMessage.textContent = 'Please complete all required fields.';
      formMessage.className = 'form-note error';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      formMessage.textContent = 'Please enter a valid email address.';
      formMessage.className = 'form-note error';
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending…';
    }

    try {
      const payload = new URLSearchParams();
      formData.forEach((value, key) => payload.append(key, String(value).trim()));
      payload.append('submittedAt', new Date().toISOString());
      payload.append('sourcePage', window.location.href);

      const response = await fetch(webAppUrl, {
        method: 'POST',
        mode: 'cors',
        body: payload,
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);

      const result = await response.json();
      if (result.result !== 'success' && !result.ok) {
        throw new Error(result.message || 'Submission failed');
      }

      formMessage.textContent = 'Thanks! Your request has been submitted. We\'ll be in touch within 24 hours.';
      formMessage.className = 'form-note success';
      contactForm.reset();
    } catch (_err) {
      formMessage.textContent = 'Submission failed. Please try again or email us directly.';
      formMessage.className = 'form-note error';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Request →';
      }
    }
  });
}
