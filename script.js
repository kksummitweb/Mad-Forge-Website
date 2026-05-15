/*
  Mad Forge shared interactivity
  - Sticky header style change
  - Mobile navigation
  - Dark/light mode with persistence
  - Scroll reveal
  - 3D tilt hover
  - Contact form front-end validation
  - Portfolio iframe preview scaling
*/

const body = document.body;
const topbar = document.querySelector('.topbar');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');
const revealItems = document.querySelectorAll('.reveal');
const tiltCards = document.querySelectorAll('.tilt-card');
const year = document.getElementById('year');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

if (year) {
  year.textContent = new Date().getFullYear();
}

const handleHeader = () => {
  if (!topbar) return;
  topbar.classList.toggle('scrolled', window.scrollY > 12);
};
window.addEventListener('scroll', handleHeader, { passive: true });
handleHeader();

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    });
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      menuToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    }
  });
}

const pageName = window.location.pathname.split('/').pop() || 'index.html';
navLinks.forEach((link) => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('mailto:') || href.startsWith('https://')) return;
  link.classList.toggle('active', href === pageName);
});

const applyTheme = (theme) => {
  body.setAttribute('data-theme', theme);
  if (themeLabel) {
    themeLabel.textContent = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  }
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', themeLabel ? themeLabel.textContent : 'Toggle theme');
    themeToggle.textContent = theme === 'light' ? 'D' : 'L';
  }
};

const savedTheme = localStorage.getItem('mf-theme');
if (savedTheme === 'light' || savedTheme === 'dark') {
  applyTheme(savedTheme);
} else {
  applyTheme('dark');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    localStorage.setItem('mf-theme', nextTheme);
  });
}

if (!prefersReducedMotion && revealItems.length) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 45, 240)}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

if (!prefersReducedMotion && hasFinePointer) {
  tiltCards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 10;
      const rotateX = (0.5 - y) * 10;
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

if (contactForm && formMessage) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(contactForm);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const service = String(data.get('service') || '').trim();
    const message = String(data.get('message') || '').trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !service || !message) {
      formMessage.textContent = 'Please complete all required fields.';
      formMessage.className = 'form-note';
      return;
    }

    if (!emailPattern.test(email)) {
      formMessage.textContent = 'Please enter a valid email address.';
      formMessage.className = 'form-note';
      return;
    }

    formMessage.textContent = 'Thanks. Your message looks great and is ready to be connected to your backend.';
    formMessage.className = 'form-note success';
    contactForm.reset();
  });
}

// Portfolio iframe preview scaling
// Each iframe is rendered at 1366×854 then scaled down to fill its container
const IFRAME_WIDTH = 1366;

function scalePortfolioPreviews() {
  document.querySelectorAll('.portfolio-media').forEach((container) => {
    const iframe = container.querySelector('iframe');
    if (!iframe) return;
    const baseWidth = parseFloat(container.dataset.baseWidth) || IFRAME_WIDTH;
    const scale = container.offsetWidth / baseWidth;
    iframe.style.transform = `scale(${scale})`;
  });
}

if (document.querySelector('.portfolio-media iframe')) {
  scalePortfolioPreviews();
  window.addEventListener('resize', scalePortfolioPreviews, { passive: true });
}
