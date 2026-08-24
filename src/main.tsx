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
  navigator.serviceWorker.register('/sw.js').catch(() => undefined);
};

if (document.readyState === 'loading') {
  window.addEventListener('load', registerServiceWorker, { once: true });
} else {
  registerServiceWorker();
}

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </LanguageProvider>
);
