import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErr("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setMsg("");
    setErr("");

    try {
      const res = await API.post("/newsletter/subscribe", { email });
      setMsg(res.data.message || "You are subscribed!");
      setEmail("");
    } catch (error) {
      setErr(error.response?.data?.error || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-1">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full sm:flex-1 bg-white border border-[#0D1512]/15 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0D1512]"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-[#0D1512] hover:bg-stone-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50 shrink-0"
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </div>
      {msg && <p className="text-[11px] font-bold text-emerald-700">{msg}</p>}
      {err && <p className="text-[11px] font-bold text-rose-600">{err}</p>}
    </form>
  );
}

export default function Footer({ settings = {}, dark = false }) {
  // We use a beautiful premium custard cream background (#FAF9F6) and deep forest green text (#0D1512)
  return (
    <footer
      style={{
        background: "#FAF9F6",
        color: "#0D1512",
        borderTop: "1px solid rgba(27, 57, 49, 0.15)",
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
      className="relative z-10"
    >
      <div className="max-w-6xl mx-auto px-6 py-10 md:py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">

          {/* Brand Info */}
          <div className="flex flex-col gap-3">
            <p
              className="text-xl md:text-2xl font-black tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif", color: "#0D1512" }}
            >
              Olive Seeds
            </p>
            <p className="text-xs md:text-sm leading-relaxed text-[#0D1512]/70">
              Personalized luxury laser engraved masterpieces and premium downloadable digital assets created by designers crafting in the Olive Seeds studio.
            </p>

            {/* Social Icons */}
            <div className="flex gap-2 mt-1">
              {[
                { icon: "🔗", label: "LinkedIn", link: "https://www.linkedin.com/in/olive-seeds-design-studio" },
                { icon: "💬", label: "WhatsApp", link: "https://wa.me/+919442943394" },
                { icon: "✉️", label: "Gmail", link: "oliveseeds.oss@gmail.com" }
              ].map((s) => (
                <button
                  key={s.label}
                  className="w-9 h-9 rounded-xl bg-[#0D1512]/5 border border-[#0D1512]/10 hover:border-[#0D1512]/30 hover:bg-[#0D1512]/10 active:scale-95 transition flex items-center justify-center text-base"
                  title={s.label}
                  aria-label={s.label}
                >
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3 md:mb-6"
              style={{ fontFamily: "'Outfit', sans-serif", color: "#0D1512" }}
            >
              Shop Catalog
            </p>
            <div className="flex flex-col gap-2 md:gap-3.5">
              <Link to="/products" className="text-xs md:text-sm text-[#0D1512]/70 hover:text-[#0D1512] hover:underline transition-all">
                Engraved Keepsakes
              </Link>
              <Link to="/digital" className="text-xs md:text-sm text-[#0D1512]/70 hover:text-[#0D1512] hover:underline transition-all">
                Digital Templates
              </Link>
              <Link to="/about" className="text-xs md:text-sm text-[#0D1512]/70 hover:text-[#0D1512] hover:underline transition-all">
                About Studio
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3 md:mb-6"
              style={{ fontFamily: "'Outfit', sans-serif", color: "#0D1512" }}
            >
              Company
            </p>
            <div className="flex flex-col gap-2 md:gap-3.5">
              <Link to="/blog" className="text-xs md:text-sm text-[#0D1512]/70 hover:text-[#0D1512] hover:underline transition-all">
                Studio Blog
              </Link>
              <Link to="/faq" className="text-xs md:text-sm text-[#0D1512]/70 hover:text-[#0D1512] hover:underline transition-all">
                Frequently Asked Questions (FAQ)
              </Link>
              <Link to="/contact" className="text-xs md:text-sm text-[#0D1512]/70 hover:text-[#0D1512] hover:underline transition-all">
                Contact Us
              </Link>
              <Link to="/bulk-order" className="text-xs md:text-sm text-[#0D1512]/70 hover:text-[#0D1512] hover:underline transition-all">
                Bulk & Wholesale Orders
              </Link>
              <Link to="/shipping" className="text-xs md:text-sm text-[#0D1512]/70 hover:text-[#0D1512] hover:underline transition-all">
                Delivery Policy
              </Link>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3 md:mb-6"
              style={{ fontFamily: "'Outfit', sans-serif", color: "#0D1512" }}
            >
              Legal & Terms
            </p>
            <div className="flex flex-col gap-2 md:gap-3.5">
              <Link to="/privacy" className="text-xs md:text-sm text-[#0D1512]/70 hover:text-[#0D1512] hover:underline transition-all">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-xs md:text-sm text-[#0D1512]/70 hover:text-[#0D1512] hover:underline transition-all">
                Terms of Service
              </Link>
              <Link to="/refund" className="text-xs md:text-sm text-[#0D1512]/70 hover:text-[#0D1512] hover:underline transition-all">
                Refund Policy
              </Link>
            </div>
          </div>

          {/* FEATURE 9: Newsletter Signup */}
          <div className="flex flex-col gap-3">
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] mb-1"
              style={{ fontFamily: "'Outfit', sans-serif", color: "#0D1512" }}
            >
              Stay Updated
            </p>
            <p className="text-xs text-[#0D1512]/70">
              Get exclusive offers, new product alerts, and creative design updates.
            </p>

            <NewsletterForm />
          </div>

        </div>

        {/* Bottom Banner */}
        <div
          className="pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-[11px] md:text-xs text-[#0D1512]/50"
          style={{ borderTop: "1px solid rgba(27, 57, 49, 0.1)" }}
        >
          <p>© {new Date().getFullYear()} Olive Seeds. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with ❤️ by Olive Seeds
          </p>
        </div>

      </div>
    </footer>
  );
}
