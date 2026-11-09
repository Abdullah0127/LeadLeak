
# LeadLeak - Project Progress

## Project Overview

LeadLeak is a website monitoring and lead-protection SaaS platform.

**Main goal:** Never lose a lead because of a broken website.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS v4
- React Router DOM

### Backend (Planned)
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT / secure authentication

### Future AI Module
- Ollama
- RAG chatbot
- Website-specific knowledge base

AI development is postponed until the core product is complete.

## Project Architecture

- One login account can access multiple workspaces.
- Workspace types: Business, Developer, Agency.
- Separate dashboards based on workspace type.
- Separate protected admin login at `/admin`.
- Backend will enforce authentication and permissions.
- Monitoring will run through backend background jobs.

## Completed Work

### Phase 1 - Frontend Foundation

- [x] Created React + Vite frontend.
- [x] Installed npm dependencies.
- [x] Installed Tailwind CSS v4.
- [x] Configured Tailwind with Vite.
- [x] Tested Tailwind styling.
- [x] Installed React Router DOM.
- [x] Created initial page components.
- [x] Created AppRoutes.jsx.
- [x] Configured BrowserRouter.
- [x] Tested all five routes.

## Current Routes

| Route | Component |
|---|---|
| / | Home |
| /login | Login |
| /register | Register |
| /dashboard | Dashboard |
| /admin | AdminLogin |

These pages are currently placeholders.

## Pending Work

- [ ] Organize reusable frontend components.
- [ ] Create shared layouts.
- [ ] Establish design system and brand identity.
- [ ] Build professional landing page.
- [ ] Build features and pricing pages.
- [ ] Build login and registration interfaces.
- [ ] Plan SEO and public-page prerendering.
- [ ] Create backend.
- [ ] Implement authentication and workspaces.
- [ ] Implement monitoring engine.
- [ ] Implement email alerts.
- [ ] Build customer and admin dashboards.
- [ ] Add subscriptions and payments.
- [ ] Perform security testing and deployment.

## Important Decisions

- Build locally first.
- Use Git and GitHub for version control.
- Use MongoDB Atlas rather than installing MongoDB on the small VPS.
- Keep AI/RAG separate for future development.
- Prioritize security, performance, responsive design and SEO.
- Use stable, compatible package versions.
- Do not expose private customer data or secrets.

## Last Working State

React + Vite + Tailwind CSS + React Router are working.

Development command:

```bash
cd frontend
npm run dev
```

## Current Phase

Phase 1 - Frontend Foundation

## Next Step

Organize reusable components and establish the LeadLeak design system.
