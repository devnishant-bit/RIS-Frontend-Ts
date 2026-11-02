// src/shared/api/config.ts

export interface AppConfig {
  apiBaseUrl: string;
}

const getApiBaseUrl = (): string => {
  // Optional override, e.g. VITE_API_BASE_URL=http://localhost:2000 in .env
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envUrl) return envUrl.replace(/\/$/, '');

  // Default (same as the original project): the API lives on the same origin as the app
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
};

const config: AppConfig = {
  apiBaseUrl: getApiBaseUrl(),
};

export default config;