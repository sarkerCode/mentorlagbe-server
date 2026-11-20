import { Router } from "express";
import { userController } from "./user.controller.js";
import verifyToken from "../../middlewares/verify-token.js";
import verifyAdmin from "../../middlewares/verify-admin.js";

const router = Router();

// Profile endpoints (Any authenticated user)
router.get("/me", verifyToken, userController.getProfile);
router.patch("/profile", verifyToken, userController.updateProfile);

// Admin user management endpoints
router.get("/", verifyToken, verifyAdmin, userController.getAllUsers);
router.patch("/:id/role", verifyToken, verifyAdmin, userController.updateUserRole);

export default router;
