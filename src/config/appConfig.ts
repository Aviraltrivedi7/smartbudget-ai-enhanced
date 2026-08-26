import { isInsForgeConfigured } from '@/lib/insforge';

const envDemoMode = import.meta.env.VITE_DEMO_MODE;

export const appConfig = {
  isInsForgeConfigured,
  isDemoMode: !isInsForgeConfigured && (envDemoMode === undefined || envDemoMode.toLowerCase() === 'true'),
  isLiveMode: isInsForgeConfigured,
};
