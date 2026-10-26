import express, { type ErrorRequestHandler } from "express";
import type { Pool } from "pg";
import { createDatabasePool } from "./db/pool.js";

type AppOptions = {
  checkDatabase?: () => Promise<void>;
};

let readinessPool: Pool | undefined;

async function checkDatabaseConnection(): Promise<void> {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL must be configured before checking readiness.");
  }

  readinessPool ??= createDatabasePool();
  await readinessPool.query("SELECT 1");
}

export async function closeReadinessPool(): Promise<void> {
  if (!readinessPool) return;

  const pool = readinessPool;
  readinessPool = undefined;
  await pool.end();
}

export function createApp(options: AppOptions = {}) {
  const app = express();
  const checkDatabase = options.checkDatabase ?? checkDatabaseConnection;

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "elvis-engineering-lab",
    });
  });

  app.get("/ready", async (_req, res) => {
    try {
      await checkDatabase();
      res.status(200).json({
        status: "ready",
        service: "elvis-engineering-lab",
      });
    } catch {
      res.status(503).json({
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Service dependencies are not ready.",
        },
      });
    }
  });

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found.",
      },
    });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (res.headersSent) return;

    if (
      err instanceof Error &&
      "type" in err &&
      err.type === "entity.too.large"
    ) {
      res.status(413).json({
        error: {
          code: "PAYLOAD_TOO_LARGE",
          message: "Request body must not exceed 100kb.",
        },
      });
      return;
    }

    if (err instanceof SyntaxError && "body" in err) {
      res.status(400).json({
        error: {
          code: "INVALID_JSON",
          message: "Request body must contain valid JSON.",
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    });
  };

  app.use(errorHandler);

  return app;
}

export const app = createApp();
