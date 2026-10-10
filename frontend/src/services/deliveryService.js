import { tokenStorage } from './authService';

const BASE_URL = 'http://localhost:8080/api';

/**
 * Perform an authenticated fetch, or unauthenticated if no token.
 */
const apiFetch = async (url, options = {}) => {
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

// ── Product Serviceability ─────────────────────────────────────────────────

/**
 * Check delivery availability for a single product.
 * PUBLIC — does not require authentication.
 *
 * @param {number} productId
 * @param {string} pincode - 6-digit pincode
 * @param {string} city - optional, required for CITY_BASED products
 * @returns {Promise<ServiceabilityResult>}
 */
export const checkProductServiceability = (productId, pincode, city = '') =>
  apiFetch('/delivery/serviceability/check', {
    method: 'POST',
    body: JSON.stringify({ productId, pincode, city: city || undefined }),
  });

// ── Cart Serviceability ────────────────────────────────────────────────────

/**
 * Check delivery availability for all cart items against an address.
 * Requires authentication.
 *
 * @param {number} addressId
 * @returns {Promise<CartServiceabilityResponse>}
 */
export const checkCartServiceability = (addressId) =>
  apiFetch('/delivery/cart/serviceability/check', {
    method: 'POST',
    body: JSON.stringify({ addressId }),
  });

// ── Shipment & Tracking ────────────────────────────────────────────────────

/**
 * Get shipment details for an order.
 * @param {number} orderId
 */
export const fetchOrderShipment = (orderId) =>
  apiFetch(`/orders/${orderId}/shipment`);

/**
 * Get live tracking for an order.
 * @param {number} orderId
 */
export const fetchOrderTracking = (orderId) =>
  apiFetch(`/orders/${orderId}/tracking`);

// ── Admin ──────────────────────────────────────────────────────────────────

export const fetchAdminOrderShipment = (orderId) =>
  apiFetch(`/admin/orders/${orderId}/shipment`);

export const fetchAdminOrderTracking = (orderId) =>
  apiFetch(`/admin/orders/${orderId}/tracking`);
