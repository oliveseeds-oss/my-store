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

// Automated SEO Schema Creation & Seeding
poolPromise.query(`
  CREATE TABLE IF NOT EXISTS seo_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_name VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    meta_description TEXT NOT NULL,
    keywords TEXT,
    og_title VARCHAR(255),
    og_description TEXT,
    og_image VARCHAR(255),
    image_alt TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`).then(() => {
  return poolPromise.query(`
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
}).then(() => {
  return poolPromise.query(`
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
}).then(() => {
  return poolPromise.query(`
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
}).then(() => {
  return poolPromise.query(`
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
}).then(() => {
  return poolPromise.query(`
    CREATE TABLE IF NOT EXISTS catalog (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      image_url TEXT,
      type VARCHAR(50) DEFAULT 'physical',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}).then(() => {
  return poolPromise.query(`
    CREATE TABLE IF NOT EXISTS portfolio (
      id INT AUTO_INCREMENT PRIMARY KEY,
      image_url TEXT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}).then(() => {
  const defaults = [
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
  const insertQueries = defaults.map(d => 
    poolPromise.query(
      "INSERT IGNORE INTO seo_settings (page_name, title, meta_description, keywords, og_title, og_description, og_image, image_alt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      d
    )
  );
  return Promise.all(insertQueries);
}).then(() => {
  console.log("✅ SEO Schema initialized and seeded successfully");
  poolPromise.query("ALTER TABLE contact_messages ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'").catch(() => {});
  poolPromise.query("ALTER TABLE bulk_orders ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'").catch(() => {});
  poolPromise.query("ALTER TABLE design_inquiries ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'").catch(() => {});
  poolPromise.query("ALTER TABLE settings ADD COLUMN paypal_client_id VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE settings ADD COLUMN paypal_client_secret VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE settings ADD COLUMN razorpay_secret VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE settings ADD COLUMN shiprocket_email VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE settings ADD COLUMN shiprocket_password VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE settings ADD COLUMN shiprocket_token TEXT DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE settings ADD COLUMN shiprocket_token_expires TIMESTAMP NULL DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE shipments ADD COLUMN shiprocket_order_id VARCHAR(100) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE shipments ADD COLUMN shiprocket_shipment_id VARCHAR(100) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE shipments ADD COLUMN courier_name VARCHAR(100) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE shipments ADD COLUMN tracking_url TEXT DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE shipments ADD COLUMN last_tracking_update TIMESTAMP NULL DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE shipments ADD COLUMN delivered_at TIMESTAMP NULL DEFAULT NULL").catch(() => {});
  
  // Razorpay physical_orders columns
  poolPromise.query("ALTER TABLE physical_orders ADD COLUMN razorpay_order_id VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE physical_orders ADD COLUMN razorpay_payment_id VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE physical_orders ADD COLUMN razorpay_signature VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE physical_orders ADD COLUMN payment_verified_at TIMESTAMP NULL DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE physical_orders ADD COLUMN refund_id VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE physical_orders ADD COLUMN refund_amount DECIMAL(10,2) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE physical_orders ADD COLUMN refund_status VARCHAR(100) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE physical_orders ADD COLUMN refund_at TIMESTAMP NULL DEFAULT NULL").catch(() => {});

  // Razorpay digital_orders columns
  poolPromise.query("ALTER TABLE digital_orders ADD COLUMN razorpay_order_id VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE digital_orders ADD COLUMN razorpay_payment_id VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE digital_orders ADD COLUMN razorpay_signature VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE digital_orders ADD COLUMN payment_verified_at TIMESTAMP NULL DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE digital_orders ADD COLUMN refund_id VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE digital_orders ADD COLUMN refund_amount DECIMAL(10,2) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE digital_orders ADD COLUMN refund_status VARCHAR(100) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE digital_orders ADD COLUMN refund_at TIMESTAMP NULL DEFAULT NULL").catch(() => {});
  
  // Seed new catalog and portfolio tables with existing database entries to ensure continuity
  poolPromise.query("INSERT INTO catalog (name, description, image_url, type) SELECT name, description, image_url, type FROM categories").catch(() => {});
  poolPromise.query("INSERT INTO portfolio (image_url, title, description, category) SELECT image_url, title, style, category FROM gallery").catch(() => {});
  
  // Ensure default settings row exists (Priority 1)
  poolPromise.query("INSERT IGNORE INTO settings (id, site_name) VALUES (1, 'My Engraving Store')").catch(() => {});

  // Ensure notifications table exists and has user_id, related_order_id, related_product_id columns
  poolPromise.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'general',
      related_order_id INT DEFAULT NULL,
      related_product_id INT DEFAULT NULL,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {});
  poolPromise.query("ALTER TABLE notifications ADD COLUMN user_id INT DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE notifications ADD COLUMN related_order_id INT DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE notifications ADD COLUMN related_product_id INT DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE notifications MODIFY COLUMN type VARCHAR(50) DEFAULT 'general'").catch(() => {});

  // Ensure broadcast_notifications table exists
  poolPromise.query(`
    CREATE TABLE IF NOT EXISTS broadcast_notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'new_arrival',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      sent_count INT DEFAULT 0
    )
  `).catch(() => {});

  // Ensure shipping_countries table exists and seed default 17 enabled countries (Update 1)
  poolPromise.query(`
    CREATE TABLE IF NOT EXISTS shipping_countries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      country_code VARCHAR(2) UNIQUE NOT NULL,
      country_name VARCHAR(255) NOT NULL,
      is_enabled BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `).then(() => {
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
    seedCountries.forEach(([code, name, enabled]) => {
      poolPromise.query(
        "INSERT IGNORE INTO shipping_countries (country_code, country_name, is_enabled) VALUES (?, ?, ?)",
        [code, name, enabled]
      ).catch(() => {});
    });
  }).catch(() => {});

  // Upgrade blogs table schema (LONGTEXT content & SEO columns)
  poolPromise.query("ALTER TABLE blogs MODIFY COLUMN content LONGTEXT").catch(() => {});
  poolPromise.query("ALTER TABLE blogs ADD COLUMN slug VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE blogs ADD COLUMN tags VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE blogs ADD COLUMN meta_title VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE blogs ADD COLUMN meta_description TEXT DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE blogs ADD COLUMN focus_keyword VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE blogs ADD COLUMN canonical_url VARCHAR(500) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE blogs ADD COLUMN og_title VARCHAR(255) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE blogs ADD COLUMN og_description TEXT DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE blogs ADD COLUMN og_image VARCHAR(500) DEFAULT NULL").catch(() => {});
  poolPromise.query("ALTER TABLE blogs ADD COLUMN no_index BOOLEAN DEFAULT FALSE").catch(() => {});
  poolPromise.query("ALTER TABLE blogs ADD COLUMN status VARCHAR(50) DEFAULT 'published'").catch(() => {});
  poolPromise.query("ALTER TABLE blogs ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP").catch(() => {});

  // Ensure FAQs table exists (Update 4)
  poolPromise.query(`
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
  `).catch(() => {});

  // FEATURE 1: Product Reviews Table
  poolPromise.query(`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id INT PRIMARY KEY AUTO_INCREMENT,
      product_id INT NOT NULL,
      user_id INT NOT NULL,
      rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      review_text TEXT,
      is_approved BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {});

  // FEATURE 2: Wishlists Table
  poolPromise.query(`
    CREATE TABLE IF NOT EXISTS wishlists (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      product_id INT DEFAULT 0,
      product_uid VARCHAR(100),
      product_type VARCHAR(20) DEFAULT 'physical',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {});

  // Add missing columns to wishlists table if existing table had old schema
  poolPromise.query("ALTER TABLE wishlists ADD COLUMN product_uid VARCHAR(100)").catch(() => {});
  poolPromise.query("ALTER TABLE wishlists ADD COLUMN product_type VARCHAR(20) DEFAULT 'physical'").catch(() => {});
  poolPromise.query("ALTER TABLE wishlists MODIFY COLUMN product_id INT DEFAULT 0").catch(() => {});

  // FEATURE 3: Coupons & Usage Tables
  poolPromise.query(`
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
  `).catch(() => {});

  poolPromise.query(`
    CREATE TABLE IF NOT EXISTS coupon_usage (
      id INT PRIMARY KEY AUTO_INCREMENT,
      coupon_id INT NOT NULL,
      user_id INT NOT NULL,
      order_id INT NOT NULL,
      used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {});

  // FEATURE 8: Bulk Inquiries Table
  poolPromise.query(`
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
  `).catch(() => {});

  // FEATURE 9: Newsletter Subscribers Table
  poolPromise.query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      is_active BOOLEAN DEFAULT true,
      subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {});

  // FIX 2: SEO Settings Tables
  poolPromise.query(`
    CREATE TABLE IF NOT EXISTS seo_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      page_key VARCHAR(255) UNIQUE NOT NULL,
      meta_title VARCHAR(255),
      meta_description TEXT,
      focus_keyword VARCHAR(255),
      keywords TEXT,
      canonical_url VARCHAR(500),
      no_index BOOLEAN DEFAULT false,
      og_title VARCHAR(255),
      og_description TEXT,
      og_image VARCHAR(500),
      twitter_card VARCHAR(50),
      twitter_title VARCHAR(255),
      twitter_description TEXT,
      twitter_image VARCHAR(500),
      custom_schema TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `).catch(() => {});

  poolPromise.query(`
    CREATE TABLE IF NOT EXISTS global_seo_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      setting_key VARCHAR(255) UNIQUE NOT NULL,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `).catch(() => {});

  // Index Optimization (Priority 5)
  poolPromise.query("ALTER TABLE visitor_logs ADD INDEX idx_visited_at (visited_at)").catch(() => {});
}).catch(err => {
  console.error("❌ SEO Schema initialization failed. Config:", {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: 3306,
  });
  console.error(err);
});

module.exports = poolPromise;