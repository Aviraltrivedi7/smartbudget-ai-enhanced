const envDemoMode = import.meta.env.VITE_DEMO_MODE;

export const appConfig = {
  isDemoMode: envDemoMode === undefined ? true : envDemoMode.toLowerCase() === 'true',
};
