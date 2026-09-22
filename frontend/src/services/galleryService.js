import { tokenStorage } from './authService';

const BASE_URL = 'http://localhost:8080/api';

const authHeaders = () => ({
  Authorization: `Bearer ${tokenStorage.get()}`,
});

// Parse a fetch Response safely — returns the API payload or throws a helpful error.
const parse = async (res) => {
  let data = null;
  try {
    data = await res.json();
  } catch {
    // Empty / non-JSON body (e.g. 403/500 with no body)
    if (res.status === 401 || res.status === 403) {
      throw new Error('Not authorized. Please sign in as an admin again.');
    }
    throw new Error(`Request failed (${res.status})`);
  }
  if (!data.success) throw new Error(data.message || `Request failed (${res.status})`);
  return data.data;
};

const buildCategoryForm = (category) => {
  const fd = new FormData();
  fd.append('name', category.name);
  fd.append('description', category.description || '');
  fd.append('displayOrder', category.displayOrder ?? 0);
  if (category.status) fd.append('status', category.status);
  return fd;
};

// ── Public ──────────────────────────────────────────────────────────────────

// All active photos across all categories (flat, each carrying category name)
export const fetchGallery = async () =>
  parse(await fetch(`${BASE_URL}/gallery`));

// All active categories
export const fetchGalleryCategories = async () =>
  parse(await fetch(`${BASE_URL}/gallery/categories`));

// ── Admin : Categories (CRUD) ─────────────────────────────────────────────────

export const adminFetchCategories = async () =>
  parse(await fetch(`${BASE_URL}/admin/gallery/categories`, { headers: authHeaders() }));

// category: { name, description, displayOrder, status }
export const adminCreateCategory = async (category) =>
  parse(await fetch(`${BASE_URL}/admin/gallery/categories`, {
    method: 'POST',
    headers: authHeaders(),
    body: buildCategoryForm(category),
  }));

export const adminUpdateCategory = async (id, category) =>
  parse(await fetch(`${BASE_URL}/admin/gallery/categories/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: buildCategoryForm(category),
  }));

export const adminDeleteCategory = async (id) =>
  parse(await fetch(`${BASE_URL}/admin/gallery/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }));

// ── Admin : Photos ─────────────────────────────────────────────────────────────

export const adminFetchPhotos = async () =>
  parse(await fetch(`${BASE_URL}/admin/gallery/photos`, { headers: authHeaders() }));

// photo: { categoryId, name, description, imageFile }
export const adminCreatePhoto = async (photo) => {
  const fd = new FormData();
  fd.append('categoryId', photo.categoryId);
  fd.append('name', photo.name);
  fd.append('description', photo.description || '');
  fd.append('image', photo.imageFile);

  return parse(await fetch(`${BASE_URL}/admin/gallery/photos`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  }));
};

// photo: { categoryId, name, description, imageFile? }  — imageFile optional (keeps existing image if omitted)
export const adminUpdatePhoto = async (id, photo) => {
  const fd = new FormData();
  fd.append('categoryId', photo.categoryId);
  fd.append('name', photo.name);
  fd.append('description', photo.description || '');
  if (photo.imageFile) fd.append('image', photo.imageFile);

  return parse(await fetch(`${BASE_URL}/admin/gallery/photos/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: fd,
  }));
};

export const adminDeletePhoto = async (id) =>
  parse(await fetch(`${BASE_URL}/admin/gallery/photos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }));
