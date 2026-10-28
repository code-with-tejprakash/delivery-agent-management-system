require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const agentsRouter = require('./routes/agents');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim())
    : 'http://localhost:5173'
}));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', async (req, res) => {
  const result = { success: true, data: { api: 'ok', mysql: 'unknown', redis: 'optional' } };
  try {
    const { getPool } = require('./config/db');
    await getPool().query('SELECT 1');
    result.data.mysql = 'ok';
  } catch (error) {
    result.success = false;
    result.data.mysql = 'unavailable';
  }
  try {
    const { getRedis } = require('./config/redis');
    const redis = await getRedis();
    result.data.redis = redis ? 'ok' : 'unavailable (cache bypassed)';
  } catch {
    result.data.redis = 'unavailable (cache bypassed)';
  }
  res.status(result.success ? 200 : 503).json(result);
});

app.use('/api/agents', agentsRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
