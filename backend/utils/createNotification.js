const createNotification = async (
  db, userId, title, message, type,
  orderId = null, productId = null
) => {
  try {
    await db.query(
      `INSERT INTO notifications 
      (user_id, title, message, type, 
      related_order_id, related_product_id) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, title, message, type, 
      orderId, productId]
    );
  } catch (error) {
    console.error('Create notification error:', error);
    // Never throw — notification failure must
    // never break order flow
  }
};

module.exports = createNotification;
