import http from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const app = createApp();
const server = http.createServer(app);

server.listen(env.PORT, () => {
  logger.info(
    `Server is listening on http://localhost:${env.PORT} (env=${env.NODE_ENV})`,
  );
});

const shutdown = (signal: string) => {
  logger.warn(`${signal} received — shutting down gracefully`);
  server.close((err) => {
    if (err) {
      logger.error({ err }, "Error during server.close()");
      process.exit(1);
    }
    logger.info("HTTP server closed. Bye.");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10_000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled Promise Rejection");
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught Exception — exiting");
  process.exit(1);
});
