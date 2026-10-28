const { createClient } = require('redis');

let client;
let connectPromise;

async function getRedis() {
  if (!process.env.REDIS_URL) return null;
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => console.error('[redis]', err.message));
  }
  if (!client.isOpen) {
    if (!connectPromise) {
      connectPromise = client.connect().catch((err) => {
        console.error('[redis] connection unavailable:', err.message);
        return null;
      }).finally(() => { connectPromise = null; });
    }
    await connectPromise;
  }
  return client.isReady ? client : null;
}

async function closeRedis() {
  if (client?.isOpen) await client.quit();
  client = undefined;
  connectPromise = undefined;
}

module.exports = { getRedis, closeRedis };
