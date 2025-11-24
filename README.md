# Eclip.pro Frontend (Single-App, Stable)

This is a clean, stable Next.js 14 frontend using the **pages** router.

- Landing page at `/` with logo, banner, login/register buttons, and stats placeholders.
- Auth placeholders at `/login` and `/register`.
- Dashboard at `/dashboard`.
- Shell pages for `/leaderboards`, `/shop`, `/forum`, `/chat`, `/settings`, `/admin`.
- Sidebar layout shown on all non-landing routes, hidden on `/`.
- Tailwind CSS configured via `tailwind.config.js` and `src/styles/globals.css`.
- Custom 404 and 500 pages.
- Health check endpoint at `/api/health`.

To run locally:
1. `npm install`
2. `npm run dev`

To deploy on Vercel:
- Set project root to this folder.
- Build command: `npm run build`
- Output: default (Next.js).
