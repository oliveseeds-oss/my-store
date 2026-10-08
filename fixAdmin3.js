const fs = require('fs');
let content = fs.readFileSync('admin-panel/src/pages/Settings.jsx', 'utf8');

const target = `        engraving_showcase_image: settings.engraving_showcase_image,
        about_story_image: settings.about_story_image,`;
const replacement = `        engraving_showcase_image: settings.engraving_showcase_image,
        about_story_image: settings.about_story_image,
        bulk_material_1: settings.bulk_material_1,
        bulk_material_2: settings.bulk_material_2,
        bulk_material_3: settings.bulk_material_3,
        bulk_material_4: settings.bulk_material_4,
        bulk_material_5: settings.bulk_material_5,
        bulk_material_6: settings.bulk_material_6,`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('admin-panel/src/pages/Settings.jsx', content);
    console.log("Successfully replaced payload!");
} else {
    console.log("Target string not found in Settings.jsx");
}
