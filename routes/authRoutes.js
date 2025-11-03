// routes/authRoutes.js
import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router(); 
// Ginagawa natin si router para dito ilalagay
// lahat ng routes na related sa authentication (register/login)


// ========================
// REGISTER ROUTE
// ========================
// When client sends POST /api/auth/register → call registerUser controller
router.post("/register", registerUser);


// ========================
// LOGIN ROUTE
// ========================
// When client sends POST /api/auth/login → call loginUser controller
router.post("/login", loginUser);


// Export para magamit sa main server (app.js)
export default router;
