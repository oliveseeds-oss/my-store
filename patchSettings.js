const fs = require('fs');
let code = fs.readFileSync('backend/routes/settings.js', 'utf8');

code = code.replace(
  'about_story_image FROM settings',
  'about_story_image, bulk_material_1, bulk_material_2, bulk_material_3, bulk_material_4, bulk_material_5, bulk_material_6 FROM settings'
);

code = code.replace(
  'about_story_image: "",',
  'about_story_image: "", bulk_material_1: "", bulk_material_2: "", bulk_material_3: "", bulk_material_4: "", bulk_material_5: "", bulk_material_6: "",'
);

code = code.replace(
  'about_story_image: res.data.about_story_image || "",',
  'about_story_image: res.data.about_story_image || "", bulk_material_1: res.data.bulk_material_1 || "", bulk_material_2: res.data.bulk_material_2 || "", bulk_material_3: res.data.bulk_material_3 || "", bulk_material_4: res.data.bulk_material_4 || "", bulk_material_5: res.data.bulk_material_5 || "", bulk_material_6: res.data.bulk_material_6 || "",'
);

code = code.replace(
  'about_story_image = ?',
  'about_story_image = ?, bulk_material_1 = ?, bulk_material_2 = ?, bulk_material_3 = ?, bulk_material_4 = ?, bulk_material_5 = ?, bulk_material_6 = ?'
);

code = code.replace(
  'settings.about_story_image,',
  'settings.about_story_image, settings.bulk_material_1, settings.bulk_material_2, settings.bulk_material_3, settings.bulk_material_4, settings.bulk_material_5, settings.bulk_material_6,'
);

fs.writeFileSync('backend/routes/settings.js', code);
