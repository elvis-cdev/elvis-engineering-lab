# 2026-10-25 — PostgreSQL integration coverage

## Improvement
Added real PostgreSQL integration tests for connection/query execution, unique-constraint enforcement, and transaction rollback. CI now starts an ephemeral PostgreSQL 16 service and requires the integration suite to run.

## Files
- `.github/workflows/ci.yml`: configure the disposable PostgreSQL service and require integration-test configuration.
- `src/db/postgres.integration.test.ts`: create a per-run schema and synthetic fixtures, verify SQLSTATE `23505`, verify rollback, then drop the schema and close the pool.
- `engineering-log/2026-10-25-postgres-integration.md`: record this change and its verification boundary.

## Verification
GitHub Actions must be checked for the final commit before this change is described as verified. This entry does not claim CI passed.

## Isolation and limitations
The CI database is an ephemeral service container with synthetic data, not a production database. Local runs skip the integration suite unless `TEST_DATABASE_URL` is supplied; CI sets `REQUIRE_POSTGRES_INTEGRATION=1` so a missing URL fails instead of silently skipping.

## Next useful task
When application migrations are introduced, add integration coverage that creates the schema through those migrations rather than a test-local table definition.
