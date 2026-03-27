# ZM Media Dashboard

A unified media server dashboard with JWT authentication, a SQLite database, and a full dark-themed SPA frontend. Integrates with **Sonarr**, **Radarr**, **Plex**, **Tautulli**, **SABnzbd**, and **Overseerr**.

---

## Stack

- **Backend** — Node.js + Express, `better-sqlite3`, `bcryptjs`, `jsonwebtoken`
- **Frontend** — Vanilla JS SPA (no build step), Cabinet Grotesk + Satoshi fonts, orange `#f97316` accent
- **Auth** — JWT stored in memory (no cookies), 7-day expiry

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/jaywill10/jaywills-media-dashboard.git
cd jaywills-media-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set at minimum:

```dotenv
PORT=3000
JWT_SECRET=change-this-to-a-long-random-string
```

Fill in your service URLs and API keys for any services you want to connect.

### 4. Seed the database

```bash
node scripts/seed.js
```

This creates `data/dashboard.db` with all tables and an initial admin account:

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

> **Change the password immediately** after your first login via Settings → Users.

### 5. Start the server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development

```bash
npm run dev   # starts with nodemon (auto-restart on changes)
```

---

## Docker

```bash
docker compose up -d
```

The compose file mounts `./data` for the SQLite database and reads your `.env` file automatically.

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/login` | No | Login, returns JWT |
| `POST` | `/api/auth/register` | No | Register (first user becomes admin) |
| `GET` | `/api/auth/me` | Yes | Current user info |
| `GET` | `/api/settings` | Yes | Fetch all settings |
| `PUT` | `/api/settings` | Yes | Update settings |
| `GET` | `/api/users` | Yes (admin) | List users |
| `GET` | `/api/sonarr/status` | Yes | Sonarr system status |
| `GET` | `/api/radarr/status` | Yes | Radarr system status |
| `GET` | `/api/plex/status` | Yes | Plex server status |
| `GET` | `/api/tautulli/status` | Yes | Tautulli status |
| `GET` | `/api/sabnzbd/status` | Yes | SABnzbd queue/status |
| `GET` | `/api/overseerr/status` | Yes | Overseerr status |

All protected routes require `Authorization: Bearer <token>` header.

---

## Project Structure

```
.
├── public/              # Frontend SPA (served as static files)
│   ├── index.html       # App shell + design system CSS
│   ├── js/app.js        # Complete SPA (login, dashboard, all pages)
│   ├── css/             # (additional stylesheets if any)
│   ├── manifest.json    # PWA manifest
│   └── sw.js            # Service worker
├── server/
│   ├── index.js         # Express app entry point
│   ├── db.js            # SQLite setup via better-sqlite3
│   ├── auth.js          # JWT middleware
│   ├── routes/          # API route handlers
│   └── middleware/      # Error handler etc.
├── scripts/
│   └── seed.js          # DB init + admin user creation
├── data/                # SQLite database (git-ignored)
├── .env.example         # Environment variable template
├── docker-compose.yml
└── Dockerfile
```

---

## License

MIT
