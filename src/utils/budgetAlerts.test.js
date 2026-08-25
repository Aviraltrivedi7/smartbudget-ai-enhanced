import assert from 'node:assert/strict';
import test from 'node:test';

const createStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
};

test('budget alerts persist once, expose unread state, and can be marked read', async () => {
  global.window = { localStorage: createStorage() };
  const alerts = await import(`./budgetAlerts.js?test=${Date.now()}`);
  const input = [{ id: 'august-2026:food:5000', month: 'august-2026', category: 'Food', spent: 7700, budget: 5000, overagePercent: 54 }];

  const first = alerts.upsertBudgetAlerts(input);
  assert.equal(first.length, 1);
  assert.equal(first[0].read, false);
  assert.equal(alerts.unreadBudgetAlertCount(), 1);

  const duplicate = alerts.upsertBudgetAlerts(input);
  assert.equal(duplicate.length, 1);

  alerts.markBudgetAlertsRead();
  assert.equal(alerts.unreadBudgetAlertCount(), 0);
  assert.equal(alerts.readBudgetAlerts()[0].read, true);

  delete global.window;
});
