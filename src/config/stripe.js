import Stripe from "stripe";
import { env } from "./env.js";

if (!env.STRIPE_SECRET_KEY) {
  console.warn(
    "[Stripe Config] Warning: STRIPE_SECRET_KEY is not defined in environment variables."
  );
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
  appInfo: {
    name: "MentorLagbe",
    version: "1.0.0",
  },
});

export default stripe;
