import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import DigitalProducts from "./pages/DigitalProducts";
import Orders from "./pages/Orders";
import Members from "./pages/Members";
import Blog from "./pages/Blog";
import ContactMessages from "./pages/ContactMessages";
import AdPanel from "./pages/AdPanel";
import Settings from "./pages/Settings";
import Categories from "./pages/Categories";
import CurrencySettings from "./pages/CurrencySettings";
import Reports from "./pages/Reports";
import Transactions from "./pages/Transactions";
import SeoSettings from "./pages/SeoSettings";
import GalleryAdmin from "./pages/GalleryAdmin";
import CatalogAdmin from "./pages/CatalogAdmin";
import PortfolioAdmin from "./pages/PortfolioAdmin";
import BulkTools from "./pages/BulkTools";

import FaqManager from "./pages/FaqManager";
import FeedManager from "./pages/FeedManager";
import ReviewsManager from "./pages/ReviewsManager";
import CouponsManager from "./pages/CouponsManager";
import BulkInquiriesManager from "./pages/BulkInquiriesManager";
import NewsletterManager from "./pages/NewsletterManager";
import ShippingCountries from "./pages/ShippingCountries";
import ShippingRates from "./pages/ShippingRates";
import SendNotifications from "./pages/SendNotifications";

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<P><Dashboard /></P>} />
          <Route path="/categories" element={<P><Categories /></P>} />
          <Route path="/catalog" element={<P><CatalogAdmin /></P>} />
          <Route path="/gallery" element={<P><GalleryAdmin /></P>} />
          <Route path="/portfolio" element={<P><PortfolioAdmin /></P>} />
          <Route path="/products" element={<P><Products /></P>} />
          <Route path="/bulk-tools" element={<P><BulkTools /></P>} />
          <Route path="/digital-products" element={<P><DigitalProducts /></P>} />
          <Route path="/reviews" element={<P><ReviewsManager /></P>} />
          <Route path="/orders" element={<P><Orders /></P>} />
          <Route path="/members" element={<P><Members /></P>} />
          <Route path="/blog" element={<P><Blog /></P>} />
          <Route path="/faqs" element={<P><FaqManager /></P>} />
          <Route path="/feeds" element={<P><FeedManager /></P>} />
          <Route path="/coupons" element={<P><CouponsManager /></P>} />
          <Route path="/bulk-inquiries" element={<P><BulkInquiriesManager /></P>} />
          <Route path="/newsletter" element={<P><NewsletterManager /></P>} />
          <Route path="/messages" element={<P><ContactMessages /></P>} />
          <Route path="/ads" element={<P><AdPanel /></P>} />
          <Route path="/notifications" element={<P><SendNotifications /></P>} />
          <Route path="/send-notifications" element={<P><SendNotifications /></P>} />
          <Route path="/currency" element={<P><CurrencySettings /></P>} />
          <Route path="/shipping-countries" element={<P><ShippingCountries /></P>} />
          <Route path="/shipping-rates" element={<P><ShippingRates /></P>} />
          <Route path="/settings" element={<P><Settings /></P>} />
          <Route path="/reports" element={<P><Reports /></P>} />
          <Route path="/transactions" element={<P><Transactions /></P>} />
          <Route path="/seo" element={<P><SeoSettings /></P>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}