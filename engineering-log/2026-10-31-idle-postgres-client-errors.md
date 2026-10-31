# 2026-10-31 — Handle idle PostgreSQL client errors

## Improvement

Attach an error listener to each PostgreSQL pool created by the shared pool factory. The pg pool emits an `error` event when an idle client is disconnected or otherwise fails. Without a listener, Node's EventEmitter treats the event as unhandled and may terminate the process.

The listener records a concise error message and prevents an idle-client failure from becoming an uncaught EventEmitter error.

## Files

- `src/db/pool.ts`: register the idle-client error listener.
- `src/db/pool.test.ts`: verify that an emitted idle-client error is handled and logged.
- `engineering-log/2026-10-31-idle-postgres-client-errors.md`: record the change.

## Verification

GitHub Actions is the verification source for the final pull-request commit. This entry does not claim local checks or CI results.
