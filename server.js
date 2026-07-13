/**
 * S.N Dental Clinic — Express Backend API
 * Port: 3001
 *
 * Routes:
 *   POST /api/appointments      — Create appointment
 *   GET  /api/appointments      — List appointments
 *   PATCH /api/appointments/:id — Update status
 *   DELETE /api/appointments/:id
 *
 *   POST /api/contact           — Contact message
 *   GET  /api/contact           — List messages
 *
 *   GET  /api/stats             — Dashboard summary
 *   GET  /api/health            — Health check
 */

const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const { randomUUID } = require('crypto');

const app  = express();
const PORT = 3001;

// ── Middleware ────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all static frontend files from root
app.use(express.static(path.join(__dirname)));

// Request logger
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[${new Date().toLocaleTimeString('en-IN')}] ${req.method} ${req.url}`);
  }
  next();
});

// ── JSON File DB ──────────────────────────────────
const DB_DIR  = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const init = { appointments: [], contacts: [], settings: { clinicName: 'S.N Dental Clinic', doctorName: 'Dr. Srihari', phone: '+91 98430 22094', landline: '0422-2541647', email: 'drsrihari@sndental.in' } };
      fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2));
      return init;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    console.error('DB read error:', e.message);
    return { appointments: [], contacts: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function generateId(prefix = 'SN') {
  return `${prefix}-${Date.now().toString().slice(-6)}-${randomUUID().slice(0,4).toUpperCase()}`;
}

// ── Health Check ──────────────────────────────────
app.get('/api/health', (req, res) => {
  const db = readDB();
  res.json({
    status: 'ok',
    server: 'S.N Dental Clinic API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    appointments: db.appointments.length,
    contacts: db.contacts.length,
  });
});

// ── Appointments ──────────────────────────────────

// Create appointment
app.post('/api/appointments', (req, res) => {
  const { name, phone, email, age, gender, date, session, time, issue, notes } = req.body;

  if (!name || !phone || !date || !time || !issue) {
    return res.status(400).json({ error: 'Missing required fields: name, phone, date, time, issue' });
  }
  if (!/^[6-9]\d{9}$/.test(phone.replace(/[\s+\-()]/g, ''))) {
    return res.status(400).json({ error: 'Invalid Indian mobile number' });
  }

  const id = generateId('SN');
  const appointment = {
    id,
    appointmentId: id,
    name: name.trim(),
    phone: phone.trim(),
    email: (email || '').trim(),
    age: age || null,
    gender: gender || null,
    date,
    session: session || null,
    time,
    issue,
    notes: (notes || '').trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const db = readDB();
  db.appointments.unshift(appointment);
  writeDB(db);

  console.log(`✅ Appointment created: ${id} — ${name} @ ${time} on ${date}`);

  res.status(201).json({
    success: true,
    message: 'Appointment request received. Clinic will confirm within 30 minutes.',
    appointment,
    whatsappUrl: `https://wa.me/919843022094?text=${encodeURIComponent(
      `Hi Dr. Srihari 👋\n\nI'd like to book an appointment.\n\n📋 *ID:* ${id}\n👤 *Name:* ${name}\n📅 *Date:* ${new Date(date).toDateString()}\n⏰ *Time:* ${time}\n🦷 *Issue:* ${issue}\n\nPlease confirm my slot. Thank you!`
    )}`,
  });
});

// Get all appointments (with optional status filter)
app.get('/api/appointments', (req, res) => {
  const db = readDB();
  let appts = db.appointments;
  if (req.query.status) appts = appts.filter(a => a.status === req.query.status);
  if (req.query.date)   appts = appts.filter(a => a.date === req.query.date);
  res.json({ success: true, count: appts.length, appointments: appts });
});

// Get single appointment
app.get('/api/appointments/:id', (req, res) => {
  const db   = readDB();
  const appt = db.appointments.find(a => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  res.json({ success: true, appointment: appt });
});

// Update appointment status
app.patch('/api/appointments/:id', (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }
  const db  = readDB();
  const idx = db.appointments.findIndex(a => a.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Appointment not found' });
  if (status) db.appointments[idx].status = status;
  if (notes !== undefined) db.appointments[idx].adminNotes = notes;
  db.appointments[idx].updatedAt = new Date().toISOString();
  writeDB(db);
  console.log(`🔄 Appointment ${req.params.id} → ${status}`);
  res.json({ success: true, appointment: db.appointments[idx] });
});

// Delete appointment
app.delete('/api/appointments/:id', (req, res) => {
  const db  = readDB();
  const idx = db.appointments.findIndex(a => a.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Appointment not found' });
  db.appointments.splice(idx, 1);
  writeDB(db);
  console.log(`🗑️  Appointment deleted: ${req.params.id}`);
  res.json({ success: true, message: 'Appointment deleted' });
});

// ── Contact Messages ──────────────────────────────

app.post('/api/contact', (req, res) => {
  const { name, phone, email, subject, message } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, phone, and message are required' });
  }
  const contact = {
    id: generateId('MSG'),
    name:    name.trim(),
    phone:   phone.trim(),
    email:   (email || '').trim(),
    subject: subject || 'General Inquiry',
    message: message.trim(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  const db = readDB();
  db.contacts.unshift(contact);
  writeDB(db);
  console.log(`📩 Contact message from ${name}`);
  res.status(201).json({ success: true, message: 'Message received! We\'ll get back to you within 24 hours.', contact });
});

app.get('/api/contact', (req, res) => {
  const db = readDB();
  res.json({ success: true, count: db.contacts.length, messages: db.contacts });
});

app.patch('/api/contact/:id/read', (req, res) => {
  const db  = readDB();
  const idx = db.contacts.findIndex(c => c.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Message not found' });
  db.contacts[idx].read = true;
  writeDB(db);
  res.json({ success: true });
});

// ── Stats Dashboard ───────────────────────────────

app.get('/api/stats', (req, res) => {
  const db    = readDB();
  const appts = db.appointments;
  const today = new Date().toISOString().slice(0, 10);
  res.json({
    success: true,
    stats: {
      total:     appts.length,
      pending:   appts.filter(a => a.status === 'pending').length,
      confirmed: appts.filter(a => a.status === 'confirmed').length,
      completed: appts.filter(a => a.status === 'completed').length,
      cancelled: appts.filter(a => a.status === 'cancelled').length,
      today:     appts.filter(a => a.date === today).length,
      messages:  db.contacts.length,
      unread:    db.contacts.filter(c => !c.read).length,
    },
  });
});

// ── Settings ──────────────────────────────────────

app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json({ success: true, settings: db.settings || {} });
});

// ── Catch-all: serve index.html for non-API routes ─
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔═════════════════════════════════════════════╗');
  console.log('║   🦷  S.N DENTAL CLINIC — SERVER RUNNING    ║');
  console.log('╠═════════════════════════════════════════════╣');
  console.log(`║  Frontend  →  http://localhost:${PORT}          ║`);
  console.log(`║  API Base  →  http://localhost:${PORT}/api      ║`);
  console.log('║                                             ║');
  console.log('║  Endpoints:                                 ║');
  console.log('║    GET  /api/health                         ║');
  console.log('║    POST /api/appointments                   ║');
  console.log('║    GET  /api/appointments                   ║');
  console.log('║    POST /api/contact                        ║');
  console.log('║    GET  /api/stats                          ║');
  console.log('║                                             ║');
  console.log(`║  Data stored in: data/db.json               ║`);
  console.log('╚═════════════════════════════════════════════╝');
  console.log('');
});

