
import app from "./app.js";
import { connectDB } from "./config/database.js";
import { env } from "./config/env.js";

const startServer = async () => {
  try {
    // Connect MongoDB first
    await connectDB();

    // Start Express server
    app.listen(env.PORT, () => {
      console.log(
        `MentorLagbe server running on port ${env.PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();
