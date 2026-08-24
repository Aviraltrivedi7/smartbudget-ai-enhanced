import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

const clampText = (value, maxLength) => String(value || '').trim().slice(0, maxLength);
const normalizeTransactions = (transactions) => (Array.isArray(transactions) ? transactions : []).slice(0, 200).map((transaction) => ({
  title: clampText(transaction.title, 120),
  amount: Number(transaction.amount) || 0,
  category: clampText(transaction.category, 60),
  date: clampText(transaction.date, 30),
  type: transaction.type === 'income' ? 'income' : 'expense',
}));

const buildSystemPrompt = (transactions, language) => {
  const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const byCategory = transactions.filter((item) => item.type === 'expense').reduce((result, item) => {
    result[item.category] = (result[item.category] || 0) + item.amount;
    return result;
  }, {});

  const balance = income - expenses;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 'unavailable';

  return `You are DhanSetu AI Coach, a concise and practical personal finance assistant. Answer only from the supplied transaction context; never invent transactions or claim to access a bank account. Use Indian rupees and Indian number formatting when possible. Give one actionable next step when useful. This is general budgeting guidance, not regulated financial advice. Respond in ${language === 'hi' ? 'friendly Hindi/Hinglish' : 'clear, friendly English'}.

Context summary:
- Tracked income: ₹${income.toLocaleString('en-IN')}
- Tracked expenses: ₹${expenses.toLocaleString('en-IN')}
- Tracked balance: ₹${balance.toLocaleString('en-IN')}
- Savings rate: ${savingsRate}%
- Category totals: ${JSON.stringify(byCategory)}
- Transactions: ${JSON.stringify(transactions)}`;
};

const callOpenAI = async ({ apiKey, model, systemPrompt, history, message }) => {
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model,
    temperature: 0.35,
    max_tokens: 600,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history.map((item) => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: clampText(item.content, 2000) })),
      { role: 'user', content: message },
    ],
  });
  return response.choices[0]?.message?.content?.trim() || 'I could not generate a response right now.';
};

const callGemini = async ({ apiKey, model, systemPrompt, history, message }) => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [
        ...history.map((item) => ({ role: item.role === 'assistant' ? 'model' : 'user', parts: [{ text: clampText(item.content, 2000) }] })),
        { role: 'user', parts: [{ text: message }] },
      ],
      generationConfig: { temperature: 0.35, maxOutputTokens: 600 },
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Gemini request failed');
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim() || 'I could not generate a response right now.';
};

router.get('/', (_req, res) => {
  res.json({ success: true, message: 'AI service is ready', data: { provider: process.env.LLM_PROVIDER || 'openai' } });
});

router.post('/categorize-transaction', (req, res) => {
  const description = clampText(req.body?.description, 240).toLowerCase();
  const amount = Number(req.body?.amount) || 0;
  if (!description || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Description and a positive amount are required' });
  }

  const rules = [
    { category: 'Rent', keywords: ['rent', 'landlord', 'lease'] },
    { category: 'Food', keywords: ['grocery', 'groceries', 'restaurant', 'food', 'dinner', 'lunch', 'breakfast', 'swiggy', 'zomato'] },
    { category: 'Utilities', keywords: ['electricity', 'wifi', 'internet', 'water', 'recharge', 'utility'] },
    { category: 'Travel', keywords: ['uber', 'ola', 'metro', 'flight', 'train', 'fuel', 'petrol', 'travel'] },
    { category: 'Healthcare', keywords: ['doctor', 'hospital', 'medicine', 'pharmacy', 'health'] },
    { category: 'Shopping', keywords: ['shopping', 'clothes', 'apparel', 'amazon', 'flipkart'] },
    { category: 'Savings / Buffer', keywords: ['saving', 'savings', 'buffer', 'sip', 'investment'] },
  ];
  const match = rules.find((rule) => rule.keywords.some((keyword) => description.includes(keyword)));
  const category = match?.category || 'Other';
  const confidence = match ? 0.9 : 0.35;

  return res.json({
    success: true,
    message: 'Transaction categorized',
    data: { category, confidence, tags: match ? [match.category.toLowerCase()] : [] },
  });
});

router.post('/chat', async (req, res) => {
  try {
    const message = clampText(req.body?.message, 2000);
    if (!message) return res.status(400).json({ success: false, message: 'A chat message is required' });

    const provider = String(req.body?.provider || process.env.LLM_PROVIDER || 'openai').toLowerCase();
    if (!['openai', 'gemini'].includes(provider)) return res.status(400).json({ success: false, message: 'Unsupported LLM provider' });

    const transactions = normalizeTransactions(req.body?.transactions);
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-10) : [];
    const language = req.body?.language === 'hi' ? 'hi' : 'en';
    const systemPrompt = buildSystemPrompt(transactions, language);

    let answer;
    let model;
    if (provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
      if (!apiKey) return res.status(503).json({ success: false, message: 'Gemini is not configured. Add GEMINI_API_KEY to the backend environment.' });
      answer = await callGemini({ apiKey, model, systemPrompt, history, message });
    } else {
      const apiKey = process.env.OPENAI_API_KEY;
      model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      if (!apiKey) return res.status(503).json({ success: false, message: 'OpenAI is not configured. Add OPENAI_API_KEY to the backend environment.' });
      answer = await callOpenAI({ apiKey, model, systemPrompt, history, message });
    }

    return res.json({ success: true, message: 'AI response generated', data: { message: answer, provider, model } });
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(502).json({ success: false, message: 'The AI provider could not respond right now', error: error.message });
  }
});

export default router;
