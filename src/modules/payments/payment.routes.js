import { Router } from "express";
import { paymentController } from "./payment.controller.js";
import { paymentWebhook } from "./payment.webhook.js";
import verifyToken from "../../middlewares/verify-token.js";
import verifyAdmin from "../../middlewares/verify-admin.js";

const router = Router();

// POST /api/payments/create-checkout-session: Authenticated user initiates Stripe checkout
router.post("/create-checkout-session", verifyToken, paymentController.createSession);

// GET /api/payments/verify-session: Public verification endpoint called on payment success redirect
router.get("/verify-session", paymentController.verifySession);

// GET /api/payments: Admin only list of all subscription transactions
router.get("/", verifyToken, verifyAdmin, paymentController.getAll);

// POST /api/payments/webhook: Fallback route for webhook
router.post("/webhook", paymentWebhook.handleWebhook);

export default router;
