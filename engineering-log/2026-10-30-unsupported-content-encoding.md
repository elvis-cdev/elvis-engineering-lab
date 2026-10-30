# 2026-10-30 — Handle unsupported request content encodings

## Improvement

Map Express JSON parser errors for unsupported request content encodings to HTTP 415 instead of the generic 500 response.

## API behaviour

- Requests with an unsupported `Content-Encoding` receive `415 Unsupported Media Type`.
- The response uses the API's structured JSON error shape and does not expose parser internals.
- Existing malformed-JSON and oversized-body responses remain unchanged.

## Files

- `src/app.ts`: handle the parser's `encoding.unsupported` error type.
- `src/app.test.ts`: add a Supertest regression test using an unsupported `Content-Encoding` value.
- `README.md`: document the request parsing error responses.

## Verification boundary

The base commit's GitHub Actions run completed successfully, but that result does not verify this branch. Check the GitHub Actions run for the final commit on `fix/unsupported-content-encoding` before describing typecheck, tests, or build as passed.

## Risks and limitations

This change handles unsupported content encodings reported by Express's JSON parser. It does not add support for additional encodings or change request body size limits.
