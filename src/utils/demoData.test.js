import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultTransactions, demoTotals, normalizeLegacyDemoSeed, resolveGuestTransactions } from './demoData.js';

test('default demo fixture reconciles August dates, categories, and totals', () => {
  const totals = demoTotals(defaultTransactions);
  const expenseCategories = defaultTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((categories, transaction) => {
      categories[transaction.category] = (categories[transaction.category] || 0) + transaction.amount;
      return categories;
    }, {});

  assert.ok(defaultTransactions.every((transaction) => transaction.date.startsWith('2026-08-')));
  assert.equal(totals.income, 93500);
  assert.equal(totals.expenses, 35000);
  assert.equal(totals.income - totals.expenses, 58500);
  assert.equal(expenseCategories.Other, 5100);
  assert.equal(Object.values(expenseCategories).reduce((sum, amount) => sum + amount, 0), totals.expenses);
});

test('partial legacy demo storage is replaced without losing custom rows', () => {
  const staleRows = [
    { id: '2', title: 'House Rent', amount: 18000, category: 'Rent', date: '2026-07-02', type: 'expense' },
    { id: '3', title: 'Supermarket Groceries', amount: 4500, category: 'Food', date: '2026-07-05', type: 'expense' },
    { id: '4', title: 'Electricity & WiFi', amount: 2400, category: 'Utilities', date: '2026-07-08', type: 'expense' },
    { id: '5', title: 'Freelance Project', amount: 18500, category: 'Income', date: '2026-07-12', type: 'income' },
    { id: '6', title: 'Dining Out', amount: 3200, category: 'Food', date: '2026-07-15', type: 'expense' },
    { id: 'local-1', title: 'Coffee test', amount: 250, category: 'Food', date: '2026-08-23', type: 'expense' },
  ];
  const migrated = normalizeLegacyDemoSeed(staleRows);
  const totals = demoTotals(migrated);

  assert.equal(migrated.length, 9);
  assert.equal(migrated.find((transaction) => transaction.title === 'Coffee test')?.amount, 250);
  assert.ok(migrated.filter((transaction) => /^\d+$/.test(transaction.id)).every((transaction) => transaction.date.startsWith('2026-08-')));
  assert.equal(totals.income, 93500);
  assert.equal(totals.expenses, 35250);
  assert.equal(totals.income - totals.expenses, 58250);
});

test('live-mode guests never inherit the local August demo fixture', () => {
  assert.deepEqual(resolveGuestTransactions(defaultTransactions, { isLiveMode: true }), []);
  assert.deepEqual(resolveGuestTransactions([], { isLiveMode: false }), defaultTransactions);
  assert.deepEqual(resolveGuestTransactions(defaultTransactions, { isLiveMode: false }), defaultTransactions);
});

test('deficit math never clamps the balance or utilization to zero/100', () => {
  const totals = demoTotals([
    { amount: 18500, type: 'income' },
    { amount: 35000, type: 'expense' },
  ]);
  const expenseRatio = Math.round((totals.expenses / totals.income) * 100);

  assert.equal(totals.income - totals.expenses, -16500);
  assert.equal(expenseRatio, 189);
});
