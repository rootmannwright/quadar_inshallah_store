// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Providers
import { AccessibilityProvider } from "./components/accessibility/AcessibilityProvider";
import { OverlayProvider } from "react-aria";
import { AuthProvider } from "./context/AuthProvider";
import { CartProvider } from "./context/CartContext";

// Components
import AccessibilityPanel from "./components/accessibility/AccessibilityPanel";

// Routes
import PrivateRoute from "./routes/PrivateRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Stories from "./pages/Stories";
import Products from "./pages/Products";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";

// Layout
import PublicLayout from "./layouts/PublicLayout";

import "./global.css";

function App() {
  return (
    <AccessibilityProvider>
      <OverlayProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <AccessibilityPanel />

              <Routes>

                {/* LOGIN / REGISTER — sem layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* ROTAS COM LAYOUT (HEADER + FOOTER) */}
                <Route element={<PublicLayout />}>

                  {/* PÚBLICAS */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/stories" element={<Stories />} />
                  <Route path="/cart" element={<Cart />} />

                  {/* PRIVADAS — conta, checkout, dashboard */}
                  <Route
                    path="/customer"
                    element={
                      <PrivateRoute>
                        <Account />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <PrivateRoute>
                        <Checkout />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                </Route>

                {/* 404 */}
                <Route
                  path="*"
                  element={
                    <h1 style={{ padding: "4rem", textAlign: "center" }}>
                      404 — Página não encontrada
                    </h1>
                  }
                />

                {/* PÁGINAS DE RETORNO DO STRIPE */}
                <Route path="/success" element={<Success />} />
                <Route path="/cancel" element={<Cancel />} />

              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </OverlayProvider>
    </AccessibilityProvider>
  );
}

export default App;