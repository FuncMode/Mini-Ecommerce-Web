// routes/authRoutes.js
import express from "express"; // Import Express
import { registerUser, loginUser } from "../controllers/authController.js"; // Import controllers

const router = express.Router(); 
// Gumagawa tayo ng hiwalay na router para dito ilalagay
// lahat ng routes na related sa Authentication (Register & Login)

// ======================== REGISTER ROUTE ========================
router.post("/register", registerUser);
// POST request sa /register → tatawagin yung registerUser controller

// ======================== LOGIN ROUTE ===========================
router.post("/login", loginUser);
// POST request sa /login → tatawagin yung loginUser controller

export default router; 
// Ia-export para magamit sa main server file (app.js)

