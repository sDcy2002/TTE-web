# TTE-web Frontend

This folder contains the **Express/EJS server-rendered web interface** for the TTE-store project. All UI templates are stored under `views/` and client logic lives in `public/js`. Static assets such as CSS and images reside in `public/`.

The frontend runs on port **3000** and makes `fetch` calls to the backend API at `http://localhost:5000/api`.

> The previous React/Vite source remains in `src/` for reference but is no longer used; you can delete it once you're satisfied with the EJS migration.

## 💻 Stack

- Node.js
- Express.js (view engine: EJS)
- Vanilla JavaScript for client-side interactions
- Simple CSS (no build step)

## 🎯 Features

- Product listing with categories and search
- Shopping cart with realtime quantity updates
- User registration/login via JWT stored in `localStorage`
- Profile page & order history
- Basic admin dashboard entry point

## ⚙️ Setup & Run

### Prerequisites

- Node.js 14+ (or later)
- npm (or yarn)

### Install

```bash
cd frontend
npm install
```

### Start Development

```bash
npm run dev    # uses nodemon, listens on http://localhost:3000
# or
npm start      # plain node
```

The server serves the EJS pages and static files directly; there is no separate build process.

### Configuration

A `.env` file can be added to override defaults (such as `PORT` or API base URL). Example:

```
PORT=3000
API_BASE=http://localhost:5000/api
```

CORS settings are handled by the backend; the frontend does not require special config.

## 📁 Structure

```
frontend/
  server.js            # express bootstrap
  views/               # EJS templates (partials + pages)
  public/
    css/               # stylesheets
    js/                # client-side scripts
    uploads/           # (optional) static uploads
  package.json
  README.md
``` 

### Cleanup

- Feel free to remove `src/`, `vite.config.js`, and React-related deps from `package.json` once they are no longer needed.

## 📝 Notes

This frontend is intentionally simple; adjust styling, validation, and security for production. 
LocalStorage is used for cart/auth state; consider migrating to cookies or a session store for real deployments.

When deploying, update API URLs and enable HTTPS as appropriate.

