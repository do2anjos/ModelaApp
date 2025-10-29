// API helper com base remota opcional, timeout e retry básico
(function() {
  'use strict';

  const DEFAULT_TIMEOUT_MS = 15000; // Aumentado para 15s
  const MAX_RETRIES = 3; // Aumentado para 3

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
        // Repetir em 502/503/504/429 (rate limit)
        if ([502, 503, 504, 429].includes(resp.status) && attempt < MAX_RETRIES) {
          attempt += 1;
          const delay = resp.status === 429 ? 1000 * attempt : 200 * attempt; // Delay maior para rate limit
          await new Promise(r => setTimeout(r, delay));
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


