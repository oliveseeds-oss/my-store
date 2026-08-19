const db = require("../db");
const { sendMail } = require("./mailer");

async function initRecoverySchema() {
  try {
    await db.query("ALTER TABLE physical_orders ADD COLUMN recovery_email_sent BOOLEAN DEFAULT FALSE").catch(() => {});
    await db.query("ALTER TABLE digital_orders ADD COLUMN recovery_email_sent BOOLEAN DEFAULT FALSE").catch(() => {});
  } catch (err) {
    // Ignore if column already exists
  }
}

let isRunning = false;

async function runCartRecovery() {
  if (isRunning) {
    console.log("🛒 cartRecovery: Job is already running, skipping overlap.");
    return;
  }
  isRunning = true;
  await initRecoverySchema();

  try {
    console.log("🛒 cartRecovery: Scanning for abandoned checkouts (created 1-2 hours ago)...");

    // 1. Fetch abandoned physical checkouts
    const [physicalOrders] = await db.query(
      `SELECT o.*, m.email as member_email, m.name as member_name
       FROM physical_orders o
       LEFT JOIN members m ON o.member_uid = m.member_uid
       WHERE o.payment_status = 'Pending' 
         AND o.recovery_email_sent = FALSE 
         AND o.invoice_date BETWEEN DATE_SUB(NOW(), INTERVAL 2 HOUR) AND DATE_SUB(NOW(), INTERVAL 1 HOUR)`
    );

    // 2. Fetch abandoned digital checkouts
    const [digitalOrders] = await db.query(
      `SELECT o.*, m.email as member_email, m.name as member_name
       FROM digital_orders o
       LEFT JOIN members m ON o.member_uid = m.member_uid
       WHERE o.payment_status = 'Pending' 
         AND o.recovery_email_sent = FALSE 
         AND o.invoice_date BETWEEN DATE_SUB(NOW(), INTERVAL 2 HOUR) AND DATE_SUB(NOW(), INTERVAL 1 HOUR)`
    );

    const allAbandoned = [
      ...physicalOrders.map(o => ({ ...o, type: 'physical' })),
      ...digitalOrders.map(o => ({ ...o, type: 'digital' }))
    ];

    if (!allAbandoned.length) {
      console.log("🛒 cartRecovery: No abandoned checkouts found in this window.");
      return;
    }

    console.log(`🛒 cartRecovery: Found ${allAbandoned.length} abandoned checkouts.`);

    for (const order of allAbandoned) {
      const email = order.guest_email || order.member_email;
      const name = order.guest_name || order.member_name || "Valued Customer";

      if (!email) continue;

      // Fetch items for this order to display in recovery email
      let items = [];
      if (order.type === 'physical') {
        [items] = await db.query("SELECT * FROM physical_order_items WHERE order_uid = ?", [order.order_uid]);
      } else {
        [items] = await db.query("SELECT * FROM digital_order_items WHERE order_uid = ?", [order.order_uid]);
      }

      let itemsListHtml = "";
      for (const item of items) {
        itemsListHtml += `
          <li style="padding: 8px 0; border-bottom: 1px solid #f1f0ee; list-style: none;">
            <strong>${item.product_name}</strong> × ${item.qty} (${order.currency_code} ${parseFloat(item.price).toFixed(2)})
          </li>
        `;
      }

      const checkoutUrl = `http://localhost:3000/cart`; // Redirect to cart / checkout page

      // Send checkout recovery email
      console.log(`🛒 cartRecovery: Dispatching recovery email to ${email} for Order #${order.order_uid}`);
      await sendMail({
        to: email,
        subject: "We noticed you left something behind! - Olive Seeds Studio",
        text: `Hello ${name}, you have items waiting in your cart. Complete your order here: ${checkoutUrl}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e5e5; border-radius: 20px; background-color: #FAF9F6; color: #0D1512;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 40px;">🌱</span>
              <h2 style="margin: 10px 0 0 0; color: #0D1512; font-weight: 800;">Did you forget something?</h2>
              <p style="font-size: 13px; color: #78716c; margin-top: 5px;">We saved the items in your cart so you can easily complete your checkout.</p>
            </div>
            
            <p>Hello ${name},</p>
            <p>We noticed you were checkout out at <strong>Olive Seeds Studio</strong>, but didn't quite finish. Here are the items you selected:</p>
            
            <ul style="padding-left: 0; background-color: #ffffff; padding: 15px; border-radius: 12px; border: 1px solid rgba(27,57,49,0.15); margin: 20px 0;">
              ${itemsListHtml}
            </ul>

            <div style="text-align: center; margin: 25px 0;">
              <a href="${checkoutUrl}" style="display: inline-block; background-color: #d97706; color: #ffffff; padding: 12px 28px; font-weight: bold; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 6px rgba(217, 119, 6, 0.2);" target="_blank">Complete Your Order</a>
            </div>

            <p style="font-size: 12px; color: #78716c;">If you have any questions or ran into issues during payment, reply directly to this email and our workshop team will assist you!</p>
            
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
            <p style="font-size: 11px; text-align: center; color: #a8a29e;">© 2026 Olive Seeds Studio. All rights reserved.</p>
          </div>
        `
      });

      // Update database flag so we never send this email again
      const table = order.type === 'physical' ? 'physical_orders' : 'digital_orders';
      await db.query(`UPDATE ${table} SET recovery_email_sent = TRUE WHERE id = ?`, [order.id]);
    }
  } catch (err) {
    console.error("❌ cartRecovery error:", err.message);
  } finally {
    isRunning = false;
  }
}

module.exports = {
  runCartRecovery
};
