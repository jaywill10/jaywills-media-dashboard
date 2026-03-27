const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db');
const authMiddleware = require('../auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const db = getDB();

    // Check if registration is allowed
    const allowReg = db.prepare('SELECT value FROM settings WHERE key = ?').get('allow_registration');
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();

    // First user always becomes admin
    if (userCount.count > 0 && allowReg?.value !== 'true') {
      return res.status(403).json({ error: 'Registration is disabled. Contact your admin.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email || '');
    if (existing) return res.status(409).json({ error: 'Username or email already taken' });

    const hash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    const role = userCount.count === 0 ? 'admin' : 'user';

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, username, email || null, hash, role);

    const token = jwt.sign({ userId: id, username, role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.status(201).json({
      token,
      user: { id, username, email, role }
    });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    db.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?').run(user.id);

    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
