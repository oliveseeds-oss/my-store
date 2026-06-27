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
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Categories from "./pages/Categories";
import CurrencySettings from "./pages/CurrencySettings";
import Reports from "./pages/Reports";
import Transactions from "./pages/Transactions";
import SeoSettings from "./pages/SeoSettings";

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<P><Dashboard /></P>} />
          <Route path="/categories" element={<P><Categories /></P>} />
          <Route path="/products" element={<P><Products /></P>} />
          <Route path="/digital-products" element={<P><DigitalProducts /></P>} />
          <Route path="/orders" element={<P><Orders /></P>} />
          <Route path="/members" element={<P><Members /></P>} />
          <Route path="/blog" element={<P><Blog /></P>} />
          <Route path="/messages" element={<P><ContactMessages /></P>} />
          <Route path="/ads" element={<P><AdPanel /></P>} />
          <Route path="/notifications" element={<P><Notifications /></P>} />
          <Route path="/currency" element={<P><CurrencySettings /></P>} />
          <Route path="/settings" element={<P><Settings /></P>} />
          <Route path="/reports" element={<P><Reports /></P>} />
          <Route path="/transactions" element={<P><Transactions /></P>} />
          <Route path="/seo" element={<P><SeoSettings /></P>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}