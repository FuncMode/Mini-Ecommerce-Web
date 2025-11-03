// controllers/authController.js
import db from "../db.js";

/* ============================================================================
   REGISTER USER
   1. Kuhain yung username & password galing sa request body.
   2. i-insert sa database.
   3. Kung may error:
      - Kapag duplicate (existing username), mag return ng message.
      - Otherwise, generic server error.
   4. Kapag successful, return success response.
============================================================================ */

export const registerUser = (req, res) => {
  const { username, password } = req.body;

  // SQL Query for inserting user
  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";

  // Execute the query
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      // Check kung duplicate username error galing MySQL
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          success: false,
          message: "Username already exists."
        });
      }

      // General server/database error
      return res.status(500).json({
        success: false,
        message: "Server error."
      });
    }

    // If successful insert
    return res.status(201).json({
      success: true,
      message: "User registered successfully."
    });
  });
};

/* ============================================================================
   LOGIN USER
   1. Kuhain username & password sa request body.
   2. I-search sa database kung existing yung username.
   3. Kung wala, return "Username not found".
   4. Kung meron pero iba password → return "Wrong password".
   5. Kung parehong tama → return login success.
============================================================================ */
export const loginUser = (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";

  db.query(sql, [username], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Server error."
      });
    }

    // If no user found
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Username not found"
      });
    }

    // Extract user data
    const user = results[0];

    // Compare stored password and entered password
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Wrong password"
      });
    }

    // Login success
    return res.json({
      success: true,
      message: "Login successful",
      username: user.username
    });
  });
};
