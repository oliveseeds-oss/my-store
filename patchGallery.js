
const fs = require('fs');
let code = fs.readFileSync('public-website/src/pages/Gallery.jsx', 'utf8');
code = code.replace(
  /<img [^>]*?src=\{item\.image_url\}[^>]*?\/>/,
  {(() => {
    const imgs = parseImagesList(item.image_url);
    return imgs.length > 1 ? (
      <HoverSlideshow 
        imageUrls={imgs} 
        alt={item.title || 'Custom crafted item'}
        className='w-full h-full'
        imageClassName='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out'
        imageStyle={{}}
      />
    ) : (
      <img 
        src={imgs[0] || ''} 
        alt={item.title || 'Custom crafted item'} 
        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out'
      />
    );
  })()}
);
code = code.replace(
  /<img [^>]*?src=\{lightboxImage\.image_url\}[^>]*?\/>/,
  {(() => {
    const imgs = parseImagesList(lightboxImage.image_url);
    return imgs.length > 1 ? (
      <HoverSlideshow 
        imageUrls={imgs} 
        alt={lightboxImage.title || 'Custom crafted item details'}
        className='w-full max-h-[380px]'
      />
    ) : (
      <img 
        src={imgs[0] || ''} 
        alt={lightboxImage.title || 'Custom crafted item details'} 
        className='w-full max-h-[380px] object-cover'
      />
    );
  })()}
);
fs.writeFileSync('public-website/src/pages/Gallery.jsx', code);

