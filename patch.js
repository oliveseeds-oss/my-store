const fs = require('fs');

function patch(file, regex, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
}

patch('backend/routes/portfolio.js',
  /if \(urls\.length === 0 \|\| !title\) \{[\s\S]*?res\.json\(\{ id: insertedIds\[0\][^\}]+\}\);/m,
  \if (urls.length === 0 || !title) {
    return res.status(400).json({ error: "At least one Image URL and Title are required" });
  }

  try {
    const combinedUrl = urls.join(',');
    const [result] = await db.query(
      "INSERT INTO portfolio (image_url, title, description, category) VALUES (?,?,?,?)",
      [combinedUrl, title, description || null, category || null]
    );
    res.json({ id: result.insertId, message: "Portfolio project added" });\
);

patch('backend/routes/gallery.js',
  /if \(urls\.length === 0\) \{[\s\S]*?res\.json\(\{ ids: insertedIds[^\}]+\}\);/m,
  \if (urls.length === 0) {
    return res.status(400).json({ error: "At least one Image URL is required" });
  }

  try {
    const combinedUrl = urls.join(',');
    const [result] = await db.query(
      "INSERT INTO gallery (image_url, title, style, category, industry, material, description) VALUES (?,?,?,?,?,?,?)",
      [combinedUrl, title || null, style || null, category || null, industry || null, material || null, description || null]
    );
    res.json({ id: result.insertId, message: "Gallery item added" });\
);

patch('backend/routes/catalog.js',
  /if \(urls\.length > 1\) \{[\s\S]*?return res\.json\(\{ id: insertedIds\[0\][^\}]+\}\);\s*\}/m,
  \if (urls.length > 1) {
    const combinedUrl = urls.join(',');
    const [result] = await db.query(
      "INSERT INTO catalog (name, type, description, image_url) VALUES (?,?,?,?)",
      [name, type || "physical", description, combinedUrl]
    );
    return res.json({ id: result.insertId, message: "Catalog item added" });
  }\
);

// We must also fix split regex to include spaces!
function fixSplit(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\/\[\\\\n,\]\\\+\//g, '/[\\\\n,\\\\s]+/');
  fs.writeFileSync(file, content);
}
fixSplit('backend/routes/portfolio.js');
fixSplit('backend/routes/gallery.js');
fixSplit('backend/routes/catalog.js');

