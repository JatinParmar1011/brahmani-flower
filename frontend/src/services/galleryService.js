const BASE_URL = 'http://localhost:8080/api';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const fetchGallery = async () => {
  const res = await fetch(`${BASE_URL}/gallery`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const adminFetchGallery = async () => {
  const res = await fetch(`${BASE_URL}/admin/gallery`, { headers: authHeaders() });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const adminCreateGalleryItem = async (formData) => {
  const res = await fetch(`${BASE_URL}/admin/gallery`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const adminUpdateGalleryItem = async (id, formData) => {
  const res = await fetch(`${BASE_URL}/admin/gallery/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const adminDeleteGalleryItem = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/gallery/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
};
