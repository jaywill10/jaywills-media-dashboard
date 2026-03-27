const express = require('express');
const { getDB } = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();

// GET /api/settings
router.get('/', (req, res) => {
  const db = getDB();
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.json({ settings });
});

// PATCH /api/settings - admin only
router.patch('/', requireAdmin, (req, res) => {
  const db = getDB();
  const update = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime("now"))');
  const updateMany = db.transaction((items) => {
    for (const [key, value] of Object.entries(items)) {
      update.run(key, String(value));
    }
  });
  updateMany(req.body);
  res.json({ message: 'Settings updated' });
});

// GET /api/settings/status - connectivity check for all services
router.get('/status', async (req, res) => {
  const fetch = require('node-fetch');
  const services = [
    { name: 'sonarr', url: process.env.SONARR_URL, path: '/api/v3/system/status', key: process.env.SONARR_API_KEY, paramName: 'apikey' },
    { name: 'radarr', url: process.env.RADARR_URL, path: '/api/v3/system/status', key: process.env.RADARR_API_KEY, paramName: 'apikey' },
    { name: 'overseerr', url: process.env.OVERSEERR_URL, path: '/api/v1/status', key: process.env.OVERSEERR_API_KEY, headerName: 'X-Api-Key' },
    { name: 'sabnzbd', url: process.env.SABNZBD_URL, path: '/sabnzbd/api', key: process.env.SABNZBD_API_KEY, paramName: 'apikey' },
    { name: 'plex', url: process.env.PLEX_URL, path: '/', key: process.env.PLEX_TOKEN, headerName: 'X-Plex-Token' },
    { name: 'tautulli', url: process.env.TAUTULLI_URL, path: '/api/v2', key: process.env.TAUTULLI_API_KEY, paramName: 'apikey' },
  ];

  const results = await Promise.allSettled(
    services.map(async (svc) => {
      if (!svc.url || !svc.key) return { name: svc.name, status: 'not_configured' };
      try {
        const headers = svc.headerName ? { [svc.headerName]: svc.key } : {};
        const paramStr = svc.paramName ? `?${svc.paramName}=${svc.key}&output=json&mode=queue` : '';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        await fetch(`${svc.url}${svc.path}${paramStr}`, { headers, signal: controller.signal });
        clearTimeout(timeout);
        return { name: svc.name, status: 'online' };
      } catch {
        return { name: svc.name, status: 'offline' };
      }
    })
  );

  const statuses = {};
  results.forEach(r => {
    if (r.status === 'fulfilled') statuses[r.value.name] = r.value.status;
  });
  res.json({ statuses });
});

module.exports = router;
