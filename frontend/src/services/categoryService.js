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
    if (res.status === 401 || res.status === 403) {
      throw new Error('Not authorized. Please sign in as an admin again.');
    }
    throw new Error(`Request failed (${res.status})`);
  }
  if (!data.success) throw new Error(data.message || `Request failed (${res.status})`);
  return data.data;
};

// ── Public ──────────────────────────────────────────────────────────────────

export const fetchCategoryTypes = async () => {
  const res = await fetch(`${BASE_URL}/categories/types`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const fetchCategoriesByTypeId = async (typeId) => {
  const res = await fetch(`${BASE_URL}/categories/type/${typeId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const fetchCategories = async (typeName) => {
  const res = await fetch(`${BASE_URL}/categories/${typeName}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

// ── Admin : Category Types ─────────────────────────────────────────────────

export const adminFetchCategoryTypes = async () =>
  parse(await fetch(`${BASE_URL}/admin/categories/types`, { headers: authHeaders() }));

export const adminCreateCategoryType = async (type) => {
  const fd = new FormData();
  fd.append('categoryTypeName', type.categoryTypeName);
  if (type.categoryTypeDescription) fd.append('categoryTypeDescription', type.categoryTypeDescription);
  if (type.status) fd.append('status', type.status);
  return parse(await fetch(`${BASE_URL}/admin/categories/types`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  }));
};

export const adminUpdateCategoryType = async (id, type) => {
  const fd = new FormData();
  fd.append('categoryTypeName', type.categoryTypeName);
  if (type.categoryTypeDescription) fd.append('categoryTypeDescription', type.categoryTypeDescription);
  if (type.status) fd.append('status', type.status);
  return parse(await fetch(`${BASE_URL}/admin/categories/types/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: fd,
  }));
};

// ── Admin : Categories ──────────────────────────────────────────────────────

export const adminFetchAllCategories = async () =>
  parse(await fetch(`${BASE_URL}/admin/categories`, { headers: authHeaders() }));

export const adminFetchCategoriesByType = async (typeId) =>
  parse(await fetch(`${BASE_URL}/admin/categories/type/${typeId}`, { headers: authHeaders() }));

// category: { categoryTypeId, categoryName, categoryDescription, categoryDisplayOrder, status, imageFile? }
export const adminCreateCategory = async (category) => {
  const fd = new FormData();
  fd.append('categoryTypeId', category.categoryTypeId);
  fd.append('categoryName', category.categoryName);
  if (category.categoryDescription) fd.append('categoryDescription', category.categoryDescription);
  fd.append('categoryDisplayOrder', category.categoryDisplayOrder ?? 0);
  if (category.status) fd.append('status', category.status);
  if (category.imageFile) fd.append('image', category.imageFile);
  return parse(await fetch(`${BASE_URL}/admin/categories`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  }));
};

// category: { categoryTypeId, categoryName, categoryDescription, categoryDisplayOrder, status, imageFile? }
export const adminUpdateCategory = async (id, category) => {
  const fd = new FormData();
  fd.append('categoryTypeId', category.categoryTypeId);
  fd.append('categoryName', category.categoryName);
  if (category.categoryDescription) fd.append('categoryDescription', category.categoryDescription);
  fd.append('categoryDisplayOrder', category.categoryDisplayOrder ?? 0);
  if (category.status) fd.append('status', category.status);
  if (category.imageFile) fd.append('image', category.imageFile);
  return parse(await fetch(`${BASE_URL}/admin/categories/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: fd,
  }));
};

export const adminDeleteCategory = async (id) =>
  parse(await fetch(`${BASE_URL}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }));
