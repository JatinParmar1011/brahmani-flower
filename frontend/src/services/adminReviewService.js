import { tokenStorage } from './authService';

const BASE_URL = 'http://localhost:8080/api';

const authFetch = async (url, options = {}) => {
  const token = tokenStorage.get();
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
  return data.data;
};

/** Fetch paginated reviews for the admin panel, filtered by status. */
export const adminFetchApprovedReviews = (page = 0, size = 20, status = 'APPROVED') =>
  authFetch(`/admin/reviews?status=${status}&page=${page}&size=${size}&sort=createdAt,desc`);

/** Fetch paginated reviews with ANY status (admin sees all). */
export const adminFetchAllReviews = (page = 0, size = 20) =>
  authFetch(`/admin/reviews?status=ALL&page=${page}&size=${size}&sort=createdAt,desc`);

/** Fetch current featured reviews (ordered by featuredOrder). */
export const adminFetchFeaturedReviews = () =>
  authFetch('/admin/reviews/featured');

/**
 * Moderate a review (REJECT / HIDE / APPROVE).
 * @param {number} reviewId
 * @param {'REJECT'|'HIDE'|'APPROVE'} action
 * @param {string} reason  optional reason for reject/hide
 */
export const adminModerateReview = (reviewId, action, reason = '') =>
  authFetch(`/admin/reviews/${reviewId}/moderate`, {
    method: 'PATCH',
    body: JSON.stringify({ action, reason: reason || undefined }),
  });
export const adminToggleFeatured = (reviewId, featured) =>
  authFetch(`/admin/reviews/${reviewId}/feature`, {
    method: 'PATCH',
    body: JSON.stringify({ featured }),
  });

/**
 * Bulk-update featured order.
 * @param {{ reviewId: number, featuredOrder: number }[]} orders
 */
export const adminUpdateFeaturedOrder = (orders) =>
  authFetch('/admin/reviews/featured/order', {
    method: 'PUT',
    body: JSON.stringify({ orders }),
  });

/** Public — fetch featured reviews for the homepage. */
export const fetchFeaturedReviews = async () => {
  const res = await fetch(`${BASE_URL}/reviews/featured`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load featured reviews');
  return data.data;
};
