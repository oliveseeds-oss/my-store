import re
with open('public-website/src/pages/Engraving.jsx', 'r', encoding='utf-8') as f:
    text = f.read()
text = re.sub(r'<img src=\{settings\[.*?\] \|\| mat\.img\} alt=\{mat\.name\}.*?\/>', '<img src={settings[ulk_material_] || mat.img} alt={mat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />', text)
with open('public-website/src/pages/Engraving.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
