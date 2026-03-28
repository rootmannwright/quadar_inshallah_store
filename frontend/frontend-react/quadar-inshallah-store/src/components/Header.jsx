import { useState } from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { Link } from "react-router-dom"
import logo from "/logos/logo-letreiro.png"
import '../styles/header.css'

export default function Header() {
  const { scrollY } = useScroll()

  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0

    // esconder ao descer
    if (current > previous && current > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }

    // ativar blur
    if (current > 30) {
      setScrolled(true)
    } else {
      setScrolled(false)
    }
  })

  return (
    <motion.header
      className={`header ${scrolled ? "header-scrolled" : ""}`}
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      {/* LOGO */}
      <div className="header-logo">
        <img src={logo} alt="Logo" />
      </div>

      {/* MENU */}
      <motion.nav
        className="home-menu"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: hidden ? 0 : 1, y: hidden ? -20 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/stories">Stories</a></li>
          <li><Link to="/login">Login</Link></li>
          <li><a href="/cart">Carrinho</a></li>
        </ul>
      </motion.nav>
    </motion.header>
  )
}