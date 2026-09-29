const fs = require('fs');
['admin-panel/src/pages/Products.jsx', 'admin-panel/src/pages/DigitalProducts.jsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /form\.images\.split\(\"\,?\"\)/g,
    'form.images.split(/[\\n]+|[,\\s]+\\s*(?=(?:https?:\\/\\/|\\/))/)'
  );
  fs.writeFileSync(file, code);
});
