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
  resetZoom();
  lightbox.hidden = false;
  lightboxClose.focus();
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.hidden = true;
  resetZoom();
  lightboxImg.src = '';
  document.body.style.overflow = '';
}

function showPrev() {
  openLightbox((currentIndex - 1 + baImages.length) % baImages.length);
}

function showNext() {
  openLightbox((currentIndex + 1) % baImages.length);
}

if (lightbox) {
  baImages.forEach((img, i) => {
    img.closest('.ba-half').addEventListener('click', () => openLightbox(i));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
}
/* ---- Lightbox zoom (+/- buttons, wheel, double-click, pinch, drag to pan) ---- */
const ZOOM_MIN = 1, ZOOM_MAX = 4, ZOOM_STEP = 0.5;
let zoom = 1, panX = 0, panY = 0;
let zoomInBtn = null, zoomOutBtn = null, zoomLevel = null;

function clampPan() {
  if (!lightboxImg) return;
  const maxX = (lightboxImg.offsetWidth  * (zoom - 1)) / 2;
  const maxY = (lightboxImg.offsetHeight * (zoom - 1)) / 2;
  panX = Math.max(-maxX, Math.min(maxX, panX));
  panY = Math.max(-maxY, Math.min(maxY, panY));
}

function applyZoom() {
  if (!lightboxImg) return;
  lightboxImg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  lightbox.classList.toggle('is-zoomed', zoom > 1);
  if (zoomInBtn)  zoomInBtn.disabled  = zoom >= ZOOM_MAX;
  if (zoomOutBtn) zoomOutBtn.disabled = zoom <= ZOOM_MIN;
  if (zoomLevel)  zoomLevel.textContent = Math.round(zoom * 100) + '%';
}

function setZoom(z) {
  zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
  if (zoom === ZOOM_MIN) { panX = 0; panY = 0; }
  clampPan();
  applyZoom();
}

function resetZoom() { zoom = 1; panX = 0; panY = 0; applyZoom(); }

if (lightbox) {
  const bar = document.createElement('div');
  bar.className = 'lightbox__zoom';
  bar.innerHTML =
    '<button type="button" class="lightbox__zoom-btn" data-zoom="out" aria-label="הקטנת תמונה"><i class="fa-solid fa-minus" aria-hidden="true"></i></button>' +
    '<span class="lightbox__zoom-level" aria-live="polite">100%</span>' +
    '<button type="button" class="lightbox__zoom-btn" data-zoom="in" aria-label="הגדלת תמונה"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>';
  lightbox.appendChild(bar);
  zoomOutBtn = bar.querySelector('[data-zoom="out"]');
  zoomInBtn  = bar.querySelector('[data-zoom="in"]');
  zoomLevel  = bar.querySelector('.lightbox__zoom-level');
  zoomInBtn.addEventListener('click',  () => setZoom(zoom + ZOOM_STEP));
  zoomOutBtn.addEventListener('click', () => setZoom(zoom - ZOOM_STEP));

  lightboxImg.addEventListener('dblclick', () => setZoom(zoom > 1 ? 1 : 2));
  lightbox.addEventListener('wheel', e => {
    e.preventDefault();
    setZoom(zoom + (e.deltaY < 0 ? 0.25 : -0.25));
  }, { passive: false });

  // Drag to pan (mouse/touch) and pinch to zoom (two fingers)
  const pointers = new Map();
  let lastX = 0, lastY = 0, pinchDist = 0, pinchZoom = 1;
  lightboxImg.addEventListener('pointerdown', e => {
    lightboxImg.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    lastX = e.clientX; lastY = e.clientY;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      pinchZoom = zoom;
    }
  });
  lightboxImg.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinchDist) {
      const [a, b] = [...pointers.values()];
      setZoom(pinchZoom * (Math.hypot(a.x - b.x, a.y - b.y) / pinchDist));
    } else if (pointers.size === 1 && zoom > 1) {
      panX += e.clientX - lastX; panY += e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      clampPan(); applyZoom();
    }
  });
  const endPointer = e => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchDist = 0;
    if (pointers.size === 1) { const [p] = [...pointers.values()]; lastX = p.x; lastY = p.y; }
  };
  lightboxImg.addEventListener('pointerup', endPointer);
  lightboxImg.addEventListener('pointercancel', endPointer);
  lightboxImg.addEventListener('dragstart', e => e.preventDefault());
}

document.addEventListener('keydown', e => {
  if (!lightbox || lightbox.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showPrev();
  if (e.key === 'ArrowLeft')  showNext();
  if (e.key === '+' || e.key === '=') setZoom(zoom + ZOOM_STEP);
  if (e.key === '-') setZoom(zoom - ZOOM_STEP);
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

      const leadData = {
        name:         document.getElementById('form-name').value.trim(),
        phone:        document.getElementById('form-phone').value.trim(),
        project_type: document.getElementById('form-service').value,
        property_type: (document.getElementById('form-property') || {}).value || '',
        address:      (document.getElementById('form-city')    || {}).value || '',
        notes:        [
                        (document.getElementById('form-property') || {}).value ? 'סוג נכס: ' + document.getElementById('form-property').value : '',
                        (document.getElementById('form-message') || {}).value || ''
                      ].filter(Boolean).join(' | '),
        landing_page: location.pathname,
        lead_source:  'אתר'
      };

      fetch('/', {
        method: 'POST',
        body: new FormData(form)
      })
        .then(() => {
          form.reset();
          success.hidden = false;
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => { success.hidden = true; }, 6000);
          if (typeof gtag === 'function') gtag('event', 'SUBMIT_LEAD_FORM');
          if (typeof fbq === 'function') fbq('track', 'Lead');
          fetch('https://crm.spiritlabs.ai/api/leads/403d3bd3f80944aeaecaf4520fc4f40961c1f03662f544be9329981939bcfd69', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
          }).catch(() => {});
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
      if (el.hasAttribute('data-static')) return;
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

/* ---- GA4 click tracking ---- */
function trackClick(eventName) {
  if (typeof gtag === 'function') gtag('event', eventName);
  if (typeof fbq === 'function' && /^(phone|whatsapp)_click/.test(eventName)) fbq('track', 'Contact', { method: eventName.split('_')[0] });
}

document.querySelectorAll('a[href^="tel:"]').forEach(el =>
  el.addEventListener('click', () => trackClick(el.classList.contains('phone-btn') ? 'phone_click_floating' : 'phone_click_contact'))
);
document.querySelectorAll('a[href^="https://wa.me"]').forEach(el =>
  el.addEventListener('click', () => trackClick(el.classList.contains('whatsapp-btn') ? 'whatsapp_click_floating' : 'whatsapp_click_contact'))
);
document.querySelector('a[aria-label="אינסטגרם OUTDOR"]')          ?.addEventListener('click', () => trackClick('instagram_click'));
document.querySelector('a[aria-label="פייסבוק OUTDOR"]')           ?.addEventListener('click', () => trackClick('facebook_click'));
document.querySelector('a[aria-label="יוטיוב OUTDOR"]')            ?.addEventListener('click', () => trackClick('youtube_click'));
document.querySelector('a[aria-label="טיקטוק OUTDOR"]')            ?.addEventListener('click', () => trackClick('tiktok_click'));

/* ---- Landing pages: always open at the top ---- */
if (document.querySelector('.hero--page') && !location.hash) {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  window.addEventListener('load', () => window.scrollTo(0, 0));
}
