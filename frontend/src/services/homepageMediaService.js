import { tokenStorage } from './authService';

const BASE_URL = 'http://localhost:8080/api';

// Fixed homepage sections the admin manages.
export const HOMEPAGE_SECTIONS = {
  SLIDER: 'SLIDER',
  CITY_DELIVERY: 'CITY_DELIVERY',
  ADVERTISE: 'ADVERTISE',
  SPOTLIGHT: 'SPOTLIGHT',
};

const authHeaders = () => ({
  Authorization: `Bearer ${tokenStorage.get()}`,
});

// Parse a fetch Response safely — returns the API payload or throws a helpful error.
const parse = async (res) => {
  let data = null;
  try {
    data = await res.json();
  } catch {
    if (res.status === 401 || res.status === 403) {
      throw new Error('Not authorized. Please sign in as an admin again.');
    }
    throw new Error(`Request failed (${res.status})`);
  }
  if (!data.success) throw new Error(data.message || `Request failed (${res.status})`);
  return data.data;
};

const buildForm = (media) => {
  const fd = new FormData();
  fd.append('section', media.section);
  fd.append('title', media.title || '');
  fd.append('displayOrder', media.displayOrder ?? 0);
  if (media.status) fd.append('status', media.status);
  if (media.mediaFile) fd.append('file', media.mediaFile);
  return fd;
};

// ── Public ──────────────────────────────────────────────────────────────────

// All active homepage media (flat list, each carrying its section)
export const fetchHomepageMedia = async () =>
  parse(await fetch(`${BASE_URL}/homepage-media`));

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminFetchHomepageMedia = async () =>
  parse(await fetch(`${BASE_URL}/admin/homepage-media`, { headers: authHeaders() }));

// media: { section, title, displayOrder, status, mediaFile }
export const adminCreateHomepageMedia = async (media) =>
  parse(await fetch(`${BASE_URL}/admin/homepage-media`, {
    method: 'POST',
    headers: authHeaders(),
    body: buildForm(media),
  }));

// media: { section, title, displayOrder, status, mediaFile? }  — mediaFile optional
export const adminUpdateHomepageMedia = async (id, media) =>
  parse(await fetch(`${BASE_URL}/admin/homepage-media/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: buildForm(media),
  }));

export const adminDeleteHomepageMedia = async (id) =>
  parse(await fetch(`${BASE_URL}/admin/homepage-media/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }));
