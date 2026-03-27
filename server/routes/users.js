const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();

// GET /api/users - admin only
router.get('/', requireAdmin, (req, res) => {
  const db = getDB();
  const users = db.prepare('SELECT id, username, email, role, is_active, last_login, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users });
});

// POST /api/users - admin create user
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { username, password, email, role = 'user' } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const db = getDB();
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) return res.status(409).json({ error: 'Username already taken' });

    const hash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    db.prepare('INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(id, username, email || null, hash, role);
    res.status(201).json({ user: { id, username, email, role } });
  } catch (err) { next(err); }
});

// PATCH /api/users/:id - admin update user
router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const db = getDB();
    const { role, is_active, email } = req.body;
    db.prepare('UPDATE users SET role = COALESCE(?, role), is_active = COALESCE(?, is_active), email = COALESCE(?, email), updated_at = datetime("now") WHERE id = ?')
      .run(role || null, is_active !== undefined ? (is_active ? 1 : 0) : null, email || null, req.params.id);
    res.json({ message: 'User updated' });
  } catch (err) { next(err); }
});

// DELETE /api/users/:id - admin delete user
router.delete('/:id', requireAdmin, (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    const db = getDB();
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
