import { tokenStorage } from './authService';

const BASE_URL = 'http://localhost:8080/api';

const authFetch = async (url, options = {}) => {
  const token = tokenStorage.get();
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
  return data.data;
};

/** Fetch paginated approved reviews for a product. Public. */
export const fetchProductReviews = (productId, page = 0, size = 10, sort = 'createdAt,desc', rating = '', withImages = false) => {
  let url = `/products/${productId}/reviews?page=${page}&size=${size}&sort=${sort}`;
  // Note: backend doesn't yet support rating/withImages query params — these are
  // applied client-side in the Reviews page component.
  return authFetch(url);
};

/** Fetch review summary (average, count, distribution) for a product. Public. */
export const fetchReviewSummary = (productId) =>
  authFetch(`/products/${productId}/reviews/summary`);

/**
 * Submit a review with optional images.
 * Uses FormData (multipart/form-data).
 * @param {number} productId
 * @param {{ rating, title, reviewText, orderItemId }} reviewData
 * @param {File[]} imageFiles - array of File objects (max 5)
 */
export const submitReview = async (productId, reviewData, imageFiles = []) => {
  const token = tokenStorage.get();

  const formData = new FormData();
  // Attach review JSON as a Blob part named "review"
  formData.append(
    'review',
    new Blob([JSON.stringify(reviewData)], { type: 'application/json' })
  );
  imageFiles.forEach((file) => {
    formData.append('images', file);
  });

  const res = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Do NOT set Content-Type — browser sets it with boundary for multipart
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to submit review');
  return data.data;
};

/** Get the authenticated customer's review for a product (null if none). */
export const fetchMyReview = (productId) =>
  authFetch(`/products/${productId}/reviews/my`);

/** Check review eligibility for a product. */
export const checkReviewEligibility = (productId) =>
  authFetch(`/products/${productId}/reviews/eligible`);

/**
 * Update an existing review (replaces images).
 * Uses FormData (multipart/form-data) — same shape as submitReview.
 */
export const updateReview = async (productId, reviewData, imageFiles = []) => {
  const token = tokenStorage.get();

  const formData = new FormData();
  formData.append(
    'review',
    new Blob([JSON.stringify(reviewData)], { type: 'application/json' })
  );
  imageFiles.forEach((file) => {
    formData.append('images', file);
  });

  const res = await fetch(`${BASE_URL}/products/${productId}/reviews/my`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update review');
  return data.data;
};
