import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api";
import SEO from "../components/SEO";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState("Bespoke Objects & Keepsakes");

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

  const handleTypeSelect = (type) => {
    setActiveType(type);
    setForm(prev => ({ ...prev, subject: type }));
  };

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
      alert("Unable to transmit your brief. Please verify your connection or contact our concierge via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#FFFFFF", color: "#181A18", fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen overflow-hidden">
      <SEO
        title="Contact Olive Seeds Design Studio | Bespoke Design Enquiries"
        description="Enquire about bespoke design products, B2B bulk orders, or brand services. Olive Seeds Design Studio welcomes enquiries from corporate clients worldwide."
        keywords="contact bespoke design studio, corporate design enquiries, b2b orders, olive seeds design studio"
      />
      <Navbar />

      {/* ── ATELIER HEADER ── */}
      <section
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E7E7E2"
        }}
        className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          
          {/* Header Title Area */}
          <div className="max-w-3xl mb-14 md:mb-18">
            <div className="inline-flex items-center gap-2 bg-[#F8F8F6] border border-[#E7E7E2] px-3.5 py-1.5 rounded-[4px] mb-5">
              <span className="text-[#A48855] text-xs">✦</span>
              <span className="text-[#23483D] text-[11px] font-bold uppercase tracking-[0.2em]">
                Private Atelier &amp; Corporate Commissions
              </span>
            </div>

            <h1
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.12] text-[#181A18] tracking-tight mb-5"
            >
              Initiate a Private Dialogue
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-[#676A65] font-normal">
              Whether you are commissioning an edition of bespoke executive keepsakes, developing an architectural spatial system, or seeking private creative consultation — our studio directors welcome your inquiry.
            </p>
          </div>

          {/* Main 2-Column Consultation Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">

            {/* Left Column: Direct Studio Channels & Concierge */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* Direct Concierge Desk */}
              <div className="bg-[#FFFFFF] border border-[#E7E7E2] rounded-[4px] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E2]">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#23483D]">
                    Studio Concierge
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[2px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Priority Response Desk
                  </span>
                </div>

                <p className="text-xs text-[#676A65] leading-relaxed">
                  For immediate coordination, urgent corporate deadlines, or to share confidential vectors and reference files directly:
                </p>

                {/* Direct Action Channels */}
                <div className="flex flex-col gap-3">
                  <a
                    href="https://wa.me/+919442943394"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-[4px] bg-[#F8F8F6] border border-[#E7E7E2] hover:border-[#23483D] hover:bg-[#F2F5F3] transition group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">💬</span>
                      <div>
                        <p className="text-xs font-semibold text-[#181A18] group-hover:text-[#23483D] transition">Direct WhatsApp Concierge</p>
                        <p className="text-[11px] text-[#676A65]">+91 94429 43394 · Senior Director</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#23483D] font-semibold group-hover:translate-x-0.5 transition">Connect →</span>
                  </a>

                  <a
                    href="mailto:oliveseeds.oss@gmail.com"
                    className="flex items-center justify-between p-3.5 rounded-[4px] bg-[#F8F8F6] border border-[#E7E7E2] hover:border-[#23483D] hover:bg-[#F2F5F3] transition group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">✉️</span>
                      <div>
                        <p className="text-xs font-semibold text-[#181A18] group-hover:text-[#23483D] transition">Official Studio Inquiries</p>
                        <p className="text-[11px] text-[#676A65]">oliveseeds.oss@gmail.com</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#23483D] font-semibold group-hover:translate-x-0.5 transition">Email →</span>
                  </a>
                </div>
              </div>

              {/* Response SLA & Trust Markers */}
              <div className="bg-[#F8F8F6] border border-[#E7E7E2] rounded-[4px] p-6 flex flex-col gap-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#181A18]">
                  Atelier Standards &amp; Commitments
                </p>

                <div className="flex flex-col gap-3 text-xs text-[#676A65]">
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#A48855] text-xs mt-0.5">✦</span>
                    <span className="text-[#181A18] font-medium leading-snug">
                      Guaranteed 24-hour turnaround on formal quotations and preliminary material evaluations.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#A48855] text-xs mt-0.5">✦</span>
                    <span className="text-[#181A18] font-medium leading-snug">
                      Mutual Non-Disclosure Agreements (NDA) honored for unannounced brand releases and private events.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#A48855] text-xs mt-0.5">✦</span>
                    <span className="text-[#181A18] font-medium leading-snug">
                      High-precision vector blueprints and 3D digital renderings rendered before production commences.
                    </span>
                  </div>
                </div>
              </div>

              {/* Studio Mark */}
              <div className="border border-[#E7E7E2] rounded-[4px] p-4 flex items-center justify-between text-xs text-[#8A8D88]">
                <span>Olive Seeds Atelier · Quality Accredited</span>
                <span className="text-[#A48855] font-semibold">EST. 2024</span>
              </div>

            </div>

            {/* Right Column: High-End Consultation Console (Form) */}
            <div className="lg:col-span-7">
              <div className="bg-[#FFFFFF] border border-[#E7E7E2] rounded-[4px] p-6 sm:p-9 shadow-[0_4px_24px_rgba(20,25,22,0.04)]">
                {sent ? (
                  <div className="text-center py-16 flex flex-col items-center gap-4 animate-fade-in">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl text-emerald-700">
                      ✓
                    </div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-3xl font-normal text-[#181A18]">
                      Brief Transmitted Successfully
                    </h2>
                    <p className="text-sm text-[#676A65] max-w-sm leading-relaxed">
                      Thank you for submitting your brief. A Studio Partner has been notified and will review your specifications within one business day.
                    </p>
                    <div className="pt-4 flex gap-3">
                      <button
                        onClick={() => setSent(false)}
                        className="text-xs uppercase tracking-wider font-semibold text-[#23483D] border border-[#23483D] px-5 py-2.5 rounded-[4px] hover:bg-[#F2F5F3] transition"
                      >
                        Submit Another Brief
                      </button>
                      <a
                        href="https://wa.me/+919442943394"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs uppercase tracking-wider font-semibold text-white bg-[#23483D] px-5 py-2.5 rounded-[4px] hover:bg-[#16352D] transition inline-flex items-center gap-1.5"
                      >
                        Open WhatsApp Concierge →
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-7 pb-4 border-b border-[#E7E7E2]">
                      <h2
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        className="text-2xl sm:text-3xl font-normal text-[#181A18]"
                      >
                        Commission Brief &amp; Inquiry
                      </h2>
                      <p className="text-xs text-[#676A65] mt-1">
                        Please outline your commission objectives and desired material palette.
                      </p>
                    </div>

                    <div className="flex flex-col gap-5">

                      {/* Project Type Quick Selector */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#676A65] mb-2 block">
                          Commission Focus / Scope
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {projectTypes.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleTypeSelect(type)}
                              className={`text-xs px-3.5 py-1.5 rounded-[4px] border transition font-medium cursor-pointer ${
                                activeType === type
                                  ? "bg-[#23483D] text-white border-[#23483D] shadow-sm"
                                  : "bg-[#FFFFFF] text-[#676A65] border-[#E7E7E2] hover:border-[#CACCC6]"
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
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
                            placeholder="Lord / Lady / Dr / Mr / Ms"
                            className="w-full bg-[#FFFFFF] border border-[#DADCD7] rounded-[4px] px-3.5 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition"
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
                            placeholder="Full Surname"
                            className="w-full bg-[#FFFFFF] border border-[#DADCD7] rounded-[4px] px-3.5 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition"
                          />
                        </div>
                      </div>

                      {/* Phone & Country Code */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#676A65] mb-1.5 block">
                          Telephone / WhatsApp Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={form.countryCode}
                            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                            className="bg-[#FFFFFF] border border-[#DADCD7] rounded-[4px] px-3 py-2.5 text-xs text-[#181A18] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition w-32"
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
                            className="flex-1 bg-[#FFFFFF] border border-[#DADCD7] rounded-[4px] px-3.5 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#676A65] mb-1.5 block">
                          Official Email Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="client@organization.com"
                          className="w-full bg-[#FFFFFF] border border-[#DADCD7] rounded-[4px] px-3.5 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition"
                        />
                      </div>

                      {/* Company Name & Subject */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#676A65] mb-1.5 block">
                            Organization / Brand Name
                          </label>
                          <input
                            type="text"
                            value={form.company}
                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                            placeholder="Company or Private Studio"
                            className="w-full bg-[#FFFFFF] border border-[#DADCD7] rounded-[4px] px-3.5 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#676A65] mb-1.5 block">
                            Subject / Commission Header
                          </label>
                          <input
                            type="text"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            placeholder="Brief Subject"
                            className="w-full bg-[#FFFFFF] border border-[#DADCD7] rounded-[4px] px-3.5 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition"
                          />
                        </div>
                      </div>

                      {/* Project Message */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#676A65] mb-1.5 block">
                          Project Brief &amp; Specifications <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder="Outline your timeline, desired materials (e.g. Teakwood, Birch Plywood, Cast Acrylic, Leather), quantity, and delivery destination..."
                          className="w-full bg-[#FFFFFF] border border-[#DADCD7] rounded-[4px] px-3.5 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] resize-none transition"
                        />
                      </div>

                      {/* Submit CTA */}
                      <button
                        type="button"
                        onClick={submit}
                        disabled={loading}
                        className="w-full bg-[#23483D] hover:bg-[#16352D] text-white rounded-[4px] py-3.5 font-bold tracking-[0.12em] uppercase text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                      >
                        {loading ? "Transmitting Brief..." : "Transmit Brief to Studio Directors →"}
                      </button>

                      <p className="text-[11px] text-[#8A8D88] text-center mt-0.5">
                        Your communication is confidential and protected by studio privacy protocols.
                      </p>

                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── ATELIER PROTOCOLS STRIP ── */}
      <section style={{ background: "#F8F8F6", borderTop: "1px solid #E7E7E2" }} className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#23483D] block mb-2">
              The Studio Protocols
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-3xl md:text-4xl font-normal text-[#181A18]">
              Precision from Brief to Handover
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Discrete Consultation & NDA",
                desc: "We treat proprietary brands, unreleased executive milestones, and luxury event materials with absolute discretion and non-disclosure governance."
              },
              {
                num: "02",
                title: "Digital Proofs & Material Calibration",
                desc: "Before production begins, we supply micron-accurate vector proofs, finish simulations, and material verification to ensure zero margin for error."
              },
              {
                num: "03",
                title: "White-Glove Worldwide Delivery",
                desc: "Finished editions are packaged in custom protective casing and dispatched via insured, tracked courier logistics across domestic and international destinations."
              }
            ].map((item) => (
              <div
                key={item.num}
                className="bg-[#FFFFFF] border border-[#E7E7E2] rounded-[4px] p-7 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              >
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl font-light text-[#A48855]">
                  {item.num}
                </span>
                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-xl font-medium text-[#181A18]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#676A65] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}