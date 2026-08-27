import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'

const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => registrations.forEach((registration) => registration.unregister())).catch(() => undefined);
    return;
  }
  navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined);
};

// Start registration immediately so PWA eligibility can be established while the branded splash is visible.
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </LanguageProvider>
);
