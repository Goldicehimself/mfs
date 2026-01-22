# MaintainPro Frontend (Vite + React)

Frontend application for MaintainPro with role-based routes, dashboard workflows, and admin/technician portals.

## Requirements
- Node.js 18+
- npm 9+

## Getting Started
```bash
npm install
npm run dev
```

## Common Scripts
```bash
npm run dev      # start Vite dev server
npm run build    # production build
npm run preview  # preview production build
```

## Project Structure
- `MFS/src/pages` - route-level pages
- `MFS/src/components` - shared UI and feature components
- `MFS/src/contexts` - auth, notifications, activity, invitations
- `MFS/src/services` - API/service wrappers
- `MFS/src/routes.jsx` - route definitions and role protection

## Documentation
Start here: `MFS/DOCUMENTATION_INDEX.md`

## Notes
- Tests are not configured yet.
