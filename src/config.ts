// config.ts
const getApiBaseUrl = (): string => {
    // Get the protocol (http/https)
    const protocol = window.location.protocol;

    // Get the host (domain or IP address)
    const host = window.location.hostname;

    // Get the port if needed (e.g., 4000 for localhost)
    const port = window.location.port ? `:${window.location.port}` : '';

    // Build the API base URL
    // const apiBaseUrl = `${protocol}//${host}${port}`;

    const apiBaseUrl = `http://localhost:2000`

    return apiBaseUrl;
  };

  const config = {
    apiBaseUrl: getApiBaseUrl(), // Dynamically get the base URL
  };

  export default config;