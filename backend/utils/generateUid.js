const db = require("../db");

async function generateMemberUid() {
    const year = new Date().getFullYear();
    await db.query(
        "UPDATE settings SET member_uid_counter = member_uid_counter + 1 WHERE id = 1"
    );
    const [s] = await db.query(
        "SELECT member_uid_counter FROM settings WHERE id = 1"
    );
    const num = String(s[0].member_uid_counter).padStart(6, "0");
    return `MBR-${year}-${num}`;
}

async function generateOrderUid(type = "physical") {
    const field = type === "digital" ? "order_d_counter" : "order_p_counter";
    const prefix = type === "digital" ? "ORD-D" : "ORD-P";
    const invPrefix = type === "digital" ? "INV-D" : "INV-P";
    await db.query(
        `UPDATE settings SET ${field} = ${field} + 1 WHERE id = 1`
    );
    const [s] = await db.query(
        `SELECT ${field} as cnt FROM settings WHERE id = 1`
    );
    const num = String(s[0].cnt).padStart(6, "0");
    return {
        order_uid: `${prefix}-${num}`,
        invoice_uid: `${invPrefix}-${num}`,
    };
}


module.exports = { generateMemberUid, generateOrderUid };