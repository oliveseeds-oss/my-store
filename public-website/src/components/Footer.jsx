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
    <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-1">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full sm:flex-1 bg-white border border-[#DADCD7] rounded px-3.5 py-2.5 text-xs text-[#181A18] focus:outline-none focus:border-[#23483D]"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-[#23483D] hover:bg-[#16352D] text-white font-medium uppercase tracking-wider text-xs px-5 py-2.5 rounded transition shadow-none disabled:opacity-50 shrink-0"
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </div>
      {msg && <p className="text-[11px] font-medium text-emerald-700">{msg}</p>}
      {err && <p className="text-[11px] font-medium text-rose-600">{err}</p>}
    </form>
  );
}

export default function Footer({ settings = {}, dark = false }) {
  return (
    <footer
      style={{
        background: "#F8F8F6",
        color: "#181A18",
        borderTop: "1px solid #E7E7E2",
        fontFamily: "'DM Sans', sans-serif"
      }}
      className="relative z-10"
    >
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10 mb-8 md:mb-12">

          {/* Brand Info */}
          <div className="flex flex-col gap-3 lg:col-span-1">
            <p
              className="text-xl md:text-2xl font-medium tracking-wide text-[#181A18]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Olive Seeds
            </p>
            <p className="text-xs md:text-[13px] leading-relaxed text-[#676A65]">
              We craft bespoke design objects, custom brand expressions, and curated visual experiences for discerning clients who understand that quality is never an accident.
            </p>

            {/* Social Icons */}
            <div className="flex gap-2 mt-2">
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
                  className="w-8 h-8 rounded bg-white border border-[#E7E7E2] hover:border-[#CACCC6] hover:bg-[#F5F4F1] transition flex items-center justify-center text-sm"
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-3 md:mb-4 text-[#181A18]">
              Shop Collections
            </p>
            <div className="flex flex-col gap-2 md:gap-2.5">
              <Link to="/products" className="text-xs md:text-[13px] text-[#676A65] hover:text-[#23483D] transition">
                Bespoke Commissions
              </Link>
              <Link to="/digital" className="text-xs md:text-[13px] text-[#676A65] hover:text-[#23483D] transition">
                Digital Design Suites
              </Link>
              <Link to="/catalog" className="text-xs md:text-[13px] text-[#676A65] hover:text-[#23483D] transition">
                Atelier Catalog
              </Link>
              <Link to="/about" className="text-xs md:text-[13px] text-[#676A65] hover:text-[#23483D] transition">
                About the Studio
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-3 md:mb-4 text-[#181A18]">
              The Studio
            </p>
            <div className="flex flex-col gap-2 md:gap-2.5">
              <Link to="/blog" className="text-xs md:text-[13px] text-[#676A65] hover:text-[#23483D] transition">
                Studio Journal
              </Link>
              <Link to="/faq" className="text-xs md:text-[13px] text-[#676A65] hover:text-[#23483D] transition">
                Questions &amp; Enquiries
              </Link>
              <Link to="/contact" className="text-xs md:text-[13px] text-[#676A65] hover:text-[#23483D] transition">
                Contact the Studio
              </Link>
              <Link to="/bulk-order" className="text-xs md:text-[13px] text-[#676A65] hover:text-[#23483D] transition">
                B2B &amp; Corporate Orders
              </Link>
              <Link to="/shipping" className="text-xs md:text-[13px] text-[#676A65] hover:text-[#23483D] transition">
                Worldwide Delivery
              </Link>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-3 md:mb-4 text-[#181A18]">
              Legal &amp; Terms
            </p>
            <div className="flex flex-col gap-2 md:gap-2.5">
              <Link to="/privacy" className="text-xs md:text-[13px] text-[#676A65] hover:text-[#23483D] transition">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-xs md:text-[13px] text-[#676A65] hover:text-[#23483D] transition">
                Terms of Service
              </Link>
              <Link to="/refund" className="text-xs md:text-[13px] text-[#676A65] hover:text-[#23483D] transition">
                Refund Policy
              </Link>
              <Link to="/cookies" className="text-xs md:text-[13px] text-[#676A65] hover:text-[#23483D] transition">
                Cookies Policy
              </Link>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1 text-[#181A18]">
              Studio Gazette
            </p>
            <p className="text-xs text-[#676A65]">
              Curated dispatches, seasonal commissions, and atelier perspectives delivered to your inbox.
            </p>

            <NewsletterForm />
          </div>

        </div>

        {/* Bottom Banner */}
        <div
          className="pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-[#8A8D88]"
          style={{ borderTop: "1px solid #E7E7E2" }}
        >
          <p>© {new Date().getFullYear()} Olive Seeds Design Studio. All rights reserved.</p>
          <p className="tracking-wide text-[#8A8D88]">
            Designed with intention. Delivered with care.
          </p>
        </div>

      </div>
    </footer>
  );
}
