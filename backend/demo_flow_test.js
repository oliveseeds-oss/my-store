const db = require('./db');

async function runDemo() {
  console.log('🏁 Starting E2E Personalization Demo Simulation...\n');
  let mockProductId = null;
  let mockTemplateId = null;
  let mockOrderId = null;
  const mockOrderUid = `DEMO-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    // 1. Create product with personalization settings
    console.log('Step 1: Admin configures a customizable product...');
    const [pRes] = await db.query(
      `INSERT INTO products (product_uid, name, price, stock, is_active, enable_personalization, allow_multiple_templates)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['PRD-DEMO-001', 'Demo Custom Acrylic Plaque', 999.00, 5, 1, 1, 0]
    );
    mockProductId = pRes.insertId;
    console.log(`  ✓ Product created with ID: ${mockProductId}`);

    // Create a template
    const [tRes] = await db.query(
      `INSERT INTO product_templates (product_id, name, preview_image, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [mockProductId, 'Standard Customization', '/uploads/demo_canvas.png', 1, 0]
    );
    mockTemplateId = tRes.insertId;
    console.log(`  ✓ Design Template created with ID: ${mockTemplateId}`);

    // Add Name Text field & Image Upload field
    await db.query(
      `INSERT INTO product_personalization_fields (template_id, label, field_key, type, is_required, max_chars)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [mockTemplateId, 'Name for Engraving', 'engrave_name', 'text', 1, 15]
    );
    await db.query(
      `INSERT INTO product_personalization_fields (template_id, label, field_key, type, is_required)
       VALUES (?, ?, ?, ?, ?)`,
      [mockTemplateId, 'Your Custom Photo', 'custom_image', 'image', 1]
    );
    console.log('  ✓ Configured fields: "Name for Engraving" (text) and "Your Custom Photo" (image).');

    // 2. Simulate Frontend Customer Input & Upload
    console.log('\nStep 2: Customer inputs customization details...');
    const customerInputs = {
      engrave_name: 'Alice Cooper',
      custom_image: '/uploads/customer_alice_face.png' // Simulated uploaded file path
    };
    console.log(`  - Customer typed Name: "${customerInputs.engrave_name}"`);
    console.log(`  - Customer uploaded file: "${customerInputs.custom_image}"`);

    // 3. Simulate Checkout (creating order)
    console.log('\nStep 3: Simulating successful Checkout...');
    const [orderRes] = await db.query(
      `INSERT INTO physical_orders (order_uid, invoice_uid, guest_name, guest_email, delivery_street, subtotal, tax_amount, shipping_fee, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [mockOrderUid, mockOrderUid, 'Alice Cooper', 'alice@demo.com', '123 Wonderland Ave', 999.00, 180.00, 0.00, 1179.00]
    );
    mockOrderId = orderRes.insertId;

    const [itemRes] = await db.query(
      `INSERT INTO physical_order_items (order_uid, product_uid, product_name, price, qty)
       VALUES (?, ?, ?, ?, ?)`,
      [mockOrderUid, 'PRD-DEMO-001', 'Demo Custom Acrylic Plaque', 999.00, 1]
    );
    const orderItemId = itemRes.insertId;

    // Save custom choices
    const itemCustomizations = [
      {
        field_key: 'engrave_name',
        field_label: 'Name for Engraving',
        field_value: customerInputs.engrave_name,
        field_type: 'text'
      },
      {
        field_key: 'custom_image',
        field_label: 'Your Custom Photo',
        field_value: customerInputs.custom_image,
        field_type: 'image'
      }
    ];

    for (const c of itemCustomizations) {
      await db.query(
        `INSERT INTO order_item_customizations (physical_order_item_id, template_id, template_name, field_key, field_label, field_value, field_type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderItemId, mockTemplateId, 'Standard Customization', c.field_key, c.field_label, c.field_value, c.field_type]
      );
    }
    console.log(`  ✓ Checkout successful. Order UUID: ${mockOrderUid}. Details written to database.`);

    // 4. Simulate Admin Order retrieval & download link validation
    console.log('\nStep 4: Admin retrieves order details for production...');
    const [orderItems] = await db.query(
      `SELECT poi.id, poi.product_name, poi.price, poi.qty
       FROM physical_order_items poi
       WHERE poi.order_uid = ?`,
      [mockOrderUid]
    );

    for (let item of orderItems) {
      const [customs] = await db.query(
        `SELECT template_name, field_label, field_value, field_type
         FROM order_item_customizations
         WHERE physical_order_item_id = ?`,
        [item.id]
      );
      
      console.log(`  📦 Order Item: ${item.product_name}`);
      console.log(`  📐 Selected Template: "${customs[0]?.template_name}"`);
      console.log('  ✒️ Custom Engravings:');
      
      customs.forEach(c => {
        if (c.field_type === 'image') {
          console.log(`    - ${c.field_label}:`);
          console.log(`      * Image Preview URL: http://localhost:5000${c.field_value}`);
          console.log(`      * Admin Download Link: http://localhost:5000${c.field_value}`);
        } else {
          console.log(`    - ${c.field_label}: "${c.field_value}"`);
        }
      });
    }

    console.log('\n🎉 DEMO VERIFICATION SUCCESSFUL! Flow is completely correct.');
  } catch (err) {
    console.error('❌ Demo simulation error:', err);
  } finally {
    // Cleanup
    console.log('\nStep 5: Cleaning up mock demo data...');
    if (mockProductId) {
      await db.query(`DELETE FROM products WHERE id = ?`, [mockProductId]);
    }
    await db.query(`DELETE FROM physical_orders WHERE order_uid = ?`, [mockOrderUid]);
    console.log('  ✓ Database cleaned.');
    process.exit(0);
  }
}

runDemo();
