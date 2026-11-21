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

  // Verify Checkout Session & Fulfill Pro Membership
  async verifyAndFulfillSession(sessionId) {
    if (!sessionId) {
      throw new Error("Stripe Session ID is required.");
    }

    const db = getDB();

    // 1. Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (!session || session.payment_status !== "paid") {
      throw new Error("Payment session has not been completed successfully.");
    }

    const userEmail = session.customer_email || session.metadata?.userEmail;
    if (!userEmail) {
      throw new Error("Subscriber email could not be identified from session metadata.");
    }

    const userName = session.metadata?.userName || "Subscriber";
    const userRole = session.metadata?.userRole || "student";
    const planName = session.metadata?.planName || "Pro Plan";
    const amount = Number(session.metadata?.amount || (session.amount_total ? session.amount_total / 100 : 15));
    const currency = session.currency || "usd";

    const transactionId =
      typeof session.payment_intent === "object" && session.payment_intent
        ? session.payment_intent.id
        : String(session.payment_intent || session.id);

    // 2. Check if already recorded in singular 'payment' collection
    const existingPayment = await db
      .collection("payment")
      .findOne({ stripeSessionId: session.id });

    let paymentRecord = existingPayment;

    if (!existingPayment) {
      paymentRecord = {
        userEmail,
        userName,
        userRole,
        planName,
        amount,
        currency,
        transactionId,
        stripeSessionId: session.id,
        paymentStatus: "paid",
        paidAt: new Date(),
      };

      const insertResult = await db.collection("payment").insertOne(paymentRecord);
      paymentRecord._id = insertResult.insertedId;
    }

    // 3. Upgrade user plan: 'pro' in singular 'user' collection
    await db.collection("user").updateOne(
      { email: userEmail },
      {
        $set: {
          plan: "pro",
          updatedAt: new Date(),
        },
      }
    );

    return {
      payment: paymentRecord,
      userEmail,
      plan: "pro",
    };
  },

  // Get all transaction logs for Admin
  async getAllPayments() {
    const db = getDB();
    return await db
      .collection("payment")
      .find({})
      .sort({ paidAt: -1 })
      .toArray();
  },
};
