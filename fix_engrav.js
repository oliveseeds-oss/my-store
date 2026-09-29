const fs = require('fs');
let lines = fs.readFileSync('public-website/src/pages/Engraving.jsx', 'utf8').split('\n');
for(let i=0; i<lines.length; i++) {
  if(lines[i].includes('ulk_material_')) {
    lines[i] = '                      <img src={settings[\ulk_material_\\] || mat.img} alt={mat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />';
  }
}
fs.writeFileSync('public-website/src/pages/Engraving.jsx', lines.join('\n'));
