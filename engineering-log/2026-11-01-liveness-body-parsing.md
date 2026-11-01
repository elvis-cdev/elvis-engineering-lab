# 2026-11-01 — Keep liveness independent of JSON body parsing

## Problem

The global JSON parser ran before `GET /health`. A request carrying malformed or oversized JSON could therefore fail in the parser before the liveness route responded, even though liveness is intended to confirm that the HTTP process is responding.

## Change

Register `/health` and `/ready` before the JSON parser. Other routes still pass through the existing 100 KB JSON parser and error handler.

A Supertest regression case sends malformed JSON to `GET /health` and expects the normal liveness response.

## Files

- `src/app.ts`: register health routes before JSON parsing.
- `src/app.test.ts`: cover liveness with a malformed JSON request body.
- `README.md`: clarify that liveness does not depend on JSON body parsing.

## Verification

GitHub Actions for the final pull-request commit must complete successfully before typecheck, tests, or build are described as verified.

## Limitations

This keeps health endpoints independent of JSON parsing. It does not change body parsing or validation for future API routes.
