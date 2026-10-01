const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'public-website', 'src', 'pages');

function rep(file, regex, replace) {
  const p = path.join(srcDir, file);
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(regex, replace);
  fs.writeFileSync(p, c, 'utf8');
}

rep('Home.jsx', /<SEO\s+title="Olive Seeds Design Studio"[^>]+>/, '<SEO title="Luxury Home Decor & Elegant Gifts | Olive Seeds Design Studio" description="Olive Seeds Design Studio creates bespoke luxury home decor, corporate office decor, elegant gifts, and designer digital services for premium clientele." keywords="luxury home decor, elegant gifts, corporate office decor, event decor, digital services" />');

const plSEO = `
    const getCategorySEO = () => {
      let title = "Bespoke Design Products | Olive Seeds Design Studio";
      let desc = "Explore our curated collection of bespoke design products - custom corporate gifts, branded dAccor, and premium design objects for discerning B2B clients.";
      let kw = "bespoke design products, custom corporate gifts, branded dAccor, premium design objects, olive seeds design studio";
      const catName = ((typeof filters !== 'undefined' ? filters.category : '') || (typeof slug !== 'undefined' ? slug : '') || '').toLowerCase();
      if (catName.includes('decor') && (catName.includes('home') || catName.includes('luxury'))) {
        title = "Luxury Home Decor | Olive Seeds Design Studio";
        desc = "Discover our premium collection of luxury home decor and designer home accessories for your interior spaces.";
        kw = "luxury home decor, premium home decor, modern wall decor, designer home accessories, premium interior decor, bespoke decor";
      } else if (catName.includes('gift')) {
        title = "Elegant Gifts | Olive Seeds Design Studio";
        desc = "Browse our selection of elegant gifts, including personalised and bespoke designer gifts for all occasions.";
        kw = "elegant gifts, premium gifts, personalised gifts, designer gifts, custom gifts";
      } else if (catName.includes('clock')) {
        title = "Designer Wall Clocks | Olive Seeds Design Studio";
        desc = "Enhance your interiors with our premium designer wall clocks, crafted for modern luxury living.";
        kw = "designer wall clocks, premium wall clocks, modern wall clocks, decorative wall clocks, luxury wall clocks";
      } else if (catName.includes('event') || catName.includes('wedding')) {
        title = "Event Decor | Olive Seeds Design Studio";
        desc = "Bespoke event decor and custom event signage designed for weddings and special occasions.";
        kw = "event decor, event decorations, wedding decor products, event signage, personalised event decor";
      } else if (catName.includes('kids') || catName.includes('education')) {
        title = "Kids Educational Products | Olive Seeds Design Studio";
        desc = "Explore our curated collection of kids educational products and learning boards.";
        kw = "kids educational products, learning products for kids, educational learning products, kids learning boards, early learning products";
      } else if (catName.includes('corporate') || catName.includes('office') || catName.includes('business')) {
        title = "Corporate Office Decor | Olive Seeds Design Studio";
        desc = "Premium corporate office decor, reception decor, and business interior products.";
        kw = "corporate office decor, office decor, corporate interior products, reception decor, office wall decor, business interior decor";
      } else if (catName.includes('hospitality')) {
        title = "Hospitality Interior Design | Olive Seeds Design Studio";
        desc = "Premium hospitality decor and design objects for hotels and restaurants.";
        kw = "hospitality interior design, hospitality decor, hotel decor, restaurant decor";
      }
      return { title, desc, kw };
    };
    const seoData = getCategorySEO();
    return (
      <div style={{ background: T.bg, minHeight: '100vh', fontFamily: T.bodyFont }}>
        <SEO title={seoData.title} description={seoData.desc} keywords={seoData.kw} />
`;
rep('ProductList.jsx', /return\s*\(\s*<div style={{ background: T\.bg, minHeight: ["']100vh["'], fontFamily: T\.bodyFont }}>\s*<SEO[\s\S]*?\/>/, plSEO);

rep('CategoryCatalog.jsx', /<SEO[\s\S]*?\/>/, '<SEO title="Luxury Home Decor & Designer Categories | Olive Seeds Design Studio" description="Browse our bespoke design objects, including luxury home decor, elegant gifts, corporate office decor, and digital services." keywords="luxury home decor, elegant gifts, corporate office decor, bespoke commissions" />');

const dplSEO = `
    const getDigitalCategorySEO = () => {
      let title = "Digital Services | Olive Seeds Design Studio";
      let desc = "Explore our professional digital services including branding, graphic design, and bespoke digital solutions.";
      let kw = "digital services, branding, graphic design, UI/UX design, website design, digital solutions";
      const catName = ((typeof filters !== 'undefined' ? filters.category : '') || (typeof slug !== 'undefined' ? slug : '') || '').toLowerCase();
      if (catName.includes('app') || catName.includes('web') || catName.includes('development')) {
        title = "Web & Mobile Application Development | Olive Seeds Design Studio";
        desc = "Professional web and mobile application development services for discerning clients.";
        kw = "web and mobile application development company, website development, web application development, mobile app development, custom application development";
      }
      return { title, desc, kw };
    };
    const seoData = getDigitalCategorySEO();
    return (
      <div style={{ background: T.bg, minHeight: '100vh', fontFamily: T.bodyFont }}>
        <SEO title={seoData.title} description={seoData.desc} keywords={seoData.kw} />
`;
rep('DigitalProductList.jsx', /return\s*\(\s*<div style={{ background: T\.bg, minHeight: ["']100vh["'], fontFamily: T\.bodyFont }}>\s*<SEO[\s\S]*?\/>/, dplSEO);

rep('Engraving.jsx', /<SEO[\s\S]*?\/>/, '<SEO title="B2B Bulk Corporate Gifts | Olive Seeds Design Studio" description="Premium B2B bulk corporate gifts, branded corporate gifts, and business gifting solutions." keywords="B2B bulk corporate gifts, corporate gifts, bulk corporate gifting, branded corporate gifts, business gifts, corporate gifting solutions" />');

rep('Service.jsx', /<SEO[\s\S]*?\/>/, '<SEO title="Digital Services | Olive Seeds Design Studio" description="Explore our bespoke digital services, branding, graphic design, UI/UX design, and website design solutions." keywords="digital services, branding, graphic design, UI/UX design, website design, digital solutions" />');

console.log('Done SEO replacements.');
