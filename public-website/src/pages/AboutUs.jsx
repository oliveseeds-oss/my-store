import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const values = [
  { icon: "✨", title: "Bespoke by nature", desc: "We do not sell off-the-shelf. Every product and service is tailored to the client." },
  { icon: "🌐", title: "Cross-industry fluency", desc: "We work across corporate, hospitality, education, retail, and events — bringing breadth of perspective to every brief." },
  { icon: "📦", title: "Bulk and B2B ready", desc: "Our studio is structured to serve large-scale corporate orders with the same care as individual commissions." },
  { icon: "⚡", title: "Digital and physical", desc: "We bridge tangible design objects and digital brand assets under one roof." },
];

const team = [
  { name: "Alexander Babu", role: "Director", initial: "AB", color: "#0D1512" },
  { name: "Vijaya Alex", role: "Executive Officer", initial: "VA", color: "#0D1512" },
  { name: "Paul Wesly", role: "Head of Digital Service", initial: "PW", color: "#0D1512" },
  { name: "Shane Beniel", role: "Head of Atelier Production", initial: "SB", color: "#2d5a4e" },
];

const approachSteps = [
  { step: "01", title: "Listen", desc: "Every engagement begins with understanding. We take time to learn your brand, your audience, and the gap between where you are and where you want to be." },
  { step: "02", title: "Create", desc: "Our studio develops considered design proposals — never templates, always originals. Each concept is built around your identity and refined until it is exactly right." },
  { step: "03", title: "Deliver", desc: "From production to final delivery, we manage every stage with precision. What arrives is complete, polished, and ready to represent you." },
];

function CountUp({ end, suffix = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = end / 60;
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      if (ref.current) ref.current.textContent = Math.floor(start).toLocaleString() + suffix;
      if (start >= end) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [end, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

export default function AboutUs() {
  useEffect(() => {
    document.title = "About Olive Seeds Design Studio | Bespoke Design with Purpose";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Olive Seeds Design Studio is a premium bespoke design practice creating distinguished products and custom experiences for corporate and lifestyle clients.");
    }
  }, []);

  return (
    <div style={{ background: "#FAF9F6", color: "#0D1512", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen">
      <SEO
        title="About Olive Seeds Design Studio | Bespoke Design with Purpose"
        description="Olive Seeds Design Studio is a premium bespoke design practice creating distinguished products and custom experiences for corporate and lifestyle clients."
        keywords="bespoke design studio, luxury craftsmanship, corporate gifting, spatial design, brand identity, olive seeds design studio"
      />
      <Navbar />

      {/* Hero Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0D1512 0%, #0d1a16 100%)",
          color: "#FAF9F6"
        }}
        className="relative py-24 about-hero overflow-hidden shadow-xl"
      >
        {/* Luxury glowing mesh blurs */}
        <div className="absolute top-1/4 right-10 w-80 h-80 bg-[#FAF9F6]/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-[70px] pointer-events-none" />

        <div className="absolute inset-0 bg-white/5 opacity-5 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex gap-2 mb-6 items-center text-xs opacity-80">
            <Link to="/" className="hover:underline text-[#FAF9F6] opacity-80 hover:opacity-100 transition">Home</Link>
            <span className="opacity-40">›</span>
            <span className="font-bold">About</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-[#FAF9F6]/60">About Us</p>
          <h1
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-5xl md:text-7xl font-black leading-tight tracking-tight max-w-2xl mb-6"
          >
            Design with Purpose. Craft with Care.
          </h1>
          <p className="text-sm md:text-base leading-relaxed max-w-xl text-[#FAF9F6]/80 font-medium">
            Olive Seeds Design Studio is an independent creative studio dedicated to the art of considered design — producing objects, identities, and experiences that endure.
          </p>
        </div>
      </div>

      {/* Stats Board */}
      <div style={{ background: "#0D1512", borderBottom: "1px solid rgba(255, 248, 222, 0.1)" }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 500, suffix: "+", label: "Bespoke Commissions" },
              { value: 15, suffix: "+", label: "Countries Served" },
              { value: 6, suffix: " yrs", label: "Studio Practice" },
              { value: 99, suffix: "%", label: "Client Satisfaction" },
            ].map((s) => (
              <div key={s.label} className="text-center p-4">
                <p
                  style={{ fontFamily: "'Outfit', sans-serif", color: "#FAF9F6" }}
                  className="text-4xl md:text-5xl font-black leading-none mb-2"
                >
                  <CountUp end={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs text-white/60 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story & Promise */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">

          <div className="lg:col-span-2 flex flex-col gap-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#0D1512]/60">Our Story</p>
            <h2
              className="text-3xl md:text-4xl font-black tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              The Studio
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-[#0D1512]/80">
              Olive Seeds was founded with a single conviction — that good design should feel inevitable. Not trendy. Not loud. Inevitable, as though it could not have been any other way. We began as a small creative practice with a deep respect for materials, craftsmanship, and the stories that objects carry.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-[#0D1512]/80">
              Today, we serve organisations across corporate, hospitality, education, and lifestyle sectors — producing bespoke design work that reflects the character of each client with clarity and confidence.
            </p>
          </div>

          {/* Visual promise block */}
          <div className="w-full">
            <div
              style={{
                background: "#0D1512",
                color: "#FAF9F6",
                border: "1px solid rgba(255, 248, 222, 0.15)"
              }}
              className="rounded-3xl p-8 relative shadow-xl"
            >
              <div
                style={{ background: "#FAF9F6", color: "#0D1512" }}
                className="absolute -top-3.5 left-6 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-md"
              >
                Our promise
              </div>
              <blockquote
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-lg font-bold leading-relaxed italic my-4"
              >
                "Good design should feel inevitable — purposeful, enduring, and crafted to represent your character with quiet authority."
              </blockquote>
              <p className="text-xs opacity-60">— AK Chris, Founder</p>

              <div className="mt-6 pt-6 border-t border-white/10 flex gap-4 items-center">
                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                  AK
                </div>
                <div>
                  <p className="text-sm font-bold">AK Chris</p>
                  <p className="text-xs opacity-60">Founder, Olive Seeds</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Values Grid */}
      <section style={{ background: "#0D1512", color: "#FAF9F6" }} className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-center opacity-60 mb-3">Distinction in Practice</p>
          <h2
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-3xl md:text-5xl font-black text-center mb-16 tracking-tight"
          >
            Why Clients Choose Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all duration-300"
              >
                <div className="text-3xl mb-4 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                  {v.icon}
                </div>
                <h3
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-xl font-bold mb-3"
                >
                  {v.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach Journey */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-center text-[#0D1512]/60 mb-3">How We Work</p>
        <h2
          style={{ fontFamily: "'Outfit', sans-serif" }}
          className="text-3xl md:text-5xl font-black text-center mb-16 tracking-tight"
        >
          Our Approach
        </h2>

        <div className="max-w-xl mx-auto relative pl-8 md:pl-0">
          <div className="absolute left-3.5 md:left-1/2 top-4 bottom-4 w-0.5 bg-[#0D1512]/10" />

          <div className="flex flex-col gap-12">
            {approachSteps.map((m, i) => (
              <div
                key={m.step}
                className={`relative flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center ${i % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
              >
                {/* Timeline Dot/Step */}
                <div className="absolute left-[-26px] md:left-1/2 md:translate-x-[-50%] z-10">
                  <div
                    style={{ background: "#0D1512", color: "#FAF9F6" }}
                    className="w-14 h-14 rounded-full border-4 border-[#FAF9F6] flex items-center justify-center font-black text-sm shadow-md"
                  >
                    {m.step}
                  </div>
                </div>

                {/* Content Card */}
                <div className="w-full md:w-1/2 pl-6 md:pl-0">
                  <div className="bg-white border border-[#0D1512]/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                    <h3 className="font-bold text-base text-[#0D1512] mb-1">{m.title}</h3>
                    <p className="text-sm text-[#0D1512]/80 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Cards */}
      <section style={{ background: "#FAF9F6", borderTop: "1px solid rgba(27, 57, 49, 0.1)" }} className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-center text-[#0D1512]/60 mb-3">The People</p>
          <h2
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-3xl md:text-5xl font-black text-center mb-16 tracking-tight"
          >
            Studio Leadership
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white border border-[#0D1512]/15 rounded-3xl p-8 text-center hover:-translate-y-2 transition-all duration-300 shadow-sm"
              >
                <div
                  style={{ background: member.color, color: "#FAF9F6" }}
                  className="w-16 h-16 rounded-full flex items-center justify-center font-black text-xl mx-auto mb-5"
                >
                  {member.initial}
                </div>
                <h3
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-lg font-bold mb-1"
                >
                  {member.name}
                </h3>
                <p className="text-xs text-[#0D1512]/60 font-semibold tracking-wider uppercase">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#0D1512]/60 mb-4">Start a Conversation</p>
        <h2
          style={{ fontFamily: "'Outfit', sans-serif" }}
          className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight"
        >
          Let's Build Something Together
        </h2>
        <p className="text-sm md:text-base text-[#0D1512]/70 leading-relaxed max-w-xl mx-auto mb-10">
          We take on a limited number of new client relationships each season to ensure the quality of our work remains uncompromised. If you are considering a project — we would welcome the conversation.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/contact"
            style={{ background: "#0D1512", color: "#FAF9F6" }}
            className="px-8 py-4 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-emerald-900/10 hover:scale-105 active:scale-95 transition-all"
          >
            Get in Touch
          </Link>
          <Link
            to="/products"
            style={{ borderColor: "#0D1512", color: "#0D1512" }}
            className="px-8 py-4 rounded-xl border-2 font-bold text-sm hover:bg-[#0D1512] hover:text-[#FAF9F6] transition-all"
          >
            Explore the Collection
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}