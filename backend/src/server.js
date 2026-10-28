require('dotenv').config();
const app = require('./app');
const { closePool } = require('./config/db');
const { closeRedis } = require('./config/redis');

const port = Number(process.env.PORT || 5000);
const server = app.listen(port, () => console.log(`Delivery Agent API listening on http://localhost:${port}`));

async function shutdown(signal) {
  console.log(`${signal} received; shutting down...`);
  server.close(async () => {
    try { await closeRedis(); } catch (e) { console.error(e.message); }
    try { await closePool(); } catch (e) { console.error(e.message); }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
