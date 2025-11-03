// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Route handlers
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

dotenv.config(); // Load .env file (DB credentials, etc.)

const app = express();

// ==========================
// MIDDLEWARES
// ==========================
// Para i-allow requests from different origins (optional but recommended)
app.use(cors());

// Para mabasa ang JSON body sa request (e.g. POST data)
app.use(express.json());

// Para mabasa ang URL-encoded forms (e.g. HTML forms)
app.use(express.urlencoded({ extended: true }));

// Resolve __dirname since ES Modules don't have it by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (CSS, JS, Images) from public folder
app.use(express.static(path.join(__dirname, "public")));


// ==========================
// FRONTEND ROUTES (VIEWS)
// ==========================

// Default → redirect to login page
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Register page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

// Main dashboard page (after login)
app.get("/main", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "main.html"));
});


// ==========================
// API ROUTES
// ==========================
// Authentication (Register + Login)
app.use("/api/auth", authRoutes);

// Cart actions (Add / View / Remove / Clear)
app.use("/api/cart", cartRoutes);


// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => 
  console.log(`✅ Server running at: http://localhost:${PORT}`)
);
