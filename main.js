/* =====================================================
   MAIN JS — Global behaviors: nav, scroll, animations,
   WhatsApp widget, back-to-top, page loader
   ===================================================== */

// ── Page Loader ──────────────────────────────────────
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 600);
  }
});

// ── Navbar Scroll Behavior ────────────────────────────
const navbar = document.getElementById('navbar');
let lastScroll = 0;

function handleScroll() {
  const currentScroll = window.scrollY;

  if (currentScroll > 60) {
    navbar?.classList.add('scrolled');
    navbar?.classList.remove('transparent');
  } else {
    navbar?.classList.remove('scrolled');
    if (navbar?.dataset.transparent === 'true') {
      navbar?.classList.add('transparent');
    }
  }
  lastScroll = currentScroll;

  // Back to top
  const btt = document.getElementById('backToTop');
  if (btt) {
    btt.classList.toggle('visible', currentScroll > 400);
  }
}

window.addEventListener('scroll', handleScroll, { passive: true });

// ── Mobile Nav Toggle ─────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu?.classList.toggle('open');
});

// Close menu on link click
navMenu?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    navMenu?.classList.remove('open');
  });
});

// ── Active Nav Link ───────────────────────────────────
function setActiveNavLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html') ||
        (path === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
setActiveNavLink();

// ── Scroll Reveal (Intersection Observer) ─────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      // Optionally stop observing after first reveal
      // revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
  revealObserver.observe(el);
});

// ── Counter Animation ─────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target || el.textContent, 10);
  const duration = parseInt(el.dataset.duration || '2000', 10);
  const suffix   = el.dataset.suffix || '';
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(ease * target);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString() + suffix;
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = 'true';
      animateCounter(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

// ── Back To Top ───────────────────────────────────────
document.getElementById('backToTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── WhatsApp Chat Widget ──────────────────────────────
const WA_NUMBER  = '919843022094'; // Replace with actual WhatsApp number
const CLINIC_NAME = 'S.N Dental Clinic';
const WORKING_HOURS = {
  open:  9,   // 9 AM
  closeAM: 13, // 1 PM
  openPM:  16, // 4 PM
  closePM: 20  // 8 PM
};
const WORKING_DAYS = [1,2,3,4,5,6]; // Mon-Sat (0=Sun)

function isClinicOpen() {
  const now = new Date();
  const day  = now.getDay();
  const hour = now.getHours();
  if (!WORKING_DAYS.includes(day)) return false;
  return (hour >= WORKING_HOURS.open && hour < WORKING_HOURS.closeAM) ||
         (hour >= WORKING_HOURS.openPM && hour < WORKING_HOURS.closePM);
}

const waBtn    = document.getElementById('waBtn');
const waWidget = document.getElementById('waWidget');
const waClose  = document.getElementById('waClose');

waBtn?.addEventListener('click', () => {
  waWidget?.classList.toggle('open');
  if (waWidget?.classList.contains('open')) {
    initWaBot();
  }
});

waClose?.addEventListener('click', () => {
  waWidget?.classList.remove('open');
});

let botInitialized = false;
function initWaBot() {
  if (botInitialized) return;
  botInitialized = true;

  const msgs = document.getElementById('waMessages');
  const opts = document.getElementById('waOptions');
  if (!msgs || !opts) return;

  const openStatus = isClinicOpen()
    ? '🟢 We\'re open now!'
    : '🔴 Currently closed';

  addBotMsg(msgs, `Welcome to <strong>${CLINIC_NAME}</strong> 🦷<br><br>${openStatus}<br><br>How may we help you today?`);

  setTimeout(() => {
    opts.innerHTML = `
      <button class="wa-option" onclick="waHandleOption('appointment')">1️⃣ Book Appointment</button>
      <button class="wa-option" onclick="waHandleOption('timings')">2️⃣ Clinic Timings</button>
      <button class="wa-option" onclick="waHandleOption('treatments')">3️⃣ Treatment Info</button>
      <button class="wa-option" onclick="waHandleOption('emergency')">4️⃣ Emergency Support</button>
    `;
  }, 800);
}

function addBotMsg(container, html) {
  const el = document.createElement('div');
  el.className = 'wa-msg wa-msg-bot';
  el.innerHTML = html;
  container?.appendChild(el);
  container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
}

window.waHandleOption = function(option) {
  const msgs = document.getElementById('waMessages');
  const opts = document.getElementById('waOptions');
  const openLink = document.getElementById('waOpenLink');

  // User's reply
  const userMsgs = {
    appointment: '1️⃣ Book Appointment',
    timings: '2️⃣ Clinic Timings',
    treatments: '3️⃣ Treatment Info',
    emergency: '4️⃣ Emergency Support'
  };
  const userEl = document.createElement('div');
  userEl.className = 'wa-msg wa-msg-user';
  userEl.textContent = userMsgs[option];
  msgs?.appendChild(userEl);
  msgs?.scrollTo({ top: msgs.scrollHeight, behavior: 'smooth' });

  opts.innerHTML = '';

  setTimeout(() => {
    if (option === 'appointment') {
      if (!isClinicOpen()) {
        addBotMsg(msgs, `Thank you for contacting <strong>${CLINIC_NAME}</strong>.<br><br>We are currently <strong>closed</strong>.<br><br>⏰ Working Hours:<br>Mon–Sat: 9:00 AM–1:00 PM & 4:00 PM–8:00 PM<br>Sun: Closed<br><br>We'll respond once we reopen! 😊`);
      } else {
        addBotMsg(msgs, `Great! Click below to chat directly on WhatsApp and book your appointment. Our team will confirm the slot. 📅`);
      }
      if (openLink) openLink.style.display = 'flex';
    } else if (option === 'timings') {
      addBotMsg(msgs, `⏰ <strong>Clinic Timings:</strong><br><br>🗓️ Monday – Saturday<br>Morning: 9:00 AM – 1:00 PM<br>Evening: 4:00 PM – 8:00 PM<br><br>🚫 Sunday: Closed<br><br>📍 #30, D B Road, R.S. Puram, Coimbatore`);
      opts.innerHTML = `<button class="wa-option" onclick="waHandleOption('back')">⬅️ Back to Menu</button>`;
    } else if (option === 'treatments') {
      addBotMsg(msgs, `🦷 <strong>Our Treatments:</strong><br><br>✅ Dental Implants<br>✅ Periodontal Flap Surgery<br>✅ Teeth Whitening<br>✅ Braces & Aligners<br>✅ Crowns & Bridges<br>✅ Root Canal<br>✅ Dental Cleaning<br>✅ Wisdom Tooth Extraction<br><br>For detailed info, click below to chat!`);
      if (openLink) openLink.style.display = 'flex';
    } else if (option === 'emergency') {
      addBotMsg(msgs, `🚨 <strong>Dental Emergency?</strong><br><br>For emergencies, please call us directly or chat on WhatsApp. We'll assist you immediately!<br><br>📞 Click the button below to connect.`);
      if (openLink) openLink.style.display = 'flex';
    } else if (option === 'back') {
      botInitialized = false;
      msgs.innerHTML = '';
      if (openLink) openLink.style.display = 'none';
      initWaBot();
    }
  }, 600);
};

// Build WA link
document.getElementById('waOpenLink')?.addEventListener('click', (e) => {
  const msg = encodeURIComponent(`Hi! I'm interested in booking an appointment at ${CLINIC_NAME}. Please help me.`);
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
});

// ── Toast Notification ────────────────────────────────
window.showToast = function(message, type = 'success', duration = 4000) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.success}</span>
    <span class="toast-msg">${message}</span>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
};

// ── Smooth Scroll for Anchor Links ────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Lightbox (simple inline) ─────────────────────────
window.openLightbox = function(src, caption) {
  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:3000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;cursor:pointer;`;
    lb.innerHTML = `<img id="lb-img" style="max-width:90vw;max-height:80vh;border-radius:12px;object-fit:contain;">
      <p id="lb-cap" style="color:white;font-size:0.9rem;text-align:center;"></p>
      <button style="position:absolute;top:20px;right:20px;background:rgba(255,255,255,0.2);border:none;color:white;width:44px;height:44px;border-radius:50%;font-size:1.3rem;cursor:pointer;" onclick="document.getElementById('lightbox').remove()">✕</button>`;
    lb.addEventListener('click', e => { if (e.target === lb) lb.remove(); });
    document.body.appendChild(lb);
  }
  document.getElementById('lb-img').src = src;
  document.getElementById('lb-cap').textContent = caption || '';
};

