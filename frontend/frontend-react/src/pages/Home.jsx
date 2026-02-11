import './home.css'
import Quadar from '../assets/images/logo/projeto_quadar_inshallah_logotipo_elipse_reformated_allwhite_transparency.png'
import ProductCard from '../components/ProductCard'
import Sidebar from '../components/Sidebar'
import '../styles/sidebar.css'

export default function Home() {
  return (
    <div className="home">

      {/* ===== Branding ===== */}
      <header className="home-header">
        <div className="logo">
          <img
            className="logo_img"
            src={Quadar}
            alt="Quadar Inshallah Co. & Records Logo"
          />
        </div>

        <span className="name-logo">
          Quadar Inshallah Co. & Records
        </span>
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
              <img src="/logos/stories.svg" alt="Produtos" />
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
        <h1>2026</h1>
        <p>Em breve.</p>
        <p>
          <em>A arte move. A fé guia. Inshallah.</em>
        </p>
      </section>

      {/* ===== Produtos (grid futuro) ===== */}
      <section className="home-products">
        <h2>Produtos em destaque</h2>

        <div class="message">
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut magnam ducimus quibusdam, culpa et ad totam provident similique dicta distinctio repellat? Saepe, officiis quae. Quibusdam perferendis asperiores dolore nihil assumenda.</p>
          <p>Lorem</p>
        </div>
        <div className="products-grid">
          {ProductCard}
        </div>
      </section>

    </div>
  )
}