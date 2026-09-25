import React, { useState, useEffect } from "react";
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
    subject: "",
    company: "",
    message: "",
  });

  const countryCodes = [
    "+61 Australia",
    "+973 Bahrain",
    "+32 Belgium",
    "+1 Canada",
    "+33 France",
    "+49 Germany",
    "+91 India",
    "+965 Kuwait",
    "+60 Malaysia",
    "+31 Netherlands",
    "+64 New Zealand",
    "+47 Norway",
    "+974 Qatar",
    "+966 Saudi Arabia",
    "+65 Singapore",
    "+41 Switzerland",
    "+971 United Arab Emirates",
    "+44 United Kingdom",
    "+1 United States",
  ];

  const submit = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.phone ||
      !form.email ||
      !form.subject ||
      !form.company ||
      !form.message
    ) {
      alert("Please fill all fields");
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
        subject: "",
        company: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
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

      {/* Hero Section */}
      <section
        style={{
          background: "#FFFFFF",
          color: "#181A18",
          borderBottom: "1px solid #E7E7E2"
        }}
        className="relative py-16 md:py-24 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Side Content */}
            <div className="flex flex-col gap-6">
              <div
                style={{ background: "#F8F8F6", borderColor: "#E7E7E2" }}
                className="inline-flex items-center gap-2 border px-3.5 py-1.5 rounded-[4px] w-fit"
              >
                <div className="w-1.5 h-1.5 bg-[#23483D] rounded-full" />
                <span style={{ color: "#23483D" }} className="text-[11px] font-semibold uppercase tracking-widest">
                  Bespoke Enquiries
                </span>
              </div>

              <h1
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-4xl md:text-5xl lg:text-6xl font-normal leading-tight text-[#181A18] tracking-tight"
              >
                Start a Conversation
              </h1>

              <p className="text-sm md:text-base leading-relaxed text-[#676A65] max-w-xl font-normal">
                Whether you have a fully formed brief or are simply exploring possibilities — we would welcome the conversation. Tell us about your project and we will respond within one business day.
              </p>

              <p className="text-xs md:text-sm leading-relaxed text-[#676A65] max-w-xl">
                We work with a select number of clients at any one time. If you are considering a commission, a bulk order, or a longer-term creative partnership — share what you have in mind and we will respond with clarity and honesty.
              </p>

              {/* Grid Features / Trust Lines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
                {[
                  "Every enquiry is reviewed by our creative directors",
                  "Response within one business day — guaranteed",
                  "Non-disclosure agreements available upon request",
                  "B2B and volume orders welcome",
                ].map((item) => (
                  <div
                    key={item}
                    style={{ background: "#F8F8F6", borderColor: "#E7E7E2" }}
                    className="border rounded-[4px] px-4 py-3.5 text-[#181A18] text-xs font-medium tracking-wide transition-all duration-200 flex items-center gap-2.5"
                  >
                    <span className="text-[#23483D] text-[10px]">✦</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side Form Card */}
            <div className="w-full">
              <div
                style={{ background: "#FFFFFF", border: "1px solid #E7E7E2", color: "#181A18" }}
                className="rounded-[4px] p-6 md:p-8 shadow-sm"
              >
                {sent ? (
                  <div className="text-center py-12 flex flex-col gap-4">
                    <span className="text-5xl">📨</span>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl md:text-3xl font-normal text-[#181A18]">Enquiry Sent</h2>
                    <p className="text-sm text-[#676A65] max-w-xs mx-auto">
                      Thank you for reaching out to Olive Seeds Design Studio. We will respond within one business day.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl md:text-3xl font-normal text-[#181A18]">Send Your Enquiry</h2>
                      <p className="text-xs text-[#676A65] mt-1">Share what you have in mind and we will respond with clarity and honesty.</p>
                    </div>

                    <div className="flex flex-col gap-4">

                      {/* Name fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-medium uppercase tracking-wider text-[#676A65] mb-1.5 block">First Name</label>
                          <input
                            type="text"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            placeholder="John"
                            className="w-full bg-white border border-[#DADCD7] rounded-[4px] px-4 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium uppercase tracking-wider text-[#676A65] mb-1.5 block">Last Name</label>
                          <input
                            type="text"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            placeholder="Doe"
                            className="w-full bg-white border border-[#DADCD7] rounded-[4px] px-4 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Phone fields */}
                      <div>
                        <label className="text-[11px] font-medium uppercase tracking-wider text-[#676A65] mb-1.5 block">Contact Number (optional)</label>
                        <div className="flex gap-2">
                          <select
                            value={form.countryCode}
                            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                            className="bg-white border border-[#DADCD7] rounded-[4px] px-3 py-2.5 text-xs text-[#181A18] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition-colors w-28"
                          >
                            {countryCodes.map((code) => (
                              <option key={code} value={code.split(" ")[0]}>
                                {code}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="9876543210"
                            className="flex-1 bg-white border border-[#DADCD7] rounded-[4px] px-4 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Email field */}
                      <div>
                        <label className="text-[11px] font-medium uppercase tracking-wider text-[#676A65] mb-1.5 block">Email Address</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="your@email.com"
                          className="w-full bg-white border border-[#DADCD7] rounded-[4px] px-4 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition-colors"
                        />
                      </div>

                      {/* Company & Subject */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-medium uppercase tracking-wider text-[#676A65] mb-1.5 block">Company Name</label>
                          <input
                            type="text"
                            value={form.company}
                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                            placeholder="Your Brand"
                            className="w-full bg-white border border-[#DADCD7] rounded-[4px] px-4 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium uppercase tracking-wider text-[#676A65] mb-1.5 block">Subject</label>
                          <input
                            type="text"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            placeholder="Bespoke Commission Enquiry"
                            className="w-full bg-white border border-[#DADCD7] rounded-[4px] px-4 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Message field */}
                      <div>
                        <label className="text-[11px] font-medium uppercase tracking-wider text-[#676A65] mb-1.5 block">Tell Us About Your Project</label>
                        <textarea
                          rows={4}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder="Share what you have in mind — materials, quantities, timelines, or your custom brief..."
                          className="w-full bg-white border border-[#DADCD7] rounded-[4px] px-4 py-2.5 text-xs text-[#181A18] placeholder-[#9CA3AF] focus:outline-none focus:border-[#23483D] focus:ring-1 focus:ring-[#23483D] resize-none transition-colors"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={submit}
                        disabled={loading}
                        style={{ background: "#23483D", color: "#FFFFFF" }}
                        className="w-full rounded-[4px] py-3.5 font-medium tracking-wider uppercase text-xs hover:bg-[#16352D] active:scale-[0.99] transition-all mt-2 disabled:opacity-50"
                      >
                        {loading ? "Sending..." : "Send Your Enquiry"}
                      </button>

                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Extra Services Strip */}
      <section style={{ background: "#F8F8F6", borderTop: "1px solid #E7E7E2" }} className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Bespoke Product Design", desc: "Hand-finished objects and collections in timber, architectural acrylic, and fine materials." },
              { title: "Brand & Spatial Systems", desc: "Enduring identity systems, spatial décor, and cohesive visual touchpoints." },
              { title: "B2B & Volume Delivery", desc: "Structured for seamless delivery across corporate orders and private commissions." }
            ].map((item) => (
              <div
                key={item.title}
                style={{ border: "1px solid #E7E7E2", background: "#FFFFFF" }}
                className="rounded-[4px] p-8 hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
              >
                <div
                  style={{ background: "#F8F8F6", color: "#23483D", border: "1px solid #E7E7E2" }}
                  className="w-10 h-10 rounded-[4px] flex items-center justify-center text-sm font-bold mb-5"
                >
                  ✦
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-xl font-normal text-[#181A18] mb-2">{item.title}</h3>
                <p className="text-xs text-[#676A65] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}