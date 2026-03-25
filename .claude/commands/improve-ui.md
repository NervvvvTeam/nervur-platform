# UI/UX Improvement Agent — NERVÜR Platform

Review and improve the UI/UX across the entire dashboard and marketing site.

## Dashboard (src/dashboard/):
1. **Consistency check** — Verify all pages use the same:
   - Background: #17181f (main), #1e2029 (cards)
   - Borders: #2a2d3a
   - Text colors: #f0f0f3 (headings), #d1d5db (body), #9ca3af (secondary)
   - Tool colors: Sentinel=#ef4444, Phantom=#8b5cf6, Vault=#06b6d4, Pulse=#ec4899
   - Border radius: 10px (cards), 8px (inputs), 6px (small)
   - Box shadows on all cards

2. **Responsive** — Check every page works on mobile (< 768px)
3. **Loading states** — Every page should have skeleton loading
4. **Error states** — Every API call should show user-friendly error messages in French
5. **Empty states** — When no data, show a helpful message with CTA
6. **Hover effects** — All clickable elements should have cursor:pointer and hover feedback
7. **Animations** — Subtle fadeInUp on page load, smooth transitions

## Marketing site (src/NervurAurora.jsx):
1. **Hero section** — Impactful, clear value proposition
2. **Services** — All 4 tools visible with their colors
3. **Pricing** — Clear, no confusion
4. **CTA buttons** — All link to /contact
5. **Footer** — Complete with all links

## Apply all improvements directly. Document changes made.
