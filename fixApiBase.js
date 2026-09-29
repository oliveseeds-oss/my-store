const fs = require('fs');
let code = fs.readFileSync('public-website/src/utils/imageHelper.js', 'utf8');

const replacement = `const getApiBase = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.endsWith("oliveseedsdesignstudio.com")) {
      return "https://apiosspanel.oliveseedsdesignstudio.com";
    }
  }
  return "http://200.141.2.131:5000";
};
const API_BASE = getApiBase();`;

code = code.replace(
  'const API_BASE = (process.env.REACT_APP_API_URL || "").replace(/\\/api\\/?$/, "");',
  replacement
);

fs.writeFileSync('public-website/src/utils/imageHelper.js', code);
