import { tokenStorage } from './authService';

const BASE_URL = 'http://localhost:8080/api';

// ── Helpers ────────────────────────────────────────────────────────────────

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${tokenStorage.get()}`,
});

const jsonHeaders = () => ({
  'Content-Type': 'application/json',
});

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

// ── Customer API ──────────────────────────────────────────────────────────

/**
 * Submit a new contact enquiry.
 * Works for both guests (no token) and authenticated customers (token sent).
 *
 * @param {Object} payload - { fullName, email, phone, subject, category, message }
 * @returns {Promise<Object>} API data containing the saved enquiry
 */
export async function submitContactEnquiry(payload) {
  const token = tokenStorage.get();
  const headers = token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : jsonHeaders();

  const res = await fetch(`${BASE_URL}/contact-enquiries`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// ── Admin APIs ────────────────────────────────────────────────────────────

/**
 * Fetch paginated + filtered list of enquiries.
 *
 * @param {Object} params - { search, status, category, priority, from, to, page, size, sort }
 */
export async function adminGetEnquiries(params = {}) {
  const qs = new URLSearchParams();
  if (params.search)   qs.set('search',   params.search);
  if (params.status)   qs.set('status',   params.status);
  if (params.category) qs.set('category', params.category);
  if (params.priority) qs.set('priority', params.priority);
  if (params.from)     qs.set('from',     params.from);
  if (params.to)       qs.set('to',       params.to);
  qs.set('page', params.page  ?? 0);
  qs.set('size', params.size  ?? 20);
  qs.set('sort', params.sort  ?? 'createdAt,desc');

  const res = await fetch(`${BASE_URL}/admin/contact-enquiries?${qs}`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  return handleResponse(res);
}

/**
 * Fetch a single enquiry by id.
 */
export async function adminGetEnquiry(id) {
  const res = await fetch(`${BASE_URL}/admin/contact-enquiries/${id}`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  return handleResponse(res);
}

/**
 * Update status of an enquiry.
 * @param {number} id
 * @param {string} status - EnquiryStatus enum value
 */
export async function adminUpdateEnquiryStatus(id, status) {
  const res = await fetch(`${BASE_URL}/admin/contact-enquiries/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

/**
 * Update priority of an enquiry.
 * @param {number} id
 * @param {string} priority - EnquiryPriority enum value
 */
export async function adminUpdateEnquiryPriority(id, priority) {
  const res = await fetch(`${BASE_URL}/admin/contact-enquiries/${id}/priority`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ priority }),
  });
  return handleResponse(res);
}

/**
 * Admin: send a reply email to the customer.
 * @param {number} id - enquiry id
 * @param {{ emailSubject: string, emailBody: string, newStatus: string }} payload
 */
export async function adminSendReply(id, payload) {
  const res = await fetch(`${BASE_URL}/admin/contact-enquiries/${id}/reply`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Admin: get full history (replies + status changes) for an enquiry.
 * @param {number} id - enquiry id
 */
export async function adminGetEnquiryHistory(id) {
  const res = await fetch(`${BASE_URL}/admin/contact-enquiries/${id}/history`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  return handleResponse(res);
}
