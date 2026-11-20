import { Router } from "express";
import { tuitionController } from "./tuition.controller.js";
import verifyToken from "../../middlewares/verify-token.js";
import verifyTutor from "../../middlewares/verify-tutor.js";
import verifyAdmin from "../../middlewares/verify-admin.js";

const router = Router();

// Public routes
router.get("/featured", tuitionController.getFeatured);
router.get("/", tuitionController.getAll);

// Protected Tutor routes
router.get("/my-tuitions", verifyToken, verifyTutor, tuitionController.getMyTuitions);
router.post("/", verifyToken, verifyTutor, tuitionController.create);
router.patch("/:id", verifyToken, verifyTutor, tuitionController.update);
router.delete("/:id", verifyToken, verifyTutor, tuitionController.delete);
router.patch("/:id/status", verifyToken, verifyTutor, tuitionController.toggleStatus);

// Protected Admin routes
router.get("/admin/all", verifyToken, verifyAdmin, tuitionController.getAdminTuitions);
router.patch("/:id/moderate", verifyToken, verifyAdmin, tuitionController.moderate);

// Public single tuition route (placed last so it doesn't collide with /featured or /my-tuitions)
router.get("/:id", tuitionController.getById);

export default router;
