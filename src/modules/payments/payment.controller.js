import { paymentService } from "./payment.service.js";

export const paymentController = {
  // POST /api/payments/create-checkout-session
  async createSession(req, res, next) {
    try {
      const user = req.user;
      const { planType } = req.body || {};

      const result = await paymentService.createCheckoutSession(user, planType);

      return res.status(200).json({
        success: true,
        message: "Stripe checkout session initialized successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/payments/verify-session?session_id=...
  async verifySession(req, res, next) {
    try {
      const sessionId = req.query.session_id || req.body?.sessionId;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: "session_id query parameter is required.",
        });
      }

      const result = await paymentService.verifyAndFulfillSession(sessionId);

      return res.status(200).json({
        success: true,
        message: "Payment successfully verified and Pro plan activated.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/payments (Admin only)
  async getAll(req, res, next) {
    try {
      const payments = await paymentService.getAllPayments();
      return res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  },
};
