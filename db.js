// db.js
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config(); // Load DB credentials from .env file

// Create MySQL connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,     // e.g. "localhost"
  user: process.env.DB_USER,     // usually "root" in XAMPP
  password: process.env.DB_PASSWORD, // empty string "" if none
  database: process.env.DB_NAME, // your database name
});

// Try connecting to database
db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
  } else {
    console.log("MySQL connected (backend integration ready!)");
  }
});

export default db;
