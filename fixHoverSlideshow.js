const fs = require('fs');
let code = fs.readFileSync('public-website/src/components/HoverSlideshow.jsx', 'utf8');

code = code.replace(
  'style={{ ...imageStyle, width: "100%", height: "100%", objectFit: "cover", display: "block" }}',
  'className={imageClassName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...imageStyle }}'
);

code = code.replace(
  /style=\{\{\s*\.\.\.imageStyle,\s*position: i === 0 \? "relative" : "absolute",\s*top: 0,\s*left: 0,\s*width: "100%",\s*height: "100%",\s*objectFit: "cover",\s*opacity: i === currentIndex \? 1 : 0,\s*transition: "opacity 0\.6s ease",\s*pointerEvents: i === currentIndex \? "auto" : "none",\s*zIndex: i === currentIndex \? 1 : 0\s*\}\}/g,
  `className={imageClassName} style={{
              position: i === 0 ? "relative" : "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: i === currentIndex ? 1 : 0,
              transition: "opacity 0.6s ease",
              pointerEvents: i === currentIndex ? "auto" : "none",
              zIndex: i === currentIndex ? 1 : 0,
              ...imageStyle
            }}`
);

// We must also add `imageClassName` to the destructured props if it's missing!
code = code.replace(
  'export default function HoverSlideshow({ imageUrls, alt, className, style, imageStyle }) {',
  'export default function HoverSlideshow({ imageUrls, alt, className, style, imageStyle, imageClassName }) {'
);

fs.writeFileSync('public-website/src/components/HoverSlideshow.jsx', code);
