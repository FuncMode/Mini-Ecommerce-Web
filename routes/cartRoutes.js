import express from "express";
import { addToCart, getCart, clearCart, removeFromCart } from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/", getCart);
router.post("/remove", removeFromCart);
router.delete("/clear", clearCart);

export default router;
