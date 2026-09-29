const fs = require('fs');
let code = fs.readFileSync('public-website/src/utils/imageHelper.js', 'utf8');

code = code.replace(
  'return trimmed.split(/[\\n,\\s]+/).map(u => u.trim()).filter(Boolean).map(resolveImageUrl).filter(Boolean);',
  'return trimmed.split(/[\\n,]+/).map(u => u.trim()).filter(Boolean).map(resolveImageUrl).filter(Boolean);'
);

fs.writeFileSync('public-website/src/utils/imageHelper.js', code);
