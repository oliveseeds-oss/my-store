import React from 'react';

export default function CuteLoader() {
  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none transition-all duration-300"
      style={{
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* Top Gold Progress Beam */}
      <div 
        className="fixed top-0 left-0 w-full h-[2.5px] z-[10000] overflow-hidden"
        style={{ background: "rgba(164, 136, 85, 0.2)" }}
      >
        <div 
          className="h-full w-1/3 bg-gradient-to-r from-[#A48855] via-[#23483D] to-[#A48855]"
          style={{
            animation: "studio-beam 1.4s infinite cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        />
      </div>

      <style>{`
        @keyframes studio-beam {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        @keyframes studio-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Luxury Studio Monogram & Orbital Glow */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Orbital delicate ring */}
          <div 
            className="absolute inset-0 rounded-full border border-[#A48855]/30 border-t-[#23483D]"
            style={{ animation: "studio-ring 1.2s infinite linear" }}
          />
          {/* Inner Studio Initial */}
          <span 
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-lg font-normal text-[#23483D]"
          >
            O
          </span>
        </div>

        <span 
          style={{ letterSpacing: "0.24em" }}
          className="text-[11px] uppercase font-semibold text-[#8A8D88]"
        >
          Olive Seeds
        </span>
      </div>
    </div>
  );
}
