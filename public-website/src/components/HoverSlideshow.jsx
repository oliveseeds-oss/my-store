import React, { useState, useEffect, useRef } from "react";
import { parseImagesList } from "../utils/imageHelper";

export default function HoverSlideshow({ imageUrls, alt, className, style, imageStyle }) {
  const images = parseImagesList(imageUrls);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length, isPaused]);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className={className} style={{ ...style, position: "relative", overflow: "hidden" }}>
        <img
          src={images[0]}
          alt={alt || "Slideshow image"}
          style={{ ...imageStyle, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    );
  }

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div 
      className={`group ${className || ""}`}
      style={{ ...style, position: "relative", overflow: "hidden", display: "block", backgroundColor: "#F9F8F6" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
        setIsPaused(true);
      }}
      onTouchEnd={(e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) setCurrentIndex((prev) => (prev + 1) % images.length);
          else setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        }
        setIsPaused(false);
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={alt ? `${alt} image ${i+1}` : `Slideshow image ${i+1}`}
            loading={i === 0 ? "eager" : "lazy"}
            style={{
              ...imageStyle,
              position: i === 0 ? "relative" : "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: i === currentIndex ? 1 : 0,
              transition: "opacity 0.6s ease",
              pointerEvents: i === currentIndex ? "auto" : "none",
              zIndex: i === currentIndex ? 1 : 0
            }}
          />
        ))}
      </div>

      {/* ARROWS */}
      <button 
        onClick={handlePrev}
        aria-label="Previous image"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 rounded-full bg-white/85 text-[#1C1C1E] flex items-center justify-center shadow hover:bg-[#1C1C1E] hover:text-white z-10 sm:flex md:opacity-0"
        style={{ fontSize: "20px", lineHeight: 1 }}
      >
        &#8249;
      </button>
      <button 
        onClick={handleNext}
        aria-label="Next image"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 rounded-full bg-white/85 text-[#1C1C1E] flex items-center justify-center shadow hover:bg-[#1C1C1E] hover:text-white z-10 sm:flex md:opacity-0"
        style={{ fontSize: "20px", lineHeight: 1 }}
      >
        &#8250;
      </button>

      {/* DOTS */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-[5px] z-10">
        {images.map((_, i) => (
          <span 
            key={i} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex(i);
            }}
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: i === currentIndex ? "#FFFFFF" : "rgba(255,255,255,0.5)",
              transform: i === currentIndex ? "scale(1.3)" : "scale(1)",
              transition: "background-color 0.25s ease, transform 0.25s ease",
              cursor: "pointer",
              display: "block"
            }}
          />
        ))}
      </div>
    </div>
  );
}
