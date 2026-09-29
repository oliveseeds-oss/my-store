const fs = require('fs');
let code = fs.readFileSync('public-website/src/utils/imageHelper.js', 'utf8');

code = code.replace(
  '  if (product.image_url) {\n    const resolved = resolveImageUrl(product.image_url);\n    if (resolved) return resolved;\n  }',
  '  if (product.image_url) {\n    const list = parseImagesList(product.image_url);\n    if (list.length > 0) return list[0];\n  }'
);
code = code.replace(
  '  if (product.image_url) {\r\n    const resolved = resolveImageUrl(product.image_url);\r\n    if (resolved) return resolved;\r\n  }',
  '  if (product.image_url) {\n    const list = parseImagesList(product.image_url);\n    if (list.length > 0) return list[0];\n  }'
);

code = code.replace(
  '  if (product.thumbnail_url) {\n    const resolved = resolveImageUrl(product.thumbnail_url);\n    if (resolved) return resolved;\n  }',
  '  if (product.thumbnail_url) {\n    const list = parseImagesList(product.thumbnail_url);\n    if (list.length > 0) return list[0];\n  }'
);
code = code.replace(
  '  if (product.thumbnail_url) {\r\n    const resolved = resolveImageUrl(product.thumbnail_url);\r\n    if (resolved) return resolved;\r\n  }',
  '  if (product.thumbnail_url) {\n    const list = parseImagesList(product.thumbnail_url);\n    if (list.length > 0) return list[0];\n  }'
);

fs.writeFileSync('public-website/src/utils/imageHelper.js', code);
