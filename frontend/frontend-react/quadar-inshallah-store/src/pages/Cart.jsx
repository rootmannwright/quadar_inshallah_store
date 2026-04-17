import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import "../styles/cart.css";

const TAX_RATE = 0.1;
const SHIPPING_FLAT = 25.0;
const BASE_URL = "http://localhost:5000";
const GUEST_KEY = "guestCart";

// ─── CSRF ─────────────────────────────────────────────────────────────────────

async function fetchCsrf() {
  try {
    const res = await fetch(`${BASE_URL}/api/csrf-token`, { credentials: "include" });
    const data = await res.json();
    return data.csrfToken ?? "";
  } catch {
    return "";
  }
}

// ─── Guest cart helpers (localStorage) ───────────────────────────────────────

function getGuestCart() {
  try { return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]"); }
  catch { return []; }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

// Formats server cart items into frontend-friendly structure
function normalizeServerItems(rawItems = []) {
  return rawItems
    .filter((i) => i.product)
    .map((i) => ({
      _id: i.product._id,
      name: i.product.name,
      price: Number(i.product.price) || 0,
      image: i.product.image ?? null,
      description: i.product.description ?? "",
      category: i.product.category ?? i.product.brand ?? "",
      qty: i.qty,
    }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QtyControl({ qty, onIncrease, onDecrease }) {
  return (
    <div className="cart-qty">
      <button onClick={onDecrease} aria-label="Diminuir">−</button>
      <span>{qty}</span>
      <button onClick={onIncrease} aria-label="Aumentar">+</button>
    </div>
  );
}

function CartItem({ item, onRemove, onUpdateQty }) {
  const price = Number(item.price) || 0;
  const qty = item.qty || 1;
  const imgSrc = item.image
    ? item.image.startsWith("http") ? item.image : `/images/${item.image.split("/").pop()}`
    : null;

  return (
    <motion.div
      className="cart-item"
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="cart-item-img-wrap">
        {imgSrc
          ? <img src={imgSrc} alt={item.name || "Produto"} className="cart-item-img" />
          : <div className="cart-item-img-placeholder" />
        }
      </div>

      <div className="cart-item-info">
        {item.category && <p className="cart-item-category">{item.category}</p>}
        <p className="cart-item-name">{item.name || "Produto sem nome"}</p>
        {item.description && <p className="cart-item-desc">{item.description}</p>}

        <div className="cart-item-bottom">
          <QtyControl
            qty={qty}
            onIncrease={() => onUpdateQty(item._id, qty + 1)}
            onDecrease={() => qty <= 1 ? onRemove(item._id) : onUpdateQty(item._id, qty - 1)}
          />
          <span className="cart-item-price">
            R${(price * qty).toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      <button className="cart-item-remove" onClick={() => onRemove(item._id)} aria-label="Remover">
        ✕
      </button>
    </motion.div>
  );
}

function OrderSummary({ subtotal, onCheckout, isGuest }) {
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal > 0 ? SHIPPING_FLAT : 0;
  const total = subtotal + tax + shipping;
  const fmt = (v) => `R$${v.toFixed(2).replace(".", ",")}`;

  return (
    <div className="cart-summary">
      <h2 className="cart-summary-title">Resumo do pedido</h2>

      <div className="cart-summary-rows">
        <div className="cart-summary-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
        <div className="cart-summary-row"><span>Impostos (10%)</span><span>{fmt(tax)}</span></div>
        <div className="cart-summary-row">
          <span>Frete</span>
          <span>{subtotal > 0 ? fmt(shipping) : "—"}</span>
        </div>
      </div>

      <div className="cart-summary-total"><span>Total</span><span>{fmt(total)}</span></div>

      <button
        className="cart-checkout-btn"
        onClick={onCheckout}
        disabled={subtotal === 0}
      >
        {isGuest ? "Entrar para finalizar" : "Finalizar compra"}
      </button>

      {isGuest && (
        <p className="cart-guest-notice">
          Você precisa fazer login para concluir a compra.
        </p>
      )}

      <Link to="/products" className="cart-continue-link">← Continuar comprando</Link>
    </div>
  );
}

function EmptyCart() {
  return (
    <motion.div
      className="cart-empty"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="cart-empty-icon">🛍</p>
      <p className="cart-empty-text">Seu carrinho está vazio.</p>
      <Link to="/products" className="cart-empty-link">Ver produtos</Link>
    </motion.div>
  );
}

// ─── Cart (root) ──────────────────────────────────────────────────────────────

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isGuest = !user;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch cart ──────────────────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isGuest) {
        setItems(getGuestCart());
      } else {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/api/cart`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Erro ${res.status}`);

        const data = await res.json();
        const raw = data?.cart?.items ?? data?.items ?? [];
        setItems(normalizeServerItems(raw));
      }
    } catch (err) {
      console.error("[FETCH CART]", err);
      setError("Não foi possível carregar o carrinho.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // ── Update qty ──────────────────────────────────────────────────────────────
  const handleUpdateQty = async (productId, newQty) => {
    if (isGuest) {
      const updated = getGuestCart().map((i) =>
        i._id === productId ? { ...i, qty: newQty } : i
      );
      saveGuestCart(updated);
      setItems(updated);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const csrfToken = await fetchCsrf();

      await fetch(`${BASE_URL}/api/cart/remove/${productId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      });

      await fetch(`${BASE_URL}/api/cart/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ productId, qty: newQty }),
      });

      fetchCart();
    } catch (err) {
      console.error("[UPDATE QTY]", err);
    }
  };

  // ── Remove item ─────────────────────────────────────────────────────────────
  const handleRemove = async (productId) => {
    if (isGuest) {
      const updated = getGuestCart().filter((i) => i._id !== productId);
      saveGuestCart(updated);
      setItems(updated);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const csrfToken = await fetchCsrf();

      await fetch(`${BASE_URL}/api/cart/remove/${productId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      });

      fetchCart();
    } catch (err) {
      console.error("[REMOVE]", err);
    }
  };

  // Checkout redirect for /payment
  const handleCheckout = () => {
    if (isGuest) {
      navigate("/login");
      return;
    }

    const formattedItems = items.map((i) => ({
      id: i._id,
      name: i.name,
      price: Number(i.price) || 0,
      image: i.image,
      description: i.description,
      quantity: i.qty,
    }));

    // salva fallback correto
    localStorage.setItem("checkoutItems", JSON.stringify(formattedItems));

    navigate("/payment", {
      state: { items: formattedItems },
    });
  };
  // ── Computed ────────────────────────────────────────────────────────────────
  const subtotal = items.reduce((acc, i) => acc + (Number(i.price) || 0) * (i.qty || 1), 0);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="cart-page">
      <motion.h1
        className="cart-title"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        Carrinho
        {items.length > 0 && (
          <span className="cart-count">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </span>
        )}
      </motion.h1>

      {loading && (
        <div className="cart-loading">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="cart-skeleton" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="cart-error">{error}</p>
      )}

      {!loading && !error && items.length === 0 && <EmptyCart />}

      {!loading && !error && items.length > 0 && (
        <div className="cart-layout">
          <div className="cart-items">
            <div className="cart-items-header">
              <span>Produto</span>
              <span>Total</span>
            </div>
            <AnimatePresence>
              {items.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onRemove={handleRemove}
                  onUpdateQty={handleUpdateQty}
                />
              ))}
            </AnimatePresence>
          </div>

          <OrderSummary
            subtotal={subtotal}
            onCheckout={handleCheckout}
            isGuest={isGuest}
          />
        </div>
      )}
    </div>
  );
}