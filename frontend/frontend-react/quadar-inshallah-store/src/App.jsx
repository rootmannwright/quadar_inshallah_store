import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "./components/accessibility/AcessibilityProvider";
import AccessibilityPanel from "./components/accessibility/AccessibilityPanel";
import { OverlayProvider } from "react-aria";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Stories from "./pages/Stories";
import PublicLayout from "./layouts/PublicLayout";
import Products from "./pages/Products";

function App() {
  return (
    <AccessibilityProvider>
      <OverlayProvider>
        <BrowserRouter>
          <AccessibilityPanel />

          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/products" element={<Products />} />
            </Route>

            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </OverlayProvider>
    </AccessibilityProvider>
  );
}

export default App;