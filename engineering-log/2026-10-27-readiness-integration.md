# 2026-10-27 — Exercise database readiness against PostgreSQL

## Improvement

Added an integration test that calls the actual `GET /ready` route against the ephemeral PostgreSQL service configured in GitHub Actions.

## Coverage

- Uses `TEST_DATABASE_URL` from the CI test service rather than a production database.
- Temporarily sets `DATABASE_URL` for the route's real connection check, then restores the prior environment value.
- Verifies the route returns HTTP 200 and the documented readiness payload when PostgreSQL executes `SELECT 1`.
- Closes the readiness pool during cleanup.
- Skips this one integration test when `TEST_DATABASE_URL` is absent; CI sets `REQUIRE_POSTGRES_INTEGRATION=1` for the PostgreSQL suite, and the workflow's ephemeral service provides the test URL.

## Verification boundary

The previous CI run does not verify this new commit. Check the GitHub Actions run associated with the latest commit before reporting typecheck, tests, or build as passed.

## Limitations

This test verifies connectivity and the readiness response against PostgreSQL. It does not verify schema migrations or application-specific database permissions.
