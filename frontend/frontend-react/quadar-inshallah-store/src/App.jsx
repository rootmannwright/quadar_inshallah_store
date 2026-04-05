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
import Home      from "./pages/Home";
import Login     from "./pages/Login";
import Register  from "./pages/Register";
import Cart      from "./pages/Cart";
import Stories   from "./pages/Stories";
import Products  from "./pages/Products";
import Dashboard from "./pages/Dashboard";
import Checkout  from "./pages/Checkout";
import Account   from "./pages/Account";

// Layout
import PublicLayout from "./layouts/PublicLayout";

function App() {
  return (
    <AccessibilityProvider>
      <OverlayProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <AccessibilityPanel />

              <Routes>

                {/* LOGIN / REGISTER — páginas únicas, sem layout */}
                <Route path="/login"    element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* PÚBLICAS COM LAYOUT */}
                <Route element={<PublicLayout />}>
                  <Route path="/"         element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/stories"  element={<Stories />} />
                  <Route path="/cart"     element={<Cart />} />
                </Route>

                {/* PRIVADAS */}
                <Route
                  path="/checkout"
                  element={
                    <PrivateRoute>
                      <Checkout />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/customer"
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

                {/* 404 */}
                <Route path="*" element={<h1>404 - Página não encontrada</h1>} />

              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </OverlayProvider>
    </AccessibilityProvider>
  );
}

export default App;