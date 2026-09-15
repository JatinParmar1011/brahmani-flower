import { tokenStorage } from './authService';

const BASE_URL = 'http://localhost:8080/api';

const get = async (url) => {
  const res = await fetch(`${BASE_URL}${url}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

// Build multipart FormData from product fields + image File objects
const buildFormData = (payload, imageFiles) => {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== null && v !== undefined && k !== 'categoryIds') {
      fd.append(k, v);
    }
  });
  // categoryIds as repeated params
  (payload.categoryIds || []).forEach(id => fd.append('categoryIds', id));
  // attach actual File objects under key "images"
  (imageFiles || []).forEach(file => {
    if (file instanceof File) fd.append('images', file);
  });
  return fd;
};

const authMultipart = async (method, url, payload, imageFiles) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: { Authorization: `Bearer ${tokenStorage.get()}` },
    body: buildFormData(payload, imageFiles),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Request failed');
  return data.data;
};

export const fetchProducts = (page = 0, size = 12) =>
  get(`/products?page=${page}&size=${size}&sort=createdAt,desc`);

export const fetchProductsByCategory = (category, page = 0, size = 50) =>
  get(`/products/category/${encodeURIComponent(category)}?page=${page}&size=${size}`);

export const fetchProductsByCategoryName = (categoryName, page = 0, size = 50) =>
  get(`/products/by-category-name/${encodeURIComponent(categoryName)}?page=${page}&size=${size}`);

export const fetchProductById = (id) => get(`/products/${id}`);

// imageFiles = array of File objects (up to 5)
export const createProduct = (payload, imageFiles) =>
  authMultipart('POST', '/products', payload, imageFiles);

export const updateProduct = (id, payload, imageFiles) =>
  authMultipart('PUT', `/products/${id}`, payload, imageFiles);

export const deleteProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenStorage.get()}` },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};
