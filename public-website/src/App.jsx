import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import WhatsAppChat from "./components/WhatsAppChat";
import CuteLoader from "./components/CuteLoader";
import { CartProvider } from "./context/CartContext";
import { MemberProvider } from "./context/MemberContext";
import { CurrencyProvider } from "./context/CurrencyContext";

const Home = lazy(() => import("./pages/Home"));
const ProductList = lazy(() => import("./pages/ProductList"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const DigitalProductList = lazy(() => import("./pages/DigitalProductList"));
const DigitalProductDetail = lazy(() => import("./pages/DigitalProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const MemberLogin = lazy(() => import("./pages/MemberLogin"));
const Profile = lazy(() => import("./pages/Profile"));
const BlogList = lazy(() => import("./pages/BlogList"));
const Service = lazy(() => import("./pages/Service"));
const Contact = lazy(() => import("./pages/Contact"));
const Catalog = lazy(() => import("./pages/Catalog"));
const CategoryCatalog = lazy(() => import("./pages/CategoryCatalog"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Engraving = lazy(() => import("./pages/Engraving"));

// ── The pages your footer links to ──
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const CookiesPolicy = lazy(() => import("./pages/CookiesPolicy"));
const AboutUs = lazy(() => import("./pages/AboutUs"));

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
            <Suspense fallback={<CuteLoader />}>
              <main>
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
                  <Route path="/categories"         element={<CategoryCatalog />} />
                  <Route path="/gallery"            element={<Gallery />} />
                  <Route path="/portfolio"          element={<Portfolio />} />
                  <Route path="/engraving"          element={<Engraving />} />

                  {/* ── Legal & info pages ── */}
                  <Route path="/terms"              element={<TermsConditions />} />
                  <Route path="/privacy"            element={<PrivacyPolicy />} />
                  <Route path="/refund"             element={<RefundPolicy />} />
                  <Route path="/shipping"           element={<ShippingPolicy />} />
                  <Route path="/cookies"            element={<CookiesPolicy />} />
                  <Route path="/about"              element={<AboutUs />} />
                </Routes>
              </main>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </CurrencyProvider>
    </MemberProvider>
  );
}