import { useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import ScrambleText from '../components/ScrambleText'
import VideoPlayer from '../components/VideoPlayer'
import './home.css'
import logo from "/logos/logo-letreiro.png"

export default function Home() {
  const productsRef = useRef(null)

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
          }
        })
      },
      { threshold: 0.15 }
    )

    elements.forEach((el) => observer.observe(el))
  }, [])

  return (
    <div className="home">

      {/* HERO VIDEO */}
      <section className="hero">

        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="https://www.pexels.com/pt-br/download/video/10046969/" type="video/mp4" />
        </video>

        <div className="hero-overlay"></div>

        <div className="hero-content">
          <img className="logo-hero" src={logo} alt="Logo" />
          <ScrambleText text="QUADAR" as="h1" />
          <ScrambleText text="INSHALLAH CO. &" as="h1" />
          <ScrambleText text="RECORDS" as="h1" />

          <p className="hero-sub">
            A arte move. A fé guia.
          </p>

          <button onClick={scrollToProducts} className="hero-btn">
            Explorar
          </button>
        </div>
      </section>

      {/* SECTION TITLE */}
      <section className="section-header reveal">
        <h2>Drops Recentes</h2>
        <p>Quadar Inshallah Co. & Records</p>
        <Sidebar />
      </section>

      {/* PRODUCTS */}
      <section ref={productsRef} className="products-grid">
        <div className="product-card reveal">
          <img src="/images/bag_quadar_inshallah_elipse_icon.jpg" />
          <div className="info">
            <span>Quadar</span>
            <h3>Bag Elipse</h3>
            <p>$100</p>
          </div>
        </div>

        <div className="product-card reveal">
          <img src="/images/camiseta_preta_quadar_inshallah_elipse_icon.jpg" />
          <div className="info">
            <span>Quadar</span>
            <h3>T-Shirt Black</h3>
            <p>$120</p>
          </div>
        </div>

        <div className="product-card reveal">
          <img src="/images/calça_branca_quadar_inshallah_elipse_icon.jpg" />
          <div className="info">
            <span>Quadar</span>
            <h3>Pants White</h3>
            <p>$229</p>
          </div>
        </div>
        <div className="product-card reveal">
          <img src="/images/bermuda_jeans_preta_quadar_inshallah_elipse_icon.jpg" />
          <div className="info">
            <span>Quadar</span>
            <h3>Pants White</h3>
            <p>$250</p>
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="video-section reveal">
        <h2>Vídeo</h2>
        <VideoPlayer />
      </section>

    </div>
  )
}