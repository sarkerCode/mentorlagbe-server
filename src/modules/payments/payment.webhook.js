import { stripe } from "../../config/stripe.js";
import { env } from "../../config/env.js";
import { paymentService } from "./payment.service.js";

export const paymentWebhook = {
  // Stripe Webhook Event Receiver
  async handleWebhook(req, res) {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (webhookSecret && sig) {
        // Construct event using Stripe signature verification
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        // Fallback for direct testing when webhook secret is not configured
        event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      }
    } catch (err) {
      console.error("[Stripe Webhook Error]: Signature verification failed:", err.message);
      return res.status(400).send(`Webhook Signature Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          console.log(`[Stripe Webhook]: Processing checkout.session.completed for ${session.id}`);

          // Fulfill payment and update user plan in MongoDB
          await paymentService.verifyAndFulfillSession(session.id);
          break;
        }

        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object;
          console.log(`[Stripe Webhook]: PaymentIntent ${paymentIntent.id} succeeded`);
          break;
        }

        default:
          console.log(`[Stripe Webhook]: Unhandled event type ${event.type}`);
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("[Stripe Webhook Handler Error]:", error);
      return res.status(500).json({
        error: "Webhook processing encountered an error",
        message: error.message,
      });
    }
  },
};

export default paymentWebhook;
