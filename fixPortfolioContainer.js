const fs = require('fs');
let code = fs.readFileSync('public-website/src/pages/Portfolio.jsx', 'utf8');

code = code.replace(
  'width: "100%",\n                maxHeight: "95vh", overflowY: "auto",\n                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",',
  'width: "auto",\n                display: "flex",\n                flexDirection: "column",\n                maxHeight: "95vh",\n                overflow: "hidden",\n                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",'
);
// In case of \r\n
code = code.replace(
  'width: "100%",\r\n                maxHeight: "95vh", overflowY: "auto",\r\n                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",',
  'width: "auto",\r\n                display: "flex",\r\n                flexDirection: "column",\r\n                maxHeight: "95vh",\r\n                overflow: "hidden",\r\n                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",'
);

fs.writeFileSync('public-website/src/pages/Portfolio.jsx', code);
