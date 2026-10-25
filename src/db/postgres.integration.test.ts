import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDatabasePool } from "./pool.js";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (
  process.env.REQUIRE_POSTGRES_INTEGRATION === "1" &&
  !testDatabaseUrl
) {
  throw new Error(
    "TEST_DATABASE_URL must be set when PostgreSQL integration tests are required.",
  );
}

describe.skipIf(!testDatabaseUrl)("PostgreSQL integration", () => {
  let pool: Pool | undefined;
  let schemaName: string | undefined;

  function getPool(): Pool {
    if (!pool) {
      throw new Error("PostgreSQL test pool has not been initialized.");
    }

    return pool;
  }

  function getSchemaName(): string {
    if (!schemaName) {
      throw new Error("PostgreSQL test schema has not been initialized.");
    }

    return schemaName;
  }

  beforeAll(async () => {
    if (!testDatabaseUrl) {
      throw new Error("TEST_DATABASE_URL is required for PostgreSQL integration tests.");
    }

    pool = createDatabasePool(testDatabaseUrl);
    await pool.query("SELECT 1");

    // The generated identifier contains only safe lowercase hex characters.
    schemaName = `integration_${randomUUID().replaceAll("-", "")}`;
    await pool.query(`CREATE SCHEMA "${schemaName}"`);
    await pool.query(
      `CREATE TABLE "${schemaName}".registrations (
        id BIGSERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE
      )`,
    );
  });

  afterAll(async () => {
    if (!pool) return;

    try {
      if (schemaName) {
        await pool.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      }
    } finally {
      await pool.end();
    }
  });

  it("connects to PostgreSQL and executes a query", async () => {
    const result = await getPool().query<{ value: number }>(
      "SELECT 1::int AS value",
    );

    expect(result.rows[0]?.value).toBe(1);
  });

  it("enforces a real unique constraint", async () => {
    const email = `duplicate-${randomUUID()}@example.test`;
    const sql = `INSERT INTO "${getSchemaName()}".registrations (email) VALUES ($1)`;

    await getPool().query(sql, [email]);

    await expect(getPool().query(sql, [email])).rejects.toMatchObject({
      code: "23505",
    });
  });

  it("rolls back uncommitted writes", async () => {
    const email = `rollback-${randomUUID()}@example.test`;
    const client = await getPool().connect();

    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO "${getSchemaName()}".registrations (email) VALUES ($1)`,
        [email],
      );
      await client.query("ROLLBACK");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }

    const result = await getPool().query<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM "${getSchemaName()}".registrations
       WHERE email = $1`,
      [email],
    );

    expect(result.rows[0]?.count).toBe(0);
  });
});
