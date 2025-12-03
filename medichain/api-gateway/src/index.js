require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Rate limiter
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Health and metrics
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway' }));
app.get('/metrics', (req, res) => res.json({ uptime: process.uptime(), now: Date.now() }));

// Simple JWT verification middleware
const verifyJwt = (req, res, next) => {
  // Skip verification for public endpoints
  const publicPaths = ['/health', '/metrics', '/auth/']; // auth routes are proxied too
  if (publicPaths.some(p => req.path.startsWith(p))) return next();

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token', details: err.message });
  }
};

// Apply JWT middleware to all proxied routes except auth public endpoints
app.use('/api', verifyJwt);

// Helper to create proxy with pathRewrite
const proxyOptions = (target, pathRewrite = {}) => ({
  target,
  changeOrigin: true,
  secure: false,
  proxyTimeout: 30000,
  timeout: 30000,
  onProxyReq(proxyReq, req, res) {
    // forward user id if available
    if (req.user && req.user.userId) {
      proxyReq.setHeader('x-user-id', req.user.userId);
    }
  },
  pathRewrite
});

// Routes (prefix /api)
app.use('/api/auth', createProxyMiddleware(proxyOptions(process.env.AUTH_URL, {'^/api/auth': ''})));
app.use('/api/orders', createProxyMiddleware(proxyOptions(process.env.ORDER_URL, {'^/api/orders': ''})));
app.use('/api/notifications', createProxyMiddleware(proxyOptions(process.env.NOTIF_URL, {'^/api/notifications': ''})));
app.use('/api/pharmacist', createProxyMiddleware(proxyOptions(process.env.PHARMACY_URL, {'^/api/pharmacist': ''})));
app.use('/api/ai', createProxyMiddleware(proxyOptions(process.env.AI_URL, {'^/api/ai': ''})));

// Fallback: show info
app.use('/', (req, res) => {
  res.json({
    message: 'MediChain API Gateway',
    routes: ['/api/auth', '/api/orders', '/api/notifications', '/api/pharmacist', '/api/ai', '/health']
  });
});

// Start
const PORT = process.env.PORT || 4010;
app.listen(PORT, () => console.log(`API Gateway listening on ${PORT}`));
