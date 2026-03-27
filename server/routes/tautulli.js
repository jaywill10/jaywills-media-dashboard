const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const BASE = () => `${process.env.TAUTULLI_URL}/api/v2`;
const KEY = () => process.env.TAUTULLI_API_KEY;

async function tautFetch(cmd, extra = '') {
  const url = `${BASE()}?apikey=${KEY()}&cmd=${cmd}${extra}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.response?.data || data;
}

// GET /api/tautulli/activity
router.get('/activity', async (req, res, next) => {
  try { res.json(await tautFetch('get_activity')); } catch (e) { next(e); }
});

// GET /api/tautulli/history
router.get('/history', async (req, res, next) => {
  try {
    const { length = 20, start = 0 } = req.query;
    res.json(await tautFetch('get_history', `&length=${length}&start=${start}`));
  } catch (e) { next(e); }
});

// GET /api/tautulli/home_stats
router.get('/home_stats', async (req, res, next) => {
  try { res.json(await tautFetch('get_home_stats', '&time_range=30&stats_count=5')); } catch (e) { next(e); }
});

// GET /api/tautulli/plays_by_date
router.get('/plays_by_date', async (req, res, next) => {
  try { res.json(await tautFetch('get_plays_by_date', '&time_range=30')); } catch (e) { next(e); }
});

// GET /api/tautulli/users
router.get('/users', async (req, res, next) => {
  try { res.json(await tautFetch('get_users')); } catch (e) { next(e); }
});

// GET /api/tautulli/user_stats/:user_id
router.get('/user_stats/:user_id', async (req, res, next) => {
  try { res.json(await tautFetch('get_user_watch_time_stats', `&user_id=${req.params.user_id}`)); } catch (e) { next(e); }
});

// GET /api/tautulli/libraries
router.get('/libraries', async (req, res, next) => {
  try { res.json(await tautFetch('get_libraries_table')); } catch (e) { next(e); }
});

module.exports = router;
