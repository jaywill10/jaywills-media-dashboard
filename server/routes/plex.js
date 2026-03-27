const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const BASE = () => process.env.PLEX_URL;
const TOKEN = () => process.env.PLEX_TOKEN;
const plexHeaders = () => ({
  'X-Plex-Token': TOKEN(),
  'Accept': 'application/json',
  'X-Plex-Client-Identifier': 'zm-media-dashboard',
  'X-Plex-Product': 'ZM Media Dashboard',
});

async function plexFetch(path) {
  const sep = path.includes('?') ? '&' : '?';
  const url = `${BASE()}${path}${sep}X-Plex-Token=${TOKEN()}`;
  const res = await fetch(url, { headers: plexHeaders() });
  if (!res.ok) throw Object.assign(new Error('Plex error'), { status: res.status });
  return res.json();
}

// GET /api/plex/sessions - who is currently watching
router.get('/sessions', async (req, res, next) => {
  try { res.json(await plexFetch('/status/sessions')); } catch (e) { next(e); }
});

// GET /api/plex/libraries
router.get('/libraries', async (req, res, next) => {
  try { res.json(await plexFetch('/library/sections')); } catch (e) { next(e); }
});

// GET /api/plex/library/:id/all - items in a library section
router.get('/library/:id/all', async (req, res, next) => {
  try {
    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;
    res.json(await plexFetch(`/library/sections/${req.params.id}/all?X-Plex-Container-Start=${offset}&X-Plex-Container-Size=${limit}`));
  } catch (e) { next(e); }
});

// GET /api/plex/library/:id/recentlyadded
router.get('/library/:id/recentlyadded', async (req, res, next) => {
  try { res.json(await plexFetch(`/library/sections/${req.params.id}/recentlyAdded?X-Plex-Container-Size=20`)); } catch (e) { next(e); }
});

// GET /api/plex/recentlyadded - across all libraries
router.get('/recentlyadded', async (req, res, next) => {
  try { res.json(await plexFetch(`/library/recentlyAdded?X-Plex-Container-Size=30`)); } catch (e) { next(e); }
});

// GET /api/plex/search?query=
router.get('/search', async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'query required' });
    res.json(await plexFetch(`/search?query=${encodeURIComponent(query)}`));
  } catch (e) { next(e); }
});

// POST /api/plex/playback/:sessionId/stop
router.post('/playback/:sessionId/stop', async (req, res, next) => {
  try {
    await fetch(`${BASE()}/status/sessions/terminate?sessionId=${req.params.sessionId}&reason=${encodeURIComponent(req.body.reason || 'Stopped by admin')}&X-Plex-Token=${TOKEN()}`, { method: 'GET', headers: plexHeaders() });
    res.json({ message: 'Session stopped' });
  } catch (e) { next(e); }
});

// GET /api/plex/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [sessions, libraries] = await Promise.all([
      plexFetch('/status/sessions'),
      plexFetch('/library/sections'),
    ]);
    res.json({
      activeSessions: sessions.MediaContainer?.size || 0,
      sessions: sessions.MediaContainer?.Metadata || [],
      libraryCount: libraries.MediaContainer?.size || 0,
    });
  } catch (e) { next(e); }
});

module.exports = router;
