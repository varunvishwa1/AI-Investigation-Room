# Architecture

Vite hosts the React client at the repository root. Express lives in `server/src` and exposes the versioned API.

```text
React/Vite -> Express session + CSRF -> validation -> domain controllers/services
                                                   -> Google GenAI SDK (server only)
                                                   -> Mongoose -> MongoDB
```

Authentication uses bcrypt password hashes and HTTP-only server sessions persisted in MongoDB. Investigation records are owned by a user ID. CSRF tokens are bound to the session for mutating requests. Dashboard statistics are derived from those stored records.

Case generation is server-owned: validate the request, ask Gemini for structured case JSON, parse and validate schema and references, repair once with targeted validation feedback, then save. A case is returned only after a successful database write. The public serializer removes the solution, which Mongoose also excludes by default.

These structural checks do not prove every generated narrative is fair or solvable; cases still need human review. Accusations are checked against the server-held solution. A conditional update transitions an investigation from active to completed once. The result endpoint refuses access before that transition.

`src/mockCase.js` is imported only behind `import.meta.env.DEV`, at `/sample`. Vite removes it from production bundles. Real cases go through the API.
