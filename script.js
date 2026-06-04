/* =====================================================
   DR. PRADEEP AGRAWAL — Premium Doctor Portfolio
   script.js  |  Vanilla JS  |  All interactivity
   ===================================================== */

'use strict';

// ── Helpers ────────────────────────────────────────────
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── Navbar: scroll behaviour + active links ─────────────
const navbar   = $('#navbar');
const hamburger = $('#hamburger');
const navLinks  = $('#navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNav();
  toggleScrollTop();
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close mobile menu when a link is clicked
$$('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

function updateActiveNav() {
  const sections  = $$('section[id]');
  const scrollPos = window.scrollY + navbar.offsetHeight + 80;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id     = section.getAttribute('id');
    const link   = $(`.nav-link[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active', scrollPos >= top && scrollPos < bottom);
    }
  });
}

// ── Smooth scroll for all anchor links ─────────────────
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const target = document.getElementById(id);
  if (target) {
    e.preventDefault();
    const offset = navbar.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
});

// ── Scroll-reveal (IntersectionObserver) ───────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

$$('.reveal').forEach(el => revealObserver.observe(el));

// ── Animated counters ───────────────────────────────────
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);

      // Also trigger stat bar fill
      const bar = entry.target.closest('.stat-card')?.querySelector('.stat-fill');
      if (bar) setTimeout(() => bar.classList.add('animated'), 200);
    }
  });
}, { threshold: 0.5 });

$$('.stat-num').forEach(el => counterObserver.observe(el));

function animateCounter(el) {
  const target  = parseFloat(el.dataset.target);
  const suffix  = el.dataset.suffix || '';
  const decimal = parseInt(el.dataset.decimal || 0);
  const duration = 1800;
  const start    = performance.now();

  const step = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const value    = target * ease;

    el.textContent = decimal
      ? value.toFixed(decimal) + suffix
      : Math.round(value).toLocaleString() + suffix;

    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = (decimal ? target.toFixed(decimal) : target.toLocaleString()) + suffix;
  };
  requestAnimationFrame(step);
}

// ── Testimonial Slider ──────────────────────────────────
const track    = $('#testimonialTrack');
const cards    = $$('.testimonial-card', track);
const dotsWrap = $('#testiDots');
const prevBtn  = $('#testiPrev');
const nextBtn  = $('#testiNext');

let currentSlide  = 0;
let visibleCount  = getVisibleCount();
const totalSlides = Math.ceil(cards.length / visibleCount);
let autoTimer;

function getVisibleCount() {
  return window.innerWidth < 768 ? 1 : 2;
}

function buildDots() {
  dotsWrap.innerHTML = '';
  const count = Math.ceil(cards.length / getVisibleCount());
  for (let i = 0; i < count; i++) {
    const btn = document.createElement('button');
    btn.className = 'testi-dot' + (i === currentSlide ? ' active' : '');
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    btn.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(btn);
  }
}

function updateSlider() {
  const vc      = getVisibleCount();
  const cardW   = cards[0].offsetWidth + 24; // width + gap
  const offset  = currentSlide * vc * cardW;
  track.style.transform = `translateX(-${offset}px)`;
  $$('.testi-dot', dotsWrap).forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

function goToSlide(idx) {
  const maxSlide = Math.ceil(cards.length / getVisibleCount()) - 1;
  currentSlide = Math.max(0, Math.min(idx, maxSlide));
  updateSlider();
}

function nextSlide() {
  const maxSlide = Math.ceil(cards.length / getVisibleCount()) - 1;
  currentSlide = currentSlide >= maxSlide ? 0 : currentSlide + 1;
  updateSlider();
}

function prevSlide() {
  const maxSlide = Math.ceil(cards.length / getVisibleCount()) - 1;
  currentSlide = currentSlide <= 0 ? maxSlide : currentSlide - 1;
  updateSlider();
}

prevBtn.addEventListener('click', () => { prevSlide(); resetAuto(); });
nextBtn.addEventListener('click', () => { nextSlide(); resetAuto(); });

function startAuto() { autoTimer = setInterval(nextSlide, 4500); }
function resetAuto()  { clearInterval(autoTimer); startAuto(); }

// Touch swipe support
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) { dx < 0 ? nextSlide() : prevSlide(); resetAuto(); }
});

// Re-initialize on resize
window.addEventListener('resize', () => {
  visibleCount = getVisibleCount();
  currentSlide = 0;
  buildDots();
  updateSlider();
}, { passive: true });

// Init slider
buildDots();
updateSlider();
startAuto();

// ── FAQ Accordion ───────────────────────────────────────
$$('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // Close all
    $$('.faq-question').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    // Toggle clicked
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

// ── Appointment Form ────────────────────────────────────
const form        = $('#appointmentForm');
const successModal = $('#successModal');
const modalClose   = $('#modalClose');
const modalDetails = $('#modalDetails');

// Set minimum date to today
const dateInput = $('#prefDate');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

function showError(fieldId, errId, msg) {
  const field = document.getElementById(fieldId);
  const err   = document.getElementById(errId);
  if (field) field.classList.add('error');
  if (err)   err.textContent = msg;
}

function clearErrors() {
  $$('.form-group input, .form-group select').forEach(f => f.classList.remove('error'));
  $$('.field-err').forEach(e => e.textContent = '');
}

function validateForm(data) {
  let valid = true;
  clearErrors();

  if (!data.fullName || data.fullName.trim().length < 2) {
    showError('fullName', 'errFullName', 'Please enter your full name.');
    valid = false;
  }
  const phoneRegex = /^[6-9]\d{9}$|^\+\d{10,14}$/;
  const cleanPhone = data.phone.replace(/\s+/g, '');
  if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
    showError('phone', 'errPhone', 'Enter a valid 10-digit Indian phone number.');
    valid = false;
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    showError('email', 'errEmail', 'Enter a valid email address.');
    valid = false;
  }
  if (!data.age || data.age < 1 || data.age > 120) {
    showError('age', 'errAge', 'Enter a valid age between 1 and 120.');
    valid = false;
  }
  if (!data.gender) {
    showError('gender', 'errGender', 'Please select your gender.');
    valid = false;
  }
  if (!data.prefDate) {
    showError('prefDate', 'errPrefDate', 'Please select a preferred date.');
    valid = false;
  }
  if (!data.prefTime) {
    showError('prefTime', 'errPrefTime', 'Please select a preferred time slot.');
    valid = false;
  }
  if (!data.reason || data.reason.trim().length < 3) {
    showError('reason', 'errReason', 'Please briefly describe your reason for visit.');
    valid = false;
  }
  return valid;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = {
    fullName : $('#fullName').value.trim(),
    phone    : $('#phone').value.trim(),
    email    : $('#email').value.trim(),
    age      : parseInt($('#age').value),
    gender   : $('#gender').value,
    prefDate : $('#prefDate').value,
    prefTime : $('#prefTime').value,
    reason   : $('#reason').value.trim(),
  };
  if (!validateForm(data)) return;

  // Format date nicely
  const dateObj = new Date(data.prefDate + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeLabel = data.prefTime === 'morning' ? 'Morning (9 AM – 1 PM)' : 'Evening (5 PM – 9 PM)';
  const genderLabel = { male: 'Male', female: 'Female', other: 'Other' }[data.gender];

  modalDetails.innerHTML = `
    <div style="display:grid;gap:8px">
      <p><strong>Patient:</strong> ${escHtml(data.fullName)} (${genderLabel}, Age ${data.age})</p>
      <p><strong>Phone:</strong> ${escHtml(data.phone)}</p>
      ${data.email ? `<p><strong>Email:</strong> ${escHtml(data.email)}</p>` : ''}
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time Slot:</strong> ${timeLabel}</p>
      <p><strong>Reason:</strong> ${escHtml(data.reason)}</p>
    </div>
  `;

  successModal.classList.add('open');
  form.reset();
});

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

modalClose.addEventListener('click', () => successModal.classList.remove('open'));
successModal.addEventListener('click', e => {
  if (e.target === successModal) successModal.classList.remove('open');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') successModal.classList.remove('open');
});

// ── Scroll-to-top button ────────────────────────────────
const scrollTopBtn = $('#scrollTop');
function toggleScrollTop() {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
}
scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Input real-time error clearing ─────────────────────
$$('.form-group input, .form-group select').forEach(el => {
  el.addEventListener('input', () => {
    el.classList.remove('error');
    const errEl = document.getElementById('err' + el.id.charAt(0).toUpperCase() + el.id.slice(1));
    if (errEl) errEl.textContent = '';
  });
});

// ── Footer links smooth scroll ──────────────────────────
// (already handled by the global anchor-click listener above)

// ── Init on load ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateActiveNav();
  toggleScrollTop();
});
