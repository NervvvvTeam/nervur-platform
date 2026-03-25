# Clean Code Agent — NERVÜR Platform

Deep clean the entire codebase. Remove dead code, fix inconsistencies, improve quality.

## Tasks:

### 1. Remove dead files
- Find files in src/dashboard/pages/ that are not imported in App.jsx (dead pages)
- Find files in server/routes/ that are not registered in server/index.js
- Find files in server/models/ that are not imported anywhere
- List them but DON'T delete without confirmation

### 2. Remove dead code within files
- Console.log statements (remove from production code)
- Commented-out code blocks
- Unused imports
- Unused variables/functions

### 3. Fix inconsistencies
- Verify all error messages are in French (not English)
- Verify all date formatting uses French locale
- Verify all currency shows € (not $)
- Verify all text uses proper French characters (é, è, à, etc.)

### 4. Code quality
- Verify all async functions have try/catch
- Verify all fetch calls handle errors
- Verify all forms validate inputs
- Verify no hardcoded API URLs (should use VITE_API_URL)

### 5. Dependencies
- Check package.json for unused dependencies
- Check server/package.json for unused dependencies
- List any that can be removed

### 6. Git cleanup
- Check .gitignore covers: node_modules, dist, .env, .env.local, server/.env, server/node_modules
- Check for any sensitive files (API keys, passwords) committed

## Report everything found. Fix what's safe to fix. List what needs confirmation.
