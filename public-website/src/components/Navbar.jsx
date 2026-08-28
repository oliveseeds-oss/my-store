import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useMember } from "../context/MemberContext";
import { MdShoppingCart, MdPerson, MdMenu, MdClose } from "react-icons/md";
import CurrencySelector from "./CurrencySelector";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { count } = useCart();
  const { member } = useMember();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF9F6]/75 border-b border-[#0D1512]/10"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 hover:bg-[#0D1512]/10 rounded-xl transition text-[#0D1512]"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
          </button>

          <Link to="/" className="text-sm xs:text-base sm:text-lg font-black text-[#0D1512] flex-shrink-0"
            style={{ fontFamily: "'Outfit', sans-serif" }}>
            Olive Seeds
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-[#0D1512]/80">
          <Link to="/products" className="hover:text-[#0D1512] transition">Engraved</Link>
          <Link to="/digital" className="hover:text-[#0D1512] transition">Digital</Link>
          <Link to="/service" className="hover:text-[#0D1512] transition">Service</Link>
          <Link to="/blog" className="hover:text-[#0D1512] transition">Blog</Link>
          <Link to="/bulk-order" className="hover:text-[#0D1512] transition">Bulk Orders</Link>
          <Link to="/contact" className="hover:text-[#0D1512] transition">Contact</Link>
        </div>

        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
          <CurrencySelector />
          {member && <NotificationBell />}
          <Link to="/wishlist" aria-label="Wishlist" title="Your Wishlist" className="p-1.5 sm:p-2 hover:bg-[#0D1512]/10 rounded-xl transition text-[#0D1512]">
            <span className="text-base sm:text-lg font-bold">♥</span>
          </Link>
          <Link to="/cart" aria-label="Shopping Cart" className="relative p-1.5 sm:p-2 hover:bg-[#0D1512]/10 rounded-xl transition text-[#0D1512]">
            <MdShoppingCart className="text-lg sm:text-xl" />
            {count > 0 && (
              <span style={{ background: "#0D1512", color: "#FAF9F6" }} className="absolute -top-0.5 -right-0.5 text-[9px]
                                w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>
          <Link to={member ? "/profile" : "/login"}
            aria-label={member ? "User Profile" : "Member Login"}
            title={member ? `Profile (${member.full_name || member.name || "Member"})` : "Login / Register"}
            className="flex items-center justify-center text-[#0D1512] hover:bg-[#0D1512]/10
                       p-2 rounded-xl transition">
            <MdPerson className="text-xl sm:text-2xl" />
          </Link>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#0D1512]/10 bg-[#FAF9F6]/95 backdrop-blur-lg animate-fade-in">
          <div className="flex flex-col px-4 py-4 gap-4 text-sm font-black uppercase tracking-wider text-[#0D1512]/80">
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 border-b border-[#0D1512]/5 hover:text-[#0D1512] transition"
            >
              Engraved Products
            </Link>
            <Link
              to="/digital"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 border-b border-[#0D1512]/5 hover:text-[#0D1512] transition"
            >
              Digital Assets
            </Link>
            <Link
              to="/service"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 border-b border-[#0D1512]/5 hover:text-[#0D1512] transition"
            >
              Creative Services
            </Link>
            <Link
              to="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 border-b border-[#0D1512]/5 hover:text-[#0D1512] transition"
            >
              Studio Blog
            </Link>
            <Link
              to="/bulk-order"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 border-b border-[#0D1512]/5 hover:text-[#0D1512] font-bold text-amber-700 transition"
            >
              📦 Bulk Orders / Custom Engraving
            </Link>
            <Link
              to="/portfolio"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 border-b border-[#0D1512]/5 hover:text-[#0D1512] transition"
            >
              Portfolio & Showcases
            </Link>
            <Link
              to="/gallery"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 border-b border-[#0D1512]/5 hover:text-[#0D1512] transition"
            >
              Gallery
            </Link>
            <Link
              to="/catalog"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 border-b border-[#0D1512]/5 hover:text-[#0D1512] transition"
            >
              Product Catalog
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 hover:text-[#0D1512] transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
