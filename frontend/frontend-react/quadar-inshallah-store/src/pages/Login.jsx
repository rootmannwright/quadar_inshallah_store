import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import logoSrc from "/public/logos/logo-letreiro.png";
import "../styles/login.css";
import Breadcrumbs from "../components/Breadcrumbs";
import { useAuth } from "../context/AuthProvider"; // ← integração API

// ─── Animation helpers ───────────────────────────────────────────────────────

const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay },
  },
});

const fadeIn = (delay = 0) => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, delay } },
});

// ─── ThemeToggle ─────────────────────────────────────────────────────────────

function ThemeToggle({ dark, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      className="theme-toggle"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={dark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 90 }}
          transition={{ duration: 0.25 }}
        >
          {dark ? "○" : "●"}
        </motion.span>
      </AnimatePresence>
      <span className="toggle-label">{dark ? "LIGHT" : "DARK"}</span>
    </motion.button>
  );
}

// ─── FloatingInput ────────────────────────────────────────────────────────────

function FloatingInput({ id, label, type = "text", value, onChange }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className={`field${active ? " active" : ""}${focused ? " focused" : ""}`}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="field-input"
        autoComplete={type === "password" ? "current-password" : "email"}
      />
      <motion.div
        className="field-line"
        initial={false}
        animate={{ scaleX: focused ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

// ─── HeroPanel ───────────────────────────────────────────────────────────────

function HeroPanel() {
  return (
    <motion.div className="hero" initial="hidden" animate="show">
      <div className="grid-lines" aria-hidden="true">
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} className="grid-line" variants={fadeIn(0.1 * i)} />
        ))}
      </div>

      <motion.div className="hero-brand" variants={stagger(0.1)}>
        <span className="brand-eyebrow">COLLECTION</span>
        <div className="brand-year">2026</div>
      </motion.div>

      <div className="hero-center">
        <motion.h1 className="hero-title" variants={stagger(0.25)}>
          <span className="title-line">A</span>
          <span className="title-line italic">QUADAR'S</span>
          <span className="title-line">SEASON</span>
        </motion.h1>

        <motion.p className="hero-sub" variants={stagger(0.45)}>
          Refined essentials for the contemporary wardrobe.
          Crafted with intention, worn with purpose.
        </motion.p>
      </div>

      <motion.div className="hero-footer" variants={stagger(0.6)}>
        <span>GUARULHOS · SÃO PAULO · USA</span>
        <div className="hero-dot" />
        <span>EST. 2025</span>
      </motion.div>

      <motion.div
        className="hero-circle"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      />
    </motion.div>
  );
}

// ─── LoginForm ───────────────────────────────────────────────────────────────

function LoginForm({ dark, onToggle }) {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [submitted, setSubmitted]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [localError, setLocalError] = useState(null);

  const errorMsg = localError || authError;

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLocalError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      setSubmitted(true);
      setTimeout(() => navigate("/"), 1600); // redireciona após animação de sucesso
    } else {
      setLocalError(result.message); // ex: "Too many login attempts. Account temporarily locked."
    }
  };

  return (
    <div className="form-panel">
      {/* ── Top bar: logo + theme toggle ── */}
      <motion.div
        className="form-topbar"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="logo">
          <img src={logoSrc} alt="Logo" className="logo" />
        </div>
        <ThemeToggle dark={dark} onToggle={onToggle} />
      </motion.div>

      {/* ── Breadcrumbs ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Breadcrumbs />
      </motion.div>

      {/* ── Form / Success ── */}
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            className="form-body"
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
          >
            <motion.div className="form-header" variants={stagger(0.2)}>
              <h2 className="form-title">SIGN IN</h2>
              <p className="form-sub">Access your personal account</p>
            </motion.div>

            {/* ── Erro da API ── */}
            <AnimatePresence>
              {errorMsg && (
                <motion.p
                  className="form-error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div className="form-fields" variants={stagger(0.35)}>
              <FloatingInput
                id="email"
                label="EMAIL ADDRESS"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FloatingInput
                id="password"
                label="PASSWORD"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>

            <motion.div className="form-extras" variants={stagger(0.45)}>
              <a href="#" className="forgot-link">FORGOT PASSWORD?</a>
            </motion.div>

            <motion.div variants={stagger(0.55)}>
              <motion.button
                className={`submit-btn${loading ? " loading" : ""}`}
                onClick={handleSubmit}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span
                      key="loading"
                      className="btn-loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      CONTINUE
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>

            <motion.div className="form-divider" variants={stagger(0.65)}>
              <span className="divider-line" />
              <span className="divider-text">OR</span>
              <span className="divider-line" />
            </motion.div>

            <motion.button
              className="guest-btn"
              variants={stagger(0.72)}
              onClick={() => navigate("/")}
            >
              CONTINUE AS GUEST
            </motion.button>

            <motion.p className="signup-prompt" variants={stagger(0.8)}>
              New to Quadar?{" "}
              <a
                href="#"
                className="signup-link"
                onClick={(e) => { e.preventDefault(); navigate("/register"); }}
              >
                CREATE AN ACCOUNT
              </a>
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            className="success-state"
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
            <h2 className="success-title">WELCOME BACK</h2>
            <p className="success-sub">Redirecting you now...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Login (root) ─────────────────────────────────────────────────────────────

export default function Login() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    return () => {
      document.documentElement.removeAttribute("data-theme");
    };
  }, [dark]);

  return (
    <div className="login-root">
      <HeroPanel />
      <LoginForm dark={dark} onToggle={() => setDark((d) => !d)} />
    </div>
  );
}