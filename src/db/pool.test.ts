import { describe, expect, it, vi } from "vitest";
import { createDatabasePool } from "./pool.js";

describe("createDatabasePool", () => {
  it("rejects a missing connection string", () => {
    expect(() => createDatabasePool("")).toThrow(
      "DATABASE_URL must be configured before creating a database pool.",
    );
  });

  it("handles and logs errors emitted by idle PostgreSQL clients", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const pool = createDatabasePool("postgres://localhost:5432/engineering_lab_test");
    const error = new Error("connection terminated");

    try {
      expect(() => pool.emit("error", error, undefined)).not.toThrow();
      expect(logError).toHaveBeenCalledWith(
        "Unexpected error on an idle PostgreSQL client:",
        error.message,
      );
    } finally {
      logError.mockRestore();
      await pool.end();
    }
  });
});
