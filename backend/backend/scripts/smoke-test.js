import assert from 'node:assert/strict';

const baseUrl = (process.env.API_BASE_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');
const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
const email = `dhansetu-smoke-${Date.now()}@example.com`;
const password = 'SmokePass123';

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
  });
  const body = await response.json();
  assert.equal(response.ok, true, `${options.method || 'GET'} ${path} failed: ${body.message || response.status}`);
  return { response, body };
};

const health = await request('/health', { headers: { Origin: origin } });
assert.equal(health.body.status, 'OK');
assert.equal(health.response.headers.get('access-control-allow-origin'), origin);

const registration = await request('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ fullName: 'DhanSetu Smoke', email, password }),
});
assert.equal(registration.body.success, true);
assert.ok(registration.body.data?.token);

const listBefore = await request('/api/transactions?limit=100');
assert.equal(listBefore.body.success, true);
assert.ok(Array.isArray(listBefore.body.data?.transactions));

const created = await request('/api/transactions', {
  method: 'POST',
  body: JSON.stringify({ title: 'Backend smoke test', amount: 1, category: 'Travel', type: 'expense', date: '2026-08-23', description: 'Integration verification' }),
});
assert.equal(created.body.data?.title, 'Backend smoke test');

const stats = await request('/api/transactions/stats');
assert.equal(stats.body.success, true);
assert.equal(typeof stats.body.data?.totalExpenses, 'number');

console.log(JSON.stringify({
  ok: true,
  baseUrl,
  corsOrigin: health.response.headers.get('access-control-allow-origin'),
  checks: ['health', 'cors', 'register', 'list transactions', 'create transaction', 'statistics'],
}, null, 2));
