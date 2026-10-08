const fs = require('fs');
let content = fs.readFileSync('src/pages/Engraving.jsx', 'utf8');

content = content.replace(
  'const [settings, setSettings] = useState({});',
  'const [settings, setSettings] = useState({});\n  const [settingsLoaded, setSettingsLoaded] = useState(false);'
);

content = content.replace(
  /API\.get\("\/settings"\)\s*\.then\(\(r\) => \{ if \(r\.data\) setSettings\(r\.data\); \}\)\s*\.catch\(\(\) => \{\}\);/,
  'API.get("/settings").then((r) => { if (r.data) setSettings(r.data); setSettingsLoaded(true); }).catch(() => { setSettingsLoaded(true); });'
);

content = content.replace(
  /<img src=\{settings\[`bulk_material_\$\{i \+ 1\}`\] \|\| mat\.img\} alt=\{mat\.name\} style=\{\{ width: "100%", height: "100%", objectFit: "cover" \}\} \/>/g,
  '{!settingsLoaded ? <div className="animate-pulse" style={{ width: "100%", height: "100%", backgroundColor: "#EAE4D6" }} /> : <img src={settings[`bulk_material_${i + 1}`] || mat.img} alt={mat.name} style={{ width: "100%", height: "100%", objectFit: "cover", animation: "fadeIn 0.5s ease" }} />}'
);

content = content.replace(
  /<img\s+src=\{settings\.engraving_hero_image[^>]*\/>/,
  `{!settingsLoaded ? <div className="animate-pulse w-full h-full bg-[#EAE4D6]" /> : $&}`
);

content = content.replace(
  /<img\s+src=\{settings\.engraving_showcase_image[^>]*\/>/,
  `{!settingsLoaded ? <div className="animate-pulse w-full h-full bg-[#EAE4D6]" /> : $&}`
);

fs.writeFileSync('src/pages/Engraving.jsx', content);
console.log('Done fix');
