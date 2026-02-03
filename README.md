# Pastebin-Lite

A lightweight pastebin application with time-based (TTL) and view-count expiry. Create text pastes, get shareable URLs, and view them. Pastes expire when either the TTL is reached or the view limit is exceeded.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** React, Bootstrap
- **Persistence:** Neon Postgres (or any compatible PostgreSQL)

## Running Locally

### Prerequisites

- Node.js 18+
- PostgreSQL database (e.g. [Neon](https://neon.tech))

### Setup

1. Clone the repository and install dependencies:

   ```bash
   npm run install:all
   ```

2. Create a `.env` file in the `server` directory (or set environment variables):

   ```
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   PORT=3000
   BASE_URL=<your-deployed-domain>
   ```

   **BASE_URL** must be set to the deployed domain. For local development only, you may use a local URL.

   For Neon, get your connection string from the Neon dashboard.

3. Build the frontend:

   ```bash
   npm run build
   ```

4. Start the server:

   ```bash
   npm start
   ```

   Or for development (backend with watch, frontend with HMR):

   ```bash
   npm run dev
   ```

   In dev mode, set `VITE_API_URL` to the backend URL for the proxy.

5. Access the app at the URL defined by your deployment (same domain serves API and frontend).

### Environment Variables

| Variable      | Description                                         |
|---------------|-----------------------------------------------------|
| DATABASE_URL  | PostgreSQL connection string                        |
| PORT          | Server port (default: 3000)                         |
| BASE_URL      | Public domain for paste links (required for deploy) |
| TEST_MODE     | Set to `1` for deterministic time                   |

## API

- `GET /api/healthz` – Health check
- `POST /api/pastes` – Create paste
- `GET /api/pastes/:id` – Fetch paste (counts as one view)
- `GET /p/:id` – View paste (HTML)

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── README.md
└── package.json
```
