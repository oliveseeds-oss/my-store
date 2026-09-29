const fs = require('fs');
let serverCode = fs.readFileSync('public-website/server.js', 'utf8');

serverCode = serverCode.replace(
  'const seoData = await getBackendData(/seo/ + activePage);',
  'const seoData = await getBackendData(/seo/page/ + activePage);'
);

serverCode = serverCode.replace(
  'const seoData = await getBackendData(\/seo/\\`);',
  'const seoData = await getBackendData(\/seo/page/\\`);'
);


let settingsCode = fs.readFileSync('backend/routes/settings.js', 'utf8');
settingsCode = settingsCode.replace('about_story_image: "",', 'about_story_image: "", bulk_material_1: "", bulk_material_2: "", bulk_material_3: "", bulk_material_4: "", bulk_material_5: "", bulk_material_6: "",');
settingsCode = settingsCode.replace('about_story_image: res.data.about_story_image || "",', 'about_story_image: res.data.about_story_image || "", bulk_material_1: res.data.bulk_material_1 || "", bulk_material_2: res.data.bulk_material_2 || "", bulk_material_3: res.data.bulk_material_3 || "", bulk_material_4: res.data.bulk_material_4 || "", bulk_material_5: res.data.bulk_material_5 || "", bulk_material_6: res.data.bulk_material_6 || "",');
settingsCode = settingsCode.replace('about_story_image: settings.about_story_image,', 'about_story_image: settings.about_story_image, bulk_material_1: settings.bulk_material_1, bulk_material_2: settings.bulk_material_2, bulk_material_3: settings.bulk_material_3, bulk_material_4: settings.bulk_material_4, bulk_material_5: settings.bulk_material_5, bulk_material_6: settings.bulk_material_6,');
fs.writeFileSync('backend/routes/settings.js', settingsCode);

