const fs = require('fs');
let code = fs.readFileSync('backend/routes/bulkAdmin.js', 'utf8');

const regexSplit = /\.split\((?:\"\,?\"|\'\,\')\)/g;
// Replace only for images
code = code.replace(/additionalImagesStr\.split\((?:\"\,?\"|\'\,\')\)/g, 'additionalImagesStr.split(/[\\n]+|[,\\s]+\\s*(?=(?:https?:\\/\\/|\\/))/)');
code = code.replace(/previewImagesStr\.split\((?:\"\,?\"|\'\,\')\)/g, 'previewImagesStr.split(/[\\n]+|[,\\s]+\\s*(?=(?:https?:\\/\\/|\\/))/)');

fs.writeFileSync('backend/routes/bulkAdmin.js', code);
