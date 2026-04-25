import { BrowserRouter, Routes, Route } from "react-router-dom";

// Providers
import { AccessibilityProvider } from "./components/accessibility/AcessibilityProvider";
import { OverlayProvider } from "react-aria";
import { AuthProvider } from "./context/AuthProvider";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "@/components/ui/sonner";

// Components
import AccessibilityPanel from "./components/accessibility/AccessibilityPanel";
import PaymentFailed from "./components/PaymentFailed";
import PaymentSuccess from "./components/PaymentSuccess";
import CookieModal from "./components/CookieModal";

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
import Payment from "./pages/Payment";

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

              <Toaster richColors position="top-right" />
              <AccessibilityPanel />
              <CookieModal />

              <Routes>

                {/* AUTH */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* PUBLIC LAYOUT */}
                <Route element={<PublicLayout />}>

                  {/* STRIPE RESULT */}
                  <Route path="/success" element={<PaymentSuccess />} />
                  <Route path="/cancel" element={<PaymentFailed />} />

                  {/* PUBLIC PAGES */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/stories" element={<Stories />} />
                  <Route path="/cart" element={<Cart />} />

                  {/* PRIVATE ROUTES */}
                  <Route
                    path="/customer"
                    element={
                      <PrivateRoute>
                        <Account />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/payment"
                    element={
                      <PrivateRoute>
                        <Payment />
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

              </Routes>

            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </OverlayProvider>
    </AccessibilityProvider>
  );
}

export default App;