import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./app.js";

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