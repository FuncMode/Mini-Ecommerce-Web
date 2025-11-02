import db from "../db.js";

// Add item to cart
export const addToCart = (req, res) => {
  const { username, product_id, product_name, price, quantity } = req.body;

  const checkSql = "SELECT * FROM carts WHERE username = ? AND product_id = ?";
  db.query(checkSql, [username, product_id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Server error." });

    if (results.length > 0) {
      const updateSql = "UPDATE carts SET quantity = quantity + ? WHERE username = ? AND product_id = ?";
      db.query(updateSql, [quantity, username, product_id], (err2) => {
        if (err2) return res.status(500).json({ success: false, message: "Update failed." });
        return res.json({ success: true, message: "Cart updated successfully." });
      });
    } else {
      const insertSql = "INSERT INTO carts (username, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)";
      db.query(insertSql, [username, product_id, product_name, price, quantity], (err3) => {
        if (err3) return res.status(500).json({ success: false, message: "Insert failed." });
        return res.json({ success: true, message: "Item added to cart." });
      });
    }
  });
};

// Get user's cart
export const getCart = (req, res) => {
  const { username } = req.query;
  const sql = "SELECT * FROM carts WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Error fetching cart." });
    res.json({ success: true, cart: results });
  });
};

// Remove with quantity logic
export const removeFromCart = (req, res) => {
  const { username, product_id, removeQty } = req.body;

  const checkSql = "SELECT quantity FROM carts WHERE username = ? AND product_id = ?";
  db.query(checkSql, [username, product_id], (err, results) => {
    if (err || results.length === 0)
      return res.status(500).json({ success: false });

    const currentQty = results[0].quantity;

    if (removeQty >= currentQty) {
      db.query("DELETE FROM carts WHERE username = ? AND product_id = ?", [username, product_id]);
    } else {
      db.query("UPDATE carts SET quantity = quantity - ? WHERE username = ? AND product_id = ?", [removeQty, username, product_id]);
    }
    res.json({ success: true });
  });
};

// Clear cart after checkout
export const clearCart = (req, res) => {
  const { username } = req.body;
  const sql = "DELETE FROM carts WHERE username = ?";
  db.query(sql, [username], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error clearing cart." });
    res.json({ success: true, message: "Cart cleared successfully." });
  });
};

