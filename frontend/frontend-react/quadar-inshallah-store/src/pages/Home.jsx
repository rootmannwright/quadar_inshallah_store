// imports
import { products } from '../data/products'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import Sidebar from '../components/Sidebar'
import ScrambleText from '../components/ScrambleText'
import './home.css'


export default function Home() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <body>
      <div className="home">

        {/* ===== Branding ===== */}
        <header className="home-header"><div className="logo">
          <img
            className="logo_img"
            src="../public/logos/logo-letreiro.png"
            alt="Quadar Inshallah Co. & Records Logo"
          />

          <div className='name-logo'>Quadar Inshallah Co. & Records</div>
        </div>

        </header>

        {/* ===== Menu Principal ===== */}
        <nav className="home-menu">
          <ul className="nav-links">
            <li>
              <a href="#">
                <img src="/logos/home.svg" alt="Home" />
                <span>Home</span>
              </a>
            </li>

            <li>
              <a href="#">
                <img src="/logos/stories.svg" alt="Stories" />
                <span>Stories</span>
              </a>
            </li>

            <li>
              <a href="#">
                <img src="/logos/login.svg" alt="Login" />
                <span>Login</span>
              </a>
            </li>

            <li>
              <a href="#">
                <img src="/logos/carrinho.svg" alt="Carrinho" />
                <span>Carrinho</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* ===== Mensagem Institucional ===== */}
        <section className="container_message">
          <Sidebar />

          <ScrambleText text="2026" as="h1" />
          <ScrambleText text="Em breve." as="p" />
          <ScrambleText
            text="A arte move. A fé guia. Inshallah."
            as="p"
          />
        </section>

        {/* ===== Produtos ===== */}
        <section className="product-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="product-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

            {/* LEFT — imagem editorial */}
            <div className="flex items-center justify-center lg:justify-start">
              <img
                src="../public/logos/scooby-quadar.png"
                alt="Scooby Mascote Quadar Inshallah"
                className="flex items-center justify-center lg:justify-start"
              />
            </div>

            {/* RIGHT — grid de produtos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <ProductCard />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <ProductCard />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ProductCard />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <ProductCard />
              </motion.div>

            </div>

          </div>
        </section>


      </div>
    </body>

  )
}