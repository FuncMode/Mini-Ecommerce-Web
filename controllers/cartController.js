import db from "../db.js";

/* ============================================================================
   ADD TO CART
   1. Kunin product details galing sa frontend
   2. I-check muna kung existing na yung product sa user's cart
   3. Kung meron na → i-increment lang quantity
   4. Kung wala pa → i-insert bilang bagong item
============================================================================ */

export const addToCart = (req, res) => {
  const { username, product_id, product_name, price, quantity } = req.body;

  // Check if product already exists in cart for this user
  const checkSql = "SELECT * FROM carts WHERE username = ? AND product_id = ?";

  db.query(checkSql, [username, product_id], (err, results) => {
    if (err)
      return res.status(500).json({ success: false, message: "Server error." });

    // Product already exists → Update quantity
    if (results.length > 0) {
      const updateSql =
        "UPDATE carts SET quantity = quantity + ? WHERE username = ? AND product_id = ?";
      db.query(updateSql, [quantity, username, product_id], (err2) => {
        if (err2)
          return res
            .status(500)
            .json({ success: false, message: "Update failed." });

        return res.json({
          success: true,
          message: "Quantity updated successfully."
        });
      });

    } else {
      // New product → Insert into cart
      const insertSql =
        "INSERT INTO carts (username, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)";
      db.query(insertSql, [username, product_id, product_name, price, quantity], (err3) => {
        if (err3)
          return res
            .status(500)
            .json({ success: false, message: "Insert failed." });

        return res.json({
          success: true,
          message: "Item added to cart."
        });
      });
    }
  });
};

/* ============================================================================
   GET CART ITEMS
   Returns all products in the cart for a specific user.
============================================================================ */
export const getCart = (req, res) => {
  const { username } = req.query;

  const sql = "SELECT * FROM carts WHERE username = ?";

  db.query(sql, [username], (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Error fetching cart." });

    return res.json({ success: true, cart: results });
  });
};

/* ============================================================================
   REMOVE ITEM OR REDUCE QUANTITY
   1. Check current quantity of the selected product
   2. If removeQty >= current quantity → DELETE item
   3. Else → Subtract removeQty from current quantity
============================================================================ */
export const removeFromCart = (req, res) => {
  const { username, product_id, removeQty } = req.body;

  const checkSql =
    "SELECT quantity FROM carts WHERE username = ? AND product_id = ?";

  db.query(checkSql, [username, product_id], (err, results) => {
    if (err || results.length === 0)
      return res
        .status(500)
        .json({ success: false, message: "Item not found or server error" });

    const currentQty = results[0].quantity;

    // If removing equal or more than current quantity → delete item
    if (removeQty >= currentQty) {
      db.query(
        "DELETE FROM carts WHERE username = ? AND product_id = ?",
        [username, product_id]
      );
    } else {
      // Else subtract quantity
      db.query(
        "UPDATE carts SET quantity = quantity - ? WHERE username = ? AND product_id = ?",
        [removeQty, username, product_id]
      );
    }

    return res.json({ success: true });
  });
};

/* ============================================================================
   CLEAR CART (CHECKOUT)
   Deletes all items for a user after successful checkout
============================================================================ */
export const clearCart = (req, res) => {
  const { username } = req.body;

  const sql = "DELETE FROM carts WHERE username = ?";

  db.query(sql, [username], (err) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Error clearing cart." });

    return res.json({
      success: true,
      message: "Cart cleared successfully."
    });
  });
};
