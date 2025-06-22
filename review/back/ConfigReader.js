// getBackendUrl.js
let cachedUrl = null;

export async function getBackendUrl() {
  if (cachedUrl !== null) return cachedUrl;

  const response = await fetch('/config.json');
  if (!response.ok) throw new Error('Failed to load config.json');
  
  const config = await response.json();
  cachedUrl = config.BACKEND_URL;
  return cachedUrl;
}