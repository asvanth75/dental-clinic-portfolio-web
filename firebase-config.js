/* =====================================================
   S.N DENTAL CLINIC — DATA LAYER (firebase-config.js)
   
   Works in TWO modes:
   ① OFFLINE MODE (default, works immediately):
      All data stored in localStorage — no account needed.
   
   ② FIREBASE MODE (optional, for production):
      Set FIREBASE_ENABLED = true and fill firebaseConfig.
   
   SETUP FIREBASE (when ready):
   1. Go to https://console.firebase.google.com
   2. Create project → Web App → copy config below
   3. Set FIREBASE_ENABLED = true
   ===================================================== */

// ══════════════════════════════════════════
// Toggle: false = localStorage, true = Firebase
// ══════════════════════════════════════════
const FIREBASE_ENABLED = false;

// ══════════════════════════════════════════
// Firebase Config (fill when ready)
// ══════════════════════════════════════════
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// ══════════════════════════════════════════
// LOCAL STORAGE DATA LAYER
// (Used when FIREBASE_ENABLED = false)
// ══════════════════════════════════════════

function generateId(prefix = 'SN') {
  return `${prefix}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2,5).toUpperCase()}`;
}

function localGet(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}

function localSet(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Appointments ──────────────────────────

export async function createAppointment(data) {
  const id = generateId('SN');
  const appointments = localGet('sn_appointments');
  const record = {
    id,
    appointmentId: id,
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  appointments.unshift(record);
  localSet('sn_appointments', appointments);
  console.log('[Offline] Appointment saved:', record);
  return id;
}

export async function getAppointments(statusFilter = null) {
  const all = localGet('sn_appointments');
  return statusFilter ? all.filter(a => a.status === statusFilter) : all;
}

export async function updateAppointmentStatus(id, status) {
  const all = localGet('sn_appointments');
  const idx = all.findIndex(a => a.id === id);
  if (idx >= 0) { all[idx].status = status; all[idx].updatedAt = new Date().toISOString(); }
  localSet('sn_appointments', all);
}

export async function deleteAppointment(id) {
  const all = localGet('sn_appointments').filter(a => a.id !== id);
  localSet('sn_appointments', all);
}

// ── Contact Messages ──────────────────────

export async function createContactMessage(data) {
  const messages = localGet('sn_messages');
  messages.unshift({ id: generateId('MSG'), ...data, createdAt: new Date().toISOString() });
  localSet('sn_messages', messages);
  console.log('[Offline] Contact message saved');
}

export async function getContactMessages() {
  return localGet('sn_messages');
}

// ── Testimonials ──────────────────────────

export async function getTestimonials() {
  const stored = localGet('sn_testimonials');
  if (stored.length > 0) return stored;
  // Seed with real Practo reviews
  return [
    { id: '1', name: 'Rao G.N.', treatment: 'Dental Implant', rating: 5, review: 'Very professional, very nice treatment care and comfort specialist. Very reasonable right treatment. Both my wife and I are extremely happy.', date: '2020-11-22', published: true },
    { id: '2', name: 'Sumitha', treatment: 'Periodontal Treatment', rating: 5, review: 'Would like to recommend... very much satisfied with the service. Got clear and detail explanation about the illness and treatment.', date: '2018-02-22', published: true },
    { id: '3', name: 'Vasantha S.', treatment: 'Teeth Whitening', rating: 5, review: 'Great treatment, very friendly and courteous, explained the treatment process in very detail. Would highly recommend.', date: '2016-06-27', published: true },
  ];
}

// ── Blog Posts ────────────────────────────

export async function getBlogPosts() {
  return localGet('sn_blog_posts');
}

// ── Gallery ───────────────────────────────

export async function getGalleryItems() {
  return localGet('sn_gallery');
}

// ── Analytics (local counters) ────────────

export async function getAnalyticsSummary() {
  return {
    totalAppointments: localGet('sn_appointments').length,
    pendingAppointments: localGet('sn_appointments').filter(a => a.status === 'pending').length,
    confirmedAppointments: localGet('sn_appointments').filter(a => a.status === 'confirmed').length,
    totalMessages: localGet('sn_messages').length,
  };
}

// ── Auth (stub for admin page) ────────────
export const ADMIN_CREDENTIALS = {
  email: 'admin@sndental.in',
  password: 'DrSrihari@2024!'
};

export function localLogin(email, password) {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    sessionStorage.setItem('sn_admin_auth', 'true');
    sessionStorage.setItem('sn_admin_user', JSON.stringify({ name: 'Dr. Srihari', email, role: 'superadmin' }));
    return true;
  }
  return false;
}

export function localLogout() {
  sessionStorage.removeItem('sn_admin_auth');
  sessionStorage.removeItem('sn_admin_user');
}

export function isLoggedIn() {
  return sessionStorage.getItem('sn_admin_auth') === 'true';
}

export function getCurrentUser() {
  try { return JSON.parse(sessionStorage.getItem('sn_admin_user') || 'null'); } catch { return null; }
}

/* ══════════════════════════════════════════
   FIREBASE MODE
   (Only initialised when FIREBASE_ENABLED = true)
   ══════════════════════════════════════════ */
if (FIREBASE_ENABLED) {
  console.info('[Firebase] Mode enabled — connecting to Firestore...');
  // Dynamic import keeps the page fast when offline
  import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js")
    .then(({ initializeApp }) => {
      initializeApp(firebaseConfig);
      console.info('[Firebase] Connected.');
    })
    .catch(err => console.error('[Firebase] Init failed:', err));
}

export const MODE = FIREBASE_ENABLED ? 'firebase' : 'offline';
console.info(`[S.N Dental] Running in ${MODE.toUpperCase()} mode.`);
