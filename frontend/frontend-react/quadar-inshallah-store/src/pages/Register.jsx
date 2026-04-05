import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import "../styles/register.css";

// API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function apiRegister({ name, email, password }) {
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }), // 🔥 sem role
    });

    const data = await res.json();

    if (!res.ok) {
      console.log("ERRO BACKEND:", data); // 👈 debug real
      throw new Error(data.message || "Erro ao criar conta.");
    }

    return data;
  } catch (error) {
    console.error("ERRO FRONT:", error);
    throw error;
  }
}

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const IconChevron = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// ─── Motion variants ──────────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const slideErr = {
  hidden: { opacity: 0, height: 0 },
  show: { opacity: 1, height: "auto", transition: { duration: 0.25 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

// ─── Fonts ────────────────────────────────────────────────────────────────────
const serif = "Georgia, 'Times New Roman', Times, serif";
const sans  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// ─── useTheme ─────────────────────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "dark"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "dark");
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return theme;
}

// ─── InputField (dark theme) ──────────────────────────────────────────────────
function InputField({ id, label, type = "text", value, onChange, error, autoComplete, rightSlot }) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <motion.div variants={fadeUp}>
      <div style={{
        position: "relative",
        borderBottom: `1px solid ${error ? "#e06060" : focused ? "#888" : "#333"}`,
        transition: "border-color 0.3s",
      }}>
        <label
          htmlFor={id}
          style={{
            position: "absolute",
            left: 0,
            top: floated ? 0 : 18,
            fontSize: floated ? 9 : 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: floated ? "#666" : "#555",
            pointerEvents: "none",
            transition: "all 0.25s ease",
            fontWeight: 400,
            fontFamily: sans,
          }}
        >
          {label}
        </label>

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            paddingTop: 20,
            paddingBottom: 10,
            paddingRight: rightSlot ? 28 : 0,
            paddingLeft: 0,
            fontSize: 13,
            fontWeight: 300,
            color: "#e8e8e8",
            letterSpacing: "0.05em",
            boxSizing: "border-box",
            fontFamily: sans,
          }}
        />

        {rightSlot && (
          <div style={{ position: "absolute", right: 0, bottom: 10, lineHeight: 0, color: "#555" }}>
            {rightSlot}
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            variants={slideErr}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{
              margin: "5px 0 0",
              fontSize: 10,
              color: "#e06060",
              letterSpacing: "0.08em",
              fontFamily: sans,
              overflow: "hidden",
            }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── PasswordStrength ─────────────────────────────────────────────────────────
function PasswordStrength({ value }) {
  const score = [
    value.length >= 8,
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ].filter(Boolean).length;

  const colors = ["#333", "#c0392b", "#e67e22", "#27ae60", "#2ecc71"];
  const labels = ["", "Fraca", "Razoável", "Boa", "Forte"];

  if (!value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      style={{ marginTop: 8, overflow: "hidden" }}
    >
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: 1,
            backgroundColor: i <= score ? colors[score] : "#2a2a2a",
            transition: "background-color 0.4s",
          }} />
        ))}
      </div>
      <p style={{
        fontSize: 9, letterSpacing: "0.2em",
        textTransform: "uppercase", color: "#444",
        margin: "4px 0 0", fontFamily: sans,
      }}>
        {labels[score]}
      </p>
    </motion.div>
  );
}

// ─── EyeButton ────────────────────────────────────────────────────────────────
function EyeBtn({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        background: "none", border: "none",
        cursor: "pointer", color: "#555",
        padding: 0, lineHeight: 0,
        display: "flex", alignItems: "center",
      }}
    >
      {show ? <IconEyeOff /> : <IconEye />}
    </button>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────
export default function Register() {
  const theme = useTheme();
  const isLight = theme === "light";

  const [form, setForm]         = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors]     = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name    = "Nome é obrigatório.";
    if (!form.email.trim())  e.email   = "E-mail é obrigatório.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "E-mail inválido.";
    if (!form.password)      e.password = "Senha é obrigatória.";
    else if (form.password.length < 6) e.password = "Mínimo de 6 caracteres.";
    if (!form.confirm)       e.confirm  = "Confirme sua senha.";
    else if (form.confirm !== form.password) e.confirm = "As senhas não coincidem.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    setApiError("");
    try {
      await apiRegister({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      Cookies.set("register_success", "1", { expires: 1 / 24 });
      window.location.href = "/login";
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: sans }}>

      {/* ── LEFT PANEL ────────────────────────────────────────────────────── */}
      <div
        className="register-left"
        style={{
          width: "50%",
          backgroundColor: "#f2ece2",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "36px 48px 36px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src="./public/logos/logo-letreiro.png" alt="Logo" className="logo" />
          <div style={{ display: "flex", gap: 20 }}>
            <span style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#888" }}>
              Collection
            </span>
            <span style={{ fontSize: 9, letterSpacing: "0.25em", color: "#888" }}>
              2026
            </span>
          </div>
        </div>

        {/* headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 style={{
            fontFamily: serif,
            fontSize: "clamp(3rem, 5vw, 5.5rem)",
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            color: "#111",
            margin: "0 0 32px",
            textTransform: "uppercase",
          }}>
            A<br />
            <em style={{ fontStyle: "italic", fontWeight: 700 }}>Quadar's</em><br />
            Season
          </h1>

          <p style={{
            fontSize: 11, color: "#888",
            lineHeight: 1.7, maxWidth: 200,
            fontWeight: 300, letterSpacing: "0.01em",
          }}>
            Refined essentials for the contemporary wardrobe.
            Crafted with intention, worn with purpose.
          </p>
        </motion.div>

        {/* footer */}
        <p style={{
          fontSize: 9, letterSpacing: "0.18em",
          textTransform: "uppercase", color: "#aaa",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          Guarulhos · São Paulo · USA
          <span style={{ color: "#ccc" }}>•</span>
          Est. 2025
        </p>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        backgroundColor: "#0d0d0d",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* top nav */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 40px",
          borderBottom: "1px solid #1c1c1c",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="/" style={{
              fontSize: 9, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "#555",
              textDecoration: "none",
            }}>
              Home
            </a>
            <span style={{ color: "#333", display: "flex" }}><IconChevron /></span>
            <span style={{
              fontSize: 9, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "#e0e0e0",
              borderBottom: "1px solid #555", paddingBottom: 1,
            }}>
              Register
            </span>
          </div>

          <a href="/login" style={{
            fontSize: 9, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#555",
            textDecoration: "none",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            ◎ Login
          </a>
        </div>

        {/* form area */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 40px",
        }}>
          <div style={{ width: "100%", maxWidth: 340 }}>

            {/* heading — cor reativa ao tema */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{ marginBottom: 32 }}
            >
              <h2
                className="form-title"
                style={{
                  fontFamily: serif,
                  fontSize: "clamp(2.4rem, 4vw, 3.2rem)",
                  fontWeight: 700,
                  color: isLight ? "#000000" : "#ffffff",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  margin: "0 0 10px",
                  lineHeight: 1,
                  transition: "color 0.3s ease",
                }}
              >
                Create<br />Account
              </h2>
              <p style={{
                fontSize: 11, color: "#555",
                letterSpacing: "0.05em", fontWeight: 300,
              }}>
                Join us — it only takes a moment.
              </p>
            </motion.div>

            {/* divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              style={{
                height: 1, backgroundColor: "#1c1c1c",
                marginBottom: 32, transformOrigin: "left",
              }}
            />

            {/* form */}
            <motion.form
              variants={stagger}
              initial="hidden"
              animate="show"
              onSubmit={handleSubmit}
              noValidate
              style={{ display: "flex", flexDirection: "column", gap: 22 }}
            >
              <InputField
                id="name"
                label="Full Name"
                value={form.name}
                onChange={set("name")}
                error={errors.name}
                autoComplete="name"
              />
              <InputField
                id="email"
                label="Email Address"
                type="email"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
                autoComplete="email"
              />
              <div>
                <InputField
                  id="password"
                  label="Password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  error={errors.password}
                  autoComplete="new-password"
                  rightSlot={<EyeBtn show={showPass} onToggle={() => setShowPass((p) => !p)} />}
                />
                <AnimatePresence>
                  {form.password && <PasswordStrength value={form.password} />}
                </AnimatePresence>
              </div>
              <InputField
                id="confirm"
                label="Confirm Password"
                type={showConf ? "text" : "password"}
                value={form.confirm}
                onChange={set("confirm")}
                error={errors.confirm}
                autoComplete="new-password"
                rightSlot={<EyeBtn show={showConf} onToggle={() => setShowConf((p) => !p)} />}
              />

              {/* api error */}
              <AnimatePresence>
                {apiError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      fontSize: 10, color: "#e06060",
                      letterSpacing: "0.08em", margin: 0, overflow: "hidden",
                    }}
                  >
                    {apiError}
                  </motion.p>
                )}
              </AnimatePresence>

              <div style={{ height: 1, backgroundColor: "#1a1a1a" }} />

              {/* submit */}
              <motion.div variants={fadeUp}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ backgroundColor: "#1a1a1a" }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    width: "100%",
                    height: 44,
                    backgroundColor: "transparent",
                    border: "1px solid #2a2a2a",
                    color: "#bbb",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: 10,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    fontWeight: 400,
                    fontFamily: sans,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: loading ? 0.5 : 1,
                    transition: "background-color 0.25s, opacity 0.2s",
                  }}
                >
                  {loading ? (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    >
                      Creating account...
                    </motion.span>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </motion.div>

              {/* login link */}
              <motion.p
                variants={fadeUp}
                style={{
                  fontSize: 10, color: "#444",
                  textAlign: "center", letterSpacing: "0.05em", margin: 0,
                }}
              >
                Already have an account?{" "}
                <a
                  href="/login"
                  style={{
                    color: "#e0e0e0",
                    textDecoration: "none",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontSize: 10,
                    fontWeight: 500,
                    borderBottom: "1px solid #444",
                    paddingBottom: 1,
                  }}
                >
                  Sign In
                </a>
              </motion.p>
            </motion.form>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .register-left { display: none !important; }
        }
      `}</style>
    </div>
  );
}