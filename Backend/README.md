# TTE-web Backend

This repository contains the **backend server** for the TTE-web project, which exposes a RESTful API used by the frontend application.

## 🧱 Technologies

- Node.js
- Express
- Sequelize (or custom DB layer)
- JWT for authentication
- (Any other stack details you want to mention)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- A running database (e.g. PostgreSQL, MySQL, SQLite)

### Installation

```bash
cd Backend
npm install
```

### Configuration

Create a `.env` file in `Backend/` (or modify `config/db.js`) with your database credentials and JWT secret, for example:

```
DB_HOST=localhost
DB_USER=username
DB_PASS=password
DB_NAME=tte_db
JWT_SECRET=your_secret_here
PORT=5000
```

> **CORS:** the backend is configured to accept requests only from the frontend server running at `http://localhost:3000`.

### Running the Server

```bash
npm run dev    # starts the development server with nodemon
# or
npm start      # starts the server normally
```

By default the server listens on `http://localhost:5000`.

## 📁 Directory Structure

```
Backend/
  controllers/      # route handlers
  middleware/       # auth and admin checks
  models/           # database models and init
  routes/           # Express routes
  config/           # database configuration
  uploads/          # uploaded files
  utils/            # helper functions
  server.js         # entry point
```

## 🔧 Common Scripts

- `npm run dev` – start in development mode with auto-reload
- `npm start` – start production server

## 📝 Notes

This backend is meant for demonstration/assignment purposes. Adjust configurations and dependencies as needed for production.

