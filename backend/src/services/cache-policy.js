// Cache policy reference used by documentation/tests.
// List queries have 60-second TTL; item details have 120-second TTL.
// All write operations invalidate both list and item namespaces.
module.exports = Object.freeze({
  listTtlSeconds: 60,
  itemTtlSeconds: 120,
  invalidationPatterns: ['delivery-agents:agents:list:*', 'delivery-agents:agents:item:*']
});
