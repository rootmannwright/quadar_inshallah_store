import { useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import logo from "/logos/logo-letreiro.png";
import "../styles/header.css";

export default function Header() {
  const { scrollY } = useScroll();
  const { user, logout } = useAuth();

  const [hidden,     setHidden]     = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);

  // ── Scroll behavior ─────────────────────────────────────────────────────────
  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(current > previous && current > 150);
    setScrolled(current > 30);
  });

  const closeMenu = () => setMenuOpen(false);

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
                  <span className="nav-user-name">
                    Olá, {user.name?.split(" ")[0]}
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
          className={`header-hamburger ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </motion.header>

      {/* ── Mobile drawer backdrop ── */}
      <div
        className={`mobile-menu-backdrop ${menuOpen ? "is-open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* ── Mobile drawer ── */}
      <div
        className={`mobile-menu ${menuOpen ? "is-open" : ""}`}
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
          <button className="mobile-menu-close" onClick={closeMenu} aria-label="Fechar menu">
            ✕
          </button>
        </div>

        <ul className="mobile-nav-links">
          <li><Link to="/"         onClick={closeMenu}>HOME</Link></li>
          <li><Link to="/products" onClick={closeMenu}>PRODUTOS</Link></li>
          <li><Link to="/stories"  onClick={closeMenu}>STORIES</Link></li>
          <li><Link to="/cart"     onClick={closeMenu}>CARRINHO</Link></li>

          {user ? (
            <>
              <li><Link to="/customer" onClick={closeMenu}>MINHA CONTA</Link></li>
              <li>
                <button
                  className="mobile-logout"
                  onClick={() => { logout(); closeMenu(); }}
                >
                  SAIR
                </button>
              </li>
            </>
          ) : (
            <li><Link to="/login" onClick={closeMenu}>LOGIN</Link></li>
          )}
        </ul>

        <div className="mobile-menu-footer">
          <p>QUADAR · EST. 2025</p>
        </div>
      </div>
    </>
  );
}