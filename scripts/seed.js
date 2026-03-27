#!/usr/bin/env node
/**
 * Seed script — creates the SQLite database and inserts a default admin user.
 * Run: node scripts/seed.js
 * Default credentials: admin / admin123
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'dashboard.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('[seed] Created data directory:', dataDir);
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Tables ────────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    avatar TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    last_login TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    entity_name TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    year INTEGER,
    tmdb_id INTEGER,
    tvdb_id INTEGER,
    poster_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    overseerr_id INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

console.log('[seed] Tables created/verified.');

// ── Default settings ──────────────────────────────────────────────────────────

const defaultSettings = [
  ['app_name', 'ZM Media'],
  ['theme', 'dark'],
  ['accent_color', '#f97316'],
  ['allow_registration', 'false'],
  ['notifications_enabled', 'true'],
];

const insertSetting = db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`);
for (const [key, value] of defaultSettings) {
  insertSetting.run(key, value);
}
console.log('[seed] Default settings inserted.');

// ── Admin user ────────────────────────────────────────────────────────────────

const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (existing) {
  console.log('[seed] Admin user already exists — skipping.');
} else {
  const hash = bcrypt.hashSync('admin123', 12);
  const id = uuidv4();
  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, 'admin', 'admin@local.dev', hash, 'admin');
  console.log('[seed] Admin user created:');
  console.log('         Username : admin');
  console.log('         Password : admin123');
  console.log('         ⚠️  Change this password immediately after first login!');
}

db.close();
console.log('[seed] Done. Database ready at:', DB_PATH);
