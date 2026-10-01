const fs = require('fs');
let code = fs.readFileSync('public-website/src/pages/Gallery.jsx', 'utf8');

code = code.replace(
  'className="bg-white text-[#181A18] max-w-xl w-full rounded-[4px] border border-[#E7E7E2] max-h-[95vh] overflow-y-auto shadow-2xl relative"',
  'className="bg-white text-[#181A18] w-auto max-w-xl flex flex-col rounded-[4px] border border-[#E7E7E2] max-h-[95vh] overflow-hidden shadow-2xl relative"'
);

const oldImgSection = `{(() => {
                const imgs = parseImagesList(lightboxImage.image_url);
                return imgs.length > 1 ? (
                  <HoverSlideshow 
                    imageUrls={imgs} 
                    alt={lightboxImage.title || "Custom crafted item details"}
                    className="w-full aspect-[3/4]"
                    imageClassName="w-full h-full object-cover"
                    imageStyle={{}}
                  />
                ) : (
                  <img 
                    src={imgs[0] || ""} 
                    alt={lightboxImage.title || "Custom crafted item details"} 
                    className="w-full aspect-[3/4] object-cover"
                  />
                );
              })()}`;

const newImgSection = `<div className="flex-1 min-h-0 bg-[#FAF6EE] flex items-center justify-center relative">
                {(() => {
                  const imgs = parseImagesList(lightboxImage.image_url);
                  return imgs.length > 1 ? (
                    <HoverSlideshow 
                      imageUrls={imgs} 
                      alt={lightboxImage.title || "Custom crafted item details"}
                      className="h-full w-auto aspect-[3/4]"
                      imageClassName="h-full w-full object-contain"
                      imageStyle={{}}
                    />
                  ) : (
                    <img 
                      src={imgs[0] || ""} 
                      alt={lightboxImage.title || "Custom crafted item details"} 
                      className="h-full w-auto aspect-[3/4] object-contain"
                    />
                  );
                })()}
              </div>`;

// Let's use regex to match because whitespace might be slightly different.
code = code.replace(/\{\(\(\) => \{\s+const imgs = parseImagesList\(lightboxImage\.image_url\);\s+return imgs\.length > 1 \? \(\s+<HoverSlideshow\s+imageUrls=\{imgs\}\s+alt=\{lightboxImage\.title \|\| "Custom crafted item details"\}\s+className="w-full aspect-\[3\/4\]"\s+imageClassName="w-full h-full object-cover"\s+imageStyle=\{\{\}\}\s+\/>\s+\) : \(\s+<img\s+src=\{imgs\[0\] \|\| ""\}\s+alt=\{lightboxImage\.title \|\| "Custom crafted item details"\}\s+className="w-full aspect-\[3\/4\] object-cover"\s+\/>\s+\);\s+\}\)\(\)\}/g, newImgSection);

code = code.replace('<div className="p-6 md:p-8">', '<div className="p-6 md:p-8 shrink-0 min-w-[320px]">');

fs.writeFileSync('public-website/src/pages/Gallery.jsx', code);
