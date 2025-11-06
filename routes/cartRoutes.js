// routes/cartRoutes.js
import express from "express";
import { addToCart, getCart, clearCart, removeFromCart } from "../controllers/cartController.js";

const router = express.Router();
// Gumawa tayo ng router para lahat ng Cart-related endpoints dito ilalagay

// =========================
// ADD ITEM TO CART
// =========================
router.post("/add", addToCart); 
// POST /add → tumatawag sa addToCart controller para maglagay (or mag-add qty) ng item

// =========================
// GET USER CART
// =========================
router.get("/", getCart); 
// GET / → kukunin lahat ng cart items ng specific user (based sa user_id)

// =========================
// REMOVE ITEM or BAWAS QTY
// =========================
router.post("/remove", removeFromCart); 
// POST /remove → kung 1 lang quantity tatanggalin, kung marami babawasan lang

// =========================
// CLEAR CART (CHECKOUT / LOGOUT)
// =========================
router.delete("/clear", clearCart); 
// DELETE /clear → buburahin lahat ng items sa cart ng user

export default router; 
// I-export para magamit sa main server (app.js)
