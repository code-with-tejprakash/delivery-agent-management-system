const test = require('node:test');
const assert = require('node:assert/strict');
const policy = require('../src/services/cache-policy');

test('list and item caches have explicit TTLs', () => {
  assert.equal(policy.listTtlSeconds, 60);
  assert.equal(policy.itemTtlSeconds, 120);
});

test('writes invalidate both list and item namespaces', () => {
  assert.deepEqual(policy.invalidationPatterns, [
    'delivery-agents:agents:list:*',
    'delivery-agents:agents:item:*'
  ]);
});
