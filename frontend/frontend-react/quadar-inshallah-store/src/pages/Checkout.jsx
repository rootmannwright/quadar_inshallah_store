import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "../api.js";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthProvider";

// ─── Stripe init ─────────────────────────────────────────────────────────────
// Sua chave pública Stripe — mova para .env em produção
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// ─── Animation helpers ────────────────────────────────────────────────────────
const slide = (delay = 0) => ({
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay } },
});

// ─── Order Summary (coluna esquerda) ─────────────────────────────────────────
function OrderSummary({ cart }) {
  return (
    <motion.div className="checkout-summary" initial="hidden" animate="show">
      <motion.p className="checkout-eyebrow" variants={slide(0.1)}>
        YOUR ORDER
      </motion.p>

      <div className="summary-items">
        {cart.items.map((item, i) => (
          <motion.div key={item.id} className="summary-item" variants={slide(0.15 + i * 0.05)}>
            <div className="summary-item-info">
              <span className="summary-item-name">{item.name}</span>
              <span className="summary-item-qty">QTY {item.quantity}</span>
            </div>
            <span className="summary-item-price">
              R$ {(item.price * item.quantity).toFixed(2)}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div className="summary-divider" variants={slide(0.4)} />

      <motion.div className="summary-total" variants={slide(0.45)}>
        <span>TOTAL</span>
        <span>R$ {cart.total.toFixed(2)}</span>
      </motion.div>

      <motion.div className="summary-security" variants={slide(0.55)}>
        <span className="security-icon">🔒</span>
        <span>Payments processed securely by Stripe</span>
      </motion.div>
    </motion.div>
  );
}

// ─── Stripe Payment Form (coluna direita) ─────────────────────────────────────
function PaymentForm({ clientSecret }) {
  const stripe   = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cart, checkout } = useCart();

  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [succeeded, setSucceeded] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/account?tab=orders` },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // Registra o pedido na sua API
      await checkout({ paymentIntentId: paymentIntent.id });
      setSucceeded(true);
      setTimeout(() => navigate("/account?tab=orders"), 2000);
    }

    setLoading(false);
  };

  return (
    <motion.div className="checkout-form-panel" initial="hidden" animate="show">
      <motion.p className="checkout-eyebrow" variants={slide(0.2)}>
        PAYMENT DETAILS
      </motion.p>

      <AnimatePresence mode="wait">
        {!succeeded ? (
          <motion.div
            key="form"
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}
          >
            {/* ── Stripe PaymentElement ── */}
            <motion.div className="stripe-element-wrap" variants={slide(0.3)}>
              <PaymentElement
                options={{
                  layout: "tabs",
                  fields: { billingDetails: { name: "auto" } },
                }}
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  className="checkout-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              className={`checkout-btn${loading ? " loading" : ""}`}
              onClick={handlePay}
              variants={slide(0.4)}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              disabled={loading || !stripe}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span key="loading" className="btn-loader"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    <span className="dot" /><span className="dot" /><span className="dot" />
                  </motion.span>
                ) : (
                  <motion.span key="label"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    PAY R$ {cart.total.toFixed(2)}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            className="checkout-success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="success-mark"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              ✓
            </motion.div>
            <h2 className="success-title">ORDER CONFIRMED</h2>
            <p className="success-sub">Redirecting to your orders...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Checkout (root) ──────────────────────────────────────────────────────────
export default function Checkout() {
  const { cart }       = useCart();
  const { user }       = useAuth();
  const navigate       = useNavigate();

  const [clientSecret, setClientSecret] = useState(null);
  const [initError,    setInitError]    = useState(null);

  // Cria o PaymentIntent na sua API ao montar
  useEffect(() => {
    if (!cart.items.length) { navigate("/cart"); return; }

    api.post("/api/payments/create-intent", { amount: Math.round(cart.total * 100) })
      .then(({ data }) => setClientSecret(data.clientSecret))
      .catch(() => setInitError("Could not initialize payment. Please try again."));
  }, []);

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary:    "#ffffff",
        colorBackground: "#0a0a0a",
        colorText:       "#ffffff",
        colorDanger:     "#ff4d4d",
        fontFamily:      "inherit",
        borderRadius:    "2px",
        spacingUnit:     "5px",
      },
    },
  };

  return (
    <div className="checkout-root">
      {/* ── Coluna esquerda: resumo ── */}
      <OrderSummary cart={cart} />

      {/* ── Coluna direita: pagamento ── */}
      {initError ? (
        <div className="checkout-init-error">{initError}</div>
      ) : clientSecret ? (
        <Elements stripe={stripePromise} options={stripeOptions}>
          <PaymentForm clientSecret={clientSecret} />
        </Elements>
      ) : (
        <div className="checkout-loading">
          <span className="dot" /><span className="dot" /><span className="dot" />
        </div>
      )}
    </div>
  );
}