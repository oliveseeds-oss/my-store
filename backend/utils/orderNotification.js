const db = require("../db");
const jwt = require("jsonwebtoken");
const { sendMail } = require("./mailer");

async function sendOrderConfirmation(orderId) {
  try {
    console.log(`🔍 orderNotification: Fetching order details for #${orderId}`);
    
    // 1. Fetch physical order if exists
    let [physicalOrders] = await db.query(
      `SELECT o.*, m.name as member_name, m.email as member_email
       FROM physical_orders o
       LEFT JOIN members m ON o.member_uid = m.member_uid
       WHERE o.order_uid = ?`,
      [orderId]
    );

    // 2. Fetch digital order if exists
    let [digitalOrders] = await db.query(
      `SELECT o.*, m.name as member_name, m.email as member_email
       FROM digital_orders o
       LEFT JOIN members m ON o.member_uid = m.member_uid
       WHERE o.order_uid = ?`,
      [orderId]
    );

    const physicalOrder = physicalOrders[0];
    const digitalOrder = digitalOrders[0];

    if (!physicalOrder && !digitalOrder) {
      console.error(`❌ orderNotification: Order #${orderId} not found in physical or digital tables.`);
      return { success: false, error: "Order not found" };
    }

    // Load store configuration details for invoice branding
    const [settings] = await db.query("SELECT site_name, site_email, phone, address FROM settings LIMIT 1");
    const store = settings[0] || {
      site_name: "Olive Seeds Studio",
      site_email: "support@oliveseeds.com",
      phone: "+91 99999 99999",
      address: "Olive Seeds Workshop, India"
    };

    let customerEmail = "";
    let customerName = "";
    let invoiceDate = new Date();
    let currency = "INR";
    let subtotal = 0;
    let tax = 0;
    let shipping = 0;
    let total = 0;
    let paymentMode = "";
    let paymentStatus = "";
    let isPaid = false;

    let itemsHtml = "";
    let digitalLinksHtml = "";

    // Load physical order items if any
    if (physicalOrder) {
      customerEmail = physicalOrder.guest_email || physicalOrder.member_email || "";
      customerName = physicalOrder.guest_name || physicalOrder.member_name || "Valued Customer";
      invoiceDate = physicalOrder.invoice_date || physicalOrder.created_at || new Date();
      currency = physicalOrder.currency_code || "INR";
      subtotal += parseFloat(physicalOrder.subtotal);
      tax += parseFloat(physicalOrder.tax_amount);
      shipping += parseFloat(physicalOrder.shipping_fee);
      total += parseFloat(physicalOrder.total);
      paymentMode = physicalOrder.payment_mode || "COD";
      paymentStatus = physicalOrder.payment_status;
      if (physicalOrder.payment_status === "Paid") isPaid = true;

      const [items] = await db.query(
        "SELECT * FROM physical_order_items WHERE order_uid = ?",
        [physicalOrder.order_uid]
      );
      
      for (const item of items) {
        const itemTotal = parseFloat(item.price) * parseInt(item.qty);
        const [customs] = await db.query(
          "SELECT field_label, field_value FROM physical_order_customizations WHERE order_item_id = ?",
          [item.id]
        );
        const customsText = customs.map(c => `${c.field_label}: ${c.field_value}`).join("<br/>") || "None";
        itemsHtml += `
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px; font-size: 13px; color: #0D1512; font-weight: bold;">
              ${item.product_name}<br/>
              <span style="font-size: 11px; color: #78716c; font-weight: normal;">Size: ${item.selected_size || 'Standard'} (Physical)</span>
            </td>
            <td style="padding: 12px; font-size: 11px; color: #44403c; vertical-align: top;">${customsText}</td>
            <td style="padding: 12px; font-size: 13px; text-align: center; color: #0D1512;">${item.qty}</td>
            <td style="padding: 12px; font-size: 13px; text-align: right; color: #0D1512;">${currency} ${parseFloat(item.price).toFixed(2)}</td>
            <td style="padding: 12px; font-size: 13px; text-align: right; color: #0D1512; font-weight: bold;">${currency} ${itemTotal.toFixed(2)}</td>
          </tr>
        `;
      }
    }

    // Load digital order items if any
    if (digitalOrder) {
      customerEmail = customerEmail || digitalOrder.guest_email || digitalOrder.member_email || "";
      customerName = customerName || digitalOrder.guest_name || digitalOrder.member_name || "Valued Customer";
      invoiceDate = digitalOrder.invoice_date || digitalOrder.created_at || new Date();
      currency = currency || digitalOrder.currency_code || "INR";
      subtotal += parseFloat(digitalOrder.subtotal);
      tax += parseFloat(digitalOrder.tax_amount);
      total += parseFloat(digitalOrder.total);
      paymentMode = paymentMode || digitalOrder.payment_mode || "Online";
      paymentStatus = paymentStatus || digitalOrder.payment_status;
      if (digitalOrder.payment_status === "Paid") isPaid = true;

      const [items] = await db.query(
        "SELECT * FROM digital_order_items WHERE order_uid = ?",
        [digitalOrder.order_uid]
      );
      
      for (const item of items) {
        const itemTotal = parseFloat(item.price) * parseInt(item.qty);
        itemsHtml += `
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px; font-size: 13px; color: #0D1512; font-weight: bold;">
              ${item.product_name}<br/>
              <span style="font-size: 11px; color: #78716c; font-weight: normal;">Instant Asset (Digital)</span>
            </td>
            <td style="padding: 12px; font-size: 11px; color: #44403c; vertical-align: top;">None</td>
            <td style="padding: 12px; font-size: 13px; text-align: center; color: #0D1512;">${item.qty}</td>
            <td style="padding: 12px; font-size: 13px; text-align: right; color: #0D1512;">${currency} ${parseFloat(item.price).toFixed(2)}</td>
            <td style="padding: 12px; font-size: 13px; text-align: right; color: #0D1512; font-weight: bold;">${currency} ${itemTotal.toFixed(2)}</td>
          </tr>
        `;

        // Retrieve product file_url for downloads
        const [assets] = await db.query(
          "SELECT file_url FROM digital_products WHERE product_uid = ?",
          [item.product_uid]
        );
        
        if (assets.length && assets[0].file_url) {
          const downloadToken = jwt.sign(
            { product_uid: item.product_uid, order_uid: digitalOrder.order_uid },
            process.env.JWT_SECRET,
            { expiresIn: "72h" }
          );
          const apiBase = process.env.API_BASE_URL || (process.env.NODE_ENV === "production" ? "https://apiosspanel.oliveseedsdesignstudio.com/api" : "http://200.141.2.131:5000/api");
          const downloadUrl = `${apiBase}/digital-products/download/${downloadToken}`;
          digitalLinksHtml += `
            <div style="background-color: #ffffff; border: 1px solid rgba(107, 124, 63, 0.2); padding: 15px; border-radius: 12px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; justify-content: space-between;">
              <div>
                <div style="font-weight: bold; font-size: 13px; color: #0D1512;">${item.product_name}</div>
                <div style="font-size: 11px; color: #78716c;">Link active for 72 hours</div>
              </div>
              <a href="${downloadUrl}" style="display: inline-block; background-color: #6B7C3F; color: #ffffff; padding: 8px 16px; font-size: 12px; font-weight: bold; border-radius: 9999px; text-decoration: none; box-shadow: 0 2px 4px rgba(107, 124, 63, 0.15);" target="_blank">Download Now</a>
            </div>
          `;
        }
      }
    }

    if (!customerEmail) {
      console.warn(`⚠️ orderNotification: Customer email empty for Order #${orderId}, aborting mail send.`);
      return { success: false, error: "No customer email found" };
    }

    const formattedDate = new Date(invoiceDate).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });

    const emailSubject = isPaid 
      ? `Payment Confirmed & Invoice: Order #${orderId} - Olive Seeds Studio` 
      : `Order Confirmed: Order #${orderId} - Olive Seeds Studio`;

    // Shipping Address Block
    let shippingAddressHtml = "";
    if (physicalOrder) {
      const street = physicalOrder.delivery_street || "";
      const apt = physicalOrder.delivery_apt || "";
      const city = physicalOrder.delivery_city || "";
      const state = physicalOrder.delivery_state || "";
      const country = physicalOrder.delivery_country || "";
      const pincode = physicalOrder.delivery_pincode || "";
      const fullAddress = [street, apt, city, state, country, pincode].filter(Boolean).join(", ");
      
      shippingAddressHtml = `
        <div style="margin-top: 20px; padding: 15px; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #fcfcfc;">
          <h4 style="margin: 0 0 10px 0; color: #6B7C3F; font-size: 14px;"><span style="font-size: 16px; margin-right: 5px;">📍</span> Shipping Address</h4>
          <p style="margin: 0; font-size: 13px; color: #44403c; line-height: 1.5;">${fullAddress || physicalOrder.address_line || 'No address provided'}</p>
        </div>
      `;
    }

    // Construct highly professional HTML invoice email
    const htmlContent = `
      <div style="font-family: 'Georgia', 'Times New Roman', serif; color: #0D1512; background-color: #ffffff; padding: 30px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <!-- Header / Logo -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
          <tr>
            <td>
              <h2 style="margin: 0; color: #6B7C3F; font-weight: bold; font-size: 26px; font-family: 'Georgia', serif;">${store.site_name}</h2>
              <span style="font-size: 11px; color: #78716c; font-family: sans-serif; text-transform: uppercase; tracking-wider">Luxury Engravings & Digital Templates</span>
            </td>
            <td style="text-align: right; vertical-align: top;">
              <span style="font-family: sans-serif; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #6B7C3F; border: 2px solid #6B7C3F; padding: 5px 12px; border-radius: 4px; display: inline-block;">
                ${isPaid ? 'PAID INVOICE' : 'ORDER CONFIRMED'}
              </span>
            </td>
          </tr>
        </table>
 
        <!-- Order Metadata -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-family: sans-serif; font-size: 13px; color: #44403c; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; padding: 15px 0;">
          <tr>
            <td style="padding: 12px 0; line-height: 1.6;">
              <strong>Order ID:</strong> #${orderId}<br/>
              <strong>Date:</strong> ${formattedDate}
            </td>
            <td style="text-align: right; padding: 12px 0; line-height: 1.6;">
              <strong>Payment Method:</strong> ${paymentMode}<br/>
              <strong>Status:</strong> ${paymentStatus}
            </td>
          </tr>
        </table>
 
        <p style="font-size: 15px; line-height: 1.6; color: #0D1512;">Dear <strong>${customerName}</strong>,</p>
        <p style="font-family: sans-serif; font-size: 13px; line-height: 1.6; color: #44403c;">
          ${isPaid 
            ? "Thank you for your payment! Your transaction has been verified successfully. Below is your official purchase invoice." 
            : "Thank you for your order! Your order has been registered successfully and is now processing. Below are your details."
          }
        </p>
 
        <!-- Digital Downloads Section -->
        ${digitalLinksHtml ? `
          <div style="background-color: #fdfdfc; border: 2px dashed #6B7C3F; padding: 20px; border-radius: 12px; margin: 25px 0; font-family: sans-serif;">
            <h4 style="margin-top: 0; margin-bottom: 15px; color: #6B7C3F; font-size: 15px; font-weight: bold;">📥 Your Digital Product Downloads</h4>
            ${digitalLinksHtml}
          </div>
        ` : ""}
 
        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin: 30px 0; font-family: sans-serif;">
          <thead>
            <tr style="background-color: #6B7C3F; color: #ffffff;">
              <th style="padding: 10px; font-size: 11px; font-weight: bold; text-align: left; text-transform: uppercase; border-top-left-radius: 4px; border-bottom-left-radius: 4px;">Items</th>
              <th style="padding: 10px; font-size: 11px; font-weight: bold; text-align: left; text-transform: uppercase;">Customization</th>
              <th style="padding: 10px; font-size: 11px; font-weight: bold; text-align: center; text-transform: uppercase; width: 40px;">Qty</th>
              <th style="padding: 10px; font-size: 11px; font-weight: bold; text-align: right; text-transform: uppercase; width: 90px;">Price</th>
              <th style="padding: 10px; font-size: 11px; font-weight: bold; text-align: right; text-transform: uppercase; width: 90px; border-top-right-radius: 4px; border-bottom-right-radius: 4px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr>
              <td colspan="3"></td>
              <td style="padding: 10px 10px 5px 10px; text-align: right; font-size: 12px; color: #78716c;">Subtotal:</td>
              <td style="padding: 10px 10px 5px 10px; text-align: right; font-size: 12px; font-weight: bold; color: #0D1512;">${currency} ${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3"></td>
              <td style="padding: 5px 10px; text-align: right; font-size: 12px; color: #78716c;">Estimated Tax:</td>
              <td style="padding: 5px 10px; text-align: right; font-size: 12px; font-weight: bold; color: #0D1512;">${currency} ${tax.toFixed(2)}</td>
            </tr>
            ${physicalOrder ? `
            <tr>
              <td colspan="3"></td>
              <td style="padding: 5px 10px; text-align: right; font-size: 12px; color: #78716c;">Shipping Fee:</td>
              <td style="padding: 5px 10px; text-align: right; font-size: 12px; font-weight: bold; color: #0D1512;">${shipping === 0 ? "FREE" : `${currency} ${shipping.toFixed(2)}`}</td>
            </tr>
            ` : ""}
            <tr style="border-top: 1px solid #6B7C3F;">
              <td colspan="3"></td>
              <td style="padding: 15px 10px; text-align: right; font-size: 15px; font-weight: bold; color: #6B7C3F; text-transform: uppercase;">Grand Total:</td>
              <td style="padding: 15px 10px; text-align: right; font-size: 16px; font-weight: bold; color: #6B7C3F;">${currency} ${total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <!-- Shipping Address -->
        ${shippingAddressHtml}
 
        <!-- Footer / Contact Info -->
        <div style="border-top: 1px solid #e5e5e5; margin-top: 40px; padding-top: 20px; font-family: sans-serif; font-size: 12px; color: #78716c; text-align: center; line-height: 1.5;">
          <p style="margin-bottom: 5px; font-weight: bold;">Thank you for shopping with Olive Seeds Studio</p>
          <p style="margin-bottom: 5px; margin-top: 0;">Need support? Reply directly to this email or call ${store.phone}.</p>
          <p style="margin-bottom: 0; color: #a8a29e;"><strong>${store.site_name}</strong> — ${store.address}</p>
        </div>
 
      </div>
    `;

    console.log(`✉️ orderNotification: Dispatching invoice email to ${customerEmail}`);
    await sendMail({
      to: customerEmail,
      subject: emailSubject,
      text: `Thank you for your purchase from Olive Seeds! Order #${orderId} total is ${currency} ${total}.`,
      html: htmlContent
    });

    // Automatically notify admin at oss.oliveseeds@gmail.com
    const adminEmail = "oss.oliveseeds@gmail.com";
    console.log(`✉️ orderNotification: Dispatching admin notification email to ${adminEmail}`);
    const adminHtmlContent = `
      <div style="background-color: #fcfdfc; border: 2px solid #6B7C3F; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-family: sans-serif; font-size: 14px; color: #6B7C3F;">
        <strong>🔔 ADMIN ORDER NOTIFICATION:</strong> A new order has been placed on your store. Below are the customer and purchase details.
      </div>
      <div style="background-color: #ffffff; padding: 15px; border: 1px solid #e5e5e5; border-radius: 8px; margin-bottom: 20px; font-family: sans-serif; font-size: 13px; line-height: 1.6;">
        <strong>Customer Name:</strong> ${customerName}<br/>
        <strong>Customer Email:</strong> ${customerEmail}<br/>
        <strong>Customer Phone:</strong> ${physicalOrder?.guest_phone || physicalOrder?.phone || 'None'}<br/>
        <strong>Total Amount:</strong> ${currency} ${total.toFixed(2)}<br/>
        <strong>Payment Gateway:</strong> ${paymentMode} (${paymentStatus})<br/>
        <strong>Admin Order Panel Link:</strong> <a href="http://localhost:3000/admin/orders" style="color: #6B7C3F; font-weight: bold;">View Order Details</a>
      </div>
      ${htmlContent}
    `;
    await sendMail({
      to: adminEmail,
      subject: `🔔 NEW ORDER: Order #${orderId} (${currency} ${total.toFixed(2)})`,
      text: `A new order #${orderId} was placed on Olive Seeds Studio for ${currency} ${total}.`,
      html: adminHtmlContent
    }).catch(err => console.error("Failed to send admin order notification email:", err.message));

    return { success: true };
  } catch (error) {
    console.error("❌ orderNotification error:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendOrderConfirmation
};
