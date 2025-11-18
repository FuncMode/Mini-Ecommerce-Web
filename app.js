// app.js
import express from "express"; // Import Express framework
import dotenv from "dotenv"; // Para mabasa ang .env (env variables)
import path from "path"; // Para sa file paths
import { fileURLToPath } from "url"; // Kailangan sa ES modules para makuha __dirname

// Route handlers (galing sa routes folder)
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

dotenv.config(); // Load variables from .env DB login details

const app = express();

// Para ma-parse/ma-read si JSON body sa requests
app.use(express.json());

// Kailangan para makuha actual path ng file (since ES modules wala default __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lahat ng files sa "public" folder magiging accessible sa browser
// Halimbawa: /public/style.css → http://localhost:3000/style.css
// app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, "public/dist")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/dist", express.static(path.join(__dirname, "public/dist")));


// Default route → redirect papuntang /register page
app.get("/", (req, res) => {
  res.redirect("/register");
});

// LOAD FRONTEND PAGES (HTML files)
// Login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Register page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

// Main dashboard (after login)
app.get("/main", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "main.html"));
});

// API ROUTES
app.use("/api/auth", authRoutes); // For register & login API
app.use("/api/cart", cartRoutes); // For cart operations (add, get, delete, etc.)

const PORT = process.env.PORT || 3000; // Port number (galing .env or default 3000)

// Start Server
app.listen(PORT, () =>
  console.log(`Server running at: http://localhost:${PORT}`)
);
