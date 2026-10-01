const fs = require('fs');
let code = fs.readFileSync('public-website/src/pages/Portfolio.jsx', 'utf8');

code = code.replace(/width: \"100%\",\s*maxHeight: \"95vh\", overflowY: \"auto\",\s*boxShadow: \"0 20px 50px rgba\(0,0,0,0\.12\)\",/g,
  `width: "auto",
                display: "flex",
                flexDirection: "column",
                maxHeight: "95vh",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",`);

fs.writeFileSync('public-website/src/pages/Portfolio.jsx', code);
