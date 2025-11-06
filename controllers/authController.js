// controllers/authController.js
import db from "../db.js"; // Koneksyon ng database

// ================= REGISTER =================
export const registerUser = (req, res) => {
  const { username, password } = req.body; // Kunin data galing frontend

  const sql = "INSERT INTO users (username, password) VALUES (?, ?)"; // Query pang insert

  db.query(sql, [username, password], (err, result) => { // I-execute yung query
    if (err) {
      if (err.code === "ER_DUP_ENTRY") { // Kapag existing na yung username
        return res.status(400).json({ 
          success: false,
          message: "Username already exists."
        });
      }

      return res.status(500).json({ // Ibang error from server/database
        success: false,
        message: "Server error."
      });
    }

    return res.status(201).json({ // Success response
      success: true,
      message: "User registered successfully."
    });
  });
};

// ================= LOGIN =================
export const loginUser = (req, res) => {
  const { username, password } = req.body; // Data galing frontend

  const sql = "SELECT * FROM users WHERE username = ?"; // Query pang hanap ng user

  db.query(sql, [username], (err, results) => { // Execute query

    if (err) {
      return res.status(500).json({ // Kapag database/server error
        success: false,
        message: "Server error." // parang server down
      });
    }

    if (results.length === 0) { // Walang nahanap na user
      return res.status(404).json({
        success: false,
        message: "Username not found"
      });
    }

    const user = results[0]; // Kunin yung actual user data

    if (user.password !== password) { // Check kung tama password
      return res.status(401).json({
        success: false,
        message: "Wrong password"
      });
    }

    return res.json({ // Login successful
      success: true,
      message: "Login successful",
      user_id: user.user_id, // I-send sa frontend (para sa auth / session / cart)
      username: user.username
    });
  });
};
