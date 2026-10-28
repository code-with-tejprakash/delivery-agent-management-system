const { getRedis } = require('../config/redis');

const PREFIX = 'delivery-agents:';

async function cacheGet(key) {
  try {
    const redis = await getRedis();
    if (!redis) return null;
    const value = await redis.get(PREFIX + key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('[cache get]', error.message);
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds) {
  try {
    const redis = await getRedis();
    if (redis) await redis.set(PREFIX + key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.error('[cache set]', error.message);
  }
}

async function invalidateAgentCaches() {
  try {
    const redis = await getRedis();
    if (!redis) return;
    for (const pattern of [`${PREFIX}agents:list:*`, `${PREFIX}agents:item:*`]) {
      let cursor = '0';
      do {
        const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = result.cursor;
        if (result.keys.length) await redis.del(result.keys);
      } while (cursor !== '0');
    }
  } catch (error) {
    console.error('[cache invalidate]', error.message);
  }
}

module.exports = { cacheGet, cacheSet, invalidateAgentCaches };
