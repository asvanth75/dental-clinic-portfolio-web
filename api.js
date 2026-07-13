/**
 * S.N Dental Clinic — Frontend API Client
 * All fetch calls to the Express backend go through here.
 * Base URL auto-detects: localhost:3001 when running locally.
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001/api'
  : '/api'; // same-origin when deployed

// ── Generic fetch helper ──────────────────────────

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaults = {
    headers: { 'Content-Type': 'application/json' },
  };
  const config = { ...defaults, ...options };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  try {
    const res  = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    console.error(`[API] ${options.method || 'GET'} ${endpoint} failed:`, err.message);
    throw err;
  }
}

// ── Public API ────────────────────────────────────

/** Submit an appointment and return { appointmentId, whatsappUrl } */
export async function bookAppointment(data) {
  return apiFetch('/appointments', { method: 'POST', body: data });
}

/** Send a contact/enquiry message */
export async function sendContactMessage(data) {
  return apiFetch('/contact', { method: 'POST', body: data });
}

/** Get dashboard stats */
export async function getStats() {
  return apiFetch('/stats');
}

/** Health ping — returns { status: 'ok' } */
export async function ping() {
  return apiFetch('/health');
}

// ── Admin API ─────────────────────────────────────

export async function listAppointments(statusFilter = null) {
  const qs = statusFilter ? `?status=${statusFilter}` : '';
  return apiFetch(`/appointments${qs}`);
}

export async function updateAppointmentStatus(id, status, notes) {
  return apiFetch(`/appointments/${id}`, { method: 'PATCH', body: { status, notes } });
}

export async function deleteAppointment(id) {
  return apiFetch(`/appointments/${id}`, { method: 'DELETE' });
}

export async function listContactMessages() {
  return apiFetch('/contact');
}

export async function markMessageRead(id) {
  return apiFetch(`/contact/${id}/read`, { method: 'PATCH' });
}
