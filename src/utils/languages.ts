
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
];

export const translations = {
  en: {
    // Common UI Elements
    language: "Language",
    dashboard: "Dashboard",
    addExpense: "Add Expense",
    insights: "AI Insights",
    coach: "Finance Coach",
    budgetPlanner: "Budget Planner",
    savingsGoals: "Savings Goals",
    billReminder: "Bill Reminder",
    expenseChat: "Expense Chat",
    spendingLimits: "Spending Limits",
    gamification: "Save to Win",
    monthlyReport: "Monthly Report",
    smartSuggestions: "Smart Suggestions",
    
    // Dashboard
    yourFinancialCompanion: "Your intelligent financial companion with advanced features",
    selectMonth: "Select Month",
    totalBalance: "Total Balance",
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    monthlyIncome: "Monthly Income",
    monthlyExpenses: "Monthly Expenses",
    savingsRate: "Savings Rate",
    recentTransactions: "Recent Transactions",
    quickActions: "Quick Actions",
    financialVisualization: "Financial Visualization",
    thisMonth: "This month",
    incomeMinusExpenses: "Income - Expenses",
    
    // New Dashboard Features
    calendarTracker: "Calendar Tracker",
    advancedAnalytics: "Advanced Analytics",
    budgetProgress: "Budget Progress",
    moneyMonster: "Money Monster",
    aiSpendingCoach: "AI Spending Coach",
    geoHeatmap: "Geo Heatmap",
    billScanner: "Bill Scanner",
    voiceEntry: "Voice Entry",
    billReminders: "Bill Reminders",
    aiFinanceCoach: "AI Finance Coach",
    smartBudgetPlanner: "Smart Budget Planner",
    viewAIInsights: "View AI Insights",
    advancedVisualizer: "Advanced Visualizer",
    
    // Categories
    food: "Food",
    travel: "Travel",
    entertainment: "Entertainment",
    rent: "Rent",
    income: "Income",
    grocery: "Grocery",
    salary: "Salary",
    freelance: "Freelance",
    
    // Months
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",
    
    // Actions
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    back: "Back",
    
    // Splash Screen
    welcome: "Welcome to",
    smartBudgetAI: "SmartBudget AI",
    yourPersonalFinanceAssistant: "Your Personal Finance Assistant",
    getStarted: "Get Started",
    
    // Gamification
    points: "Points",
    level: "Level",
    streak: "Day Streak",
    badges: "Your Badges",
    challenges: "Today's Challenges",
    leaderboard: "Weekly Leaderboard",
    yourRank: "Your Rank",
    
    // AddExpense Component
    addTransaction: "Add Transaction",
    recordIncomeOrExpense: "Record your income or expense",
    transactionDetails: "Transaction Details",
    transactionType: "Transaction Type",
    selectType: "Select type",
    expense: "Expense",
    title: "Title",
    titlePlaceholder: "e.g., McDonald's, Salary, Rent",
    amount: "Amount",
    category: "Category",
    selectCategory: "Select category",
    date: "Date",
    pickDate: "Pick a date",
    saveTransaction: "Save Transaction",
    preview: "Preview",
    missingInformation: "Missing Information",
    fillAllFields: "Please fill in all fields to save the transaction.",
    invalidAmount: "Invalid Amount",
    enterValidAmount: "Please enter a valid positive amount.",
    transactionSaved: "Transaction Saved",
    transactionSavedDesc: "Transaction added successfully.",
    
    // Categories
    shopping: "Shopping",
    healthcare: "Healthcare",
    education: "Education",
    utilities: "Utilities",
    other: "Other",
    
    // Common phrases
    languageChanged: "Language Changed!",
    congratulations: "Congratulations!",
    newBadgeEarned: "New Badge Earned!",
    keepSaving: "Keep saving to climb higher!",
  },
  
  hi: {
    // Common UI Elements
    language: "भाषा",
    dashboard: "डैशबोर्ड",
    addExpense: "खर्च जोड़ें",
    insights: "AI अंतर्दृष्टि",
    coach: "वित्त कोच",
    budgetPlanner: "बजट प्लानर",
    savingsGoals: "बचत लक्ष्य",
    billReminder: "बिल रिमाइंडर",
    expenseChat: "खर्च चैट",
    spendingLimits: "खर्च सीमा",
    gamification: "जीतने के लिए बचत",
    monthlyReport: "मासिक रिपोर्ट",
    smartSuggestions: "स्मार्ट सुझाव",
    
    // Dashboard
    yourFinancialCompanion: "उन्नत सुविधाओं के साथ आपका बुद्धिमान वित्तीय साथी",
    selectMonth: "महीना चुनें",
    totalBalance: "कुल बैलेंस",
    totalIncome: "कुल आय",
    totalExpenses: "कुल खर्च",
    monthlyIncome: "मासिक आय",
    monthlyExpenses: "मासिक खर्च",
    savingsRate: "बचत दर",
    recentTransactions: "हाल के लेनदेन",
    quickActions: "त्वरित कार्य",
    financialVisualization: "वित्तीय विज़ुअलाइज़ेशन",
    thisMonth: "इस महीने",
    incomeMinusExpenses: "आय - खर्च",
    
    // New Dashboard Features
    calendarTracker: "कैलेंडर ट्रैकर",
    advancedAnalytics: "उन्नत विश्लेषण",
    budgetProgress: "बजट प्रगति",
    moneyMonster: "मनी मॉन्स्टर",
    aiSpendingCoach: "AI खर्च कोच",
    geoHeatmap: "भू हीटमैप",
    billScanner: "बिल स्कैनर",
    voiceEntry: "आवाज़ एंट्री",
    billReminders: "बिल रिमाइंडर",
    aiFinanceCoach: "AI वित्त कोच",
    smartBudgetPlanner: "स्मार्ट बजट प्लानर",
    viewAIInsights: "AI अंतर्दृष्टि देखें",
    advancedVisualizer: "उन्नत विज़ुअलाइज़र",
    
    // Categories
    food: "भोजन",
    travel: "यात्रा",
    entertainment: "मनोरंजन",
    rent: "किराया",
    income: "आय",
    grocery: "किराना",
    salary: "सैलरी",
    freelance: "फ्रीलांस",
    
    // Months
    january: "जनवरी",
    february: "फरवरी",
    march: "मार्च",
    april: "अप्रैल",
    may: "मई",
    june: "जून",
    july: "जुलाई",
    august: "अगस्त",
    september: "सितंबर",
    october: "अक्टूबर",
    november: "नवंबर",
    december: "दिसंबर",
    
    // Actions
    save: "सेव करें",
    cancel: "रद्द करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    back: "वापस",
    
    // Splash Screen
    welcome: "आपका स्वागत है",
    smartBudgetAI: "स्मार्टबजट AI",
    yourPersonalFinanceAssistant: "आपका व्यक्तिगत वित्त सहायक",
    getStarted: "शुरू करें",
    
    // Gamification
    points: "अंक",
    level: "स्तर",
    streak: "दिन स्ट्रीक",
    badges: "आपके बैज",
    challenges: "आज की चुनौतियां",
    leaderboard: "साप्ताहिक लीडरबोर्ड",
    yourRank: "आपकी रैंक",
    
    // AddExpense Component
    addTransaction: "लेनदेन जोड़ें",
    recordIncomeOrExpense: "अपनी आय या खर्च का रिकॉर्ड करें",
    transactionDetails: "लेनदेन विवरण",
    transactionType: "लेनदेन प्रकार",
    selectType: "प्रकार चुनें",
    expense: "खर्च",
    title: "शीर्षक",
    titlePlaceholder: "जैसे मैकडोनाल्ड, सैलरी, किराया",
    amount: "राशि",
    category: "श्रेणी",
    selectCategory: "श्रेणी चुनें",
    date: "दिनांक",
    pickDate: "दिनांक चुनें",
    saveTransaction: "लेनदेन सेव करें",
    preview: "पूर्वावलोकन",
    missingInformation: "जानकारी गायब",
    fillAllFields: "लेनदेन सेव करने के लिए कृपया सभी फ़ील्ड भरें।",
    invalidAmount: "गलत राशि",
    enterValidAmount: "कृपया एक वैध सकारात्मक राशि दर्ज करें।",
    transactionSaved: "लेनदेन सेव हो गया",
    transactionSavedDesc: "लेनदेन सफलतापूर्वक जोड़ दिया गया।",
    
    // Categories
    shopping: "खरीदारी",
    healthcare: "स्वास्थ्य सेवा",
    education: "शिक्षा",
    utilities: "उपयोगिता",
    other: "अन्य",
    
    // Common phrases
    languageChanged: "भाषा बदल गई!",
    congratulations: "बधाई हो!",
    newBadgeEarned: "नया बैज मिला!",
    keepSaving: "ऊपर चढ़ने के लिए बचत करते रहें!",
  }
};

export const getTranslation = (key: string, language: string = 'en'): string => {
  const langTranslations = translations[language as keyof typeof translations] || translations.en;
  return langTranslations[key as keyof typeof langTranslations] || key;
};

// Helper function to get category translation
export const getCategoryTranslation = (category: string, language: string = 'en'): string => {
  const categoryMap: Record<string, string> = {
    'Food': 'food',
    'Travel': 'travel', 
    'Rent': 'rent',
    'Entertainment': 'entertainment',
    'Shopping': 'shopping',
    'Healthcare': 'healthcare',
    'Education': 'education',
    'Utilities': 'utilities',
    'Income': 'income',
    'Other': 'other',
    'Grocery': 'grocery',
    'Salary': 'salary',
    'Freelance': 'freelance',
    // Handle lowercase and existing category keys
    'food': 'food',
    'travel': 'travel',
    'rent': 'rent',
    'entertainment': 'entertainment',
    'shopping': 'shopping',
    'healthcare': 'healthcare',
    'education': 'education',
    'utilities': 'utilities',
    'income': 'income',
    'other': 'other',
    'grocery': 'grocery',
    'salary': 'salary',
    'freelance': 'freelance'
  };
  
  const translationKey = categoryMap[category] || 'other';
  return getTranslation(translationKey, language);
};
