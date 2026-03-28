import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "./components/accessibility/AcessibilityProvider";
import AccessibilityPanel from "./components/accessibility/AccessibilityPanel";
import { OverlayProvider } from "react-aria";
import { AuthProvider } from "./context/AuthProvider";
import PrivateRoute from "./routes/PrivateRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Stories from "./pages/Stories";
import Products from "./pages/Products";
import Dashboard from "./pages/Dashboard";
import PublicLayout from "./layouts/PublicLayout";

function App() {
  return (
    <AccessibilityProvider>
      <OverlayProvider>
        <AuthProvider>
          <BrowserRouter>
            <AccessibilityPanel />

            <Routes>
              {/* 🌐 ROTAS PÚBLICAS COM LAYOUT */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/products" element={<Products />} />
              </Route>

              {/* 🔐 LOGIN */}
              <Route path="/login" element={<Login />} />

              {/* 🔒 DASHBOARD PROTEGIDO */}
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
        </AuthProvider>
      </OverlayProvider>
    </AccessibilityProvider>
  );
}

export default App;