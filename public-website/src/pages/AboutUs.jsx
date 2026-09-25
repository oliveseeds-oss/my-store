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
    <div style={{ background: "#FFFFFF", color: "#181A18", fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen">
      <SEO
        title="About Olive Seeds Design Studio | Bespoke Design with Purpose"
        description="Olive Seeds Design Studio is a premium bespoke design practice creating distinguished products and custom experiences for corporate and lifestyle clients."
        keywords="bespoke design studio, luxury craftsmanship, corporate gifting, spatial design, brand identity, olive seeds design studio"
      />
      <Navbar />

      {/* Hero Header */}
      <div
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E7E7E2",
          color: "#181A18"
        }}
        className="relative py-20 md:py-28 about-hero overflow-hidden"
      >
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex gap-2 mb-6 items-center text-xs text-[#676A65]">
            <Link to="/" className="hover:underline text-[#676A65] transition">Home</Link>
            <span className="opacity-40">›</span>
            <span className="font-semibold text-[#181A18]">About</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] mb-4 text-[#23483D]">About Us</p>
          <h1
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-4xl md:text-6xl font-normal leading-tight tracking-tight max-w-2xl mb-6 text-[#181A18]"
          >
            Design with Purpose. Craft with Care.
          </h1>
          <p className="text-sm md:text-base leading-relaxed max-w-xl text-[#676A65] font-normal">
            Olive Seeds Design Studio is an independent creative studio dedicated to the art of considered design — producing objects, identities, and experiences that endure.
          </p>
        </div>
      </div>

      {/* Stats Board */}
      <div style={{ background: "#F8F8F6", borderBottom: "1px solid #E7E7E2" }}>
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
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#181A18" }}
                  className="text-4xl md:text-5xl font-light leading-none mb-2"
                >
                  <CountUp end={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs text-[#676A65] uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story & Promise */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">

          <div className="lg:col-span-2 flex flex-col gap-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#23483D]">Our Story</p>
            <h2
              className="text-3xl md:text-4xl font-normal tracking-tight text-[#181A18]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              The Studio
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-[#676A65]">
              Olive Seeds was founded with a single conviction — that good design should feel inevitable. Not trendy. Not loud. Inevitable, as though it could not have been any other way. We began as a small creative practice with a deep respect for materials, craftsmanship, and the stories that objects carry.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-[#676A65]">
              Today, we serve organisations across corporate, hospitality, education, and lifestyle sectors — producing bespoke design work that reflects the character of each client with clarity and confidence.
            </p>
          </div>

          {/* Visual promise block */}
          <div className="w-full">
            <div
              style={{
                background: "#F8F8F6",
                color: "#181A18",
                border: "1px solid #E7E7E2"
              }}
              className="rounded-[4px] p-8 relative"
            >
              <div
                style={{ background: "#FFFFFF", color: "#23483D", border: "1px solid #E7E7E2" }}
                className="absolute -top-3.5 left-6 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-[2px]"
              >
                Our promise
              </div>
              <blockquote
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-lg font-normal leading-relaxed italic my-4 text-[#181A18]"
              >
                "Good design should feel inevitable — purposeful, enduring, and crafted to represent your character with quiet authority."
              </blockquote>
              <p className="text-xs text-[#676A65]">— AK Chris, Founder</p>

              <div className="mt-6 pt-6 border-t border-[#E7E7E2] flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-[#23483D] text-white flex items-center justify-center font-bold text-sm">
                  AK
                </div>
                <div>
                  <p className="text-sm font-bold text-[#181A18]">AK Chris</p>
                  <p className="text-xs text-[#676A65]">Founder, Olive Seeds</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Values Grid */}
      <section style={{ background: "#F8F8F6", borderTop: "1px solid #E7E7E2", borderBottom: "1px solid #E7E7E2" }} className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-center text-[#23483D] mb-3">Distinction in Practice</p>
          <h2
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-3xl md:text-5xl font-normal text-center mb-16 tracking-tight text-[#181A18]"
          >
            Why Clients Choose Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white border border-[#E7E7E2] rounded-[4px] p-8 transition-all duration-300"
              >
                <div className="text-2xl mb-4 w-10 h-10 bg-[#F8F8F6] border border-[#E7E7E2] rounded-[4px] flex items-center justify-center">
                  {v.icon}
                </div>
                <h3
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-xl font-normal mb-3 text-[#181A18]"
                >
                  {v.title}
                </h3>
                <p className="text-sm text-[#676A65] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach Journey */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-center text-[#23483D] mb-3">How We Work</p>
        <h2
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-3xl md:text-5xl font-normal text-center mb-16 tracking-tight text-[#181A18]"
        >
          Our Approach
        </h2>

        <div className="max-w-xl mx-auto relative pl-8 md:pl-0">
          <div className="absolute left-3.5 md:left-1/2 top-4 bottom-4 w-0.5 bg-[#E7E7E2]" />

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
                    style={{ background: "#23483D", color: "#FFFFFF" }}
                    className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center font-bold text-xs shadow-sm"
                  >
                    {m.step}
                  </div>
                </div>

                {/* Content Card */}
                <div className="w-full md:w-1/2 pl-6 md:pl-0">
                  <div className="bg-white border border-[#E7E7E2] rounded-[4px] p-6">
                    <h3 className="font-bold text-base text-[#181A18] mb-1">{m.title}</h3>
                    <p className="text-sm text-[#676A65] leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Cards */}
      <section style={{ background: "#F8F8F6", borderTop: "1px solid #E7E7E2" }} className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-center text-[#23483D] mb-3">The People</p>
          <h2
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-3xl md:text-5xl font-normal text-center mb-16 tracking-tight text-[#181A18]"
          >
            Studio Leadership
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white border border-[#E7E7E2] rounded-[4px] p-8 text-center transition-all duration-300"
              >
                <div
                  style={{ background: "#23483D", color: "#FFFFFF" }}
                  className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-5"
                >
                  {member.initial}
                </div>
                <h3
                  className="text-base font-bold mb-1 text-[#181A18]"
                >
                  {member.name}
                </h3>
                <p className="text-xs text-[#676A65] font-medium tracking-wider uppercase">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#23483D] mb-4">Start a Conversation</p>
        <h2
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-4xl md:text-6xl font-normal mb-6 tracking-tight leading-tight text-[#181A18]"
        >
          Let's Build Something Together
        </h2>
        <p className="text-sm md:text-base text-[#676A65] leading-relaxed max-w-xl mx-auto mb-10">
          We take on a limited number of new client relationships each season to ensure the quality of our work remains uncompromised. If you are considering a project — we would welcome the conversation.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/contact"
            className="px-8 py-3.5 rounded-[4px] font-semibold text-xs uppercase tracking-wider bg-[#23483D] hover:bg-[#16352D] text-white transition-all"
          >
            Get in Touch
          </Link>
          <Link
            to="/products"
            className="px-8 py-3.5 rounded-[4px] border border-[#E7E7E2] font-semibold text-xs uppercase tracking-wider text-[#181A18] hover:bg-[#F8F8F6] transition-all"
          >
            Explore the Collection
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}