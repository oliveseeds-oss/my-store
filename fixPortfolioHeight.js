const fs = require('fs');
let code = fs.readFileSync('public-website/src/pages/Portfolio.jsx', 'utf8');

code = code.replace(/<div style=\{\{ flex: "1 1 auto", minHeight: 0, background: "\#FAF6EE", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" \}\}>[^]*?<\/div>/,
`<div style={{ height: "min(55vh, 600px)", aspectRatio: "3/4", background: "#FAF6EE", position: "relative", margin: "0 auto", width: "100%", maxWidth: "min(400px,100%)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {(() => {
                  const imgs = parseImagesList(activeItem.image_url);
                  return imgs.length > 1 ? (
                    <HoverSlideshow 
                      imageUrls={imgs} 
                      alt={activeItem.title}
                      className="w-full h-full"
                      imageClassName="object-contain w-full h-full"
                      style={{ width: "100%", height: "100%" }}
                      imageStyle={{ objectFit: "contain" }}
                    />
                  ) : (
                    <img 
                      src={imgs[0] || ""} 
                      alt={activeItem.title} 
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  );
                })()}
              </div>`);

code = code.replace(/maxWidth: "600px",\s*width: "auto",\s*display: "flex",\s*flexDirection: "column",\s*maxHeight: "95vh",\s*overflow: "hidden",\s*boxShadow: "0 20px 50px rgba\(0,0,0,0\.12\)",/,
`maxWidth: "600px",
                width: "auto",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
                margin: "0 auto",`);

fs.writeFileSync('public-website/src/pages/Portfolio.jsx', code);
