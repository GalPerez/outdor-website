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

/* ---- Gallery Lightbox ---- */
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

document.querySelectorAll('.gallery__item').forEach(item => {
  item.addEventListener('click', () => {
    const src = item.dataset.src;
    const alt = item.querySelector('img').alt;
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.hidden = false;
    lightboxClose.focus();
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = '';
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
});

/* ---- File Input Preview with Remove ---- */
const filesInput = document.getElementById('form-files');
const filesPreview = document.getElementById('files-preview');
let selectedFiles = [];

if (filesInput) {
  filesInput.addEventListener('change', () => {
    Array.from(filesInput.files).forEach(f => {
      if (!selectedFiles.find(sf => sf.name === f.name && sf.size === f.size)) {
        selectedFiles.push(f);
      }
    });
    filesInput.value = '';
    renderFilesPreview();
  });
}

function renderFilesPreview() {
  if (!filesPreview) return;
  filesPreview.innerHTML = '';
  selectedFiles.forEach((f, i) => {
    const li = document.createElement('li');
    li.className = 'files-preview__item';
    li.innerHTML = `<span class="files-preview__name">${f.name}</span><button type="button" class="files-preview__remove" aria-label="הסר קובץ">✕</button>`;
    li.querySelector('button').addEventListener('click', () => {
      selectedFiles.splice(i, 1);
      renderFilesPreview();
    });
    filesPreview.appendChild(li);
  });

}

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

    /* Files size */
    const errFiles = document.getElementById('error-files');
    if (selectedFiles.length > 0) {
      const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 10 * 1024 * 1024) {
        if (errFiles) errFiles.textContent = 'גודל הקבצים חורג מ-10MB — אנא הקטן או צרף פחות קבצים';
        valid = false;
      } else {
        if (errFiles) errFiles.textContent = '';
      }
    }

    if (valid) {
      const success = document.getElementById('form-success');
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      const fd = new FormData(form);
      selectedFiles.forEach(f => fd.append('files', f));

      fetch('/', {
        method: 'POST',
        body: fd
      })
        .then(() => {
          form.reset();
          selectedFiles = [];
          renderFilesPreview();
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

/* ---- Footer year ---- */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
