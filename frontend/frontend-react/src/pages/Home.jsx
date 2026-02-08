export default function Home() {
  return (
    <>
      <div className="logo">
        <img
          className="logo_img"
          src="/assets/logo/projeto_quadar_inshallah_logotipo_elipse_reformated_final.png"
          alt="Quadar Inshallah Co. & Records Logo"
        />
      </div>

      <span className="name-logo">Quadar Inshallah Co. & Records</span>

      <div className="menu">
        <nav>
          <ul className="nav-links">
            <li>
              <a href="#">
                <img src="/assets/logo/entregavel.png" alt="" />
                <br />
                <span>Products</span>
              </a>
            </li>

            <li>
              <a href="#">
                <img src="src/assets/logo/stacks_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png" alt="" />
                <br />
                <span>Stories</span>
              </a>
            </li>

            <li>
              <a href="#">
                <img src="src/assets/logo/groups_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png" alt="" />
                <br />
                <span>Login</span>
              </a>
            </li>

            <li>
              <a href="#">
                <img src="src/assets/logo/shopping_cart.png" alt="" />
                <br />
                <span>Carrinho</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="container_message">
        <h1>2026</h1>
        <p>Em breve.</p>
        <p><em>A arte move. A fé guia. Inshallah.</em></p>
      </div>
    </>
  )
}