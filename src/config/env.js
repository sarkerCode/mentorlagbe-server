import "dotenv/config";

const requiredEnvVariables = [
  "MONGODB_URI",
  "DB_NAME",
  "BETTER_AUTH_URL",
];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(
      `Missing required environment variable: ${variable}`
    );
  }
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  MONGODB_URI: process.env.MONGODB_URI,
  DB_NAME: process.env.DB_NAME,

  CLIENT_URL:
    process.env.CLIENT_URL || "http://localhost:3000",

  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  STRIPE_TUTOR_PRICE_ID: process.env.STRIPE_TUTOR_PRICE_ID,
  STRIPE_STUDENT_PRICE_ID: process.env.STRIPE_STUDENT_PRICE_ID,
};