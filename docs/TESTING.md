# Testing

Run backend API and unit checks with `npm run test:server`. They use Node's built-in test runner and do not call Gemini or MongoDB. Current coverage includes health, validation, safe errors, authentication boundaries, CSRF enforcement, case schema/reference checks, solution exclusion, Gemini JSON parsing/configuration, and duplicate accusation behavior.

Run the frontend production compilation with `npm run build`. The development sample is dynamically imported only in development and is excluded from the production bundle.

Live Gemini generation, Mongo persistence, and the full browser account journey require configured external services and are not exercised by deterministic checks.
