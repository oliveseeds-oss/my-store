const fs = require('fs');
let content = fs.readFileSync('src/pages/BlogList.jsx', 'utf8');

content = content.replace(
  'DOMPurify.sanitize(formatContent(viewingPost.content))',
  'DOMPurify.sanitize(formatContent(viewingPost.content), { ADD_ATTR: ["target", "class", "style", "id", "href", "src"], ADD_TAGS: ["iframe", "figure", "figcaption"] })'
);

const oldLayout = `        <main className="flex-1 w-full pb-12">
          {/* Article Header (Hero) */}
          <header className="max-w-3xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-6 sm:pb-8">`;
const newLayout = `        <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-10 px-5 sm:px-8 pb-12 pt-6 sm:pt-10">
          <main className="flex-1 w-full max-w-3xl">
          {/* Article Header (Hero) */}
          <header className="w-full pb-6 sm:pb-8">`;
content = content.replace(oldLayout, newLayout);

content = content.replace(/className="max-w-4xl mx-auto px-5 sm:px-8 mb-10 sm:mb-14"/g, 'className="w-full mb-10 sm:mb-14"');
content = content.replace(/<div className="max-w-4xl mx-auto px-5 sm:px-8 mb-8"><AdBanner \/><\/div>/g, '<div className="w-full mb-8 lg:hidden"><AdBanner placement="Horizontal Banner" /></div>');
content = content.replace(/<article className="max-w-3xl mx-auto px-5 sm:px-8 md:px-10">/g, '<article className="w-full">');
content = content.replace(/<section className="max-w-3xl mx-auto px-5 sm:px-8 mt-14 sm:mt-20 mb-12">/g, '<section className="w-full mt-14 sm:mt-20 mb-12">');

const oldClose = `        </main>

        <Footer />`;
const newClose = `          </main>

          <aside className="hidden lg:flex w-[300px] shrink-0 sticky top-28 flex-col gap-8 self-start">
            <AdBanner placement="Square Tile" />
            <AdBanner placement="Vertical Tower" />
          </aside>
        </div>

        <Footer />`;
content = content.replace(oldClose, newClose);

fs.writeFileSync('src/pages/BlogList.jsx', content);
console.log('done blog fix');
