import { Router } from "express";
import { applicationController } from "./application.controller.js";
import verifyToken from "../../middlewares/verify-token.js";
import verifyStudent from "../../middlewares/verify-student.js";
import verifyTutor from "../../middlewares/verify-tutor.js";

const router = Router();

// Student routes
router.post("/", verifyToken, verifyStudent, applicationController.create);
router.get("/my-applications", verifyToken, verifyStudent, applicationController.getMyApplications);
router.delete("/:id", verifyToken, verifyStudent, applicationController.cancel);

// Tutor routes
router.get("/tutor-applicants", verifyToken, verifyTutor, applicationController.getTutorApplicants);
router.patch("/:id/status", verifyToken, verifyTutor, applicationController.updateStatus);

export default router;
