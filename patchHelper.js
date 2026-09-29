const fs = require('fs');
let code = fs.readFileSync('public-website/src/utils/imageHelper.js', 'utf8');

code = code.replace(
  '  if (trimmed.includes(",") || trimmed.includes(" ")) {\r\n    trimmed = trimmed.split(/[\\s,]+/)[0].trim();\r\n  }\r\n',
  ''
);
code = code.replace(
  '  if (trimmed.includes(",") || trimmed.includes(" ")) {\n    trimmed = trimmed.split(/[\\s,]+/)[0].trim();\n  }\n',
  ''
);
code = code.replace(
  /  if \(trimmed\.includes\(\",\"\) \|\| trimmed\.includes\(\" \"\)\) \{\s*trimmed = trimmed\.split\(\/\[\\s,\]\+\/\)\[0\]\.trim\(\);\s*\}/g,
  ''
);

code = code.replace(
  'return trimmed.split(/[\\n,]+/).map(resolveImageUrl).filter(Boolean);',
  'return trimmed.split(/[\\n,]+/).map(u => u.trim()).filter(Boolean).map(resolveImageUrl).filter(Boolean);'
);

fs.writeFileSync('public-website/src/utils/imageHelper.js', code);
