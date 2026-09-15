import { tokenStorage } from './authService';

const BASE_URL = 'http://localhost:8080/api';

// ── authenticated cart (logged-in users) ─────────────────────────────────
const authFetch = async (url, options = {}) => {
  const token = tokenStorage.get();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Cart request failed');
  return data.data;
};

export const fetchCart      = ()                         => authFetch('/cart');
export const addToCartApi   = (productId, quantity = 1)  => authFetch(`/cart/add?productId=${productId}&quantity=${quantity}`, { method: 'POST' });
export const updateCartApi  = (productId, quantity)      => authFetch(`/cart/update?productId=${productId}&quantity=${quantity}`, { method: 'PUT' });
export const removeFromCart = (productId)                => authFetch(`/cart/remove?productId=${productId}`, { method: 'DELETE' });
export const clearCartApi   = ()                         => authFetch('/cart/clear', { method: 'DELETE' });

// ── guest cart (no auth — identified by bf_guest_session HttpOnly cookie) ─
const guestFetch = async (url, options = {}) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: 'include',   // sends the bf_guest_session cookie automatically
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Cart request failed');
  return data.data;
};

export const fetchGuestCart        = ()                         => guestFetch('/guest-cart');
export const addToGuestCartApi     = (productId, quantity = 1)  => guestFetch(`/guest-cart/add?productId=${productId}&quantity=${quantity}`, { method: 'POST' });
export const updateGuestCartApi    = (productId, quantity)      => guestFetch(`/guest-cart/update?productId=${productId}&quantity=${quantity}`, { method: 'PUT' });
export const removeFromGuestCart   = (productId)                => guestFetch(`/guest-cart/remove?productId=${productId}`, { method: 'DELETE' });
export const clearGuestCartApi     = ()                         => guestFetch('/guest-cart/clear', { method: 'DELETE' });
export const mergeGuestCartOnLogin = ()                         => guestFetch('/guest-cart/merge', { method: 'POST',
  headers: { Authorization: `Bearer ${tokenStorage.get()}` } });
