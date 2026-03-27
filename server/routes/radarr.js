const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const BASE = () => process.env.RADARR_URL;
const KEY = () => process.env.RADARR_API_KEY;
const headers = () => ({ 'X-Api-Key': KEY(), 'Content-Type': 'application/json' });

async function radarrFetch(path, options = {}) {
  const url = `${BASE()}/api/v3${path}`;
  const res = await fetch(url, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.message || 'Radarr error'), { status: res.status });
  return data;
}

router.get('/movies', async (req, res, next) => {
  try { res.json(await radarrFetch('/movie')); } catch (e) { next(e); }
});

router.get('/movies/:id', async (req, res, next) => {
  try { res.json(await radarrFetch(`/movie/${req.params.id}`)); } catch (e) { next(e); }
});

router.post('/movies', async (req, res, next) => {
  try {
    const result = await radarrFetch('/movie', { method: 'POST', body: JSON.stringify(req.body) });
    res.status(201).json(result);
  } catch (e) { next(e); }
});

router.delete('/movies/:id', async (req, res, next) => {
  try {
    await radarrFetch(`/movie/${req.params.id}?deleteFiles=${req.query.deleteFiles || false}`, { method: 'DELETE' });
    res.json({ message: 'Movie deleted' });
  } catch (e) { next(e); }
});

router.get('/queue', async (req, res, next) => {
  try { res.json(await radarrFetch('/queue')); } catch (e) { next(e); }
});

router.get('/calendar', async (req, res, next) => {
  try {
    const start = req.query.start || new Date().toISOString().split('T')[0];
    const end = req.query.end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    res.json(await radarrFetch(`/calendar?start=${start}&end=${end}`));
  } catch (e) { next(e); }
});

router.get('/search', async (req, res, next) => {
  try {
    const { term } = req.query;
    if (!term) return res.status(400).json({ error: 'term required' });
    res.json(await radarrFetch(`/movie/lookup?term=${encodeURIComponent(term)}`));
  } catch (e) { next(e); }
});

router.get('/stats', async (req, res, next) => {
  try {
    const [movies, queue] = await Promise.all([
      radarrFetch('/movie'),
      radarrFetch('/queue'),
    ]);
    res.json({
      totalMovies: movies.length,
      monitored: movies.filter(m => m.monitored).length,
      downloaded: movies.filter(m => m.hasFile).length,
      missing: movies.filter(m => m.monitored && !m.hasFile).length,
      queueCount: queue.totalRecords || 0,
    });
  } catch (e) { next(e); }
});

router.post('/command', async (req, res, next) => {
  try {
    res.json(await radarrFetch('/command', { method: 'POST', body: JSON.stringify(req.body) }));
  } catch (e) { next(e); }
});

module.exports = router;
