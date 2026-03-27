const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const BASE = () => `${process.env.SABNZBD_URL}/sabnzbd/api`;
const KEY = () => process.env.SABNZBD_API_KEY;

async function sabFetch(mode, extra = '') {
  const url = `${BASE()}?apikey=${KEY()}&output=json&mode=${mode}${extra}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

async function sabPost(params = {}) {
  const form = new URLSearchParams({ apikey: KEY(), output: 'json', ...params });
  const res = await fetch(BASE(), { method: 'POST', body: form });
  return res.json();
}

// GET /api/sabnzbd/queue
router.get('/queue', async (req, res, next) => {
  try { res.json(await sabFetch('queue', `&start=0&limit=50`)); } catch (e) { next(e); }
});

// GET /api/sabnzbd/history
router.get('/history', async (req, res, next) => {
  try { res.json(await sabFetch('history', `&start=0&limit=20`)); } catch (e) { next(e); }
});

// GET /api/sabnzbd/status
router.get('/status', async (req, res, next) => {
  try { res.json(await sabFetch('queue', `&start=0&limit=1`)); } catch (e) { next(e); }
});

// POST /api/sabnzbd/pause
router.post('/pause', async (req, res, next) => {
  try { res.json(await sabPost({ mode: 'pause' })); } catch (e) { next(e); }
});

// POST /api/sabnzbd/resume
router.post('/resume', async (req, res, next) => {
  try { res.json(await sabPost({ mode: 'resume' })); } catch (e) { next(e); }
});

// DELETE /api/sabnzbd/queue/:id
router.delete('/queue/:id', async (req, res, next) => {
  try {
    res.json(await sabPost({ mode: 'queue', name: 'delete', id: req.params.id }));
  } catch (e) { next(e); }
});

// POST /api/sabnzbd/speed - set speed limit (kb/s, 0 = unlimited)
router.post('/speed', async (req, res, next) => {
  try {
    const { limit = 0 } = req.body;
    res.json(await sabPost({ mode: 'config', name: 'speedlimit', value: limit }));
  } catch (e) { next(e); }
});

module.exports = router;
