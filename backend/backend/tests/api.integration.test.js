import request from 'supertest';
import app from '../server.js';

describe('DhanSetu AI backend integration', () => {
  const email = `jest-${Date.now()}@example.com`;
  const password = 'JestPass123';
  let token;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Jest User', email, password });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toEqual(expect.any(String));
    token = response.body.data.token;
  });

  it('reports a healthy DhanSetu AI service', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'OK',
      message: 'DhanSetu AI Backend is running!',
    });
    expect(response.body.timestamp).toEqual(expect.any(String));
  });

  it('returns the authenticated demo profile', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      email,
      fullName: 'Jest User',
    });
  });

  it('supports isolated transaction CRUD, filtering, and statistics', async () => {
    const auth = { Authorization: `Bearer ${token}` };
    const initial = await request(app).get('/api/transactions').set(auth);

    expect(initial.status).toBe(200);
    expect(initial.body.data.transactions).toEqual([]);

    const income = await request(app)
      .post('/api/transactions')
      .set(auth)
      .send({
        title: 'Salary',
        amount: 75000,
        category: 'Income',
        type: 'income',
        date: '2026-08-01',
      });
    const expense = await request(app)
      .post('/api/transactions')
      .set(auth)
      .send({
        title: 'Groceries',
        amount: 2500,
        category: 'Food',
        type: 'expense',
        date: '2026-08-03',
      });

    expect(income.status).toBe(201);
    expect(expense.status).toBe(201);
    expect(income.body.data.id).toEqual(expect.any(String));
    expect(expense.body.data.category).toBe('Food');

    const filtered = await request(app)
      .get('/api/transactions?category=food')
      .set(auth);
    expect(filtered.status).toBe(200);
    expect(filtered.body.data.transactions).toHaveLength(1);
    expect(filtered.body.data.transactions[0].title).toBe('Groceries');

    const stats = await request(app).get('/api/transactions/stats').set(auth);
    expect(stats.status).toBe(200);
    expect(stats.body.data).toMatchObject({
      totalIncome: 75000,
      totalExpenses: 2500,
      balance: 72500,
      transactionCount: 2,
    });
    expect(stats.body.data.categoryBreakdown).toEqual([
      { category: 'Food', amount: 2500, percentage: 100 },
    ]);

    const transactionId = expense.body.data.id;
    const updated = await request(app)
      .put(`/api/transactions/${transactionId}`)
      .set(auth)
      .send({ amount: 3000, description: 'Updated groceries' });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ amount: 3000, description: 'Updated groceries' });

    const removed = await request(app)
      .delete(`/api/transactions/${transactionId}`)
      .set(auth);
    expect(removed.status).toBe(200);
    expect(removed.body.success).toBe(true);
  });
});
