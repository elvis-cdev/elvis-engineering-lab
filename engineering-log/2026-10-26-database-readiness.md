# 2026-10-26 — Database readiness endpoint

## Improvement

Added a readiness endpoint that checks PostgreSQL separately from the process liveness endpoint.

## Behaviour

- `GET /health` remains independent of database availability.
- `GET /ready` runs `SELECT 1` using a lazily created pool.
- Missing database configuration or a failed query returns a generic HTTP 503 response without leaking internal error details.
- The server closes the readiness pool during graceful shutdown.
- Supertest covers both readiness success and failure through an injected database check, without requiring a live database for unit tests.

## Files

- `src/app.ts`: readiness route, injectable database check, and pool cleanup helper.
- `src/app.test.ts`: success and failure regression tests.
- `src/server.ts`: graceful pool cleanup.
- `README.md`: endpoint contract.

## Verification

GitHub Actions for the final commit is the source of truth for typecheck, test, and build results. The change must not be described as verified unless that run completes successfully.

## Limitations

The readiness check verifies that PostgreSQL can execute a trivial query; it does not validate application migrations or every downstream dependency.
