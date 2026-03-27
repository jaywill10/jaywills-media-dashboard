const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const BASE = () => process.env.SONARR_URL;
const KEY = () => process.env.SONARR_API_KEY;
const headers = () => ({ 'X-Api-Key': KEY(), 'Content-Type': 'application/json' });

async function sonarrFetch(path, options = {}) {
  const url = `${BASE()}/api/v3${path}`;
  const res = await fetch(url, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.message || 'Sonarr error'), { status: res.status });
  return data;
}

// GET /api/sonarr/series - all series
router.get('/series', async (req, res, next) => {
  try { res.json(await sonarrFetch('/series')); } catch (e) { next(e); }
});

// GET /api/sonarr/series/:id
router.get('/series/:id', async (req, res, next) => {
  try { res.json(await sonarrFetch(`/series/${req.params.id}`)); } catch (e) { next(e); }
});

// POST /api/sonarr/series - add series
router.post('/series', async (req, res, next) => {
  try {
    const result = await sonarrFetch('/series', { method: 'POST', body: JSON.stringify(req.body) });
    res.status(201).json(result);
  } catch (e) { next(e); }
});

// DELETE /api/sonarr/series/:id
router.delete('/series/:id', async (req, res, next) => {
  try {
    await sonarrFetch(`/series/${req.params.id}?deleteFiles=${req.query.deleteFiles || false}`, { method: 'DELETE' });
    res.json({ message: 'Series deleted' });
  } catch (e) { next(e); }
});

// GET /api/sonarr/queue
router.get('/queue', async (req, res, next) => {
  try { res.json(await sonarrFetch('/queue')); } catch (e) { next(e); }
});

// GET /api/sonarr/calendar
router.get('/calendar', async (req, res, next) => {
  try {
    const start = req.query.start || new Date().toISOString().split('T')[0];
    const end = req.query.end || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    res.json(await sonarrFetch(`/calendar?start=${start}&end=${end}&includeSeries=true`));
  } catch (e) { next(e); }
});

// GET /api/sonarr/search?term=
router.get('/search', async (req, res, next) => {
  try {
    const { term } = req.query;
    if (!term) return res.status(400).json({ error: 'term required' });
    res.json(await sonarrFetch(`/series/lookup?term=${encodeURIComponent(term)}`));
  } catch (e) { next(e); }
});

// GET /api/sonarr/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [series, queue, history] = await Promise.all([
      sonarrFetch('/series'),
      sonarrFetch('/queue'),
      sonarrFetch('/history?pageSize=10&sortKey=date&sortDir=desc'),
    ]);
    res.json({
      totalSeries: series.length,
      monitored: series.filter(s => s.monitored).length,
      queueCount: queue.totalRecords || 0,
      recentHistory: history.records?.slice(0, 5) || []
    });
  } catch (e) { next(e); }
});

// POST /api/sonarr/command - trigger command (refresh, search, etc.)
router.post('/command', async (req, res, next) => {
  try {
    res.json(await sonarrFetch('/command', { method: 'POST', body: JSON.stringify(req.body) }));
  } catch (e) { next(e); }
});

module.exports = router;
