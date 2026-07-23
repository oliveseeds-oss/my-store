import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const values = [
  { icon: "✏️", title: "Crafted by hand", desc: "Every piece begins with a human idea and ends with a laser — precision-crafted in our Olive Seeds studio with care in every pass." },
  { icon: "🌿", title: "Sustainable materials", desc: "We source natural wood, bamboo, and acrylic from responsible suppliers. Beautiful products shouldn't cost the earth." },
  { icon: "🎯", title: "Detail-obsessed", desc: "We agonise over fonts, spacing, and depth. The difference between good and exceptional is always in the detail." },
  { icon: "❤️", title: "Made with meaning", desc: "Most of what we make is gifted — to someone beloved, to a team, to a milestone. We treat every order as if it were our own." },
];

const team = [
  { name: "Arjun Krishnamurthy", role: "Founder & Head of Craftsmanship", initial: "AK", color: "#0D1512" },
  { name: "Priya Natarajan", role: "Design & Digital Products Lead", initial: "PN", color: "#2d5a4e" },
  { name: "Ravi Subramaniam", role: "Operations & Customer Experience", initial: "RS", color: "#3d7e6c" },
];

const milestones = [
  { year: "2019", event: "Founded in a small workshop with one laser machine and a big dream." },
  { year: "2020", event: "Survived the pandemic by pivoting to personalised gifts — orders quadrupled." },
  { year: "2021", event: "Launched our digital design products — extending our craft into the digital world." },
  { year: "2022", event: "Shipped our 10,000th order. Expanded to international shipping across 15 countries." },
  { year: "2023", event: "Won the MSME Excellence Award for craft and innovation." },
  { year: "2025", event: "Today — still growing, still crafting, still obsessing over every millimetre." },
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
  return (
    <div style={{ background: "#FAF9F6", color: "#0D1512", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen">
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
            Craft that lasts forever.
          </h1>
          <p className="text-sm md:text-base leading-relaxed max-w-xl text-[#FAF9F6]/80 font-medium">
            We started Olive Seeds because we believed that the things you give to the people you love should be as permanent as the love itself. A laser, some wood, and a lot of heart — that's how it all began.
          </p>
        </div>
      </div>

      {/* Stats Board */}
      <div style={{ background: "#0D1512", borderBottom: "1px solid rgba(255, 248, 222, 0.1)" }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 15000, suffix: "+", label: "Orders crafted" },
              { value: 15, suffix: "", label: "Countries shipped to" },
              { value: 6, suffix: " yrs", label: "In business" },
              { value: 98, suffix: "%", label: "Happy customers" },
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
              Crafted with passion, made for the world.
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-[#0D1512]/80">
              Olive Seeds began in 2019 in a small workshop. What started as a passion project — engraving wooden gifts for friends and family — grew into something we never anticipated: a business built entirely on the idea that personalised things carry far more meaning than mass-produced ones.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-[#0D1512]/80">
              Today, we combine traditional craftsmanship with laser-precision technology to create engraved products that are genuinely unique. We also create premium digital design products — logo kits, brand templates, and social media packs — extending our commitment to quality into the digital world.
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
                "Every piece that leaves our studio is one we'd be proud to give to someone we love."
              </blockquote>
              <p className="text-xs opacity-60">— Arjun Krishnamurthy, Founder</p>
              
              <div className="mt-6 pt-6 border-t border-white/10 flex gap-4 items-center">
                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                  AK
                </div>
                <div>
                  <p className="text-sm font-bold">Arjun Krishnamurthy</p>
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
                className={`relative flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center ${
                  i % 2 === 0 ? "md:flex-row-reverse" : ""
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
            Meet our team
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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