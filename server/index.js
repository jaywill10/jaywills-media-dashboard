require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { initDB } = require('./db');
const authMiddleware = require('./auth');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const sonarrRoutes = require('./routes/sonarr');
const radarrRoutes = require('./routes/radarr');
const overseerrRoutes = require('./routes/overseerr');
const sabnzbdRoutes = require('./routes/sabnzbd');
const plexRoutes = require('./routes/plex');
const tautulliRoutes = require('./routes/tautulli');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initDB();

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://api.fontshare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://api.fontshare.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://api.fontshare.com", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'", "https:"],
      workerSrc: ["'self'", "blob:"],
    },
  },
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' }
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '..', 'public'), {
  etag: true,
  maxAge: '1d'
}));

// Health check (no auth)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Auth routes (no middleware)
app.use('/api/auth', authRoutes);

// Protected API routes
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/sonarr', authMiddleware, sonarrRoutes);
app.use('/api/radarr', authMiddleware, radarrRoutes);
app.use('/api/overseerr', authMiddleware, overseerrRoutes);
app.use('/api/sabnzbd', authMiddleware, sabnzbdRoutes);
app.use('/api/plex', authMiddleware, plexRoutes);
app.use('/api/tautulli', authMiddleware, tautulliRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }
});

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║   ZM Media Dashboard v1.0.0          ║`);
  console.log(`  ║   Running on http://0.0.0.0:${PORT}     ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});

module.exports = app;
