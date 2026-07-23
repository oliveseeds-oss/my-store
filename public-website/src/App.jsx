import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { MemberProvider } from "./context/MemberContext";
import { CurrencyProvider } from "./context/CurrencyContext";

import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import DigitalProductList from "./pages/DigitalProductList";
import DigitalProductDetail from "./pages/DigitalProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MemberLogin from "./pages/MemberLogin";
import Profile from "./pages/Profile";
import BlogList from "./pages/BlogList";
import Service from "./pages/Service";
import Contact from "./pages/Contact";
import Catalog from "./pages/Catalog";
import Gallery from "./pages/Gallery";

// ── The pages your footer links to ──
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import CookiesPolicy from "./pages/CookiesPolicy";
import AboutUs from "./pages/AboutUs";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import WhatsAppChat from "./components/WhatsAppChat";

// ── Scroll to Top on Route Change ──
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <MemberProvider>
      <CurrencyProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <WhatsAppChat />
            <Routes>
              <Route path="/"                   element={<Home />} />
              <Route path="/products"           element={<ProductList />} />
              <Route path="/products/:id"       element={<ProductDetail />} />
              <Route path="/digital"            element={<DigitalProductList />} />
              <Route path="/digital/:id"        element={<DigitalProductDetail />} />
              <Route path="/cart"               element={<Cart />} />
              <Route path="/checkout"           element={<Checkout />} />
              <Route path="/order-success"      element={<OrderSuccess />} />
              <Route path="/login"              element={<MemberLogin />} />
              <Route path="/profile"            element={<Profile />} />
              <Route path="/blog"               element={<BlogList />} />
              <Route path="/service" element={<Service/>}/>
              <Route path="/contact"            element={<Contact />} />
              <Route path="/catalog"            element={<Catalog />} />
              <Route path="/gallery"            element={<Gallery />} />

              {/* ── Legal & info pages ── */}
              <Route path="/terms"              element={<TermsConditions />} />
              <Route path="/privacy"            element={<PrivacyPolicy />} />
              <Route path="/refund"             element={<RefundPolicy />} />
              <Route path="/shipping"           element={<ShippingPolicy />} />
              <Route path="/cookies"            element={<CookiesPolicy />} />
              <Route path="/about"              element={<AboutUs />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </CurrencyProvider>
    </MemberProvider>
  );
}