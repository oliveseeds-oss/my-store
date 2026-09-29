import React, { useState, useEffect } from "react";
import { parseImagesList } from "../utils/imageHelper";

export default function HoverSlideshow({ imageUrls, alt, className, style, imageStyle }) {
  const images = parseImagesList(imageUrls);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 1500); // cycle every 1.5s
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  if (images.length === 0) return null;

  return (
    <div 
      className={className} 
      style={{ ...style, position: "relative", overflow: "hidden" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentIndex(0);
      }}
    >
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={alt || "Slideshow image"}
          style={{
            ...imageStyle,
            position: i === 0 ? "relative" : "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: i === currentIndex ? 1 : 0,
            transition: "opacity 0.6s ease-in-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            zIndex: i === currentIndex ? 1 : 0
          }}
        />
      ))}
    </div>
  );
}
