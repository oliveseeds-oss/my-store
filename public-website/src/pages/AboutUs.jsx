import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const values = [
  { icon: "💡", title: "Strategic Thinking", desc: "Every successful project begins with understanding. We combine research, creativity, and strategy to design brands, digital experiences, and products that deliver meaningful results." },
  { icon: "💻", title: "Digital Excellence", desc: "From brand identities and websites to mobile applications and user experiences, we create modern digital solutions that are intuitive, scalable, and built for long-term success." },
  { icon: "🎯", title: " Precision in Every Detail", desc: "Great design lives in the details. We carefully refine every element—from typography and layouts to interactions, materials, and finishes—to ensure exceptional quality across both digital and physical creations." },
  { icon: "✨", title: "Made with meaning", desc: "Whether we're developing a digital platform or producing a premium custom product, we approach every project with the same commitment to quality, innovation, and lasting value." },
];

const team = [
  { name: "Alexander Babu", role: "Director", initial: "AB", color: "#0D1512" },
  { name: "Vijaya Alex", role: "Executive Officer", initial: "VA", color: "#0D1512" },
  { name: "Paul Wesly", role: "Head of Digital Service", initial: "PW", color: "#0D1512" },
  { name: "Shane Beniel", role: "Head of Manufacturing ", initial: "SB", color: "#2d5a4e" },
];

const milestones = [
  { year: "2019", event: "Founded on meaningful design to build unique, creative and innovative soluction." },
  { year: "2020", event: "Expanded into digital solutions." },
  { year: "2021", event: "Launched our design services " },
  { year: "2022", event: "Extending Collaborated with Brands." },
  { year: "2025", event: "Expanded into premium products manufacturing" },
  { year: "2026", event: "Today — still creating, still innovating, still designing with purpose." },
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
    document.title = "About Us | Oliveseeds Creative Studio";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Learn about Oliveseeds Studio's mission, milestones, leadership, and our design and manufacturing processes.");
    }
  }, []);

  return (
    <div style={{ background: "#FAF9F6", color: "#0D1512", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen">
      <SEO
        title="About Our Studio | Olive Seeds"
        description="Learn about our passion for luxury craftsmanship, organic bamboo & recycled acrylic selections, precision laser engraving, and custom brand designs."
        keywords="luxury craftsmanship, sustainable design, about olive seeds, laser workshop, design studio"
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
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-[#FAF9F6]/60">Our Story</p>
          <h1
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-5xl md:text-7xl font-black leading-tight tracking-tight max-w-2xl mb-6"
          >
            Intent Over Trends.
          </h1>
          <p className="text-sm md:text-base leading-relaxed max-w-xl text-[#FAF9F6]/80 font-medium">
            We started Olive Seeds because we believed that the thing- exceptional design creates lasting impact. Great design has the power to create lasting value. So our creative studio, delivering premium digital solutions and custom-crafted premium products for businesses and individuals around the world.
          </p>
        </div>
      </div>

      {/* Stats Board */}
      <div style={{ background: "#0D1512", borderBottom: "1px solid rgba(255, 248, 222, 0.1)" }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 500, suffix: "+", label: "Products crafted & custom" },
              { value: 15, suffix: "+", label: "Countries Expanding" },
              { value: 6, suffix: " yrs", label: "In business" },
              { value: 99, suffix: "%", label: "Happy customers" },
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
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#0D1512]/60">Who We Are</p>
            <h2
              className="text-3xl md:text-4xl font-black tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Create with passion, made for the world.
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-[#0D1512]/80">
              Olive Seeds Design Studio is a multidisciplinary creative studio focused on building impactful products, designs and digital experiences.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-[#0D1512]/80">
              Beyond the digital world, we extend the same commitment to excellence through premium custom products. We believe every project deserves a tailored approach. Whether we're designing a digital platform or crafting a premium product, our goal is the same—to create work that is purposeful, distinctive, and built to leave a lasting impression.

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
                "Every design that leaves our studio is created with purpose, build on trust and a lasting impression of excellence."
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
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-center opacity-60 mb-3">What Drives Us</p>
          <h2
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-3xl md:text-5xl font-black text-center mb-16 tracking-tight"
          >
            Our core values
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

      {/* Timeline Journey */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-center text-[#0D1512]/60 mb-3">The Journey</p>
        <h2
          style={{ fontFamily: "'Outfit', sans-serif" }}
          className="text-3xl md:text-5xl font-black text-center mb-16 tracking-tight"
        >
          How we got here
        </h2>

        <div className="max-w-xl mx-auto relative pl-8 md:pl-0">
          <div className="absolute left-3.5 md:left-1/2 top-4 bottom-4 w-0.5 bg-[#0D1512]/10" />

          <div className="flex flex-col gap-12">
            {milestones.map((m, i) => (
              <div
                key={m.year}
                className={`relative flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center ${i % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
              >
                {/* Timeline Dot/Year */}
                <div className="absolute left-[-26px] md:left-1/2 md:translate-x-[-50%] z-10">
                  <div
                    style={{ background: "#0D1512", color: "#FAF9F6" }}
                    className="w-14 h-14 rounded-full border-4 border-[#FAF9F6] flex items-center justify-center font-black text-sm shadow-md"
                  >
                    {m.year}
                  </div>
                </div>

                {/* Content Card */}
                <div className="w-full md:w-1/2 pl-6 md:pl-0">
                  <div className="bg-white border border-[#0D1512]/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                    <p className="text-sm text-[#0D1512]/80 leading-relaxed">{m.event}</p>
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
            Meet our Partners
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
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#0D1512]/60 mb-4">Start your story</p>
        <h2
          style={{ fontFamily: "'Outfit', sans-serif" }}
          className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight"
        >
          Ready to create something<br />unforgettable?
        </h2>
        <p className="text-sm md:text-base text-[#0D1512]/70 leading-relaxed max-w-xl mx-auto mb-10">
          Browse our collection or contact us to discuss a custom project. We'd love to make something beautiful for you.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/products"
            style={{ background: "#0D1512", color: "#FAF9F6" }}
            className="px-8 py-4 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-emerald-900/10 hover:scale-105 active:scale-95 transition-all"
          >
            Shop Keepsakes
          </Link>
          <Link
            to="/contact"
            style={{ borderColor: "#0D1512", color: "#0D1512" }}
            className="px-8 py-4 rounded-xl border-2 font-bold text-sm hover:bg-[#0D1512] hover:text-[#FAF9F6] transition-all"
          >
            Get In Touch
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}