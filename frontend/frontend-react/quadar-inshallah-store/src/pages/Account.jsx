import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api.js";
import { useAuth } from "../context/AuthProvider";

// ─── Animation helpers ────────────────────────────────────────────────────────
const slide = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay } },
});

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ["PROFILE", "ORDERS"];

// ─── Profile Tab ─────────────────────────────────────────────────────────────
function ProfileTab({ user, onLogout }) {
  return (
    <motion.div className="account-section" initial="hidden" animate="show">
      <motion.div className="account-avatar" variants={slide(0.1)}>
        {user.name?.[0]?.toUpperCase() ?? "U"}
      </motion.div>

      <motion.div className="account-info" variants={slide(0.2)}>
        <div className="account-field">
          <span className="account-field-label">NAME</span>
          <span className="account-field-value">{user.name}</span>
        </div>
        <div className="account-field">
          <span className="account-field-label">EMAIL</span>
          <span className="account-field-value">{user.email}</span>
        </div>
        {user.createdAt && (
          <div className="account-field">
            <span className="account-field-label">MEMBER SINCE</span>
            <span className="account-field-value">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long", year: "numeric",
              })}
            </span>
          </div>
        )}
      </motion.div>

      <motion.button
        className="account-logout-btn"
        variants={slide(0.35)}
        onClick={onLogout}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        SIGN OUT
      </motion.button>
    </motion.div>
  );
}

// ─── Orders Tab ──────────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    api.get("/api/payments/orders")
      .then(({ data }) => setOrders(data))
      .catch(() => setError("Could not load orders."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="account-loading">
      <span className="dot" /><span className="dot" /><span className="dot" />
    </div>
  );

  if (error) return <p className="account-error">{error}</p>;

  if (!orders.length) return (
    <motion.div className="account-empty" initial="hidden" animate="show">
      <motion.p variants={slide(0.1)}>NO ORDERS YET</motion.p>
      <motion.p className="account-empty-sub" variants={slide(0.2)}>
        Your completed orders will appear here.
      </motion.p>
    </motion.div>
  );

  return (
    <motion.div className="orders-list" initial="hidden" animate="show">
      {orders.map((order, i) => (
        <motion.div key={order.id} className="order-card" variants={slide(0.1 + i * 0.06)}>
          <div className="order-card-header">
            <span className="order-id">#{order.id?.slice(-8).toUpperCase()}</span>
            <span className={`order-status order-status--${order.status}`}>
              {order.status?.toUpperCase()}
            </span>
          </div>

          <div className="order-items">
            {order.items?.map((item) => (
              <div key={item.productId} className="order-item-row">
                <span>{item.name ?? item.productId}</span>
                <span>× {item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="order-card-footer">
            <span className="order-date">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
            <span className="order-total">R$ {(order.total / 100).toFixed(2)}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Account (root) ───────────────────────────────────────────────────────────
export default function Account() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Permite chegar direto na aba de pedidos via ?tab=orders (ex: pós-checkout)
  const initialTab = searchParams.get("tab") === "orders" ? "ORDERS" : "PROFILE";
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "ORDERS" ? { tab: "orders" } : {});
  };

  return (
    <div className="account-root">
      {/* ── Header ── */}
      <motion.div className="account-header" initial="hidden" animate="show">
        <motion.p className="checkout-eyebrow" variants={slide(0.05)}>
          MY ACCOUNT
        </motion.p>
        <motion.h1 className="account-name" variants={slide(0.15)}>
          {user?.name?.toUpperCase()}
        </motion.h1>
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div
        className="account-tabs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`account-tab${activeTab === tab ? " active" : ""}`}
            onClick={() => switchTab(tab)}
          >
            {tab}
            {activeTab === tab && (
              <motion.div className="account-tab-line" layoutId="tab-line" />
            )}
          </button>
        ))}
      </motion.div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
        >
          {activeTab === "PROFILE"
            ? <ProfileTab user={user} onLogout={handleLogout} />
            : <OrdersTab />
          }
        </motion.div>
      </AnimatePresence>
    </div>
  );
}