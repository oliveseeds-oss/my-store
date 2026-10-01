const fs = require('fs');
let code = fs.readFileSync('public-website/src/pages/Portfolio.jsx', 'utf8');

code = code.replace(
  'overflow: "hidden",',
  'maxHeight: "95vh", overflowY: "auto",'
);

// If they want 3:4 images here too, we can apply it. They didn't ask, but it's consistent.
// Let's just fix the overflow for now so nothing is ever cut off.

fs.writeFileSync('public-website/src/pages/Portfolio.jsx', code);
