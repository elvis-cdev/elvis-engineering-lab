import request from "supertest";
import { describe, expect, it } from "vitest";
import { app, createApp } from "./app.js";

describe("GET /health", () => {
  it("returns a successful health response", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "elvis-engineering-lab",
    });
  });
});

describe("GET /ready", () => {
  it("returns ready when the database check succeeds", async () => {
    const readyApp = createApp({ checkDatabase: async () => undefined });
    const response = await request(readyApp).get("/ready");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ready",
      service: "elvis-engineering-lab",
    });
  });

  it("returns 503 without exposing database errors when the check fails", async () => {
    const readyApp = createApp({
      checkDatabase: async () => {
        throw new Error("simulated database outage");
      },
    });
    const response = await request(readyApp).get("/ready");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Service dependencies are not ready.",
      },
    });
    expect(JSON.stringify(response.body)).not.toContain("simulated database outage");
  });
});

describe("unknown routes", () => {
  it("returns a consistent JSON 404 response", async () => {
    const response = await request(app).get("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found.",
      },
    });
  });
});

describe("invalid JSON", () => {
  it("returns a client error for malformed JSON", async () => {
    const response = await request(app)
      .post("/health")
      .set("Content-Type", "application/json")
      .send("{bad json");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "INVALID_JSON",
        message: "Request body must contain valid JSON.",
      },
    });
  });
});

describe("oversized JSON", () => {
  it("returns 413 when the request body exceeds the configured limit", async () => {
    const response = await request(app)
      .post("/health")
      .set("Content-Type", "application/json")
      .send({ payload: "x".repeat(101 * 1024) });

    expect(response.status).toBe(413);
    expect(response.body).toEqual({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Request body must not exceed 100kb.",
      },
    });
  });
});
