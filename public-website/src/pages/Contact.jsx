import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api";
import SEO from "../components/SEO";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

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
    "+1 USA",
    "+44 UK",
    "+91 India",
    "+61 Australia",
    "+81 Japan",
    "+49 Germany",
    "+33 France",
    "+971 UAE",
    "+86 China",
    "+65 Singapore",
    "+94 Sri Lanka",
    "+880 Bangladesh",
    "+92 Pakistan",
    "+7 Russia",
    "+39 Italy",
    "+34 Spain",
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
    <div style={{ background: "#FAF9F6", color: "#0D1512", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen overflow-hidden">
      <SEO 
        title="Contact Our Studio" 
        description="Reach out to the Olive Seeds creative team for corporate luxury engraving quotes, brand identity commissions, or digital asset customization." 
        keywords="contact us, custom order request, corporate premium quotes, customer care"
      />
      <Navbar />

      {/* Hero Section */}
      <section 
        style={{
          background: "linear-gradient(135deg, #0D1512 0%, #0d1a16 100%)",
          color: "#FAF9F6"
        }}
        className="relative py-20 md:py-28 overflow-hidden shadow-xl"
      >
        {/* Luxury glowing mesh blurs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#FAF9F6]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="absolute inset-0 bg-white/5 opacity-5 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side Content */}
            <div className="flex flex-col gap-6">
              <div 
                style={{ background: "rgba(255, 248, 222, 0.1)", borderColor: "rgba(255, 248, 222, 0.2)" }}
                className="inline-flex items-center gap-2 border px-4 py-2 rounded-full backdrop-blur-md w-fit"
              >
                <div className="w-2 h-2 bg-[#FAF9F6] rounded-full animate-pulse" />
                <span style={{ color: "#FAF9F6" }} className="text-xs font-bold uppercase tracking-widest">
                  Premium Contact Experience
                </span>
              </div>

              <h1 
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-4xl md:text-6xl font-black leading-tight text-white tracking-tight"
              >
                Let’s Build <span style={{ color: "#FAF9F6" }}>Luxury Digital</span> & Engraved Designs.
              </h1>

              <p className="text-sm md:text-base leading-relaxed text-white/80 max-w-xl">
                Premium custom wooden engravings, acrylic keepsakes, ecommerce portals, UI/UX design and professional corporate identity solutions crafted with extreme precision.
              </p>

              {/* Grid Features */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  "Fast Response",
                  "Premium UI/UX",
                  "SEO Optimized",
                  "Mobile Friendly",
                ].map((item) => (
                  <div
                    key={item}
                    style={{ background: "rgba(255, 248, 222, 0.05)", borderColor: "rgba(255, 248, 222, 0.1)" }}
                    className="border rounded-2xl px-5 py-4 text-white text-xs font-semibold tracking-wide hover:border-white/30 transition-all duration-300"
                  >
                    ✨ {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side Form Card */}
            <div className="w-full">
              <div 
                style={{ background: "#FAF9F6", border: "1px solid rgba(27, 57, 49, 0.15)", color: "#0D1512" }}
                className="rounded-3xl p-6 md:p-8 shadow-xl"
              >
                {sent ? (
                  <div className="text-center py-12 flex flex-col gap-4">
                    <span className="text-6xl">📨</span>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-black">Message Sent!</h2>
                    <p className="text-sm opacity-80 max-w-xs mx-auto">
                      Thank you for reaching out to us. Our studio will get back to you shortly.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-black">Get in Touch</h2>
                      <p className="text-xs opacity-60 mt-1">Fill out the form below to begin a luxury custom commission.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                      
                      {/* Name fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">First Name</label>
                          <input
                            type="text"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            placeholder="John"
                            className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">Last Name</label>
                          <input
                            type="text"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            placeholder="Doe"
                            className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                          />
                        </div>
                      </div>

                      {/* Phone fields */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">Phone Number</label>
                        <div className="flex gap-2">
                          <select
                            value={form.countryCode}
                            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                            className="bg-white border border-[#0D1512]/20 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512] w-28"
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
                            className="flex-1 bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                          />
                        </div>
                      </div>

                      {/* Email field */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">Email Address</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="your@email.com"
                          className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                        />
                      </div>

                      {/* Company & Subject */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">Company Name</label>
                          <input
                            type="text"
                            value={form.company}
                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                            placeholder="Your Brand"
                            className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">Subject</label>
                          <input
                            type="text"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            placeholder="Custom Engraving Quote"
                            className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                          />
                        </div>
                      </div>

                      {/* Message field */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">Project Details</label>
                        <textarea
                          rows={4}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder="Tell us about the custom keepsake or digital system you wish to commission..."
                          className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512] resize-none"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={submit}
                        disabled={loading}
                        style={{ background: "#0D1512", color: "#FAF9F6" }}
                        className="w-full rounded-xl py-4 font-black tracking-wider uppercase text-xs shadow-lg active:scale-95 transition-all mt-2 disabled:opacity-50"
                      >
                        {loading ? "Sending..." : "Send Message"}
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
      <section style={{ background: "#FAF9F6", borderTop: "1px solid rgba(27, 57, 49, 0.1)" }} className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Bespoke Engraving", desc: "Hand-finished premium wood, bamboo, and acrylic gifts." },
              { title: "Dynamic Agency Tools", desc: "Modern ecommerce platforms, React architectures and UI packs." },
              { title: "Dedicated Support", desc: "Consistent guidance from discovery to doorstep shipment." }
            ].map((item) => (
              <div 
                key={item.title}
                style={{ border: "1px solid rgba(27, 57, 49, 0.1)", background: "white" }}
                className="rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300"
              >
                <div 
                  style={{ background: "#0D1512", color: "#FAF9F6" }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold mb-5"
                >
                  ✨
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-xs text-[#0D1512]/75 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}