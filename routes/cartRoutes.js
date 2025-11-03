// routes/cartRoutes.js
import express from "express";
import { addToCart, getCart, clearCart, removeFromCart } from "../controllers/cartController.js";

const router = express.Router();
// Gumagawa tayo ng router para dito ilagay lahat ng cart-related API endpoints

// =========================
// ADD ITEM TO CART
// =========================
// POST /api/cart/add
// Mag-a-add ng product sa cart (or mag-a-update ng quantity kung existing na)
router.post("/add", addToCart);

// =========================
// GET USER CART DATA
// =========================
// GET /api/cart?username=<username>
// Kukunin lahat ng items sa cart ng specific na user
router.get("/", getCart);


// =========================
// REMOVE ITEM / REDUCE QTY
// =========================
// POST /api/cart/remove
// Either tatanggalin ang item kung 1 lang quantity,
// or babawasan quantity kung higit sa 1
router.post("/remove", removeFromCart);


// =========================
// CLEAR CART AFTER CHECKOUT
// =========================
// DELETE /api/cart/clear
// Tatanggalin lahat ng items sa cart ng user pagkatapos ng checkout
router.delete("/clear", clearCart);


// Export para magamit ng main server
export default router;
