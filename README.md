# AI Mystery Room

An interactive fictional mystery game with cinematic landing pages, account registration and sign-in, beginner onboarding, and a private investigation desk. Cases are generated through Gemini, checked and stored by the Express API, and accusations are evaluated on the server.

## Stack

- React, Vite, and React Router
- Node.js and Express 5
- MongoDB and Mongoose
- Google GenAI JavaScript SDK (`@google/genai`)
- Server-side sessions, bcrypt password hashing, and CSRF protection

## Run locally

Use Node.js 20 or newer, npm, MongoDB, and a Gemini API key.

1. Run `npm install`.
2. Copy `server/.env.example` to `server/.env`, then configure `MONGODB_URI`, `GEMINI_API_KEY`, `GEMINI_MODEL`, and a long random `SESSION_SECRET`.
3. Run the API with `npm run dev:server`.
4. In another terminal, run `npm run dev`.
5. Open the Vite URL, usually `http://localhost:5173`.

The frontend uses `http://localhost:5000/api/v1` by default. Set `VITE_API_BASE_URL` in the root `.env` to override it. Provider keys and session secrets belong only in `server/.env`; never add them to the frontend environment. Both `.env` files are ignored by Git.

The API health endpoint is `GET http://localhost:5000/api/v1/health`. Production frontend assets can be built with `npm run build`; run the API with `npm run start:server`.

## Accounts and onboarding

Registration requires a display name, a valid email, and a password with at least 10 characters including uppercase, lowercase, and a number. The API stores a bcrypt hash and uses an HTTP-only session cookie. Sessions are persisted to MongoDB. Mutating requests use a session-bound CSRF token.

The first sign-in leads to the beginner field guide: a desk tour, a deterministic training mystery, and an evidence-first method. Progress is saved to the user account. Password reset UI is present, but email delivery requires configuring a provider and currently reports that it is unavailable.

## Development sample

In development only, `/sample` opens the sample investigation. It is loaded from `src/mockCase.js` and excluded from production bundles. Real cases require a signed-in account and use the API.

## Checks

- `npm run test:server` — backend API and unit checks
- `npm run build` — production frontend bundle

The automated checks do not require a live Gemini key or MongoDB connection. Live registration, case generation, and persistence do.

## Current scope

Solo investigations, account flows, and beginner onboarding are implemented. Team modes are marked as coming soon. The in-game AI assistant is disclosed as unavailable rather than returning fabricated answers. Password reset email delivery needs an email provider. Evidence media is currently described in text.

See [`spec.md`](./spec.md) and [`docs/`](./docs/) for product requirements and technical notes.

## Google sign-in setup

Create an OAuth 2.0 **Web application** client in Google Cloud. Add `http://localhost:5173` as an authorized JavaScript origin. Copy the same client ID into `GOOGLE_CLIENT_ID` in `server/.env` and `VITE_GOOGLE_CLIENT_ID` in the root `.env`, then restart both development servers. The server verifies Google ID tokens and requires a verified email. New Google accounts must accept the app terms first. Never put a Google client secret in the frontend; this flow uses only the public client ID.

The login screen shows a disabled Google setup button until the frontend client ID is configured.

## MongoDB requirement

The API must connect to MongoDB before it starts. Start a local MongoDB service, or set `MONGODB_URI` in `server/.env` to a reachable MongoDB deployment. If the API logs a MongoDB connection failure, account registration and sign-in cannot complete; check that the database is running and reachable from this machine.

## LAN access

The Vite development server is exposed on the local network. When `VITE_API_BASE_URL` points to the default local API (`localhost:5000`), browser requests use Vite's same-origin `/api/v1` proxy, which forwards to the API on the same computer. This avoids browser CORS and LAN firewall issues on port 5000. MongoDB must still be reachable by the API process.