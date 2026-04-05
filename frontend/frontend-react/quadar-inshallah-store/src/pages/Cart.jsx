import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import "../styles/cart.css";

const TAX_RATE = 0.1;
const SHIPPING_FLAT = 25.0;

// Controle de quantidade
function QtyControl({ qty, onIncrease, onDecrease }) {
  return (
    <div className="cart-qty">
      <button onClick={onDecrease} aria-label="Diminuir">−</button>
      <span>{qty}</span>
      <button onClick={onIncrease} aria-label="Aumentar">+</button>
    </div>
  );
}

// Item do carrinho
function CartItem({ item, onRemove, onUpdateQty }) {
  const price = Number(item.price) || 0;
  const qty = item.qty || 1;

  // Corrige o caminho da imagem para funcionar sempre
  const imgSrc = item.image
    ? item.image.startsWith("http")
      ? item.image
      : `/images/${item.image.split("/").pop()}`
    : null;

  return (
    <AnimatePresence>
      <motion.div
        className="cart-item"
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="cart-item-img-wrap">
          {imgSrc ? (
            <img src={imgSrc} alt={item.name || "Produto"} className="cart-item-img" />
          ) : (
            <div className="cart-item-img-placeholder" />
          )}
        </div>

        <div className="cart-item-info">
          <p className="cart-item-category">{item.category || item.brand || "Categoria"}</p>
          <p className="cart-item-name">{item.name || "Produto sem nome"}</p>
          <p className="cart-item-desc">{item.description || ""}</p>

          <div className="cart-item-bottom">
            <QtyControl
              qty={qty}
              onIncrease={() => onUpdateQty(item._id, qty + 1)}
              onDecrease={() => {
                if (qty <= 1) onRemove(item._id);
                else onUpdateQty(item._id, qty - 1);
              }}
            />
            <span className="cart-item-price">
              R${(price * qty).toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>

        <button
          className="cart-item-remove"
          onClick={() => onRemove(item._id)}
          aria-label="Remover item"
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

// Resumo do pedido
function OrderSummary({ subtotal, onCheckout }) {
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal > 0 ? SHIPPING_FLAT : 0;
  const total = subtotal + tax + shipping;
  const fmt = (v) => `R$${v.toFixed(2).replace(".", ",")}`;

  return (
    <div className="cart-summary">
      <h2 className="cart-summary-title">Resumo do pedido</h2>

      <div className="cart-summary-rows">
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>
        <div className="cart-summary-row">
          <span>Impostos (10%)</span>
          <span>{fmt(tax)}</span>
        </div>
        <div className="cart-summary-row">
          <span>Frete</span>
          <span>{subtotal > 0 ? fmt(shipping) : "—"}</span>
        </div>
      </div>

      <div className="cart-summary-total">
        <span>Total</span>
        <span>{fmt(total)}</span>
      </div>

      <button
        className="cart-checkout-btn"
        onClick={onCheckout}
        disabled={subtotal === 0}
      >
        Finalizar compra
      </button>

      <a href="/products" className="cart-continue-link">
        ← Continuar comprando
      </a>
    </div>
  );
}

// Carrinho vazio
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
      <a href="/products" className="cart-empty-link">Ver produtos</a>
    </motion.div>
  );
}

// Componente principal
export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pega carrinho
      const cartRes = await fetch("http://localhost:5000/api/cart", { credentials: "include" });
      if (!cartRes.ok) throw new Error("Erro ao carregar o carrinho");
      const cartData = await cartRes.json();
      const cartArray = Array.isArray(cartData) ? cartData : cartData.items ?? [];

      // Pega produtos
      const productsRes = await fetch("http://localhost:5000/api/products");
      if (!productsRes.ok) throw new Error("Erro ao carregar os produtos");
      const productsData = await productsRes.json();

      // Combina produtos com carrinho
      const cartItems = cartArray.map(cartItem => {
        const product = productsData.find(p => p._id === cartItem.productId);
        if (!product) return null;
        return {
          ...product,
          qty: cartItem.qty,
          price: Number(product.price) || 0,
        };
      }).filter(Boolean);

      setItems(cartItems);
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQty = async (productId, newQty) => {
    try {
      await fetch(`http://localhost:5000/api/cart/remove/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, qty: newQty }),
      });
      await fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await fetch(`http://localhost:5000/api/cart/remove/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      await fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = () => {
    window.location.href = "/checkout";
  };

  const subtotal = items.reduce((acc, i) => acc + (Number(i.price) || 0) * (i.qty || 1), 0);

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

      {loading && <p>Carregando carrinho...</p>}
      {error && <p className="cart-error">Erro: {error}</p>}
      {!loading && !error && items.length === 0 && <EmptyCart />}

      {!loading && !error && items.length > 0 && (
        <div className="cart-layout">
          <div className="cart-items">
            <div className="cart-items-header">
              <span>Produto</span>
              <span>Total</span>
            </div>
            {items.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onRemove={handleRemove}
                onUpdateQty={handleUpdateQty}
              />
            ))}
          </div>
          <OrderSummary subtotal={subtotal} onCheckout={handleCheckout} />
        </div>
      )}
    </div>
  );
}