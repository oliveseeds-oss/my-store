const fs = require('fs');
let code = fs.readFileSync('public-website/src/pages/Gallery.jsx', 'utf8');

const oldModalClass = 'className="bg-white text-[#181A18] max-w-xl w-full rounded-[4px] border border-[#E7E7E2] max-h-[95vh] overflow-y-auto shadow-2xl relative"';
const newModalClass = 'className="bg-white text-[#181A18] w-auto max-w-xl flex flex-col rounded-[4px] border border-[#E7E7E2] max-h-[95vh] overflow-hidden shadow-2xl relative"';
code = code.replace(oldModalClass, newModalClass);

const oldImageLogic = `{(() => {
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

const newImageLogic = `<div className="flex-1 min-h-0 bg-[#FAF6EE] flex items-center justify-center relative">
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

code = code.replace(oldImageLogic, newImageLogic);

const oldTextContainer = '<div className="p-6 md:p-8">';
const newTextContainer = '<div className="p-6 md:p-8 shrink-0 min-w-[320px]">';
code = code.replace(oldTextContainer, newTextContainer);

fs.writeFileSync('public-website/src/pages/Gallery.jsx', code);
