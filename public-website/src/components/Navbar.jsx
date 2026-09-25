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
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-[#E7E7E2]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-[#F5F4F1] rounded transition text-[#181A18]"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
          </button>

          <Link to="/" className="text-base sm:text-xl font-medium tracking-wide text-[#181A18] flex-shrink-0"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "0.04em" }}>
            Olive Seeds
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-[12px] font-medium uppercase tracking-[0.14em] text-[#181A18]/80">
          <Link to="/products" className="hover:text-[#23483D] transition">The Collection</Link>
          <Link to="/digital" className="hover:text-[#23483D] transition">Digital</Link>
          <Link to="/service" className="hover:text-[#23483D] transition">Service</Link>
          <Link to="/blog" className="hover:text-[#23483D] transition">Blog</Link>
          <Link to="/bulk-order" className="hover:text-[#23483D] transition">Bulk Orders</Link>
          <Link to="/contact" className="hover:text-[#23483D] transition">Contact</Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <CurrencySelector />
          {member && <NotificationBell />}
          <Link to="/cart" aria-label="Shopping Cart" className="relative p-2 hover:bg-[#F5F4F1] rounded transition text-[#181A18]">
            <MdShoppingCart className="text-xl" />
            {count > 0 && (
              <span style={{ background: "#23483D", color: "#FFFFFF" }} className="absolute -top-0.5 -right-0.5 text-[9px]
                                w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>
          <Link to={member ? "/profile" : "/login"}
            aria-label={member ? "User Profile" : "Member Login"}
            title={member ? `Profile (${member.full_name || member.name || "Member"})` : "Login / Register"}
            className="flex items-center justify-center text-[#181A18] hover:bg-[#F5F4F1]
                       p-2 rounded transition">
            <MdPerson className="text-2xl" />
          </Link>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E7E2] bg-white/98 backdrop-blur-lg animate-fade-in shadow-sm">
          <div className="flex flex-col px-5 py-4 gap-3 text-xs font-medium uppercase tracking-[0.12em] text-[#181A18]/85">
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 border-b border-[#E7E7E2]/60 hover:text-[#23483D] transition"
            >
              The Collection
            </Link>
            <Link
              to="/digital"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 border-b border-[#E7E7E2]/60 hover:text-[#23483D] transition"
            >
              Digital Assets
            </Link>
            <Link
              to="/service"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 border-b border-[#E7E7E2]/60 hover:text-[#23483D] transition"
            >
              Creative Services
            </Link>
            <Link
              to="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 border-b border-[#E7E7E2]/60 hover:text-[#23483D] transition"
            >
              Studio Blog
            </Link>
            <Link
              to="/bulk-order"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 border-b border-[#E7E7E2]/60 hover:text-[#23483D] text-[#A48855] font-semibold transition"
            >
              B2B & Volume Orders
            </Link>
            <Link
              to="/portfolio"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 border-b border-[#E7E7E2]/60 hover:text-[#23483D] transition"
            >
              Portfolio & Showcases
            </Link>
            <Link
              to="/gallery"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 border-b border-[#E7E7E2]/60 hover:text-[#23483D] transition"
            >
              Gallery
            </Link>
            <Link
              to="/catalog"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 border-b border-[#E7E7E2]/60 hover:text-[#23483D] transition"
            >
              Product Catalog
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 hover:text-[#23483D] transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
