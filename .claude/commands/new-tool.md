# Create New Tool — NERVÜR Platform

Build a complete new SaaS tool for the NERVÜR platform from scratch.

## Arguments:
$ARGUMENTS should contain: tool name, color, description, and key features.

Example: /new-tool "Shield" "#10b981" "Conformité légale" "RGPD scan, mentions légales, cookies"

## Steps:

### 1. Backend
- Create model in server/models/
- Create routes in server/routes/
- Register routes in server/index.js
- Add tool to Subscription model enum
- Add rate limiting for sensitive endpoints
- All routes must use authMiddleware

### 2. Frontend Pages
- Create main dashboard page in src/dashboard/pages/
- Create history/evolution page
- Create any additional sub-pages
- All pages must have SubNav with tool color
- Dark theme: #1e2029 cards, #2a2d3a borders, tool color accents
- Loading skeletons, error states, empty states in French

### 3. Integration
- Add lazy imports and routes in src/App.jsx
- Add to Layout.jsx (TOOL_COLORS, PATH_COLORS, NAV_ICONS, navItems)
- Add to PortalPage.jsx TOOLS array
- Add to LoginPage.jsx tool pills
- Add to ContactPage.jsx SUJETS and TOOLS

### 4. Marketing
- Add to NervurAurora.jsx services section
- Add to NervurAurora.jsx tarifs section
- Update tool counts everywhere
- Add JSON-LD structured data

### 5. Database
- Add subscription for demo user (demo@nervur.fr)
- Add subscription for admin user (admin@nervurpro.com)

### 6. Testing
- Run `npx vite build` to verify no errors
- Test the API endpoint with curl
