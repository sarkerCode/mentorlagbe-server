import { stripe } from "../../config/stripe.js";
import { env } from "../../config/env.js";
import { getDB } from "../../config/database.js";

const PLAN_CONFIGS = {
  tutor: {
    name: "Pro Tutor Plan",
    description: "Unlimited tuition postings, priority placement, and verified mentor badge",
    amount: 1500, // $15.00 USD in cents
    currency: "usd",
  },
  student: {
    name: "Pro Student Plan",
    description: "Priority application status, direct tutor access, and study resources",
    amount: 1000, // $10.00 USD in cents
    currency: "usd",
  },
};

export const paymentService = {
  // Create Stripe Checkout Session
  async createCheckoutSession(user, targetPlan) {
    const roleKey = (targetPlan || user?.role || "student").toLowerCase();
    const plan = PLAN_CONFIGS[roleKey] || PLAN_CONFIGS.student;

    const clientUrl = env.CLIENT_URL.replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: user?.email,
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment/cancel`,
      metadata: {
        userId: String(user?.id || user?._id || ""),
        userName: user?.name || "Member",
        userEmail: user?.email || "",
        userRole: user?.role || (roleKey === "tutor" ? "tutor" : "student"),
        planName: plan.name,
        amount: String(plan.amount / 100),
        currency: plan.currency,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  },
};
