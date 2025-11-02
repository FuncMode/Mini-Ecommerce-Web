// controllers/authController.js
import db from "../db.js";

// Register
export const registerUser = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "All fields required." });
  }

  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ success: false, message: "Username already exists." });
      }
      return res.status(500).json({ success: false, message: "Server error." });
    }
    return res.status(201).json({ success: true, message: "User registered successfully." });
  });
};

// Login 
export const loginUser = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "All fields required." });
  }

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Server error." });

    if (results.length === 0) {
      // Username not found
      return res.status(404).json({ success: false, message: "Username not found" });
    }

    const user = results[0];

    if (user.password !== password) {
      // Password mismatch
      return res.status(401).json({ success: false, message: "Wrong password" });
    }

    // Successful login
    return res.json({ success: true, message: "Login successful", username: user.username });
  });
};
