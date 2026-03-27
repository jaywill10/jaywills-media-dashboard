const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const BASE = () => process.env.OVERSEERR_URL;
const KEY = () => process.env.OVERSEERR_API_KEY;
const headers = () => ({ 'X-Api-Key': KEY(), 'Content-Type': 'application/json' });

async function overseerrFetch(path, options = {}) {
  const url = `${BASE()}/api/v1${path}`;
  const res = await fetch(url, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.message || 'Overseerr error'), { status: res.status });
  return data;
}

// GET /api/overseerr/requests
router.get('/requests', async (req, res, next) => {
  try {
    const { filter = 'all', take = 20, skip = 0 } = req.query;
    res.json(await overseerrFetch(`/request?filter=${filter}&take=${take}&skip=${skip}&sort=added`));
  } catch (e) { next(e); }
});

// POST /api/overseerr/requests
router.post('/requests', async (req, res, next) => {
  try {
    res.json(await overseerrFetch('/request', { method: 'POST', body: JSON.stringify(req.body) }));
  } catch (e) { next(e); }
});

// PUT /api/overseerr/requests/:id/approve
router.put('/requests/:id/approve', async (req, res, next) => {
  try {
    res.json(await overseerrFetch(`/request/${req.params.id}/approve`, { method: 'POST' }));
  } catch (e) { next(e); }
});

// PUT /api/overseerr/requests/:id/decline
router.put('/requests/:id/decline', async (req, res, next) => {
  try {
    res.json(await overseerrFetch(`/request/${req.params.id}/decline`, { method: 'POST' }));
  } catch (e) { next(e); }
});

// DELETE /api/overseerr/requests/:id
router.delete('/requests/:id', async (req, res, next) => {
  try {
    await overseerrFetch(`/request/${req.params.id}`, { method: 'DELETE' });
    res.json({ message: 'Request deleted' });
  } catch (e) { next(e); }
});

// GET /api/overseerr/search?query=
router.get('/search', async (req, res, next) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) return res.status(400).json({ error: 'query required' });
    res.json(await overseerrFetch(`/search?query=${encodeURIComponent(query)}&page=${page}&language=en`));
  } catch (e) { next(e); }
});

// GET /api/overseerr/trending
router.get('/trending', async (req, res, next) => {
  try {
    const [movies, tv] = await Promise.all([
      overseerrFetch('/discover/trending'),
      overseerrFetch('/discover/trending?mediaType=tv'),
    ]);
    res.json({ movies, tv });
  } catch (e) { next(e); }
});

// GET /api/overseerr/stats
router.get('/stats', async (req, res, next) => {
  try { res.json(await overseerrFetch('/request/count')); } catch (e) { next(e); }
});

module.exports = router;
