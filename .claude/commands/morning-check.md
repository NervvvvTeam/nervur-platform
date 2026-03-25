# Morning Check — NERVÜR Platform

Quick daily health check to run at the start of each session.

## Steps:

### 1. Backend Status
- Check if Railway is running: curl https://nervurapi-production.up.railway.app/api/health
- Verify MongoDB is connected
- Check for any deployment errors in Railway logs

### 2. Frontend Status
- Verify https://nervur.fr loads correctly
- Verify https://nervur.fr/app/login loads
- Check Netlify deploy status

### 3. Git Status
- Run `git status` to check for uncommitted changes
- Run `git log --oneline -5` to see recent commits
- Check if local is ahead/behind remote

### 4. Quick Security Check
- Verify no .env files are committed
- Check rate limiting is active
- Verify CORS is restricted

### 5. Report
- All systems GO / issues found
- Suggest priority tasks for the day
