# TTE-web Monorepo

This workspace contains two independent projects:

- **Backend/** – Express API server running on port 5000.
- **Frontend/** – Express/EJS web interface running on port 3000, consuming the backend API.

Both folders have their own `package.json` and may be started separately (see their READMEs for details).

## Quick start

```bash
# backend
cd Backend && npm install && npm run dev

# frontend (in a new terminal)
cd frontend && npm install && npm run dev
```

Navigate to http://localhost:3000 for the user interface; API endpoints are at http://localhost:5000/api.

CORS is configured so that only the frontend origin is allowed. The previous React/Vite frontend has been removed and replaced with server-rendered EJS templates — you may safely delete `frontend/src` and uninstall unused packages once the migration is complete.

### Cleanup notes

If you're no longer using the old React code, run:
```bash
cd frontend && rm -rf src vite.config.js
```
and remove React-related dependencies from `frontend/package.json`.

