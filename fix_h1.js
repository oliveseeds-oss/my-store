const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'public-website', 'src', 'pages');

function fixH1(filename) {
  const filepath = path.join(srcDir, filename);
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Find the first <h2 ...> ... </h2> and replace with h1
  // Only doing this if there is NO <h1 in the file
  if (!content.includes('<h1')) {
    content = content.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/, '<h1$1>$2</h1>');
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Fixed H1 in ${filename}`);
  }
}

fixH1('Home.jsx');
