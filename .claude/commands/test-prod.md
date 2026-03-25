# Test Production — NERVÜR Platform

Test all production endpoints and pages to verify everything works.

## API Tests (use curl against https://nervurapi-production.up.railway.app):
1. `GET /api/health` — Should return status:ok with tools list
2. `POST /api/sentinel-app/auth/login` — Login with demo@nervur.fr / Client1234!
3. Use the returned JWT token for all subsequent authenticated requests
4. `GET /api/sentinel-app/auth/me` — Verify user data + subscriptions returned
5. Test each tool's main endpoint:
   - Sentinel: `GET /api/sentinel-app/businesses`
   - Phantom: `POST /api/phantom/audit` with a test URL
   - Vault: `POST /api/vault/scan` with a test domain
   - Pulse: `GET /api/pulse/sites`
6. `POST /api/contact` — Test contact form submission

## Frontend Tests (check these URLs load):
- https://nervur.fr — Site vitrine loads
- https://nervur.fr/contact — Contact page loads
- https://nervur.fr/app/login — Login page loads
- https://nervur.fr/blog/e-reputation — Blog loads
- https://nervur.fr/blog/cybersecurite — Blog loads
- https://nervur.fr/blog/performance-web — Blog loads

## Report:
- List every endpoint tested with PASS/FAIL
- For failures, explain what went wrong
- Suggest fixes for any issues found
