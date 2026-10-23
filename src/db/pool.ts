import { Pool } from "pg";

/**
 * Create a PostgreSQL connection pool.
 * Pass a connection string explicitly in tests or configure DATABASE_URL locally.
 * This function does not connect until a query is issued.
 */
export function createDatabasePool(
  connectionString: string | undefined = process.env.DATABASE_URL,
): Pool {
  if (!connectionString?.trim()) {
    throw new Error("DATABASE_URL must be configured before creating a database pool.");
  }

  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}
