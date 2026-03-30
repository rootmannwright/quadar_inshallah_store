import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // ─── Adicionar item ───────────────────────────────────────
  const addToCart = useCallback((product, quantity = 1) => {
    setCart((prev) => {
      const exists = prev.items.find((i) => i.id === product.id);
      const items = exists
        ? prev.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [...prev.items, { ...product, quantity }];

      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items, total };
    });
  }, []);

  // ─── Remover item ─────────────────────────────────────────
  const removeFromCart = useCallback((productId) => {
    setCart((prev) => {
      const items = prev.items.filter((i) => i.id !== productId);
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items, total };
    });
  }, []);

  // ─── Atualizar quantidade ─────────────────────────────────
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCart((prev) => {
      const items = prev.items.map((i) =>
        i.id === productId ? { ...i, quantity } : i
      );
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items, total };
    });
  }, [removeFromCart]);

  // ─── Checkout ─────────────────────────────────────────────
  const checkout = useCallback(async (addressData) => {
    setLoading(true);
    setCheckoutError(null);
    try {
      const payload = {
        items: cart.items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        address: addressData,
      };
      const { data } = await api.post('/api/orders', payload);
      setCart({ items: [], total: 0 }); // limpa o carrinho após pedido
      return { success: true, order: data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao finalizar pedido';
      setCheckoutError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, checkout, loading, checkoutError, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);