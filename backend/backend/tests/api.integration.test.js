import request from 'supertest';
import app from '../server.js';

describe('DhanSetu AI backend integration', () => {
  const email = `jest-${Date.now()}@example.com`;
  const password = 'JestPass123';
  let token;
  let refreshToken;
  let expenseId;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Jest User', email, password });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));
    token = response.body.data.token;
    refreshToken = response.body.data.refreshToken;
  });

  it('reports a healthy DhanSetu AI service', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'OK', message: 'DhanSetu AI Backend is running!' });
    expect(response.body.timestamp).toEqual(expect.any(String));
  });

  it('rejects invalid demo bearer tokens for user data', async () => {
    const response = await request(app)
      .get('/api/transactions')
      .set('Authorization', 'Bearer definitely-invalid');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('returns the authenticated demo profile with a stable envelope', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toMatchObject({ email, fullName: 'Jest User' });
    expect(response.body.data.user.password).toBeUndefined();
  });

  it('supports demo profile update and password changes through frontend methods', async () => {
    const auth = { Authorization: `Bearer ${token}` };
    const profile = await request(app)
      .put('/api/user/profile')
      .set(auth)
      .send({ fullName: 'Updated Jest User', password: 'must-not-be-updated' });
    expect(profile.status).toBe(200);
    expect(profile.body.data).toMatchObject({ fullName: 'Updated Jest User' });
    expect(profile.body.data.password).toBeUndefined();

    const passwordResponse = await request(app)
      .post('/api/auth/change-password')
      .set(auth)
      .send({ oldPassword: password, newPassword: 'NewJestPass123' });
    expect(passwordResponse.status).toBe(200);
    expect(passwordResponse.body).toMatchObject({ success: true, message: 'Password changed successfully' });

    const refresh = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });
    expect(refresh.status).toBe(200);
    expect(refresh.body.data.token).toEqual(expect.any(String));
    expect(refresh.body.data.refreshToken).toEqual(expect.any(String));
    token = refresh.body.data.token;
    refreshToken = refresh.body.data.refreshToken;
  });

  it('supports isolated transaction CRUD, filtering, pagination, and signed statistics', async () => {
    const auth = { Authorization: `Bearer ${token}` };
    const initial = await request(app).get('/api/transactions').set(auth);
    expect(initial.status).toBe(200);
    expect(initial.body.data).toMatchObject({ transactions: [], total: 0, page: 1, totalPages: 0 });

    const income = await request(app)
      .post('/api/transactions')
      .set(auth)
      .send({ title: 'Salary', amount: 75000, category: 'Income', type: 'income', date: '2026-08-01' });
    const expense = await request(app)
      .post('/api/transactions')
      .set(auth)
      .send({ title: 'Groceries', amount: 2500, category: 'Food', type: 'expense', date: '2026-08-03' });
    const overspend = await request(app)
      .post('/api/transactions')
      .set(auth)
      .send({ title: 'Emergency bill', amount: 80000, category: 'Other', type: 'expense', date: '2026-08-04' });

    expect(income.status).toBe(201);
    expect(expense.status).toBe(201);
    expect(overspend.status).toBe(201);
    expect(expense.body.data.id).toEqual(expect.any(String));
    expect(expense.body.data.category).toBe('Food');
    expenseId = expense.body.data.id;

    const filtered = await request(app)
      .get('/api/transactions?category=food&dateFrom=2026-08-01&dateTo=2026-08-03')
      .set(auth);
    expect(filtered.status).toBe(200);
    expect(filtered.body.data).toMatchObject({ total: 1, page: 1, totalPages: 1 });
    expect(filtered.body.data.transactions[0].title).toBe('Groceries');

    const paginated = await request(app).get('/api/transactions?limit=1&page=2').set(auth);
    expect(paginated.status).toBe(200);
    expect(paginated.body.data).toMatchObject({ total: 3, page: 2, totalPages: 3 });
    expect(paginated.body.data.transactions).toHaveLength(1);

    const invalid = await request(app)
      .post('/api/transactions')
      .set(auth)
      .send({ title: '', amount: -10, category: 'Food', type: 'expense', date: 'not-a-date' });
    expect(invalid.status).toBe(400);
    expect(invalid.body.success).toBe(false);

    const stats = await request(app).get('/api/transactions/stats?dateFrom=2026-08-01&dateTo=2026-08-31').set(auth);
    expect(stats.status).toBe(200);
    expect(stats.body.data).toMatchObject({ totalIncome: 75000, totalExpenses: 82500, balance: -7500, transactionCount: 3 });
    expect(stats.body.data.categoryBreakdown).toEqual([
      { category: 'Other', amount: 80000, percentage: 96.97 },
      { category: 'Food', amount: 2500, percentage: 3.03 },
    ]);
    expect(stats.body.data.monthlyTrend).toEqual([{ month: '2026-08', income: 75000, expenses: 82500 }]);

    const updated = await request(app)
      .put(`/api/transactions/${expenseId}`)
      .set(auth)
      .send({ amount: 3000, description: 'Updated groceries' });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ amount: 3000, description: 'Updated groceries' });

    const fetched = await request(app).get(`/api/transactions/${expenseId}`).set(auth);
    expect(fetched.status).toBe(200);
    expect(fetched.body.data).toMatchObject({ id: expenseId, amount: 3000 });

    const removed = await request(app).delete(`/api/transactions/${expenseId}`).set(auth);
    expect(removed.status).toBe(200);
    expect(removed.body.success).toBe(true);
  });

  it('validates bulk import, returns created and failed rows, and exposes CSV export metadata', async () => {
    const auth = { Authorization: `Bearer ${token}` };
    const imported = await request(app)
      .post('/api/transactions/bulk-import')
      .set(auth)
      .send({ transactions: [
        { title: 'Imported travel', amount: 1200, category: 'Travel', type: 'expense', date: '2026-08-10' },
        { title: '', amount: 0, category: 'Other', type: 'expense', date: '2026-08-10' },
      ] });
    expect(imported.status).toBe(201);
    expect(imported.body.data.created).toHaveLength(1);
    expect(imported.body.data.failed).toHaveLength(1);

    const exported = await request(app).get('/api/transactions/export?format=csv').set(auth);
    expect(exported.status).toBe(200);
    expect(exported.body.data.downloadUrl).toMatch(/^data:text\/csv/);
    expect(decodeURIComponent(exported.body.data.downloadUrl)).toContain('Imported travel');

    const unsupported = await request(app).get('/api/transactions/export?format=pdf').set(auth);
    expect(unsupported.status).toBe(400);

    const scan = await request(app).post('/api/transactions/scan-receipt').set(auth);
    expect(scan.status).toBe(503);
    expect(scan.body.message).toMatch(/OCR is not configured/i);
  });

  it('provides deterministic AI categorization without exposing provider keys', async () => {
    const response = await request(app)
      .post('/api/ai/categorize-transaction')
      .send({ description: 'Dinner at restaurant', amount: 850 });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ category: 'Food', confidence: 0.9 });

    const invalid = await request(app)
      .post('/api/ai/categorize-transaction')
      .send({ description: '', amount: 0 });
    expect(invalid.status).toBe(400);
  });

  it('isolates transactions across two demo users', async () => {
    const second = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Second User', email: `second-${Date.now()}@example.com`, password: 'SecondPass123' });
    expect(second.status).toBe(201);
    const response = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${second.body.data.token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.transactions).toEqual([]);
  });
});
