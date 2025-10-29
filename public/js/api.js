// API helper com base remota opcional, timeout e retry básico
(function() {
  'use strict';

  const DEFAULT_TIMEOUT_MS = 8000;
  const MAX_RETRIES = 2;

  function getBaseUrl() {
    try {
      if (typeof window !== 'undefined' && window.API_BASE_URL) {
        return String(window.API_BASE_URL).replace(/\/$/, '');
      }
    } catch (_) {}
    return '';
  }

  async function fetchWithTimeout(resource, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(resource, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  }

  async function apiFetch(path, options = {}) {
    const base = getBaseUrl();
    const url = `${base}${path}`;
    let attempt = 0;
    let lastErr;
    while (attempt <= MAX_RETRIES) {
      try {
        const resp = await fetchWithTimeout(url, options, options.timeoutMs || DEFAULT_TIMEOUT_MS);
        // Repetir em 502/503/504
        if ([502, 503, 504].includes(resp.status) && attempt < MAX_RETRIES) {
          attempt += 1;
          await new Promise(r => setTimeout(r, 200 * attempt));
          continue;
        }
        return resp;
      } catch (err) {
        lastErr = err;
        if (attempt >= MAX_RETRIES) throw err;
        attempt += 1;
        await new Promise(r => setTimeout(r, 200 * attempt));
      }
    }
    throw lastErr || new Error('apiFetch failed');
  }

  // Expor globalmente
  if (typeof window !== 'undefined') {
    window.apiFetch = apiFetch;
  }
})();


