const db = require("./db");

async function initShippingCharges() {
  console.log("🚚 Initializing Shipping Charges Database Tables...");

  // 1. Table: shipping_zones
  await db.query(`
    CREATE TABLE IF NOT EXISTS shipping_zones (
      id INT PRIMARY KEY AUTO_INCREMENT,
      zone_name VARCHAR(100) NOT NULL,
      zone_description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Seed default zones if empty
  const [existingZones] = await db.query("SELECT COUNT(*) as count FROM shipping_zones");
  if (existingZones[0].count === 0) {
    const defaultZones = [
      ['Domestic - India', 'Shipments within India'],
      ['South Asia', 'India, Malaysia, Singapore'],
      ['Middle East', 'UAE, Kuwait, Qatar, Saudi Arabia'],
      ['Europe', 'UK, France, Germany, Netherlands, Norway, Switzerland'],
      ['North America', 'USA, Canada'],
      ['Oceania', 'Australia, New Zealand'],
      ['Rest of World', 'All other enabled countries']
    ];
    for (const [name, desc] of defaultZones) {
      await db.query("INSERT INTO shipping_zones (zone_name, zone_description) VALUES (?, ?)", [name, desc]);
    }
    console.log("  ✓ Seeded default shipping_zones");
  }

  // 2. Table: shipping_zone_countries
  await db.query(`
    CREATE TABLE IF NOT EXISTS shipping_zone_countries (
      id INT PRIMARY KEY AUTO_INCREMENT,
      zone_id INT NOT NULL,
      country_code VARCHAR(2) NOT NULL,
      country_name VARCHAR(100) NOT NULL,
      UNIQUE KEY unique_zone_country (zone_id, country_code),
      INDEX idx_country_code (country_code),
      FOREIGN KEY (zone_id) REFERENCES shipping_zones(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Seed initial mappings for default 17 enabled countries if empty
  const [existingZoneCountries] = await db.query("SELECT COUNT(*) as count FROM shipping_zone_countries");
  if (existingZoneCountries[0].count === 0) {
    const [zones] = await db.query("SELECT id, zone_name FROM shipping_zones");
    const zoneMap = {};
    zones.forEach(z => { zoneMap[z.zone_name] = z.id; });

    const countryZoneMappings = [
      { zone: 'Domestic - India', code: 'IN', name: 'India' },
      { zone: 'South Asia', code: 'MY', name: 'Malaysia' },
      { zone: 'South Asia', code: 'SG', name: 'Singapore' },
      { zone: 'Middle East', code: 'AE', name: 'United Arab Emirates' },
      { zone: 'Middle East', code: 'KW', name: 'Kuwait' },
      { zone: 'Middle East', code: 'QA', name: 'Qatar' },
      { zone: 'Middle East', code: 'SA', name: 'Saudi Arabia' },
      { zone: 'Europe', code: 'GB', name: 'United Kingdom' },
      { zone: 'Europe', code: 'FR', name: 'France' },
      { zone: 'Europe', code: 'DE', name: 'Germany' },
      { zone: 'Europe', code: 'NL', name: 'Netherlands' },
      { zone: 'Europe', code: 'NO', name: 'Norway' },
      { zone: 'Europe', code: 'CH', name: 'Switzerland' },
      { zone: 'North America', code: 'US', name: 'United States' },
      { zone: 'North America', code: 'CA', name: 'Canada' },
      { zone: 'Oceania', code: 'AU', name: 'Australia' },
      { zone: 'Oceania', code: 'NZ', name: 'New Zealand' },
    ];

    for (const m of countryZoneMappings) {
      if (zoneMap[m.zone]) {
        await db.query(
          "INSERT IGNORE INTO shipping_zone_countries (zone_id, country_code, country_name) VALUES (?, ?, ?)",
          [zoneMap[m.zone], m.code, m.name]
        );
      }
    }
    console.log("  ✓ Seeded default shipping_zone_countries");
  }

  // 3. Table: shipping_methods
  await db.query(`
    CREATE TABLE IF NOT EXISTS shipping_methods (
      id INT PRIMARY KEY AUTO_INCREMENT,
      method_name VARCHAR(100) NOT NULL,
      method_code VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      estimated_days_min INT DEFAULT 1,
      estimated_days_max INT DEFAULT 7,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Seed default shipping methods
  const [existingMethods] = await db.query("SELECT COUNT(*) as count FROM shipping_methods");
  if (existingMethods[0].count === 0) {
    const defaultMethods = [
      ['Standard Shipping', 'standard', 'Regular delivery service', 7, 14],
      ['Express Shipping', 'express', 'Faster priority delivery', 3, 7],
      ['Economy Shipping', 'economy', 'Budget-friendly slower delivery', 14, 21]
    ];
    for (const [name, code, desc, minDays, maxDays] of defaultMethods) {
      await db.query(
        "INSERT INTO shipping_methods (method_name, method_code, description, estimated_days_min, estimated_days_max) VALUES (?, ?, ?, ?, ?)",
        [name, code, desc, minDays, maxDays]
      );
    }
    console.log("  ✓ Seeded default shipping_methods");
  }

  // 4. Table: shipping_rates
  await db.query(`
    CREATE TABLE IF NOT EXISTS shipping_rates (
      id INT PRIMARY KEY AUTO_INCREMENT,
      zone_id INT NOT NULL,
      method_id INT NOT NULL,
      base_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
      first_weight_grams INT DEFAULT 500,
      first_weight_rate DECIMAL(10,2) DEFAULT 0,
      additional_weight_grams INT DEFAULT 500,
      additional_weight_rate DECIMAL(10,2) DEFAULT 0,
      free_shipping_above DECIMAL(10,2) DEFAULT NULL,
      minimum_order_value DECIMAL(10,2) DEFAULT 0,
      rate_currency VARCHAR(3) DEFAULT 'INR',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_zone_method (zone_id, method_id),
      FOREIGN KEY (zone_id) REFERENCES shipping_zones(id) ON DELETE CASCADE,
      FOREIGN KEY (method_id) REFERENCES shipping_methods(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Seed default rates for zones and methods if empty
  const [existingRates] = await db.query("SELECT COUNT(*) as count FROM shipping_rates");
  if (existingRates[0].count === 0) {
    const [zones] = await db.query("SELECT id, zone_name FROM shipping_zones");
    const [methods] = await db.query("SELECT id, method_code FROM shipping_methods");
    const methodMap = {};
    methods.forEach(m => { methodMap[m.method_code] = m.id; });

    for (const z of zones) {
      let stdBase = 600, stdFirst = 150, stdExtra = 100, stdFree = 5000;
      let expBase = 1200, expFirst = 300, expExtra = 250, expFree = 8000;
      let ecoBase = 400, ecoFirst = 80, ecoExtra = 60, ecoFree = 4000;

      if (z.zone_name.includes("Domestic")) {
        stdBase = 60; stdFirst = 0; stdExtra = 30; stdFree = 999;
        expBase = 150; expFirst = 40; expExtra = 50; expFree = 1999;
        ecoBase = 40; ecoFirst = 0; ecoExtra = 20; ecoFree = 799;
      } else if (z.zone_name.includes("Middle East")) {
        stdBase = 800; stdFirst = 200; stdExtra = 150; stdFree = 5000;
        expBase = 1500; expFirst = 400; expExtra = 300; expFree = 8000;
        ecoBase = 500; ecoFirst = 100; ecoExtra = 80; ecoFree = 4000;
      } else if (z.zone_name.includes("South Asia")) {
        stdBase = 700; stdFirst = 180; stdExtra = 120; stdFree = 4500;
        expBase = 1300; expFirst = 350; expExtra = 250; expFree = 7500;
        ecoBase = 450; ecoFirst = 90; ecoExtra = 70; ecoFree = 3500;
      } else if (z.zone_name.includes("Europe") || z.zone_name.includes("North America")) {
        stdBase = 900; stdFirst = 250; stdExtra = 200; stdFree = 6000;
        expBase = 1800; expFirst = 500; expExtra = 400; expFree = 10000;
        ecoBase = 600; ecoFirst = 150; ecoExtra = 100; ecoFree = 5000;
      } else if (z.zone_name.includes("Oceania")) {
        stdBase = 850; stdFirst = 220; stdExtra = 180; stdFree = 5500;
        expBase = 1700; expFirst = 450; expExtra = 350; expFree = 9000;
        ecoBase = 550; ecoFirst = 120; ecoExtra = 90; ecoFree = 4500;
      }

      if (methodMap['standard']) {
        await db.query(
          "INSERT IGNORE INTO shipping_rates (zone_id, method_id, base_rate, first_weight_grams, first_weight_rate, additional_weight_grams, additional_weight_rate, free_shipping_above, minimum_order_value) VALUES (?, ?, ?, 500, ?, 500, ?, ?, 0)",
          [z.id, methodMap['standard'], stdBase, stdFirst, stdExtra, stdFree]
        );
      }
      if (methodMap['express']) {
        await db.query(
          "INSERT IGNORE INTO shipping_rates (zone_id, method_id, base_rate, first_weight_grams, first_weight_rate, additional_weight_grams, additional_weight_rate, free_shipping_above, minimum_order_value) VALUES (?, ?, ?, 500, ?, 500, ?, ?, 0)",
          [z.id, methodMap['express'], expBase, expFirst, expExtra, expFree]
        );
      }
      if (methodMap['economy']) {
        await db.query(
          "INSERT IGNORE INTO shipping_rates (zone_id, method_id, base_rate, first_weight_grams, first_weight_rate, additional_weight_grams, additional_weight_rate, free_shipping_above, minimum_order_value) VALUES (?, ?, ?, 500, ?, 500, ?, ?, 0)",
          [z.id, methodMap['economy'], ecoBase, ecoFirst, ecoExtra, ecoFree]
        );
      }
    }
    console.log("  ✓ Seeded default shipping_rates");
  }

  // 5. Table: shipping_country_overrides
  await db.query(`
    CREATE TABLE IF NOT EXISTS shipping_country_overrides (
      id INT PRIMARY KEY AUTO_INCREMENT,
      country_code VARCHAR(2) NOT NULL UNIQUE,
      country_name VARCHAR(100) NOT NULL,
      method_id INT NOT NULL,
      base_rate DECIMAL(10,2) NOT NULL,
      first_weight_grams INT DEFAULT 500,
      first_weight_rate DECIMAL(10,2) DEFAULT 0,
      additional_weight_grams INT DEFAULT 500,
      additional_weight_rate DECIMAL(10,2) DEFAULT 0,
      free_shipping_above DECIMAL(10,2) DEFAULT NULL,
      rate_currency VARCHAR(3) DEFAULT 'INR',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (method_id) REFERENCES shipping_methods(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // 6. Table: product_shipping_weight
  await db.query(`
    CREATE TABLE IF NOT EXISTS product_shipping_weight (
      id INT PRIMARY KEY AUTO_INCREMENT,
      product_id INT NOT NULL UNIQUE,
      weight_grams INT NOT NULL DEFAULT 500,
      length_cm DECIMAL(8,2) DEFAULT NULL,
      width_cm DECIMAL(8,2) DEFAULT NULL,
      height_cm DECIMAL(8,2) DEFAULT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_product_id (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // 7. Table: shipping_rate_history (Step 7)
  await db.query(`
    CREATE TABLE IF NOT EXISTS shipping_rate_history (
      id INT PRIMARY KEY AUTO_INCREMENT,
      rate_id INT,
      zone_id INT,
      method_id INT,
      old_base_rate DECIMAL(10,2),
      new_base_rate DECIMAL(10,2),
      changed_by VARCHAR(255),
      change_note TEXT,
      changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // 8. Add shipping columns to physical_orders if missing (Step 9)
  const columnsToAdd = [
    { name: 'shipping_method_id', type: 'INT DEFAULT NULL' },
    { name: 'shipping_method_name', type: 'VARCHAR(100) DEFAULT NULL' },
    { name: 'shipping_cost', type: 'DECIMAL(10,2) DEFAULT 0' },
    { name: 'shipping_cost_currency', type: 'VARCHAR(3) DEFAULT \'INR\'' },
    { name: 'shipping_weight_grams', type: 'INT DEFAULT NULL' },
    { name: 'shipping_zone', type: 'VARCHAR(100) DEFAULT NULL' }
  ];

  for (const col of columnsToAdd) {
    try {
      const [colExists] = await db.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'physical_orders' AND COLUMN_NAME = ?",
        [col.name]
      );
      if (colExists.length === 0) {
        await db.query(`ALTER TABLE physical_orders ADD COLUMN ${col.name} ${col.type}`);
        console.log(`  ✓ Added column ${col.name} to physical_orders`);
      }
    } catch (e) {
      console.warn(`  Note on physical_orders.${col.name}:`, e.message);
    }
  }

  console.log("✅ Shipping charges database tables initialized successfully.");
}

// Allow standalone execution: node initShippingCharges.js
if (require.main === module) {
  initShippingCharges()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Failed to initialize shipping charges tables:", err);
      process.exit(1);
    });
}

module.exports = { initShippingCharges };
