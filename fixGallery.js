const fs = require('fs');
let code = fs.readFileSync('backend/routes/gallery.js', 'utf8');

code = code.replace(
  /split\(\/\[\\n\,\]\+\/\)/g,
  'split(/[\\n]+|[,\\s]+\\s*(?=(?:https?:\\/\\/|\\/))/)'
);

fs.writeFileSync('backend/routes/gallery.js', code);
