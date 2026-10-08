const fs = require('fs');
let content = fs.readFileSync('admin-panel/src/pages/Settings.jsx', 'utf8');

content = content.replace(
    /about_story_image:\s*settings\.about_story_image,/,
    `about_story_image: settings.about_story_image,\n        bulk_material_1: settings.bulk_material_1,\n        bulk_material_2: settings.bulk_material_2,\n        bulk_material_3: settings.bulk_material_3,\n        bulk_material_4: settings.bulk_material_4,\n        bulk_material_5: settings.bulk_material_5,\n        bulk_material_6: settings.bulk_material_6,`
);

fs.writeFileSync('admin-panel/src/pages/Settings.jsx', content);
console.log("Successfully replaced payload!");
