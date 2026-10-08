const fs = require('fs');
let content = fs.readFileSync('src/pages/BlogList.jsx', 'utf8');
content = content.replace('<article className="max-w-3xl mx-auto px-5 sm:px-8 md:px-10">', '<div className="max-w-4xl mx-auto px-5 sm:px-8 mb-8"><AdBanner /></div>\n          <article className="max-w-3xl mx-auto px-5 sm:px-8 md:px-10">');
fs.writeFileSync('src/pages/BlogList.jsx', content);
console.log('done');
