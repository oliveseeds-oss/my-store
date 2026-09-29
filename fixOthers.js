const fs = require('fs');
['backend/routes/catalog.js', 'backend/routes/portfolio.js'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /split\(\/\[\\n\,\]\+\/\)/g,
    'split(/[\\n]+|[,\\s]+\\s*(?=(?:https?:\\/\\/|\\/))/)'
  );
  fs.writeFileSync(file, code);
});
