import { createClient } from '@insforge/sdk';

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

const baseUrl = import.meta.env.VITE_INSFORGE_BASE_URL?.trim()
  ? trimTrailingSlashes(import.meta.env.VITE_INSFORGE_BASE_URL.trim())
  : '';
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY?.trim() || '';

export const INSFORGE_CONFIG = {
  baseUrl,
  anonKey,
};

export const isInsForgeConfigured = Boolean(baseUrl && anonKey);
export const insforgeHealthUrl = baseUrl ? `${baseUrl}/health` : null;

/**
 * Browser client. The anon key is intentionally public and must be protected by
 * InsForge RLS policies; the project admin key never belongs in this module.
 */
export const insforge = isInsForgeConfigured
  ? createClient({ baseUrl, anonKey })
  : null;

export default insforge;
