// controllers/cartController.js
import db from "../db.js"; // Import DB connection

// ================= ADD TO CART =================
export const addToCart = (req, res) => {
  const { user_id, product_id, product_name, price, quantity } = req.body; // Data galing frontend

  const checkSql = "SELECT * FROM carts WHERE user_id = ? AND product_id = ?"; // Check kung existing na sa cart

  db.query(checkSql, [user_id, product_id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Server error." });

    if (results.length > 0) { // Kapag existing item na
      const updateSql = "UPDATE carts SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?";

      db.query(updateSql, [quantity, user_id, product_id], (err2) => {
        if (err2) return res.status(500).json({ success: false, message: "Update failed." });

        return res.json({ success: true, message: "Quantity updated successfully." }); // Add lang quantity
      });

    } else { // Kapag wala pa sa cart
      const insertSql = "INSERT INTO carts (user_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)";
      db.query(insertSql, [user_id, product_id, product_name, price, quantity], (err3) => {
        if (err3) return res.status(500).json({ success: false, message: "Insert failed." });

        return res.json({ success: true, message: "Item added to cart." }); // Add new item
      });
    }
  });
};

// ================= GET CART ITEMS =================
export const getCart = (req, res) => {
  const { user_id } = req.query; // user_id galing URL query

  const sql = "SELECT * FROM carts WHERE user_id = ?"; // Fetch all cart items

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Error fetching cart." });

    return res.json({ success: true, cart: results }); // Return cart list
  });
};

// ================= REMOVE ITEM FROM CART =================
export const removeFromCart = (req, res) => {
  const { user_id, product_id, removeQty } = req.body; // Data galing frontend

  const checkSql = "SELECT quantity FROM carts WHERE user_id = ? AND product_id = ?"; // Check current quantity

  db.query(checkSql, [user_id, product_id], (err, results) => {
    if (err || results.length === 0)
      return res.status(500).json({ success: false, message: "Item not found or server error" });

    const currentQty = results[0].quantity; // Current quantity sa cart

    if (removeQty >= currentQty) { // Kapag ubos na dapat
      db.query("DELETE FROM carts WHERE user_id = ? AND product_id = ?", [user_id, product_id]);
    } else { // Kapag bawas quantity lang
      db.query(
        "UPDATE carts SET quantity = quantity - ? WHERE user_id = ? AND product_id = ?",
        [removeQty, user_id, product_id]
      );
    }

    return res.json({ success: true }); // Success response
  });
};

// ================= CLEAR CART =================
export const clearCart = (req, res) => {
  const { user_id } = req.body; // Kunin user_id

  const sql = "DELETE FROM carts WHERE user_id = ?"; // Delete all items ng user

  db.query(sql, [user_id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error clearing cart." });

    return res.json({ success: true, message: "Cart cleared successfully." }); // All removed
  });
};
