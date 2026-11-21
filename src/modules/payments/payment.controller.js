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
};
