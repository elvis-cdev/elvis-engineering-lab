import { describe, expect, it } from "vitest";
import { createDatabasePool } from "./pool.js";

describe("createDatabasePool", () => {
  it("rejects a missing connection string", () => {
    expect(() => createDatabasePool("")).toThrow(
      "DATABASE_URL must be configured before creating a database pool.",
    );
  });
});