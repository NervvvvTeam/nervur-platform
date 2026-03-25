# Bug Fix Agent — NERVÜR Platform

Scan the entire codebase for bugs, broken features, and code quality issues. Fix everything found.

## Scan process:
1. Run `npx vite build` to check for compilation errors
2. Read every file in src/dashboard/pages/ and check for:
   - Undefined variables or imports
   - Missing error handling (try/catch)
   - Broken API calls (wrong endpoints, missing auth)
   - UI bugs (missing styles, broken layouts)
   - Text encoding issues (garbled characters, \u escapes displaying as text)
   - Hardcoded values that should be dynamic
   - Console.log statements left in production code

3. Read every file in server/routes/ and check for:
   - Unhandled promise rejections
   - Missing error responses
   - Incorrect HTTP status codes
   - Memory leaks (unclosed connections, streams)

4. Check App.jsx for:
   - Missing or duplicate routes
   - Incorrect lazy imports
   - Missing Suspense wrappers

5. Check Layout.jsx for:
   - Missing nav items for active tools
   - Incorrect PATH_COLORS mappings
   - Broken mobile menu

## Fix process:
- Fix every issue found immediately
- Document what was fixed
- Run `npx vite build` again to verify no new errors
