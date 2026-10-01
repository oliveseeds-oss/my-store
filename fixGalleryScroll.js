const fs = require('fs');
let code = fs.readFileSync('public-website/src/pages/Gallery.jsx', 'utf8');

code = code.replace(
  'className="bg-white text-[#181A18] max-w-xl w-full rounded-[4px] border border-[#E7E7E2] overflow-hidden shadow-2xl relative"',
  'className="bg-white text-[#181A18] max-w-xl w-full rounded-[4px] border border-[#E7E7E2] max-h-[95vh] overflow-y-auto shadow-2xl relative"'
);

fs.writeFileSync('public-website/src/pages/Gallery.jsx', code);
