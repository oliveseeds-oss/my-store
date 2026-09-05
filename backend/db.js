const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  port: 3306,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

const poolPromise = pool.promise();

async function initializeDatabase() {
  const runSafe = async (query, params = []) => {
    try {
      return await poolPromise.query(query, params);
    } catch (err) {
      // Ignore existing column/table/index schema errors safely
      return null;
    }
  };

  // 1. CRITICAL: Payment & Order Gateway Columns (Razorpay, PayPal & Order tracking)
  const orderTables = ["physical_orders", "digital_orders"];
  for (const tbl of orderTables) {
    await runSafe(`ALTER TABLE ${tbl} ADD COLUMN razorpay_order_id VARCHAR(255) DEFAULT NULL`);
    await runSafe(`ALTER TABLE ${tbl} ADD COLUMN razorpay_payment_id VARCHAR(255) DEFAULT NULL`);
    await runSafe(`ALTER TABLE ${tbl} ADD COLUMN razorpay_signature VARCHAR(255) DEFAULT NULL`);
    await runSafe(`ALTER TABLE ${tbl} ADD COLUMN payment_verified_at TIMESTAMP NULL DEFAULT NULL`);
    await runSafe(`ALTER TABLE ${tbl} ADD COLUMN refund_id VARCHAR(255) DEFAULT NULL`);
    await runSafe(`ALTER TABLE ${tbl} ADD COLUMN refund_amount DECIMAL(10,2) DEFAULT NULL`);
    await runSafe(`ALTER TABLE ${tbl} ADD COLUMN refund_status VARCHAR(100) DEFAULT NULL`);
    await runSafe(`ALTER TABLE ${tbl} ADD COLUMN refund_at TIMESTAMP NULL DEFAULT NULL`);
  }

  // 2. Settings table gateway columns
  await runSafe("ALTER TABLE settings ADD COLUMN paypal_client_id VARCHAR(255) DEFAULT NULL");
  await runSafe("ALTER TABLE settings ADD COLUMN paypal_client_secret VARCHAR(255) DEFAULT NULL");
  await runSafe("ALTER TABLE settings ADD COLUMN razorpay_key VARCHAR(255) DEFAULT NULL");
  await runSafe("ALTER TABLE settings ADD COLUMN razorpay_secret VARCHAR(255) DEFAULT NULL");
  await runSafe("ALTER TABLE settings ADD COLUMN shiprocket_email VARCHAR(255) DEFAULT NULL");
  await runSafe("ALTER TABLE settings ADD COLUMN shiprocket_password VARCHAR(255) DEFAULT NULL");
  await runSafe("ALTER TABLE settings ADD COLUMN shiprocket_token TEXT DEFAULT NULL");
  await runSafe("ALTER TABLE settings ADD COLUMN shiprocket_token_expires TIMESTAMP NULL DEFAULT NULL");
  await runSafe("INSERT IGNORE INTO settings (id, site_name) VALUES (1, 'My Engraving Store')");

  // 3. SEO Settings Table & Schema
  await runSafe(`
    CREATE TABLE IF NOT EXISTS seo_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page_name VARCHAR(50) NOT NULL UNIQUE,
      page_key VARCHAR(255) UNIQUE,
      title VARCHAR(255),
      meta_title VARCHAR(255),
      meta_description TEXT,
      focus_keyword VARCHAR(255),
      keywords TEXT,
      canonical_url VARCHAR(500),
      no_index BOOLEAN DEFAULT false,
      og_title VARCHAR(255),
      og_description TEXT,
      og_image VARCHAR(500),
      image_alt TEXT,
      twitter_card VARCHAR(50) DEFAULT 'summary_large_image',
      twitter_title VARCHAR(255),
      twitter_description TEXT,
      twitter_image VARCHAR(500),
      custom_schema TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  const seoCols = [
    "ALTER TABLE seo_settings ADD COLUMN page_key VARCHAR(255) UNIQUE",
    "ALTER TABLE seo_settings ADD COLUMN meta_title VARCHAR(255)",
    "ALTER TABLE seo_settings ADD COLUMN focus_keyword VARCHAR(255)",
    "ALTER TABLE seo_settings ADD COLUMN canonical_url VARCHAR(500)",
    "ALTER TABLE seo_settings ADD COLUMN no_index BOOLEAN DEFAULT false",
    "ALTER TABLE seo_settings ADD COLUMN twitter_card VARCHAR(50) DEFAULT 'summary_large_image'",
    "ALTER TABLE seo_settings ADD COLUMN twitter_title VARCHAR(255)",
    "ALTER TABLE seo_settings ADD COLUMN twitter_description TEXT",
    "ALTER TABLE seo_settings ADD COLUMN twitter_image VARCHAR(500)",
    "ALTER TABLE seo_settings ADD COLUMN custom_schema TEXT",
    "ALTER TABLE seo_settings ADD COLUMN og_title VARCHAR(255)",
    "ALTER TABLE seo_settings ADD COLUMN og_description TEXT",
    "ALTER TABLE seo_settings ADD COLUMN og_image VARCHAR(500)"
  ];
  for (const q of seoCols) {
    await runSafe(q);
  }

  // Sync page_key and page_name
  await runSafe("UPDATE seo_settings SET page_key = page_name WHERE (page_key IS NULL OR page_key = '') AND page_name IS NOT NULL");
  await runSafe("UPDATE seo_settings SET meta_title = title WHERE (meta_title IS NULL OR meta_title = '') AND title IS NOT NULL");

  // Global SEO Settings
  await runSafe(`
    CREATE TABLE IF NOT EXISTS global_seo_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      setting_key VARCHAR(255) UNIQUE NOT NULL,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  const defaultGlobals = [
    ['site_name', 'Olive Seeds Studio'],
    ['title_separator', '|'],
    ['default_meta_description', 'Olive Seeds Design Studio offers custom laser-engraved products, instant-download digital templates, and professional design services. Worldwide shipping available.'],
    ['default_og_image', 'https://oliveseedsdesignstudio.com/logo192.png'],
    ['site_logo_url', 'https://oliveseedsdesignstudio.com/logo192.png'],
    ['robots_txt', `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout\nDisallow: /cart\nDisallow: /profile\nDisallow: /api/\n\nSitemap: https://oliveseedsdesignstudio.com/sitemap.xml\nSitemap: https://oliveseedsdesignstudio.com/sitemap-images.xml\nSitemap: https://oliveseedsdesignstudio.com/sitemap-news.xml`]
  ];
  for (const [k, v] of defaultGlobals) {
    await runSafe("INSERT IGNORE INTO global_seo_settings (setting_key, setting_value) VALUES (?, ?)", [k, v]);
  }

  // Seed default seo pages
  const seoDefaults = [
    ['home', 'Premium Engraving & Digital Studio | Olive Seeds', 'Premium laser engraved luxury gifts, wood carvings, personalized wedding frames, custom design templates, Notion trackers, React apps and brand UI design.', 'laser engraving, custom engravings, personalized gifts, Notion templates, Figma kits, React developers, web design, Olive Seeds', 'Olive Seeds Creative Studio', 'Handcrafted engraved products & templates', '', 'Designers crafting engravings in Olive Seeds studio workshop'],
    ['products', 'Luxury Laser Engraved Masterpieces | Olive Seeds', 'Browse premium custom-engraved wooden frames, acrylic wedding blocks, corporate luxury keepsakes and hand-finished laser gifts at Olive Seeds.', 'wood engraving, personalized gifts, custom keepsakes, corporate premium gifts, wedding acrylic blocks', 'Luxury Custom Engravings', 'Elegant keepsakes hand-finished at Olive Seeds', '', 'Precision custom wood engraving using high-end laser technology'],
    ['digital', 'Premium AI-Powered Digital Assets & UI/UX Design Templates', 'Download professional Notion templates, Figma kits, React source code, luxury vectors, and premium UI designs instantly at Olive Seeds.', 'Notion template, Figma design systems, React developer kits, premium UI design templates, Olive Seeds digital', 'Olive Seeds Digital Assets', 'Instant premium download templates', '', 'Sleek luxury design kits representation'],
    ['blogs', 'Studio Journal & Craftsmanship Musings | Olive Seeds', 'Read about precision laser engraving sciences, sustainable teakwood designs, creative branding, and luxury design philosophies on Olive Seeds Journal.', 'precision laser calibration, design journal, corporate gift ideas, circular branding, sustainable bamboo, Olive Seeds', 'Olive Seeds Craftsmanship Journal', 'Insights from the workshop & digital desk', '', 'Teakwood designs alignment on the desk'],
    ['about', 'About Our Studio | Olive Seeds', 'Learn about our passion for luxury craftsmanship, organic bamboo & recycled acrylic selections, precision laser engraving, and custom brand designs.', 'luxury craftsmanship, sustainable design, about olive seeds, laser workshop', 'The Story of Olive Seeds', 'Luxury craftsmanship meeting modern digital tech', '', 'Olive Seeds workshop process representation'],
    ['contact', 'Contact Our Studio | Olive Seeds', 'Get in touch with the team at Olive Seeds for custom engraving requests, corporate branding quotes, or personalized digital agency solutions.', 'contact us, custom quotes, custom laser orders', 'Start a Project with Olive Seeds', 'Reach out for pricing and bespoke orders', '', 'Luxury contact desk illustration'],
    ['service', 'Premium Creative Services | Olive Seeds', 'Professional UI/UX design, web & mobile development, AI integration, brand identity design, and premium creative solutions.', 'ui/ux design, web development, app development, branding, AI solutions, Olive Seeds services', 'Creative Services | Olive Seeds', 'Everything your brand needs to succeed', '', 'Workspace overview with design draft models'],
    ['terms', 'Terms & Conditions | Olive Seeds', 'Review the official terms of service, user agreements, digital license terms, and purchase policies of Olive Seeds Creative Studio.', 'terms and conditions, terms of service, user agreement, licensing terms, Olive Seeds terms', 'Terms & Conditions', 'Our customer terms & guidelines', '', 'Legal documents illustration'],
    ['privacy', 'Privacy Policy | Olive Seeds', 'Read the privacy policy of Olive Seeds Creative Studio to understand how we collect, protect, and handle your personal data.', 'privacy policy, data protection, security, user privacy, Olive Seeds privacy', 'Privacy Policy', 'Your privacy & trust are secure with us', '', 'Secure lock privacy illustration'],
    ['refund', 'Refund & Cancellation Policy | Olive Seeds', 'Learn about our return, refund, and replacement policies for customized engraved products and digital downloads.', 'refund policy, cancellation, return policy, product replacement, Olive Seeds refund', 'Refund & Cancellation Policy', 'Return & refund terms explained', '', 'Customer care support graphics'],
    ['shipping', 'Shipping & Delivery Policy | Olive Seeds', 'Read the shipping details, processing times, and worldwide delivery options for our physical laser-engraved creations.', 'shipping policy, worldwide delivery, processing times, package tracking, Olive Seeds shipping', 'Shipping & Delivery Policy', 'Safe packaging and fast shipping logistics', '', 'Delivery packaging container representation'],
    ['cookies', 'Cookies Policy | Olive Seeds', 'Understand how Olive Seeds Creative Studio uses cookies to optimize your browsing experience and custom dashboard usage.', 'cookies policy, cookies usage, tracking, website cookies, Olive Seeds cookies', 'Cookies Policy', 'Cookie storage and tracking preference terms', '', 'Cookie browser settings graphics'],
    ['cart', 'Your Shopping Cart | Olive Seeds', 'Review your selected premium laser-engraved gifts, custom keepsakes, or digital design templates in your cart.', 'shopping cart, cart, checkout items, checkout queue, Olive Seeds cart', 'Your Shopping Cart', 'Securely view your selected items', '', 'Shopping cart illustration'],
    ['checkout', 'Secure Checkout | Olive Seeds', 'Complete your secure payment and purchase of handcrafted engraved treasures or instant digital creator assets.', 'secure checkout, checkout, buy templates, pay custom order, Olive Seeds checkout', 'Secure Checkout', 'Encrypted secure payment gateway integration', '', 'Secure payment processing card representation'],
    ['login', 'Member Login | Olive Seeds', 'Log in to your secure Olive Seeds member portal to access your previous digital downloads, tracking, and customized order history.', 'member login, login, dashboard access, sign in, customer account', 'Member Portal Login', 'Access your customer account securely', '', 'Customer login shield vector'],
    ['profile', 'Your Dashboard & Profile | Olive Seeds', 'Access your secure profile dashboard to track your orders, retrieve download keys, and manage your account configurations.', 'user profile, profile dashboard, customer panel, digital library, order history', 'Customer Profile Dashboard', 'Manage your orders, digital assets & account details', '', 'Custom dashboard analytics mockup']
  ];
  for (const d of seoDefaults) {
    await runSafe(
      "INSERT IGNORE INTO seo_settings (page_name, title, meta_description, keywords, og_title, og_description, og_image, image_alt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      d
    );
  }

  // 4. Notifications & Broadcasts
  await runSafe(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT DEFAULT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'general',
      link VARCHAR(255) DEFAULT NULL,
      related_order_id INT DEFAULT NULL,
      related_product_id INT DEFAULT NULL,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await runSafe("ALTER TABLE notifications ADD COLUMN user_id INT DEFAULT NULL");
  await runSafe("ALTER TABLE notifications ADD COLUMN link VARCHAR(255) DEFAULT NULL");
  await runSafe("ALTER TABLE notifications ADD COLUMN related_order_id INT DEFAULT NULL");
  await runSafe("ALTER TABLE notifications ADD COLUMN related_product_id INT DEFAULT NULL");
  await runSafe("ALTER TABLE notifications MODIFY COLUMN type VARCHAR(50) DEFAULT 'general'");

  await runSafe(`
    CREATE TABLE IF NOT EXISTS broadcast_notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'new_arrival',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      sent_count INT DEFAULT 0
    )
  `);

  // 5. Inquiries, Catalog, Portfolio, OTP
  await runSafe(`
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp_code VARCHAR(6) NOT NULL,
      purpose VARCHAR(50) NOT NULL DEFAULT 'registration',
      is_verified BOOLEAN DEFAULT FALSE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSafe(`
    CREATE TABLE IF NOT EXISTS bulk_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      company VARCHAR(255),
      product_type VARCHAR(255),
      quantity INT DEFAULT 10,
      message TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await runSafe("ALTER TABLE bulk_orders ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'");

  await runSafe(`
    CREATE TABLE IF NOT EXISTS design_inquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      project_type VARCHAR(255) NOT NULL,
      budget_range VARCHAR(255),
      timeline VARCHAR(255),
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await runSafe("ALTER TABLE design_inquiries ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'");

  await runSafe(`
    CREATE TABLE IF NOT EXISTS digital_inquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      project_type VARCHAR(255) NOT NULL,
      budget_range VARCHAR(255),
      timeline VARCHAR(255),
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSafe(`
    CREATE TABLE IF NOT EXISTS catalog (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      image_url TEXT,
      type VARCHAR(50) DEFAULT 'physical',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSafe(`
    CREATE TABLE IF NOT EXISTS portfolio (
      id INT AUTO_INCREMENT PRIMARY KEY,
      image_url TEXT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSafe("INSERT INTO catalog (name, description, image_url, type) SELECT name, description, image_url, type FROM categories");
  await runSafe("INSERT INTO portfolio (image_url, title, description, category) SELECT image_url, title, style, category FROM gallery");

  // 6. Contact messages & shipments
  await runSafe("ALTER TABLE contact_messages ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'");
  await runSafe("ALTER TABLE shipments ADD COLUMN shiprocket_order_id VARCHAR(100) DEFAULT NULL");
  await runSafe("ALTER TABLE shipments ADD COLUMN shiprocket_shipment_id VARCHAR(100) DEFAULT NULL");
  await runSafe("ALTER TABLE shipments ADD COLUMN courier_name VARCHAR(100) DEFAULT NULL");
  await runSafe("ALTER TABLE shipments ADD COLUMN tracking_url TEXT DEFAULT NULL");
  await runSafe("ALTER TABLE shipments ADD COLUMN last_tracking_update TIMESTAMP NULL DEFAULT NULL");
  await runSafe("ALTER TABLE shipments ADD COLUMN delivered_at TIMESTAMP NULL DEFAULT NULL");

  // 7. Shipping countries
  await runSafe(`
    CREATE TABLE IF NOT EXISTS shipping_countries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      country_code VARCHAR(2) UNIQUE NOT NULL,
      country_name VARCHAR(255) NOT NULL,
      is_enabled BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  const seedCountries = [
    ['AU', 'Australia', true],
    ['CA', 'Canada', true],
    ['FR', 'France', true],
    ['DE', 'Germany', true],
    ['IN', 'India', true],
    ['KW', 'Kuwait', true],
    ['MY', 'Malaysia', true],
    ['NL', 'Netherlands', true],
    ['NZ', 'New Zealand', true],
    ['NO', 'Norway', true],
    ['QA', 'Qatar', true],
    ['SA', 'Saudi Arabia', true],
    ['SG', 'Singapore', true],
    ['CH', 'Switzerland', true],
    ['AE', 'United Arab Emirates', true],
    ['GB', 'United Kingdom', true],
    ['US', 'United States', true]
  ];
  for (const [code, name, enabled] of seedCountries) {
    await runSafe("INSERT IGNORE INTO shipping_countries (country_code, country_name, is_enabled) VALUES (?, ?, ?)", [code, name, enabled]);
  }

  // 8. Blogs table upgrades
  await runSafe("ALTER TABLE blogs MODIFY COLUMN content LONGTEXT");
  await runSafe("ALTER TABLE blogs ADD COLUMN slug VARCHAR(255) DEFAULT NULL");
  await runSafe("ALTER TABLE blogs ADD COLUMN tags VARCHAR(255) DEFAULT NULL");
  await runSafe("ALTER TABLE blogs ADD COLUMN meta_title VARCHAR(255) DEFAULT NULL");
  await runSafe("ALTER TABLE blogs ADD COLUMN meta_description TEXT DEFAULT NULL");
  await runSafe("ALTER TABLE blogs ADD COLUMN focus_keyword VARCHAR(255) DEFAULT NULL");
  await runSafe("ALTER TABLE blogs ADD COLUMN canonical_url VARCHAR(500) DEFAULT NULL");
  await runSafe("ALTER TABLE blogs ADD COLUMN og_title VARCHAR(255) DEFAULT NULL");
  await runSafe("ALTER TABLE blogs ADD COLUMN og_description TEXT DEFAULT NULL");
  await runSafe("ALTER TABLE blogs ADD COLUMN og_image VARCHAR(500) DEFAULT NULL");
  await runSafe("ALTER TABLE blogs ADD COLUMN no_index BOOLEAN DEFAULT FALSE");
  await runSafe("ALTER TABLE blogs ADD COLUMN status VARCHAR(50) DEFAULT 'published'");
  await runSafe("ALTER TABLE blogs ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

  // 9. FAQs, Reviews, Wishlists, Coupons, Bulk Inquiries, Newsletters
  await runSafe(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question VARCHAR(500) NOT NULL,
      answer LONGTEXT NOT NULL,
      category VARCHAR(100) DEFAULT 'General',
      display_order INT DEFAULT 0,
      is_published BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await runSafe(`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id INT PRIMARY KEY AUTO_INCREMENT,
      product_id INT NOT NULL,
      user_id INT NOT NULL,
      rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      review_text TEXT,
      is_approved BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSafe(`
    CREATE TABLE IF NOT EXISTS wishlists (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL DEFAULT 0,
      member_id INT DEFAULT 0,
      member_uid VARCHAR(100),
      product_id INT DEFAULT 0,
      digital_id INT DEFAULT 0,
      product_uid VARCHAR(100),
      product_type VARCHAR(20) DEFAULT 'physical',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await runSafe("ALTER TABLE wishlists ADD COLUMN user_id INT DEFAULT 0");
  await runSafe("ALTER TABLE wishlists ADD COLUMN member_id INT DEFAULT 0");
  await runSafe("ALTER TABLE wishlists ADD COLUMN member_uid VARCHAR(100)");
  await runSafe("ALTER TABLE wishlists ADD COLUMN product_uid VARCHAR(100)");
  await runSafe("ALTER TABLE wishlists ADD COLUMN product_type VARCHAR(20) DEFAULT 'physical'");
  await runSafe("ALTER TABLE wishlists ADD COLUMN digital_id INT DEFAULT 0");
  await runSafe("ALTER TABLE wishlists MODIFY COLUMN product_id INT DEFAULT 0");

  await runSafe(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INT PRIMARY KEY AUTO_INCREMENT,
      code VARCHAR(50) UNIQUE NOT NULL,
      type ENUM('percentage', 'flat') NOT NULL,
      value DECIMAL(10,2) NOT NULL,
      minimum_order_value DECIMAL(10,2) DEFAULT 0,
      usage_limit INT DEFAULT NULL,
      used_count INT DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      expires_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSafe(`
    CREATE TABLE IF NOT EXISTS coupon_usage (
      id INT PRIMARY KEY AUTO_INCREMENT,
      coupon_id INT NOT NULL,
      user_id INT NOT NULL,
      order_id INT NOT NULL,
      used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSafe(`
    CREATE TABLE IF NOT EXISTS bulk_inquiries (
      id INT PRIMARY KEY AUTO_INCREMENT,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      company_name VARCHAR(255),
      product_interest TEXT,
      quantity INT,
      message TEXT,
      status ENUM('new','contacted','closed') DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSafe(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      is_active BOOLEAN DEFAULT true,
      subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSafe("ALTER TABLE visitor_logs ADD INDEX idx_visited_at (visited_at)");

  console.log("✅ Database tables and schema migrations verified successfully.");
}

initializeDatabase().catch(err => {
  console.error("Database schema initialization error:", err.message);
});

module.exports = poolPromise;