import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { tokenStorage } from '../services/authService';
import {
  fetchCart, addToCartApi, updateCartApi, removeFromCart, clearCartApi,
  fetchGuestCart, addToGuestCartApi, updateGuestCartApi,
  removeFromGuestCart, clearGuestCartApi, mergeGuestCartOnLogin,
} from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const fromApi = (item) => ({
  id:             item.productId,
  cartItemId:     item.cartItemId,
  name:           item.productName,
  imageUrl:       item.imageUrl || null,
  price:          Number(item.price),
  originalPrice:  Number(item.originalPrice || item.price),
  subtotal:       Number(item.subtotal || 0),
  qty:            item.quantity,
  stockWarning:   item.stockWarning || false,
  availableStock: item.availableStock ?? null,
  tag:            '',
  category:       '',
});

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems]           = useState([]);
  const [cartTotal, setCartTotal]   = useState(0);  // authoritative backend totalAmount
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);
  const prevUserRef = useRef(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // applies a full API response — always sets both items AND cartTotal together
  const applyResponse = useCallback((data) => {
    setItems((data.items || []).map(fromApi));
    setCartTotal(Number(data.totalAmount ?? 0));
  }, []);

  const isLoggedIn = () => !!tokenStorage.get();

  // ── load server cart (authenticated) ─────────────────────────────────────
  const loadServerCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCart();
      applyResponse(data);
    } catch {
      setItems([]); setCartTotal(0);
    } finally {
      setLoading(false);
    }
  }, [applyResponse]);

  // ── load guest cart (server-side, cookie-identified) ─────────────────────
  const loadGuestCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchGuestCart();
      applyResponse(data);
    } catch {
      setItems([]); setCartTotal(0);
    } finally {
      setLoading(false);
    }
  }, [applyResponse]);

  // ── react to auth state changes ───────────────────────────────────────────
  useEffect(() => {
    const wasLoggedIn   = !!prevUserRef.current;
    const isNowLoggedIn = !!user;
    prevUserRef.current = user;

    if (!wasLoggedIn && isNowLoggedIn) {
      mergeGuestCartOnLogin()
        .then(data => applyResponse(data))
        .catch(() => loadServerCart());
      return;
    }

    if (wasLoggedIn && !isNowLoggedIn) {
      loadGuestCart();
      return;
    }

    if (isNowLoggedIn) {
      loadServerCart();
    } else {
      loadGuestCart();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── add item ──────────────────────────────────────────────────────────────
  const addItem = useCallback(async (product) => {
    if (!isLoggedIn()) {
      try {
        const data = await addToGuestCartApi(product.id, 1);
        applyResponse(data);
      } catch (e) {
        showToast(e.message || 'Failed to add item to cart.');
      }
      return;
    }
    try {
      const data = await addToCartApi(product.id, 1);
      applyResponse(data);
    } catch (e) {
      showToast(e.message || 'Failed to add item to cart.');
    }
  }, [applyResponse, showToast]);

  // ── update quantity ───────────────────────────────────────────────────────
  const updateQty = useCallback(async (productId, qty) => {
    if (!isLoggedIn()) {
      try {
        const data = await updateGuestCartApi(productId, qty);
        applyResponse(data);
      } catch (e) {
        showToast(e.message || 'Failed to update quantity.');
      }
      return;
    }
    try {
      const data = await updateCartApi(productId, qty);
      applyResponse(data);
    } catch (e) {
      showToast(e.message || 'Failed to update quantity.');
    }
  }, [applyResponse, showToast]);

  // ── remove item ───────────────────────────────────────────────────────────
  const removeItem = useCallback(async (productId) => {
    if (!isLoggedIn()) {
      try {
        const data = await removeFromGuestCart(productId);
        applyResponse(data);
      } catch (e) {
        showToast(e.message || 'Failed to remove item.');
      }
      return;
    }
    try {
      const data = await removeFromCart(productId);
      applyResponse(data);
    } catch (e) {
      showToast(e.message || 'Failed to remove item.');
    }
  }, [applyResponse, showToast]);

  // ── clear cart ────────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    if (!isLoggedIn()) {
      try { await clearGuestCartApi(); setItems([]); setCartTotal(0); } catch (e) {
        showToast(e.message || 'Failed to clear cart.');
      }
      return;
    }
    try { await clearCartApi(); setItems([]); setCartTotal(0); } catch (e) {
      showToast(e.message || 'Failed to clear cart.');
    }
  }, [showToast]);

  const itemCount = items.length;

  return (
    <CartContext.Provider value={{
      items, cartTotal, itemCount, loading, toast,
      addItem, updateQty, removeItem, clearCart,
      reload: isLoggedIn() ? loadServerCart : loadGuestCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
