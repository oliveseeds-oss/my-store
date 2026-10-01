const fs = require('fs');
let code = fs.readFileSync('public-website/src/pages/Gallery.jsx', 'utf8');

code = code.replace(/<div className="flex-1 min-h-0 bg-\[\#FAF6EE\] flex items-center justify-center relative">[^]*?<\/div>/,
`<div style={{ height: "min(55vh, 600px)", aspectRatio: "3/4" }} className="bg-[#FAF6EE] relative shrink-0 mx-auto w-full max-w-[min(400px,100%)] flex items-center justify-center overflow-hidden">
                {(() => {
                  const imgs = parseImagesList(lightboxImage.image_url);
                  return imgs.length > 1 ? (
                    <HoverSlideshow 
                      imageUrls={imgs} 
                      alt={lightboxImage.title || "Custom crafted item details"}
                      className="w-full h-full"
                      imageClassName="object-contain w-full h-full"
                      imageStyle={{ objectFit: "contain" }}
                    />
                  ) : (
                    <img 
                      src={imgs[0] || ""} 
                      alt={lightboxImage.title || "Custom crafted item details"} 
                      className="w-full h-full object-contain"
                    />
                  );
                })()}
              </div>`);

// Make sure modal container does NOT have max-h-[95vh] overflow-y-auto anymore.
code = code.replace(/className="bg-white text-\[\#181A18\] w-auto max-w-xl flex flex-col rounded-\[4px\] border border-\[\#E7E7E2\] max-h-\[95vh\] overflow-hidden shadow-2xl relative"/,
'className="bg-white text-[#181A18] w-auto max-w-xl flex flex-col rounded-[4px] border border-[#E7E7E2] overflow-hidden shadow-2xl relative mx-auto"');

fs.writeFileSync('public-website/src/pages/Gallery.jsx', code);
