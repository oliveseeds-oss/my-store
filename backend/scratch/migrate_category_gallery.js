const db = require('../db');

async function migrate() {
  console.log('🏁 Running database alterations for categories and gallery system...');
  try {
    // 1. Add image_url to categories table
    console.log('Step 1: Checking categories table image_url column...');
    const [cols] = await db.query("SHOW COLUMNS FROM categories LIKE 'image_url'");
    if (cols.length === 0) {
      await db.query("ALTER TABLE categories ADD COLUMN image_url VARCHAR(511) DEFAULT NULL");
      console.log("  ✓ Added image_url column to categories table.");
    } else {
      console.log("  ✓ image_url column already exists on categories table.");
    }

    // 2. Create gallery table
    console.log('Step 2: Creating design gallery showcase table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url VARCHAR(511) NOT NULL,
        title VARCHAR(255) DEFAULT NULL,
        style VARCHAR(100) DEFAULT NULL,
        category VARCHAR(100) DEFAULT NULL,
        industry VARCHAR(100) DEFAULT NULL,
        material VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("  ✓ Created gallery table successfully.");

    // Seed some initial demo gallery images if empty
    const [galleryRows] = await db.query("SELECT COUNT(*) as count FROM gallery");
    if (galleryRows[0].count === 0) {
      console.log('Step 3: Seeding initial luxury design gallery items...');
      const seedItems = [
        ['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80', 'Teakwood Engraved Doorplate', 'Classic', 'Signage', 'Residential', 'Teak Wood'],
        ['https://images.unsplash.com/photo-1449247700740-e4403cd261fe?auto=format&fit=crop&w=800&q=80', 'Minimalist Office Desk Nameplate', 'Modern', 'Nameplate', 'Corporate', 'Acrylic & Teak'],
        ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 'Acrylic Backlit Logo Sign', 'Backlit', 'Logo Signs', 'Commercial', 'Frosted Acrylic'],
        ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 'Laser Engraved Wooden Restaurant Menu', 'Rustic', 'Menus', 'Hospitality', 'Pine Wood'],
        ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', 'Brass Inlay Teak Wall Clock', 'Vintage', 'Clocks', 'Interior Design', 'Premium Teak & Brass']
      ];
      for (const item of seedItems) {
        await db.query(
          "INSERT INTO gallery (image_url, title, style, category, industry, material) VALUES (?,?,?,?,?,?)",
          item
        );
      }
      console.log("  ✓ Seeded 5 design showcase items.");
    }

    console.log("🎉 Database migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

migrate();
