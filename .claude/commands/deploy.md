# Deploy NERVÜR to production

Commit all changes, push to GitHub, and trigger deploys on both Netlify (frontend) and Railway (backend).

## Steps:
1. Run `git status` to see all changes
2. Stage all changes with `git add -A`
3. Create a descriptive commit message based on the changes
4. Push to GitHub (`git push origin master`)
5. Run `npx @railway/cli up` from the project root to deploy the backend
6. Verify Netlify auto-deploys by checking the build status
7. Test the production URLs:
   - https://nervur.fr (site vitrine)
   - https://nervur.fr/app/login (espace client)
   - https://nervurapi-production.up.railway.app/api/health (API health)
8. Report the deployment status

Always include `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>` in commits.
