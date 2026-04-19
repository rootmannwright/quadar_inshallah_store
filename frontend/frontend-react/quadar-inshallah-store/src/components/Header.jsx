import { useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import logo from "/logos/logo-letreiro.png";
import "../styles/header.css";

export default function Header() {
  const { scrollY } = useScroll();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Scroll behavior ──────────────────────────────────────────────────────
  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(current > previous && current > 150);
    setScrolled(current > 30);
  });

  const closeMenu = () => setMenuOpen(false);

  // ── Variantes do drawer ──────────────────────────────────────────────────
  const drawerVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: { duration: 0.25, ease: "easeInOut" },
    },
  };

  // ── Variantes dos itens do menu mobile (stagger) ─────────────────────────
  const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { x: 30, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 22 } },
  };

  // ── Variantes do backdrop ────────────────────────────────────────────────
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.25 } },
  };

  return (
    <>
      {/* ── Header bar ── */}
      <motion.header
        className={`header ${scrolled ? "header-scrolled" : ""}`}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        {/* Logo */}
        <div className="header-logo">
          <Link to="/" onClick={closeMenu}>
            <img src={logo} alt="Quadar" />
          </Link>
        </div>

        {/* ── Desktop nav ── */}
        <motion.nav
          className="home-menu"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: hidden ? 0 : 1, y: hidden ? -20 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        >
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Produtos</Link></li>
            <li><Link to="/stories">Stories</Link></li>
            <li><Link to="/cart">Carrinho</Link></li>

            {user ? (
              <>
                <li>
                  <span
                    className="nav-user-name"
                    onClick={() => navigate("/customer")}
                    style={{ cursor: "pointer" }}
                  >
                    Olá, {user.name?.split(" ")[0]}
                    <div className="nav-user-avatar">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.name ? user.name[0].toUpperCase() : "U"}
                        </div>
                      )}
                    </div>
                  </span>
                </li>
                <li>
                  <button className="logout-btn" onClick={logout}>
                    Sair
                  </button>
                </li>
              </>
            ) : (
              <li><Link to="/login">Login</Link></li>
            )}
          </ul>
        </motion.nav>

        {/* ── Hamburger button (mobile) ── */}
        <button
          className="header-hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {/* Linha 1: vira a diagonal superior do ✕ */}
          <motion.span
            className="hamburger-line"
            animate={menuOpen
              ? { rotate: 45, y: 8, width: "100%" }
              : { rotate: 0, y: 0, width: "100%" }
            }
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
          {/* Linha 2: some no meio */}
          <motion.span
            className="hamburger-line"
            animate={menuOpen
              ? { opacity: 0, scaleX: 0 }
              : { opacity: 1, scaleX: 1 }
            }
            transition={{ duration: 0.2, ease: "easeInOut" }}
          />
          {/* Linha 3: vira a diagonal inferior do ✕ */}
          <motion.span
            className="hamburger-line"
            animate={menuOpen
              ? { rotate: -45, y: -8, width: "100%" }
              : { rotate: 0, y: 0, width: "100%" }
            }
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </button>
      </motion.header>

      {/* ── Mobile drawer backdrop ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
          >
            <div className="mobile-menu-header">
              <div className="mobile-menu-logo">
                <Link to="/" onClick={closeMenu}>
                  <img src={logo} alt="Quadar" />
                </Link>
              </div>
              <button
                className="mobile-menu-close"
                onClick={closeMenu}
                aria-label="Fechar menu"
              >
                ✕
              </button>
            </div>

            <motion.ul
              className="mobile-nav-links"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { to: "/", label: "HOME" },
                { to: "/products", label: "PRODUTOS" },
                { to: "/stories", label: "STORIES" },
                { to: "/cart", label: "CARRINHO" },
              ].map(({ to, label }) => (
                <motion.li key={to} variants={itemVariants}>
                  <Link to={to} onClick={closeMenu}>{label}</Link>
                </motion.li>
              ))}

              {user ? (
                <>
                  <motion.li variants={itemVariants}>
                    <Link to="/customer" onClick={closeMenu}>MINHA CONTA</Link>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <button
                      className="mobile-logout"
                      onClick={() => { logout(); closeMenu(); }}
                    >
                      SAIR
                    </button>
                  </motion.li>
                </>
              ) : (
                <motion.li variants={itemVariants}>
                  <Link to="/login" onClick={closeMenu}>LOGIN</Link>
                </motion.li>
              )}
            </motion.ul>

            <div className="mobile-menu-footer">
              <p>QUADAR · EST. 2025</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}