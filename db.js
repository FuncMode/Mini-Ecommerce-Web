// db.js
import mysql from "mysql2"; // MySQL client library
import dotenv from "dotenv"; // Para mabasa ang .env file

dotenv.config(); // Load DB credentials from .env file

// Nag Create tayo ng MySQL connection gamit yung values na nasa .env
const db = mysql.createConnection({
  host: process.env.DB_HOST,        // Database server host
  user: process.env.DB_USER,        // Database username
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME,    // Database name
});

// Connect sa database
db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message); // Kung may error sa connection ipakita ito sa console
  } else {
    console.log("MySQL connected!"); // Successful connection
  }
});

export default db; 
// I-export para magamit ng controllers at routes
