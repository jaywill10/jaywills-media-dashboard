# ZM Media Dashboard

A unified media server dashboard with JWT authentication, a SQLite database, and a full dark-themed SPA frontend. Integrates with **Sonarr**, **Radarr**, **Plex**, **Tautulli**, **SABnzbd**, and **Overseerr**.

---

## Stack

- **Backend** — Node.js + Express, `better-sqlite3`, `bcryptjs`, `jsonwebtoken`
- **Frontend** — Vanilla JS SPA (no build step), Cabinet Grotesk + Satoshi fonts, orange `#f97316` accent
- **Auth** — JWT stored in memory (no cookies), 7-day expiry
- **Image** — `ghcr.io/jaywill10/jaywills-media-dashboard:latest` (linux/amd64 + linux/arm64)

---

## Unraid Setup (Recommended)

This is the fastest way to get running on Unraid using the pre-built GHCR image.

### 1. Add the container via Unraid Docker UI

In Unraid → **Docker** → **Add Container**, fill in:

| Field | Value |
|-------|-------|
| **Name** | `jaywills-media-dashboard` |
| **Repository** | `ghcr.io/jaywill10/jaywills-media-dashboard:latest` |
| **Network Type** | `bridge` |
| **Port** | Host: `3000` → Container: `3000` |
| **Path** | Host: `/mnt/user/appdata/media-dashboard/data` → Container: `/app/data` |

### 2. Add environment variables

In the **Extra Parameters** or **Environment Variables** section, add:

| Variable | Value |
|----------|-------|
| `JWT_SECRET` | A long random string (required) |
| `NODE_ENV` | `production` |
| `DB_PATH` | `/app/data/dashboard.db` |
| `SONARR_URL` | `http://YOUR_UNRAID_IP:8989` |
| `SONARR_API_KEY` | Your Sonarr API key |
| `RADARR_URL` | `http://YOUR_UNRAID_IP:7878` |
| `RADARR_API_KEY` | Your Radarr API key |
| `PLEX_URL` | `http://YOUR_UNRAID_IP:32400` |
| `PLEX_TOKEN` | Your Plex token |
| `TAUTULLI_URL` | `http://YOUR_UNRAID_IP:8181` |
| `TAUTULLI_API_KEY` | Your Tautulli API key |
| `SABNZBD_URL` | `http://YOUR_UNRAID_IP:8080` |
| `SABNZBD_API_KEY` | Your SABnzbd API key |
| `OVERSEERR_URL` | `http://YOUR_UNRAID_IP:5055` |
| `OVERSEERR_API_KEY` | Your Overseerr API key |

### 3. Seed the database (first run only)

After the container starts, open the **Unraid terminal** and run:

```bash
docker exec -it jaywills-media-dashboard node scripts/seed.js
```

This creates the database and the initial admin account:

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

> ⚠️ **Change the password immediately** after first login via Settings → Users.

### 4. Access the dashboard

Open `http://YOUR_UNRAID_IP:3000` in your browser.

---

## Docker Compose (Non-Unraid)

```bash
git clone https://github.com/jaywill10/jaywills-media-dashboard.git
cd jaywills-media-dashboard
cp .env.example .env          # edit at minimum: JWT_SECRET
docker compose up -d
docker exec -it jaywills-media-dashboard node scripts/seed.js
```

Open `http://localhost:3000`.

---

## Manual / Local Dev Setup

```bash
git clone https://github.com/jaywill10/jaywills-media-dashboard.git
cd jaywills-media-dashboard
npm install
cp .env.example .env          # edit JWT_SECRET at minimum
node scripts/seed.js          # creates data/dashboard.db + admin user
npm start                     # or: npm run dev (nodemon)
```

---

## Updating on Unraid

Pull the latest image and recreate the container:

```bash
docker pull ghcr.io/jaywill10/jaywills-media-dashboard:latest
docker stop jaywills-media-dashboard
docker rm jaywills-media-dashboard
# re-apply your settings in the Unraid Docker UI and click Apply
```

Or if using Unraid's Community Applications / Docker Compose manager, it handles this automatically.

---

## GHCR Image Tags

| Tag | Description |
|-----|-------------|
| `latest` | Latest build from `main` branch |
| `main` | Same as `latest` |
| `v1.0.0` | Specific release tag |

Image URL: `ghcr.io/jaywill10/jaywills-media-dashboard`

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
├── .github/workflows/
│   └── docker-publish.yml   # Auto-builds & pushes to GHCR on every push to main
├── public/              # Frontend SPA (served as static files)
│   ├── index.html       # App shell + design system CSS
│   ├── js/app.js        # Complete SPA (login, dashboard, all pages)
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
├── data/                # SQLite database (git-ignored, mounted as volume)
├── .env.example         # Environment variable template
├── docker-compose.yml   # Compose using GHCR image
└── Dockerfile
```

---

## License

MIT
