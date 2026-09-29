const fs = require('fs');
let text = fs.readFileSync('public-website/src/pages/Engraving.jsx', 'utf8');
text = text.replace(/<img src=\{settings\[.*?\] \|\| mat\.img\} alt=\{mat\.name\}.*?\/>/, '<img src={settings[`bulk_material_${i + 1}`] || mat.img} alt={mat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />');
fs.writeFileSync('public-website/src/pages/Engraving.jsx', text);
