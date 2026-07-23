const db = require('../db');

async function migrate() {
  console.log('Starting Personalization Module migration...');

  try {
    // 1. Add fields to products table
    console.log('Updating products table...');
    const [cols] = await db.query('SHOW COLUMNS FROM products');
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('enable_personalization')) {
      await db.query('ALTER TABLE products ADD COLUMN enable_personalization BOOLEAN DEFAULT FALSE');
      console.log('Added enable_personalization to products');
    }
    if (!colNames.includes('allow_multiple_templates')) {
      await db.query('ALTER TABLE products ADD COLUMN allow_multiple_templates BOOLEAN DEFAULT FALSE');
      console.log('Added allow_multiple_templates to products');
    }

    // 2. Create product_templates table
    console.log('Creating product_templates table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS product_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        preview_image VARCHAR(500) NOT NULL,
        background_image VARCHAR(500) DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('product_templates table ensured!');

    // 3. Create product_personalization_fields table
    console.log('Creating product_personalization_fields table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS product_personalization_fields (
        id INT AUTO_INCREMENT PRIMARY KEY,
        template_id INT NOT NULL,
        label VARCHAR(255) NOT NULL,
        field_key VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_required BOOLEAN DEFAULT FALSE,
        placeholder VARCHAR(255) DEFAULT NULL,
        help_text VARCHAR(255) DEFAULT NULL,
        min_chars INT DEFAULT NULL,
        max_chars INT DEFAULT NULL,
        default_value TEXT DEFAULT NULL,
        sort_order INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        options TEXT DEFAULT NULL,
        x_pos INT DEFAULT NULL,
        y_pos INT DEFAULT NULL,
        font_family VARCHAR(100) DEFAULT NULL,
        font_size INT DEFAULT NULL,
        font_color VARCHAR(50) DEFAULT NULL,
        text_align VARCHAR(50) DEFAULT 'left',
        max_width INT DEFAULT NULL,
        rotation INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES product_templates(id) ON DELETE CASCADE
      )
    `);
    console.log('product_personalization_fields table ensured!');

    // 4. Create order_item_customizations table
    console.log('Creating order_item_customizations table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_item_customizations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        physical_order_item_id INT NOT NULL,
        template_id INT DEFAULT NULL,
        template_name VARCHAR(255) DEFAULT NULL,
        field_key VARCHAR(255) NOT NULL,
        field_label VARCHAR(255) NOT NULL,
        field_value TEXT NOT NULL,
        field_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (physical_order_item_id) REFERENCES physical_order_items(id) ON DELETE CASCADE
      )
    `);
    console.log('order_item_customizations table ensured!');

    // 5. Add production tracking to physical_orders table
    console.log('Updating physical_orders table...');
    const [orderCols] = await db.query('SHOW COLUMNS FROM physical_orders');
    const orderColNames = orderCols.map(c => c.Field);

    if (!orderColNames.includes('production_notes')) {
      await db.query('ALTER TABLE physical_orders ADD COLUMN production_notes TEXT DEFAULT NULL');
      console.log('Added production_notes to physical_orders');
    }
    if (!orderColNames.includes('production_status')) {
      await db.query("ALTER TABLE physical_orders ADD COLUMN production_status VARCHAR(50) DEFAULT 'Pending'");
      console.log('Added production_status to physical_orders');
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
