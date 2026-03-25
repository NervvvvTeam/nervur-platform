# Security Audit — NERVÜR Platform

Perform a comprehensive security audit of the entire backend and frontend.

## Backend checks (C:\Escriba\AGencer\server\):
1. **Authentication** — Verify ALL routes in server/routes/ have authMiddleware where needed
2. **Open registration** — Check sentinel-auth.js for any public signup/register routes. Only admins should create accounts.
3. **Input validation** — Check every POST/PUT route validates inputs (types, lengths, formats)
4. **NoSQL injection** — Check for user input going directly into MongoDB queries without sanitization
5. **Rate limiting** — Verify rate limiters in server/index.js cover all sensitive endpoints
6. **CORS** — Verify CORS whitelist in server/index.js only allows nervur.fr, nervur.netlify.app, and localhost
7. **JWT** — Verify algorithm pinning (HS256), expiry check, payload validation in middleware/auth.js
8. **Error leakage** — No internal error messages sent to clients
9. **Environment variables** — All secrets in .env, never hardcoded

## Frontend checks:
1. **XSS** — Check for dangerouslySetInnerHTML usage
2. **Token storage** — JWT should be in localStorage, not cookies without httpOnly
3. **API URL** — No hardcoded API URLs (should use VITE_API_URL)

## Report format:
- List every issue found with file:line reference
- Categorize as CRITICAL / IMPORTANT / MINOR
- Fix every issue found immediately
- Generate a final security score (0-100)
