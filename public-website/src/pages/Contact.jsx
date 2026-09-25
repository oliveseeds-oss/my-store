import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api";
import SEO from "../components/SEO";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Contact Olive Seeds Design Studio | Bespoke Design Enquiries";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Enquire about bespoke design products, B2B bulk orders, or brand services. Olive Seeds Design Studio welcomes enquiries from corporate clients worldwide.");
    }
  }, []);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    countryCode: "+91",
    phone: "",
    email: "",
    subject: "Bespoke Objects & Keepsakes",
    company: "",
    message: "",
  });

  const projectTypes = [
    "Bespoke Objects & Keepsakes",
    "Corporate Gifting & Bulk",
    "Architectural Signage",
    "Brand & Spatial Systems",
    "Digital Design Suites"
  ];

  const countryCodes = [
    "+91 India",
    "+1 United States",
    "+44 United Kingdom",
    "+971 United Arab Emirates",
    "+65 Singapore",
    "+49 Germany",
    "+33 France",
    "+61 Australia",
    "+1 Canada",
    "+41 Switzerland",
    "+31 Netherlands",
    "+966 Saudi Arabia",
    "+974 Qatar",
    "+965 Kuwait",
    "+973 Bahrain",
    "+60 Malaysia",
    "+64 New Zealand",
    "+47 Norway",
    "+32 Belgium",
  ];

  const submit = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.phone ||
      !form.email ||
      !form.message
    ) {
      alert("Please complete the required fields (Name, Phone, Email, and Brief).");
      return;
    }

    setLoading(true);
    try {
      await API.post("/contact", form);
      setSent(true);
      setForm({
        firstName: "",
        lastName: "",
        countryCode: "+91",
        phone: "",
        email: "",
        subject: "Bespoke Objects & Keepsakes",
        company: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      alert("Unable to transmit your brief. Please verify your connection or reach out directly via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#FFFFFF", color: "#181A18", fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen">
      <SEO
        title="Contact Olive Seeds Design Studio | Bespoke Design Enquiries"
        description="Enquire about bespoke design products, B2B bulk orders, or brand services. Olive Seeds Design Studio welcomes enquiries from corporate clients worldwide."
        keywords="contact bespoke design studio, corporate design enquiries, b2b orders, olive seeds design studio"
      />
      <Navbar />

      {/* ── ATELIER CONTACT SECTION (QUIET LUXURY & SERENE) ── */}
      <section
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #EAE4D6",
          padding: "clamp(80px, 9vw, 120px) 24px clamp(60px, 8vw, 100px)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Subtle Ambient Warm Champagne Gold Glow Decoration with Motion */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.6, 0.35],
            x: [0, 20, 0],
            y: [0, -15, 0]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-15%",
            right: "15%",
            width: 550,
            height: 550,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(197, 168, 128, 0.16) 0%, rgba(197, 168, 128, 0.04) 50%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1
          }}
        />

        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.25, 0.45, 0.25],
            y: [0, 15, 0]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "10%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(164, 136, 85, 0.12) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1
          }}
        />

        <div className="max-w-4xl mx-auto relative z-10">

          {/* Centered Editorial Header */}
          <div className="text-center mb-12 sm:mb-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 bg-[#FAF6EE] border border-[#EAE4D6] px-4 py-1.5 rounded-[4px] mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#23483D]">
                <span className="text-[#C5A880]">✦</span>
                Private Atelier Consultation
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.12] text-[#181A18] tracking-tight mb-4"
            >
              Start a Conversation
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm sm:text-base leading-relaxed text-[#676A65] max-w-xl mx-auto"
            >
              Whether you are commissioning bespoke executive objects or seeking a longer-term creative partnership — our studio directors welcome your brief.
            </motion.p>

            {/* Direct Concierge Line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.85, delay: 0.3 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs text-[#676A65]"
            >
              <a
                href="https://wa.me/+919442943394"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#23483D] hover:text-[#16352D] font-medium transition"
              >
                <span>💬 WhatsApp Concierge: +91 94429 43394</span>
              </a>
              <span className="hidden sm:inline text-[#EAE4D6]">|</span>
              <a
                href="mailto:oliveseeds.oss@gmail.com"
                className="inline-flex items-center gap-2 text-[#23483D] hover:text-[#16352D] font-medium transition"
              >
                <span>✉️ Email: oliveseeds.oss@gmail.com</span>
              </a>
            </motion.div>
          </div>

          {/* Clean, Refined Consultation Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto bg-[#FFFFFF] border border-[#EAE4D6] rounded-[4px] p-7 sm:p-10 shadow-[0_8px_30px_rgba(20,25,22,0.03)]"
          >
            {sent ? (
              <div className="text-center py-12 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FAF6EE] border border-[#C5A880] flex items-center justify-center text-xl text-[#23483D]">
                  ✓
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-normal text-[#181A18]">
                  Brief Transmitted
                </h2>
                <p className="text-xs sm:text-sm text-[#676A65] max-w-sm leading-relaxed">
                  Thank you for reaching out. A studio director has been notified and will review your specifications within one business day.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-2 text-xs uppercase tracking-wider font-semibold text-[#23483D] border border-[#23483D] px-5 py-2.5 rounded-[4px] hover:bg-[#FAF6EE] transition"
                >
                  Submit Another Brief
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">

                {/* Scope Selector */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#676A65] mb-2 block">
                    Commission Scope
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-[#FAF6EE] border border-[#EAE4D6] rounded-[4px] px-3.5 py-2.5 text-xs text-[#181A18] focus:outline-none focus:border-[#23483D] transition cursor-pointer"
                  >
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#676A65] mb-1.5 block">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="First Name"
                      className="w-full bg-[#FFFFFF] border border-[#EAE4D6] rounded-[4px] px-3.5 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#676A65] mb-1.5 block">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Last Name"
                      className="w-full bg-[#FFFFFF] border border-[#EAE4D6] rounded-[4px] px-3.5 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition"
                    />
                  </div>
                </div>

                {/* Contact & Country Code */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#676A65] mb-1.5 block">
                    Contact / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={form.countryCode}
                      onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                      className="bg-[#FFFFFF] border border-[#EAE4D6] rounded-[4px] px-3 py-2.5 text-xs text-[#181A18] focus:outline-none focus:border-[#23483D] transition w-32"
                    >
                      {countryCodes.map((code) => (
                        <option key={code} value={code.split(" ")[0]}>
                          {code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Mobile or Direct Line"
                      className="flex-1 bg-[#FFFFFF] border border-[#EAE4D6] rounded-[4px] px-3.5 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#676A65] mb-1.5 block">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@organization.com"
                    className="w-full bg-[#FFFFFF] border border-[#EAE4D6] rounded-[4px] px-3.5 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition"
                  />
                </div>

                {/* Organization */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#676A65] mb-1.5 block">
                    Organization / Brand (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Company or Private Studio"
                    className="w-full bg-[#FFFFFF] border border-[#EAE4D6] rounded-[4px] px-3.5 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] transition"
                  />
                </div>

                {/* Project Brief */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#676A65] mb-1.5 block">
                    Project Brief &amp; Requirements <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your project, timelines, desired materials, or estimated quantities..."
                    className="w-full bg-[#FFFFFF] border border-[#EAE4D6] rounded-[4px] px-3.5 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] resize-none transition"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={submit}
                  disabled={loading}
                  className="w-full bg-[#23483D] hover:bg-[#16352D] text-white rounded-[4px] py-3.5 font-bold tracking-[0.12em] uppercase text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                >
                  {loading ? "Transmitting..." : "Submit Inquiry to Studio Partners →"}
                </button>

                <p className="text-[11px] text-[#8A8D88] text-center mt-1">
                  Guaranteed response within 24 hours. Non-disclosure agreements honored upon request.
                </p>

              </div>
            )}
          </motion.div>

        </div>
      </section>

      <Footer />
    </div>
  );
}