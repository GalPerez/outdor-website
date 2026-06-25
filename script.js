/* =====================================================
   OUTDOR — script.js
   ===================================================== */

/* ---- Navbar: sticky shadow + hamburger ---- */
const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const navMenu    = document.getElementById('nav-menu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
});

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navMenu.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    const section = href !== '#' && document.querySelector(href);
    if (section) {
      e.preventDefault();
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* Close mobile menu when a link is clicked */
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* Close menu on Escape key */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navMenu.classList.contains('open')) {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.focus();
  }
});

/* ---- Gallery Lightbox ---- */
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev  = document.getElementById('lightbox-prev');
const lightboxNext  = document.getElementById('lightbox-next');

const baImages = Array.from(document.querySelectorAll('.ba-half img'));
let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  lightboxImg.src = baImages[index].src;
  lightboxImg.alt = baImages[index].alt;
  lightbox.hidden = false;
  lightboxClose.focus();
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = '';
  document.body.style.overflow = '';
}

function showPrev() {
  openLightbox((currentIndex - 1 + baImages.length) % baImages.length);
}

function showNext() {
  openLightbox((currentIndex + 1) % baImages.length);
}

baImages.forEach((img, i) => {
  img.closest('.ba-half').addEventListener('click', () => openLightbox(i));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrev);
lightboxNext.addEventListener('click', showNext);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showPrev();
  if (e.key === 'ArrowLeft')  showNext();
});

/* ---- FAQ Accordion ---- */
document.querySelectorAll('.faq__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded  = btn.getAttribute('aria-expanded') === 'true';
    const answerId  = btn.getAttribute('aria-controls');
    const answer    = document.getElementById(answerId);

    /* Collapse all */
    document.querySelectorAll('.faq__question').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.faq__answer').forEach(a => {
      a.hidden = true;
    });

    /* Open clicked (if was closed) */
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      answer.hidden = false;
    }
  });
});


/* ---- Quote Form Validation ---- */
const form = document.getElementById('quote-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    /* Name */
    const name = document.getElementById('form-name');
    const errName = document.getElementById('error-name');
    if (!name.value.trim()) {
      setError(name, errName, 'נא להזין שם מלא');
      valid = false;
    } else {
      clearError(name, errName);
    }

    /* Phone */
    const phone = document.getElementById('form-phone');
    const errPhone = document.getElementById('error-phone');
    const phonePattern = /^0[5-9]\d{8}$|^0[5-9]\d-\d{7}$|^0[5-9]\d{1}-\d{3}-\d{4}$/;
    const phoneClean = phone.value.replace(/[-\s]/g, '');
    if (!phoneClean) {
      setError(phone, errPhone, 'נא להזין מספר טלפון');
      valid = false;
    } else if (!/^0[5-9]\d{8}$/.test(phoneClean)) {
      setError(phone, errPhone, 'מספר טלפון לא תקין (לדוגמה: 0501234567)');
      valid = false;
    } else {
      clearError(phone, errPhone);
    }

    /* Service */
    const service = document.getElementById('form-service');
    const errService = document.getElementById('error-service');
    if (!service.value) {
      setError(service, errService, 'נא לבחור סוג עבודה');
      valid = false;
    } else {
      clearError(service, errService);
    }

    if (valid) {
      const success = document.getElementById('form-success');
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      fetch('/', {
        method: 'POST',
        body: new FormData(form)
      })
        .then(() => {
          form.reset();
          success.hidden = false;
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => { success.hidden = true; }, 6000);
        })
        .catch(() => {
          alert('שגיאה בשליחה. נסה שוב או צור קשר טלפוני.');
        })
        .finally(() => {
          submitBtn.disabled = false;
        });
    }
  });
}

function setError(input, errEl, msg) {
  input.classList.add('invalid');
  errEl.textContent = msg;
}
function clearError(input, errEl) {
  input.classList.remove('invalid');
  errEl.textContent = '';
}

/* ---- Scroll reveal ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

[
  { selector: '.section-header',    stagger: 0   },
  { selector: '.service-card',      stagger: 0   },
  { selector: '.about__text',       stagger: 0   },
  { selector: '.about__image',      stagger: 150 },
  { selector: '.stats__item',       stagger: 100 },
  { selector: '.testimonial-card',  stagger: 100 },
  { selector: '.ba-item',           stagger: 80  },
  { selector: '.faq__item',         stagger: 50  },
  { selector: '.quote__text',       stagger: 0   },
  { selector: '.quote__form',       stagger: 150 },
].forEach(({ selector, stagger }) => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    if (stagger) el.style.transitionDelay = `${i * stagger}ms`;
    revealObserver.observe(el);
  });
});

/* ---- Stats count-up ---- */
function animateCount(el, target, suffix, duration) {
  const start = performance.now();
  (function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  })(start);
}

const statsSection = document.querySelector('.stats');
if (statsSection) {
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    document.querySelectorAll('.stats__number').forEach(el => {
      const text = el.textContent.trim();
      if (text === '24/7') {
        animateCount(el, 24, '/7', 1200);
      } else {
        const m = text.match(/^(\d+)(.*)$/);
        if (m) animateCount(el, parseInt(m[1]), m[2], 1200);
      }
    });
    obs.disconnect();
  }, { threshold: 0.5 }).observe(statsSection);
}

/* ---- Floating buttons: remove focus after click ---- */
document.querySelectorAll('.whatsapp-btn, .phone-btn').forEach(btn => {
  btn.addEventListener('click', () => btn.blur());
});

/* ---- Footer year ---- */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
