const fs = require('fs');
let code = fs.readFileSync('public-website/src/pages/Gallery.jsx', 'utf8');

// Change grid aspect ratio
code = code.replace(/aspect-square w-full overflow-hidden bg-\[\#FAF6EE\] relative/g, 'aspect-[3/4] w-full overflow-hidden bg-[#FAF6EE] relative');

// Change modal aspect ratio for HoverSlideshow
code = code.replace(/className=\"w-full max-h-\[380px\]\"/g, 'className="w-full aspect-[3/4]"');

// Change modal aspect ratio for single img
code = code.replace(/className=\"w-full max-h-\[380px\] object-cover\"/g, 'className="w-full aspect-[3/4] object-cover"');

fs.writeFileSync('public-website/src/pages/Gallery.jsx', code);
