# Elvis Engineering Lab

A practical engineering lab for building backend engineering skills through small, verified, production-minded changes.

## Focus

- Backend APIs and request validation
- Database modelling, queries, migrations, and data integrity
- Automated tests and regression prevention
- Error handling, observability, security, and maintainability
- Clear technical notes explaining trade-offs

## Working principles

1. Prefer useful, reviewable changes over activity for its own sake.
2. Never create empty commits or invent work to maintain a contribution streak.
3. Run the checks appropriate to the project before calling a change verified.
4. Report exact checks run and their results. If a check could not run, say so.
5. Never commit secrets, credentials, private user data, or generated build artefacts.
6. Keep `main` stable. Use a focused branch and pull request when a change is risky or CI has not yet verified it.
7. Make commits concise and specific, using conventional prefixes when useful (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`).

## Daily engineering log

Record completed work, tests, limitations, and the next useful task in `engineering-log/`. A quiet day is better than a low-quality change.

## Project stack

- Node.js 22 and TypeScript
- Express 5 for HTTP APIs
- Vitest and Supertest for automated tests
- PostgreSQL for persistence as database exercises are added
- GitHub Actions for type checks, tests, and build verification

The initial API includes a health endpoint, consistent JSON 404 responses, and malformed-JSON handling. PostgreSQL integration and migrations will be added in focused steps with tests.
