import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api";

const zoneGroups = [
  {
    zone: "India (Domestic)",
    flag: "🇮🇳",
    color: { bg: "white", border: "rgba(27, 57, 49, 0.15)", accent: "#0D1512" },
    countries: ["India"],
    standardDays: "3–5 business days",
    expressDays: "1–2 business days",
    baseFee: "₹60",
    freeAbove: "₹999",
    taxNote: "18% GST applicable",
  },
  {
    zone: "Gulf & Middle East",
    flag: "🌍",
    color: { bg: "white", border: "rgba(27, 57, 49, 0.15)", accent: "#0D1512" },
    countries: ["UAE 🇦🇪", "Saudi Arabia 🇸🇦", "Bahrain 🇧🇭", "Kuwait 🇰🇼"],
    standardDays: "7–10 business days",
    expressDays: "4–5 business days",
    baseFee: "₹600–650",
    freeAbove: "₹4,000",
    taxNote: "No additional tax",
  },
  {
    zone: "Southeast Asia & Pacific",
    flag: "🌏",
    color: { bg: "white", border: "rgba(27, 57, 49, 0.15)", accent: "#0D1512" },
    countries: ["Singapore 🇸🇬", "Malaysia 🇲🇾", "Australia 🇦🇺", "New Zealand 🇳🇿"],
    standardDays: "10–16 business days",
    expressDays: "6–8 business days",
    baseFee: "₹700–900",
    freeAbove: "₹4,500–5,500",
    taxNote: "No additional tax",
  },
  {
    zone: "Europe & North America",
    flag: "🌎",
    color: { bg: "white", border: "rgba(27, 57, 49, 0.15)", accent: "#0D1512" },
    countries: ["UK 🇬🇧", "Germany 🇩🇪", "France 👑", "Netherlands 🇳🇱", "USA 🇺🇸", "Canada 🇨🇦"],
    standardDays: "10–14 business days",
    expressDays: "6–8 business days",
    baseFee: "₹800–900",
    freeAbove: "₹5,000–5,500",
    taxNote: "No additional tax",
  },
];

const importantNotes = [
  { icon: "📦", title: "Packaging", desc: "All items are packed in premium protective packaging to ensure safe delivery. Fragile engraved items use bubble wrap and custom-fit foam inserts." },
  { icon: "🚚", title: "Carriers", desc: "We partner with India Post, BlueDart, FedEx International, and DHL for domestic and international shipments. Carrier selection is based on your location and order size." },
  { icon: "📍", title: "Tracking", desc: "Once shipped, you will receive a tracking number via email and SMS. Use it on the carrier's website to track your order in real time." },
  { icon: "🛃", title: "Customs & Duties", desc: "For international orders, customs duties, import taxes, or handling fees may be levied by your country's customs authority. These charges are the buyer's responsibility and are not included in our shipping fee." },
  { icon: "⏳", title: "Production time", desc: "Engraved products require 1–2 business days for production before dispatch. Total delivery time = production time + shipping time shown above." },
  { icon: "📅", title: "Business days", desc: "Business days exclude weekends and public holidays in India. Orders placed on weekends are processed on the next business day." },
];

export default function ShippingPolicy() {
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    API.get("/currency").then(r => setCurrencies(r.data)).catch(() => { });
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#FAF9F6", color: "#0D1512" }} className="min-h-screen">
      <Navbar />

      {/* Hero — rich green */}
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
        <div className="max-w-5xl mx-auto px-6 relative text-[#FAF9F6]">
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
            <Link to="/" style={{ color: "#FAF9F6", fontSize: "13px", textDecoration: "none", opacity: 0.8 }} className="hover:opacity-100 transition">Home</Link>
            <span style={{ color: "#FAF9F6", opacity: 0.4 }}>›</span>
            <span style={{ color: "#FAF9F6", fontSize: "13px", opacity: 0.8 }}>Policies</span>
          </div>
          <p style={{ color: "#FAF9F6", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "16px", fontWeight: "bold" }}>
            Worldwide Delivery
          </p>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            color: "#FAF9F6", fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 900, lineHeight: 1.15, marginBottom: "20px",
          }}>
            Shipping<br />Policy
          </h1>
          <p style={{ color: "#FAF9F6", fontSize: "14px", opacity: 0.8, fontWeight: "semibold" }}>
            Currently shipping to 15 countries &nbsp;·&nbsp; Real-time tracking on all orders
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Hero stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "48px" }}>
          {[
            { value: "15", label: "Countries we ship to", icon: "🌍" },
            { value: "3–5", label: "Days domestic delivery", icon: "🇮🇳" },
            { value: "₹60", label: "Starting shipping fee", icon: "💰" },
            { value: "Free", label: "Above ₹999 in India", icon: "🎁" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "white", border: "1px solid rgba(27, 57, 49, 0.15)",
              borderRadius: "16px", padding: "24px 20px", textAlign: "center",
            }} className="shadow-md">
              <div style={{ fontSize: "30px", marginBottom: "10px" }}>{s.icon}</div>
              <p style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "28px", fontWeight: 900, color: "#0D1512", marginBottom: "6px",
              }}>{s.value}</p>
              <p style={{ fontSize: "12px", color: "#0D1512", opacity: 0.7, lineHeight: 1.4, fontWeight: "bold" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Shipping zones */}
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "26px", color: "#0D1512", fontWeight: 900, marginBottom: "24px" }}>
            Shipping Zones & Rates
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {zoneGroups.map((zone) => {
              const c = zone.color;
              return (
                <div key={zone.zone} style={{
                  background: c.bg, border: `1px solid ${c.border}`,
                  borderRadius: "16px", overflow: "hidden",
                }} className="shadow-md">
                  <div style={{
                    padding: "16px 24px",
                    borderBottom: `1px solid ${c.border}`,
                    display: "flex", alignItems: "center", gap: "12px",
                  }}>
                    <span style={{ fontSize: "24px" }}>{zone.flag}</span>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "18px", color: c.accent, fontWeight: 900 }}>
                      {zone.zone}
                    </h3>
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "0",
                    padding: "0",
                  }} className="divide-y md:divide-y-0 md:divide-x divide-stone-200/10">
                    {[
                      { label: "Countries", value: zone.countries.join(", ") },
                      { label: "Standard delivery", value: zone.standardDays },
                      { label: "Shipping fee", value: zone.baseFee },
                      { label: "Free shipping above", value: zone.freeAbove },
                      { label: "Tax", value: zone.taxNote },
                    ].map((row, i) => (
                      <div key={i} style={{
                        padding: "20px",
                        borderRight: i < 4 ? `1px solid ${c.border}` : "none",
                      }}>
                        <p style={{ fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: c.accent, opacity: 0.6, marginBottom: "6px", fontWeight: "bold" }}>
                          {row.label}
                        </p>
                        <p style={{ fontSize: "14px", fontWeight: 800, color: "#0D1512", lineHeight: 1.4 }}>
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Important notes */}
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "26px", color: "#0D1512", fontWeight: 900, marginBottom: "24px" }}>
            Important Shipping Notes
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {importantNotes.map((note) => (
              <div key={note.title} style={{
                background: "white", border: "1px solid rgba(27, 57, 49, 0.15)",
                borderRadius: "16px", padding: "24px",
                display: "flex", gap: "16px", alignItems: "flex-start",
              }} className="shadow-sm">
                <span style={{
                  fontSize: "24px", width: "44px", height: "44px",
                  background: "rgba(27, 57, 49, 0.1)", borderRadius: "12px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {note.icon}
                </span>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 800, color: "#0D1512", marginBottom: "6px" }}>
                    {note.title}
                  </p>
                  <p style={{ fontSize: "13px", color: "#0D1512", opacity: 0.8, lineHeight: 1.7, fontWeight: 500 }}>
                    {note.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Digital products note */}
        <div style={{
          background: "white", border: "1px solid rgba(27, 57, 49, 0.15)",
          borderRadius: "16px", padding: "28px 32px", marginBottom: "40px",
          display: "flex", gap: "20px", alignItems: "flex-start",
        }} className="shadow-md">
          <span style={{ fontSize: "30px", flexShrink: 0 }}>⚡</span>
          <div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "18px", color: "#0D1512", fontWeight: 900, marginBottom: "8px" }}>
              Digital Products — Instant Delivery
            </p>
            <p style={{ fontSize: "14px", color: "#0D1512", opacity: 0.9, lineHeight: 1.8, fontWeight: 500 }}>
              Digital products (logo kits, templates, and design packs) are delivered via secure download link immediately after payment confirmation. No shipping is required. Your download link will be sent to your registered email address and will also be available in your account dashboard.
            </p>
          </div>
        </div>

        {/* Countries shipping to */}
        {currencies.length > 0 && (
          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "22px", color: "#0D1512", fontWeight: 950, marginBottom: "16px" }}>
              Countries We Currently Ship To
            </h2>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "10px",
            }}>
              {currencies.map((c) => (
                <div key={c.country_code} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "white", border: "1px solid rgba(27, 57, 49, 0.15)",
                  borderRadius: "30px", padding: "8px 18px",
                  fontSize: "13px", color: "#0D1512", fontWeight: 600,
                }} className="shadow-sm">
                  <span style={{ fontSize: "18px" }}>{c.flag_emoji}</span>
                  {c.country_name}
                </div>
              ))}
            </div>
            <p style={{ fontSize: "12px", color: "#0D1512", opacity: 0.6, marginTop: "12px", fontWeight: "bold" }}>
              Don't see your country? Contact us — we may still be able to ship to you on request.
            </p>
          </section>
        )}

        {/* CTA */}
        <div style={{
          background: "#0D1512",
          borderRadius: "24px", padding: "32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "20px", flexWrap: "wrap",
        }} className="shadow-xl">
          <div className="text-[#FAF9F6]">
            <p style={{ fontFamily: "'Outfit', sans-serif", color: "#FAF9F6", fontSize: "20px", fontWeight: 900, marginBottom: "8px" }}>
              Questions about your shipment?
            </p>
            <p style={{ color: "#FAF9F6", opacity: 0.8, fontSize: "13px", fontWeight: "semibold" }}>
              Our team responds within 24 hours. Contact us with your Order ID.
            </p>
          </div>
          <Link to="/contact" style={{
            display: "inline-block", background: "#FAF9F6", color: "#0D1512",
            fontWeight: 900, fontSize: "12px", padding: "12px 28px",
            borderRadius: "12px", textDecoration: "none", whiteSpace: "nowrap",
          }} className="uppercase tracking-wider shadow active:scale-95 transition">
            Track my order →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}