import { BrowserRouter, Routes, Route } from "react-router-dom";

// Providers
import { AccessibilityProvider } from "./components/accessibility/AcessibilityProvider";
import { OverlayProvider } from "react-aria";
import { AuthProvider } from "./context/AuthProvider";
import { CartProvider } from "./context/CartContext"; // ← adicionado

// Components
import AccessibilityPanel from "./components/accessibility/AccessibilityPanel";

// Routes
import PrivateRoute from "./routes/PrivateRoute";

// Pages
import Home      from "./pages/Home";
import Login     from "./pages/Login";
import Cart      from "./pages/Cart";
import Stories   from "./pages/Stories";
import Products  from "./pages/Products";
import Dashboard from "./pages/Dashboard";
import Checkout  from "./pages/Checkout";  // ← adicionado
import Account   from "./pages/Account";   // ← adicionado

// Layout
import PublicLayout from "./layouts/PublicLayout";

function App() {
  return (
    <AccessibilityProvider>
      <OverlayProvider>
        <AuthProvider>
          <CartProvider> {/* ← envolve tudo que usa o carrinho */}
            <BrowserRouter>

              {/* BOTÃO DE ACESSIBILIDADE GLOBAL */}
              <AccessibilityPanel />

              <Routes>

                {/* 🌐 ROTAS PÚBLICAS COM LAYOUT */}
                <Route element={<PublicLayout />}>
                  <Route path="/"         element={<Home />} />
                  <Route path="/cart"     element={<Cart />} />
                  <Route path="/stories"  element={<Stories />} />
                  <Route path="/products" element={<Products />} />
                </Route>

                {/* 🔐 LOGIN — sem layout */}
                <Route path="/login" element={<Login />} />

                {/* 🔒 ROTAS PROTEGIDAS */}
                <Route
                  path="/checkout"
                  element={
                    <PrivateRoute>
                      <Checkout />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <PrivateRoute>
                      <Account />
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

              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </OverlayProvider>
    </AccessibilityProvider>
  );
}

export default App;