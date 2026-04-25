import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import api from "../api";
import "../styles/products.css";

// Framer Motion variants
const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const GUEST_CART_KEY = "guestCart";

function getGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function addToGuestCart(product) {
  const cart = getGuestCart();
  const existing = cart.find((i) => i._id === product._id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveGuestCart(cart);
  return cart;
}

function countGuestCart() {
  return getGuestCart().reduce((sum, i) => sum + i.qty, 0);
}

// Cart Drawer component
function CartDrawer({ open, onClose, items, onRemove, onCheckout }) {
  const total = items.reduce((sum, item) => {
    const price = item.price ?? item.product?.price ?? 0;
    return sum + price * item.qty;
  }, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="cart-drawer-header">
              <span className="cart-drawer-title">BAG ({items.reduce((s, i) => s + i.qty, 0)})</span>
              <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
                ✕
              </button>
            </div>

            <div className="cart-drawer-body">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <p>Your bag is empty.</p>
                  <p className="cart-empty-sub">Add something beautiful.</p>
                </div>
              ) : (
                <ul className="cart-item-list">
                  {items.map((item, idx) => {
                    const name  = item.name  ?? item.product?.name  ?? "Product";
                    const price = item.price ?? item.product?.price ?? 0;
                    const image = item.image ?? item.product?.image ?? null;
                    const id    = item._id   ?? item.product?._id   ?? idx;

                    return (
                      <motion.li
                        key={id}
                        className="cart-item"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="cart-item-img-wrap">
                          {image
                            ? <img src={image} alt={name} className="cart-item-img" />
                            : <div className="cart-item-img-placeholder" />
                          }
                        </div>
                        <div className="cart-item-info">
                          <p className="cart-item-name">{name}</p>
                          <p className="cart-item-price">
                            R$ {(price * item.qty).toFixed(2).replace(".", ",")}
                          </p>
                          <p className="cart-item-qty">Qty: {item.qty}</p>
                        </div>
                        <button
                          className="cart-item-remove"
                          onClick={() => onRemove(id)}
                          aria-label="Remove item"
                        >
                          ✕
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-total-row">
                  <span>TOTAL</span>
                  <span>R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
                <motion.button
                  className="checkout-btn"
                  onClick={onCheckout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  CHECKOUT
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Product card
function ProductCard({ product, onAddToCart, adding }) {
  const outOfStock = product.stock === 0;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      className={`q-product-card ${outOfStock ? "is-sold-out" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="q-product-img-wrap">
        {product.image
          ? <img src={product.image} alt={product.name} className="q-product-img" />
          : <div className="q-product-img-placeholder">NO IMAGE</div>
        }

        {outOfStock && <div className="q-sold-out-overlay">SOLD OUT</div>}

        {/* Hover CTA */}
        <AnimatePresence>
          {hovered && !outOfStock && (
            <motion.button
              className="q-hover-add-btn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              onClick={() => onAddToCart(product)}
              disabled={adding === product._id}
            >
              {adding === product._id ? "ADDING…" : "ADD TO BAG"}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Low stock badge */}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="q-low-stock-badge">ONLY {product.stock} LEFT</span>
        )}
      </div>

      {/* Info */}
      <div className="q-product-info">
        <p className="q-product-name">{product.name}</p>
        <p className="q-product-price">
          R$ {Number(product.price).toFixed(2).replace(".", ",")}
        </p>
      </div>
    </motion.div>
  );
}

// Filter Bar
function FilterBar({ activeFilter, onFilter, productCount }) {
  const filters = ["ALL", "NEW", "IN STOCK", "SALE"];

  return (
    <div className="q-filter-bar">
      <div className="q-filter-left">
        {filters.map((f) => (
          <button
            key={f}
            className={`q-filter-btn ${activeFilter === f ? "active" : ""}`}
            onClick={() => onFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <span className="q-product-count">{productCount} PIECES</span>
    </div>
  );
}

// Products root
export default function Products() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState(null);
  const [adding, setAdding]           = useState(null);
  const [cartOpen, setCartOpen]       = useState(false);
  const [cartItems, setCartItems]     = useState([]);
  const [cartCount, setCartCount]     = useState(0);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [toast, setToast]             = useState(null);
  const toastTimer = useRef(null);

// CSRF token fetch on mount
  const [csrfToken, setCsrfToken] = useState("");
  useEffect(() => {
    fetch("https://equation-hazelnut-camcorder.ngrok-free.dev/api/csrf-token", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCsrfToken(d.csrfToken))
      .catch(() => {});
  }, []);

// Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await api.get("/api/products");
        setProducts(data);
      } catch {
        setFetchError("Não foi possível carregar os produtos.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user) {
      fetchServerCart();

      const pending = localStorage.getItem("pendingCartMerge");
      if (pending) {
        try {
          const guestItems = JSON.parse(pending);
          mergeGuestToServer(guestItems);
        } catch {}
        localStorage.removeItem("pendingCartMerge");
      }
    } else {
      const guestCart = getGuestCart();
      setCartItems(guestCart);
      setCartCount(guestCart.reduce((s, i) => s + i.qty, 0));
    }
  }, [user]);

// Server cart helpers
  const fetchServerCart = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get("/api/cart", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = data?.cart?.items || data?.items || [];
      setCartItems(items);
      setCartCount(items.reduce((s, i) => s + i.qty, 0));
    } catch {}
  }, []);

  const mergeGuestToServer = useCallback(async (guestItems) => {
    const token = localStorage.getItem("token");
    for (const item of guestItems) {
      try {
        await api.post(
          "/api/cart/add",
          { productId: item._id, qty: item.qty },
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}`, "X-CSRF-Token": csrfToken },
          }
        );
      } catch {}
    }
    fetchServerCart();
  }, [csrfToken, fetchServerCart]);

// Toast helper
  const showToast = (message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

// Add to cart
  const handleAddToCart = async (product) => {
    if (product.stock === 0) return;
    setAdding(product._id);

    try {
      if (user) {
        const token = localStorage.getItem("token");
        await api.post(
          "/api/cart/add",
          { productId: product._id, qty: 1 },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "X-CSRF-Token": csrfToken,
            },
          }
        );
        await fetchServerCart();
      } else {
        const updatedCart = addToGuestCart(product);
        setCartItems(updatedCart);
        setCartCount(updatedCart.reduce((s, i) => s + i.qty, 0));
      }

      showToast(`${product.name} foi adicionado`, "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not add to bag", "error");
    } finally {
      setAdding(null);
    }
  };

// Remove from cart
  const handleRemove = async (productId) => {
    if (user) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/api/cart/remove/${productId}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-Token": csrfToken,
          },
        });
        await fetchServerCart();
      } catch {
        showToast("Could not remove item", "error");
      }
    } else {
      const updated = getGuestCart().filter((i) => i._id !== productId);
      saveGuestCart(updated);
      setCartItems(updated);
      setCartCount(updated.reduce((s, i) => s + i.qty, 0));
    }
  };

// Checkout
  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

// Filter products
  const filtered = products.filter((p) => {
    if (activeFilter === "ALL")      return true;
    if (activeFilter === "IN STOCK") return p.stock > 0;
    if (activeFilter === "NEW")      return p.isNew;
    if (activeFilter === "SALE")     return p.onSale;
    return true;
  });

  return (
    <div className="q-products-page">
      {/* ── Hero strip ── */}
      <div className="q-collection-hero">
        <motion.p
          className="q-collection-label"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          SS 2026 COLLECTION
        </motion.p>
        <motion.h2
          className="q-collection-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          QUADAR INSHALLAH CO. & RECORDS
        </motion.h2>
      </div>

      {/* ── Filter bar ── */}
      <FilterBar
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        productCount={filtered.length}
      />

      {/* ── Content ── */}
      <main className="q-products-main">
        {fetchError && (
          <motion.p
            className="q-fetch-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {fetchError}
          </motion.p>
        )}

        {loading && (
          <div className="q-loading">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="q-skeleton-card" />
            ))}
          </div>
        )}

        {!loading && !fetchError && (
          <motion.div
            className="q-products-grid"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                adding={adding}
              />
            ))}
          </motion.div>
        )}
      </main>

      {/* ── Cart drawer ── */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={handleRemove}
        onCheckout={handleCheckout}
      />

      {/* ── Toast notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`q-toast q-toast--${toast.type}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}