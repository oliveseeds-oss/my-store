const fs = require('fs');
let code = fs.readFileSync('public-website/src/pages/Engraving.jsx', 'utf8');

code = code.replace(
  '<img src={mat.img} alt={mat.name}',
  '<img src={settings[\ulk_material_\\] || mat.img} alt={mat.name}'
);

fs.writeFileSync('public-website/src/pages/Engraving.jsx', code);
