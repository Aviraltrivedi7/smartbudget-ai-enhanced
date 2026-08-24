const DEMO_YEAR = 2026;
const DEMO_MONTH_INDEX = 7;

const demoDate = (day) => new Date(Date.UTC(DEMO_YEAR, DEMO_MONTH_INDEX, day)).toISOString().split('T')[0];

export const defaultTransactions = [
  { id: '1', title: 'Monthly Salary', amount: 75000, category: 'Income', date: demoDate(1), type: 'income', description: 'Tech Corp Salary' },
  { id: '2', title: 'House Rent', amount: 18000, category: 'Rent', date: demoDate(2), type: 'expense', description: 'Apartment Rent' },
  { id: '3', title: 'Supermarket Groceries', amount: 4500, category: 'Food', date: demoDate(5), type: 'expense', description: 'Monthly Essentials' },
  { id: '4', title: 'Electricity & WiFi', amount: 2400, category: 'Utilities', date: demoDate(8), type: 'expense', description: 'Utilities Payment' },
  { id: '5', title: 'Freelance Project', amount: 18500, category: 'Income', date: demoDate(12), type: 'income', description: 'UI Design Consulting' },
  { id: '6', title: 'Dining Out', amount: 3200, category: 'Food', date: demoDate(15), type: 'expense', description: 'Weekend Dinner' },
  { id: '7', title: 'Uber & Transport', amount: 1800, category: 'Travel', date: demoDate(18), type: 'expense', description: 'Commute' },
  { id: '8', title: 'Shopping & Apparel', amount: 5100, category: 'Other', date: demoDate(22), type: 'expense', description: 'Miscellaneous spending' },
];

const demoSeedTitles = new Set(defaultTransactions.map((transaction) => transaction.title));

export const normalizeLegacyDemoSeed = (parsed) => {
  // Earlier previews persisted numeric-id demo rows. Replace any partial legacy
  // seed with the complete August fixture, while preserving user-created rows.
  const legacyDemoTitles = new Set(
    parsed
      .filter((item) => demoSeedTitles.has(item.title) && /^\d+$/.test(String(item.id)))
      .map((item) => item.title),
  );
  if (legacyDemoTitles.size === 0) return parsed;

  const userCreatedRows = parsed.filter((item) => !legacyDemoTitles.has(item.title));
  return [...defaultTransactions, ...userCreatedRows];
};

export const demoTotals = (transactions) => transactions.reduce((totals, transaction) => {
  if (transaction.type === 'income') totals.income += Number(transaction.amount) || 0;
  if (transaction.type === 'expense') totals.expenses += Number(transaction.amount) || 0;
  return totals;
}, { income: 0, expenses: 0 });
