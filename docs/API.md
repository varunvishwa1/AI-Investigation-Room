# API contract

Base path: `/api/v1`. Successful responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "error": { "code", "message", "requestId" } }`.

| Method and path | Purpose |
| --- | --- |
| `GET /health` | Public health response. |
| `GET /auth/csrf` | Creates or returns a CSRF token for the current cookie session. |
| `POST /auth/register` | Validates registration, hashes the password, creates the account, and starts a session. |
| `POST /auth/login` | Validates email/password credentials and starts a session. |
| `POST /auth/google` | Verifies a Google ID token, links or creates an account, and starts a session. Requires configured OAuth client ID. |
| `POST /auth/logout` | Destroys the session. |
| `GET /auth/me` | Returns the current signed-in user. |
| `GET /auth/onboarding` / `PATCH /auth/onboarding` | Reads and saves beginner guide progress. |
| `POST /auth/forgot-password` | Reports that email delivery is unavailable until a provider is configured. |
| `GET /dashboard` | Returns the signed-in user's server-recorded counts and recent investigations. |
| `POST /cases/generate` | Requires authentication; validates the premise, requests structured Gemini case JSON, validates consistency, persists the case, and returns its public projection. |
| `GET /cases/:caseId` | Retrieves public briefing, suspects, evidence, and timeline. The canonical solution is excluded. |
| `POST /investigations` | Requires authentication; creates an investigation owned by the current user. |
| `GET /investigations/:id/notes` | Reads notes for an investigation owned by the current user. |
| `PATCH /investigations/:id/notes` | Saves notes for an investigation owned by the current user. |
| `POST /investigations/:id/accusation` | Submits one accusation for an owned investigation. |
| `GET /investigations/:id/result` | Returns the solution only after accusation. |

All mutating API calls require the session-bound `X-CSRF-Token`; the browser client obtains it through `/auth/csrf`. The HTTP-only session cookie is `amr.sid`. Configure HTTPS for production. Case generation is rate limited.
