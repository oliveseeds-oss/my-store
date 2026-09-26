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
      setMsg(res.data.message || "You are subscribed.");
      setEmail("");
    } catch (error) {
      setErr(error.response?.data?.error || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full sm:flex-1 bg-[#182923] border border-[#294239] rounded px-3.5 py-2.5 text-xs text-[#F3F5F4] placeholder-[#7E8F87] focus:outline-none focus:border-[#C5A880] transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-[#C5A880] hover:bg-[#B5966B] text-[#111C18] font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded transition shadow-sm disabled:opacity-50 shrink-0"
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </div>
      {msg && <p className="text-[11px] font-medium text-emerald-400">{msg}</p>}
      {err && <p className="text-[11px] font-medium text-rose-400">{err}</p>}
    </form>
  );
}

export default function Footer({ settings = {}, dark = false }) {
  return (
    <footer
      style={{
        background: "#111C18",
        color: "#F3F5F4",
        borderTop: "1px solid rgba(197, 168, 128, 0.25)",
        fontFamily: "'DM Sans', sans-serif"
      }}
      className="relative z-10"
    >
      <div className="max-w-6xl mx-auto px-6 py-14 md:py-20">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-12 mb-12 md:mb-16">

          {/* Brand Info */}
          <div className="flex flex-col gap-3.5 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 group" title="Olive Seeds Design Studio">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#C5A880]/50 p-0.5 bg-[#FAF6EE] shadow-sm group-hover:border-[#C5A880] group-hover:scale-105 transition-all shrink-0">
                <img 
                  src={settings?.logo_url || settings?.logo || "/android-chrome-192x192.png"} 
                  alt="Olive Seeds Studio Logo" 
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>
              <div>
                <p
                  className="text-2xl font-normal tracking-wide text-[#F3F5F4] flex items-center gap-1.5 leading-none"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  <span>Olive Seeds</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                </p>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A880] font-bold block mt-1">
                  Design Studio
                </span>
              </div>
            </Link>
            <p className="text-xs md:text-[13px] leading-relaxed text-[#9EA8A2]">
              We craft bespoke design objects, custom brand expressions, and curated visual experiences for discerning clients who understand that quality is never an accident.
            </p>

            {/* Social Icons */}
            <div className="flex gap-2.5 mt-2">
              {[
                { icon: "🔗", label: "LinkedIn", link: "https://www.linkedin.com/in/olive-seeds-design-studio" },
                { icon: "💬", label: "WhatsApp", link: "https://wa.me/+919442943394" },
                { icon: "✉️", label: "Gmail", link: "mailto:oliveseeds.oss@gmail.com" }
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded bg-[#182923] border border-[#294239] hover:border-[#C5A880] hover:text-[#C5A880] transition flex items-center justify-center text-sm text-[#D1DDD6]"
                  title={s.label}
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-4 text-[#C5A880]">
              Shop Collections
            </p>
            <div className="flex flex-col gap-2.5">
              <Link to="/products" className="text-xs md:text-[13px] text-[#A4B0A9] hover:text-[#F3F5F4] transition">
                Bespoke Commissions
              </Link>
              <Link to="/digital" className="text-xs md:text-[13px] text-[#A4B0A9] hover:text-[#F3F5F4] transition">
                Digital Design Suites
              </Link>
              <Link to="/catalog" className="text-xs md:text-[13px] text-[#A4B0A9] hover:text-[#F3F5F4] transition">
                Atelier Catalog
              </Link>
              <Link to="/about" className="text-xs md:text-[13px] text-[#A4B0A9] hover:text-[#F3F5F4] transition">
                About the Studio
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-4 text-[#C5A880]">
              The Studio
            </p>
            <div className="flex flex-col gap-2.5">
              <Link to="/blog" className="text-xs md:text-[13px] text-[#A4B0A9] hover:text-[#F3F5F4] transition">
                Studio Journal
              </Link>
              <Link to="/faq" className="text-xs md:text-[13px] text-[#A4B0A9] hover:text-[#F3F5F4] transition">
                Questions &amp; Enquiries
              </Link>
              <Link to="/contact" className="text-xs md:text-[13px] text-[#A4B0A9] hover:text-[#F3F5F4] transition">
                Contact the Studio
              </Link>
              <Link to="/bulk-order" className="text-xs md:text-[13px] text-[#A4B0A9] hover:text-[#F3F5F4] transition">
                B2B &amp; Corporate Orders
              </Link>
              <Link to="/shipping" className="text-xs md:text-[13px] text-[#A4B0A9] hover:text-[#F3F5F4] transition">
                Worldwide Delivery
              </Link>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-4 text-[#C5A880]">
              Legal &amp; Terms
            </p>
            <div className="flex flex-col gap-2.5">
              <Link to="/privacy" className="text-xs md:text-[13px] text-[#A4B0A9] hover:text-[#F3F5F4] transition">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-xs md:text-[13px] text-[#A4B0A9] hover:text-[#F3F5F4] transition">
                Terms of Service
              </Link>
              <Link to="/refund" className="text-xs md:text-[13px] text-[#A4B0A9] hover:text-[#F3F5F4] transition">
                Refund Policy
              </Link>
              <Link to="/cookies" className="text-xs md:text-[13px] text-[#A4B0A9] hover:text-[#F3F5F4] transition">
                Cookies Policy
              </Link>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1 text-[#C5A880]">
              Studio Gazette
            </p>
            <p className="text-xs text-[#9EA8A2] leading-relaxed">
              Curated dispatches, seasonal commissions, and atelier perspectives delivered directly to your inbox.
            </p>

            <NewsletterForm />
          </div>

        </div>

        {/* Bottom Banner */}
        <div
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#7E8F87]"
          style={{ borderTop: "1px solid #1F332B" }}
        >
          <div className="flex items-center gap-2.5">
            <img 
              src={settings?.logo_url || settings?.logo || "/android-chrome-192x192.png"} 
              alt="" 
              className="w-5 h-5 rounded-full border border-[#C5A880]/30 opacity-80 shrink-0" 
            />
            <p>© {new Date().getFullYear()} Olive Seeds Design Studio. All rights reserved.</p>
          </div>
          <p className="tracking-wide text-[#9EA8A2] flex items-center gap-2">
            <span className="text-[#C5A880]">✦</span>
            <span>Designed with intention. Delivered with care.</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
