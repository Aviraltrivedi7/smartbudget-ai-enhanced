const STORAGE_KEY = 'dhansetu_budget_alerts';
const MAX_ALERTS = 24;

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

export const readBudgetAlerts = () => {
  if (!canUseStorage()) return [];
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistBudgetAlerts = (alerts) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts.slice(0, MAX_ALERTS)));
};

export const upsertBudgetAlerts = (incoming) => {
  const current = readBudgetAlerts();
  const next = [...current];
  incoming.forEach((alert) => {
    if (!next.some((item) => item.id === alert.id)) {
      next.unshift({ ...alert, createdAt: new Date().toISOString(), read: false });
    }
  });
  persistBudgetAlerts(next);
  return next;
};

export const markBudgetAlertsRead = () => {
  const next = readBudgetAlerts().map((alert) => ({ ...alert, read: true }));
  persistBudgetAlerts(next);
  return next;
};

export const unreadBudgetAlertCount = () => readBudgetAlerts().filter((alert) => !alert.read).length;

export const notifyBudgetAlert = (alert) => {
  if (typeof window === 'undefined' || !('Notification' in window) || window.Notification.permission !== 'granted') return;
  try {
    new window.Notification(`${alert.category} budget crossed`, {
      body: `Spent ₹${Math.round(alert.spent).toLocaleString('en-IN')} against a ₹${Math.round(alert.budget).toLocaleString('en-IN')} limit (${alert.overagePercent}% over).`,
      icon: '/icon-192.png',
      tag: alert.id,
    });
  } catch {
    // Browser notifications are optional; the in-app toast remains the source of truth.
  }
};

export const requestBudgetNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window) || window.Notification.permission !== 'default') {
    return typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'unsupported';
  }
  try {
    return await window.Notification.requestPermission();
  } catch {
    return 'denied';
  }
};
