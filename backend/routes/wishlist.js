const router = require("express").Router();
const db = require("../db");
const { verifyMember } = require("../middleware/auth");

// Helper to get member identifiers (resolves both numeric id and alphanumeric member_uid from DB if needed)
const getMemberIdentifiers = async (req) => {
  let userId = req.member?.id || req.member?.member_id || 0;
  let memberUid = req.member?.member_uid || (userId ? String(userId) : "");

  if ((!userId || !memberUid) && (req.member?.email || memberUid)) {
    try {
      const [rows] = await db.query(
        "SELECT id, member_uid FROM members WHERE member_uid = ? OR email = ? OR id = ?",
        [memberUid, req.member?.email || "", userId]
      );
      if (rows.length > 0) {
        userId = rows[0].id;
        memberUid = rows[0].member_uid;
      }
    } catch (e) {}
  }
  return { userId, memberUid };
};

// GET /api/wishlist — get current user wishlist details
router.get("/", verifyMember, async (req, res) => {
  const { userId, memberUid } = await getMemberIdentifiers(req);
  console.log(`🔍 Fetching wishlist for user: userId=${userId}, memberUid=${memberUid}`);
  try {
    // 1. Fetch user wishlist entries
    const [wishlistRows] = await db.query(
      `SELECT * FROM wishlists WHERE (user_id = ? OR member_id = ? OR member_uid = ?) ORDER BY created_at DESC`,
      [userId, userId, memberUid]
    ).catch(() => [[]]);

    let rawEntries = wishlistRows || [];
    if (rawEntries.length === 0) {
      const [legacyRows] = await db.query(
        `SELECT * FROM wishlist WHERE member_uid = ? ORDER BY id DESC`,
        [memberUid]
      ).catch(() => [[]]);
      rawEntries = legacyRows || [];
    }

    if (rawEntries.length === 0) {
      return res.json([]);
    }

    // 2. Fetch full product catalog from all tables to join in Node.js
    const [products] = await db.query("SELECT * FROM products").catch(() => [[]]);
    const [physProducts] = await db.query("SELECT * FROM physical_products").catch(() => [[]]);
    const [digiProducts] = await db.query("SELECT * FROM digital_products").catch(() => [[]]);

    const catalogMap = new Map();

    // Map physical products
    [...(products || []), ...(physProducts || [])].forEach(p => {
      if (p.id) catalogMap.set(`physical_id_${p.id}`, p);
      if (p.product_uid) catalogMap.set(`physical_uid_${p.product_uid}`, p);
      catalogMap.set(`id_${p.id}`, p);
      if (p.product_uid) catalogMap.set(`uid_${p.product_uid}`, p);
    });

    // Map digital products
    (digiProducts || []).forEach(p => {
      if (p.id) catalogMap.set(`digital_id_${p.id}`, p);
      if (p.product_uid) catalogMap.set(`digital_uid_${p.product_uid}`, p);
      if (!catalogMap.has(`id_${p.id}`)) catalogMap.set(`id_${p.id}`, p);
      if (p.product_uid && !catalogMap.has(`uid_${p.product_uid}`)) catalogMap.set(`uid_${p.product_uid}`, p);
    });

    // Helper to parse image
    const extractImage = (p) => {
      if (!p) return "";
      if (p.image_url) return p.image_url;
      if (p.image) return p.image;
      if (p.thumbnail_url) return p.thumbnail_url;
      if (p.thumbnail) return p.thumbnail;
      if (p.images) {
        try {
          const imgs = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
          if (Array.isArray(imgs) && imgs.length > 0) return imgs[0];
        } catch (e) {}
      }
      return "";
    };

    // 3. Build enriched result list
    const result = rawEntries.map(w => {
      const pType = w.product_type || w.type || "physical";
      const targetUid = w.product_uid || (w.product_id ? String(w.product_id) : (w.digital_id ? String(w.digital_id) : ""));
      const targetId = w.product_id || w.digital_id || w.id;

      // Look up matched product object
      let matched = catalogMap.get(`${pType}_uid_${targetUid}`) ||
                    catalogMap.get(`${pType}_id_${targetId}`) ||
                    catalogMap.get(`uid_${targetUid}`) ||
                    catalogMap.get(`id_${targetId}`);

      // If not matched under pType, try cross-searching opposite table
      if (!matched) {
        const altType = pType === "digital" ? "physical" : "digital";
        matched = catalogMap.get(`${altType}_uid_${targetUid}`) || catalogMap.get(`${altType}_id_${targetId}`);
      }

      const img = extractImage(matched);

      return {
        wishlist_id: w.id,
        saved_at: w.created_at || new Date(),
        product_id: matched?.id || w.product_id || 0,
        product_uid: matched?.product_uid || targetUid || String(matched?.id || w.id),
        type: matched ? (matched.file_url ? "digital" : "physical") : pType,
        id: matched?.id || targetId || w.id,
        name: matched?.name || matched?.title || "Saved Product",
        price: matched ? (matched.discount_price || matched.price || 0) : 0,
        discount_price: matched?.discount_price || null,
        description: matched?.description || "",
        image: img,
        image_url: img,
        category: matched?.category || (pType === "digital" ? "Digital Asset" : "Engraved Product"),
        stock: matched?.stock ?? 99,
        slug: matched?.product_uid || targetUid || String(matched?.id || w.id)
      };
    });

    console.log(`✅ Wishlist items enriched count: ${result.length}`);
    res.json(result);
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    res.status(500).json({ error: "Failed to get wishlist" });
  }
});

// GET /api/wishlist/my — array of all saved IDs & product_uids as strings
router.get("/my", verifyMember, async (req, res) => {
  const { userId, memberUid } = await getMemberIdentifiers(req);
  try {
    const [items] = await db.query(
      `SELECT product_id, product_uid, digital_id FROM wishlists WHERE (user_id = ? OR member_id = ? OR member_uid = ?)
       UNION
       SELECT 0 as product_id, product_uid, 0 as digital_id FROM wishlist WHERE member_uid = ?`,
      [userId, userId, memberUid, memberUid]
    );
    const savedList = [];
    items.forEach(i => {
      if (i.product_uid) savedList.push(String(i.product_uid));
      if (i.product_id && i.product_id !== 0) savedList.push(String(i.product_id));
      if (i.digital_id && i.digital_id !== 0) savedList.push(String(i.digital_id));
    });
    res.json(Array.from(new Set(savedList)));
  } catch (error) {
    res.json([]);
  }
});

// POST /api/wishlist/add — add via body { product_id, product_uid, product_type }
router.post("/add", verifyMember, async (req, res) => {
  const { userId, memberUid } = await getMemberIdentifiers(req);
  const { product_id, product_uid, product_type } = req.body;
  const targetUid = product_uid ? String(product_uid) : (product_id ? String(product_id) : null);
  const targetId = typeof product_id === "number" ? product_id : (!isNaN(product_uid) && product_uid !== null ? parseInt(product_uid) : 0);
  const pType = product_type || "physical";

  if (!targetUid && !targetId) {
    return res.status(400).json({ error: "Product identifier required" });
  }

  try {
    // Check if already in wishlists
    const [existing] = await db.query(
      "SELECT id FROM wishlists WHERE (user_id = ? OR member_id = ? OR member_uid = ?) AND ((product_uid = ? AND product_uid IS NOT NULL) OR (product_id = ? AND product_id != 0))",
      [userId, userId, memberUid, targetUid, targetId]
    );
    if (existing.length === 0) {
      await db.query(
        "INSERT INTO wishlists (user_id, member_id, member_uid, product_id, product_uid, product_type) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, userId, memberUid, targetId, targetUid, pType]
      );
    }

    // Also sync to legacy `wishlist` table if present
    try {
      await db.query(
        "INSERT IGNORE INTO wishlist (member_uid, product_uid, product_type) VALUES (?, ?, ?)",
        [memberUid, targetUid || String(targetId), pType]
      );
    } catch (e) {
      // Ignore if table/constraint doesn't exist
    }

    res.json({ message: "added", saved: true });
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// POST /api/wishlist/:product_id — add to wishlist by param
router.post("/:product_id", verifyMember, async (req, res) => {
  const { userId, memberUid } = await getMemberIdentifiers(req);
  const paramVal = req.params.product_id;
  const isNum = !isNaN(paramVal);
  const targetId = isNum ? parseInt(paramVal) : 0;
  const targetUid = String(paramVal);

  try {
    const [existing] = await db.query(
      "SELECT id FROM wishlists WHERE (user_id = ? OR member_id = ? OR member_uid = ?) AND ((product_uid = ? AND product_uid IS NOT NULL) OR (product_id = ? AND product_id != 0))",
      [userId, userId, memberUid, targetUid, targetId]
    );
    if (existing.length === 0) {
      await db.query(
        "INSERT INTO wishlists (user_id, member_id, member_uid, product_id, product_uid, product_type) VALUES (?, ?, ?, ?, ?, 'physical')",
        [userId, userId, memberUid, targetId, targetUid]
      );
    }

    // Sync to legacy wishlist table
    try {
      await db.query(
        "INSERT IGNORE INTO wishlist (member_uid, product_uid, product_type) VALUES (?, ?, 'physical')",
        [memberUid, targetUid]
      );
    } catch (e) {}

    res.json({ message: "added", saved: true });
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// DELETE /api/wishlist/:product_id — remove from wishlist
router.delete("/:product_id", verifyMember, async (req, res) => {
  const { userId, memberUid } = await getMemberIdentifiers(req);
  const paramVal = req.params.product_id;

  try {
    await db.query(
      "DELETE FROM wishlists WHERE (user_id = ? OR member_id = ? OR member_uid = ?) AND (product_id = ? OR product_uid = ? OR id = ?)",
      [userId, userId, memberUid, paramVal, paramVal, paramVal]
    );
    try {
      await db.query(
        "DELETE FROM wishlist WHERE member_uid = ? AND (product_uid = ? OR id = ?)",
        [memberUid, paramVal, paramVal]
      );
    } catch (e) {}

    res.json({ message: "removed", saved: false });
  } catch (error) {
    console.error("Failed to remove from wishlist:", error);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

module.exports = router;