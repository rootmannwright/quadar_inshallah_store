//export this file into components/Navbar.jsx and import it into App.jsx, and then create the navbar with the links to the pages of the store, and also include the logo of the store in the navbar, and make it responsive for mobile devices.
export default function Navbar() {
    return (
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
    )
};