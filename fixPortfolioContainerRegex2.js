const fs = require('fs');
let code = fs.readFileSync('public-website/src/pages/Portfolio.jsx', 'utf8');

code = code.replace(/maxWidth: \"600px\",\s*width: \"100%\",\s*overflow: \"hidden\",\s*boxShadow: \"0 20px 50px rgba\(0,0,0,0\.12\)\",/g,
  `maxWidth: "600px",
                width: "auto",
                display: "flex",
                flexDirection: "column",
                maxHeight: "95vh",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",`);

fs.writeFileSync('public-website/src/pages/Portfolio.jsx', code);
