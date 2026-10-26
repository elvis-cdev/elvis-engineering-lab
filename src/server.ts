import "dotenv/config";
import { app, closeReadinessPool } from "./app.js";

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

const server = app.listen(port, () => {
  console.info(`Engineering lab API listening on port ${port}`);
});

function shutdown(signal: string) {
  console.info(`Received ${signal}; closing HTTP server.`);
  server.close(async (error) => {
    if (error) {
      console.error("Failed to close HTTP server cleanly.", error);
      process.exitCode = 1;
    }

    try {
      await closeReadinessPool();
    } catch (poolError) {
      console.error("Failed to close database pool cleanly.", poolError);
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
