const fs = require('fs');
let code = fs.readFileSync('public-website/src/pages/Portfolio.jsx', 'utf8');

// Replace the container style
code = code.replace(
  /background: \"#FFFFFF\",\s*border: \"1px solid #E7E7E2\",\s*borderRadius: \"4px\",\s*maxWidth: \"600px\",\s*width: \"100%\",\s*maxHeight: \"95vh\", overflowY: \"auto\",\s*boxShadow: \"0 20px 50px rgba\(0,0,0,0\.12\)\",/g,
  `background: "#FFFFFF",
                border: "1px solid #E7E7E2",
                borderRadius: "4px",
                maxWidth: "600px",
                width: "auto",
                display: "flex",
                flexDirection: "column",
                maxHeight: "95vh",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",`
);

// Replace the image block
code = code.replace(/\{\(\(\) => \{\s+const imgs = parseImagesList\(activeItem\.image_url\);\s+return imgs\.length > 1 \? \(\s+<HoverSlideshow\s+imageUrls=\{imgs\}\s+alt=\{activeItem\.title\}\s+style=\{\{ width: "100%", maxHeight: "380px" \}\}\s+\/>\s+\) : \(\s+<img\s+src=\{imgs\[0\] \|\| ""\}\s+alt=\{activeItem\.title\}\s+style=\{\{ width: "100%", maxHeight: "380px", objectFit: "cover" \}\}\s+\/>\s+\);\s+\}\)\(\)\}/g,
`<div style={{ flex: "1 1 auto", minHeight: 0, background: "#FAF6EE", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {(() => {
                  const imgs = parseImagesList(activeItem.image_url);
                  return imgs.length > 1 ? (
                    <HoverSlideshow 
                      imageUrls={imgs} 
                      alt={activeItem.title}
                      className="h-full w-auto aspect-[3/4]"
                      imageClassName="h-full w-full object-contain"
                      style={{ height: "100%", width: "auto", aspectRatio: "3/4" }}
                      imageStyle={{ height: "100%", width: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <img 
                      src={imgs[0] || ""} 
                      alt={activeItem.title} 
                      style={{ height: "100%", width: "auto", aspectRatio: "3/4", objectFit: "contain" }} 
                    />
                  );
                })()}
              </div>`
);

code = code.replace('<div style={{ padding: "28px" }}>', '<div style={{ padding: "28px", flexShrink: 0, minWidth: "320px" }}>');

fs.writeFileSync('public-website/src/pages/Portfolio.jsx', code);
