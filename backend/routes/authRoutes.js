import express from "express";
import { handleRefreshToken, Logout, SignIn, SignUp } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/signup", SignUp);
router.post("/signin", SignIn);
router.post("/refresh",handleRefreshToken);
router.post("/logout",authMiddleware, Logout);

export default router;
