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

// ── Customer order APIs ───────────────────────────────────────────────────

export const checkoutApi = (addressId, idempotencyKey) =>
  authFetch('/orders/checkout', {
    method: 'POST',
    body: JSON.stringify({ addressId, idempotencyKey }),
  });

export const fetchMyOrders = (page = 0, size = 10) =>
  authFetch(`/orders/my-orders?page=${page}&size=${size}&sort=createdAt,desc`);

export const fetchOrderById = (id) =>
  authFetch(`/orders/${id}`);

export const fetchOrderHistory = (id) =>
  authFetch(`/orders/${id}/history`);

// ── Admin order APIs ──────────────────────────────────────────────────────

export const fetchAllOrders = (page = 0, size = 20, status = '') => {
  const statusParam = status && status !== 'All' ? `&status=${status}` : '';
  return authFetch(`/orders?page=${page}&size=${size}${statusParam}`);
};

export const fetchAdminOrderDetail = (id) =>
  authFetch(`/orders/admin/${id}`);

export const updateOrderStatusApi = (id, status, reason = '') =>
  authFetch(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });

// ── Admin inventory APIs ──────────────────────────────────────────────────

export const adjustStockApi = (productId, transactionType, quantity, notes = '') =>
  authFetch(`/inventory/${productId}/adjust`, {
    method: 'POST',
    body: JSON.stringify({ transactionType, quantity, notes }),
  });

export const fetchInventoryTransactions = (productId, page = 0, size = 20) =>
  authFetch(`/inventory/${productId}/transactions?page=${page}&size=${size}`);

export const fetchRecentOrders = (size = 5) =>
  authFetch(`/orders?page=0&size=${size}`);
