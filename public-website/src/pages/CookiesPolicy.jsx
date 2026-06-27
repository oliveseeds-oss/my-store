import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const cookieTypes = [
  {
    id: "essential",
    name: "Essential Cookies",
    icon: "🔐",
    required: true,
    color: { bg: "white", border: "rgba(27, 57, 49, 0.15)", text: "#0D1512", badge: "#0D1512" },
    description: "These cookies are strictly necessary for the website to function and cannot be disabled. They enable core features like your shopping cart, login session, currency preference, and order processing.",
    examples: [
      { name: "auth_token", purpose: "Keeps you logged in securely", duration: "7 days" },
      { name: "cart_session", purpose: "Remembers your cart items", duration: "Session" },
      { name: "currency_pref", purpose: "Stores your currency selection", duration: "30 days" },
      { name: "csrf_token", purpose: "Prevents cross-site request forgery", duration: "Session" },
    ],
  },
  {
    id: "analytics",
    name: "Analytics Cookies",
    icon: "📊",
    required: false,
    color: { bg: "white", border: "rgba(27, 57, 49, 0.15)", text: "#0D1512", badge: "#0D1512" },
    description: "These cookies help us understand how visitors interact with our website — which pages are popular, where visitors come from, and how they navigate. All data is aggregated and anonymised.",
    examples: [
      { name: "visitor_count", purpose: "Anonymous daily visitor tracking", duration: "24 hours" },
      { name: "page_views", purpose: "Page popularity analytics", duration: "30 days" },
      { name: "referrer_source", purpose: "Traffic source tracking", duration: "30 days" },
    ],
  },
  {
    id: "functional",
    name: "Functional Cookies",
    icon: "⚙️",
    required: false,
    color: { bg: "white", border: "rgba(27, 57, 49, 0.15)", text: "#0D1512", badge: "#0D1512" },
    description: "Functional cookies enhance your experience by remembering your preferences and choices. Without these, you may need to re-enter preferences each time you visit.",
    examples: [
      { name: "selected_country", purpose: "Remembers shipping country choice", duration: "90 days" },
      { name: "recently_viewed", purpose: "Shows recently viewed products", duration: "14 days" },
      { name: "cookie_consent", purpose: "Stores your cookie preferences", duration: "1 year" },
    ],
  },
];

function CookieToggle({ enabled, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      style={{
        width: "48px", height: "26px",
        borderRadius: "13px",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: enabled ? "#0D1512" : "#d5cfc8",
        position: "relative",
        transition: "background 0.3s",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: "3px",
        left: enabled ? "24px" : "3px",
        width: "20px", height: "20px",
        borderRadius: "50%",
        background: "white",
        transition: "left 0.3s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

export default function CookiesPolicy() {
  const [prefs, setPrefs] = useState({ analytics: false, functional: true });
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem("cookie_prefs", JSON.stringify({ ...prefs, essential: true }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#FAF9F6", color: "#0D1512" }} className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <div style={{
        background: "#0D1512",
        padding: "96px 0 80px",
        position: "relative",
        overflow: "hidden",
      }} className="shadow-md">
        {/* Luxury glowing mesh blurs */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#FAF9F6]/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-[75px] pointer-events-none" />

        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "4px",
          background: "linear-gradient(90deg, transparent, rgba(255, 248, 222, 0.3), transparent)",
        }} />
        <div className="max-w-4xl mx-auto px-6 relative text-[#FAF9F6]">
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
            <Link to="/" style={{ color: "#FAF9F6", fontSize: "13px", textDecoration: "none", opacity: 0.8 }} className="hover:opacity-100 transition">Home</Link>
            <span style={{ color: "#FAF9F6", opacity: 0.4 }}>›</span>
            <span style={{ color: "#FAF9F6", fontSize: "13px", opacity: 0.8 }}>Legal</span>
          </div>
          <p style={{ color: "#FAF9F6", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "16px", fontWeight: "bold" }}>
            Transparency First
          </p>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            color: "#FAF9F6", fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 900, lineHeight: 1.15, marginBottom: "20px",
          }}>
            Cookie Consent<br />Policy
          </h1>
          <p style={{ color: "#FAF9F6", fontSize: "14px", opacity: 0.8, fontWeight: "semibold" }}>
            Effective date: 1 January 2025 &nbsp;·&nbsp; You control what we store
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* What are cookies */}
        <div style={{
          background: "white", border: "1px solid rgba(27, 57, 49, 0.15)",
          borderRadius: "16px", padding: "32px",
          marginBottom: "32px",
          display: "flex", gap: "24px", alignItems: "flex-start",
        }} className="shadow-md">
          <span style={{ fontSize: "40px", flexShrink: 0 }}>🍪</span>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "22px", color: "#0D1512", fontWeight: 900, marginBottom: "12px" }}>
              What are cookies?
            </h2>
            <p style={{ color: "#0D1512", fontSize: "14px", lineHeight: 1.85, fontWeight: 500 }}>
              Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you logged in, and understand how you use the site. MyStore uses cookies to provide you with a seamless shopping experience — from remembering your cart to showing prices in your local currency.
            </p>
            <p style={{ color: "#0D1512", opacity: 0.9, fontSize: "14px", lineHeight: 1.85, marginTop: "12px", fontWeight: 500 }}>
              You can control your cookie preferences below. Note that disabling certain cookies may affect your experience on our site.
            </p>
          </div>
        </div>

        {/* Cookie type cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" }}>
          {cookieTypes.map((ct) => {
            const isEnabled = ct.required || prefs[ct.id];
            const c = ct.color;
            return (
              <div key={ct.id} style={{
                background: "white",
                border: `1px solid ${c.border}`,
                borderRadius: "16px",
                overflow: "hidden",
              }} className="shadow-md">
                {/* Header */}
                <div style={{
                  background: "rgba(27, 57, 49, 0.04)",
                  padding: "20px 24px",
                  display: "flex", alignItems: "center", justifySpace: "between",
                  borderBottom: `1px solid ${c.border}`,
                }} className="flex justify-between items-center">
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span style={{ fontSize: "24px" }}>{ct.icon}</span>
                    <div>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "18px", color: c.text, fontWeight: 900, marginBottom: "4px" }}>
                        {ct.name}
                      </h3>
                      {ct.required && (
                        <span style={{
                          fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase",
                          background: "#0D1512", color: "#FAF9F6",
                          padding: "2px 8px", borderRadius: "6px", fontWeight: "bold",
                        }}>
                          Always on
                        </span>
                      )}
                    </div>
                  </div>
                  <CookieToggle
                    enabled={isEnabled}
                    disabled={ct.required}
                    onChange={(val) => setPrefs(p => ({ ...p, [ct.id]: val }))}
                  />
                </div>

                {/* Body */}
                <div style={{ padding: "24px" }}>
                  <p style={{ color: "#0D1512", opacity: 0.9, fontSize: "14px", lineHeight: 1.8, marginBottom: "20px", fontWeight: 500 }}>
                    {ct.description}
                  </p>

                  {/* Examples table */}
                  <div style={{ border: "1px solid rgba(27, 57, 49, 0.15)", borderRadius: "16px", overflow: "hidden" }}>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 2fr 120px",
                      background: "rgba(27, 57, 49, 0.08)",
                      padding: "12px 18px",
                      fontSize: "10px", letterSpacing: "1.5px",
                      textTransform: "uppercase", color: "#0D1512", fontWeight: "bold",
                    }}>
                      <span>Cookie name</span>
                      <span>Purpose</span>
                      <span>Duration</span>
                    </div>
                    {ct.examples.map((ex, i) => (
                      <div key={i} style={{
                        display: "grid", gridTemplateColumns: "1fr 2fr 120px",
                        padding: "14px 18px", fontSize: "13px",
                        borderTop: "1px solid rgba(27, 57, 49, 0.1)",
                        background: "white",
                        fontWeight: 500,
                      }}>
                        <span style={{ fontFamily: "monospace", color: "#0D1512", fontSize: "12px", fontWeight: "bold" }}>{ex.name}</span>
                        <span style={{ color: "#0D1512", opacity: 0.9 }}>{ex.purpose}</span>
                        <span style={{ color: "#0D1512", opacity: 0.6, fontSize: "12px", fontWeight: "bold" }}>{ex.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save preferences */}
        <div style={{
          background: "#0D1512",
          borderRadius: "24px", padding: "28px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "20px", flexWrap: "wrap",
        }} className="shadow-xl">
          <div className="text-[#FAF9F6]">
            <p style={{ fontFamily: "'Outfit', sans-serif", color: "#FAF9F6", fontSize: "18px", fontWeight: 900, marginBottom: "6px" }}>
              Save your preferences
            </p>
            <p style={{ color: "#FAF9F6", opacity: 0.8, fontSize: "13px", fontWeight: "semibold" }}>
              Your choices are stored locally and respected on every visit.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {saved && (
              <span style={{ color: "#4caf8a", fontSize: "13px", fontWeight: "bold" }}>
                ✓ Saved!
              </span>
            )}
            <button
              onClick={() => setPrefs({ analytics: false, functional: false })}
              style={{
                background: "transparent", border: "1px solid rgba(255, 248, 222, 0.2)",
                color: "#FAF9F6", fontSize: "12px", fontWeight: 700,
                padding: "12px 20px", borderRadius: "12px", cursor: "pointer",
              }} className="hover:bg-white/5 active:scale-95 transition">
              Essential only
            </button>
            <button
              onClick={save}
              style={{
                background: "#FAF9F6", border: "none",
                color: "#0D1512", fontSize: "12px", fontWeight: 900,
                padding: "12px 24px", borderRadius: "12px", cursor: "pointer",
              }} className="uppercase tracking-wider shadow active:scale-95 transition">
              Save preferences
            </button>
          </div>
        </div>

        {/* How to clear */}
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "22px", color: "#0D1512", fontWeight: 900, marginBottom: "16px" }}>
            How to manage cookies in your browser
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {[
              { browser: "Chrome", url: "chrome://settings/cookies" },
              { browser: "Firefox", url: "about:preferences#privacy" },
              { browser: "Safari", url: "Settings → Safari → Privacy" },
              { browser: "Edge", url: "edge://settings/privacy" },
            ].map((b) => (
              <div key={b.browser} style={{
                background: "white", border: "1px solid rgba(27, 57, 49, 0.15)",
                borderRadius: "16px", padding: "20px",
              }} className="shadow-sm">
                <p style={{ fontSize: "14px", fontWeight: 850, color: "#0D1512", marginBottom: "6px" }}>{b.browser}</p>
                <p style={{ fontSize: "11px", color: "#0D1512", opacity: 0.6, fontFamily: "monospace", fontWeight: "bold" }}>{b.url}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}