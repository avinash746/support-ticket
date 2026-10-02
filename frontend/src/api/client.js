const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

/** Error thrown for any failed request; `fieldErrors` maps field -> message. */
export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', details = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = Object.fromEntries(
      details.filter((d) => d.field).map((d) => [d.field, d.message])
    );
  }
}

export async function request(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Check that the API is running and try again.', {
      code: 'NETWORK_ERROR',
    });
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    /* non-JSON response */
  }

  if (!response.ok) {
    const error = payload?.error;
    throw new ApiError(error?.message || `Request failed (${response.status})`, {
      status: response.status,
      code: error?.code,
      details: error?.details,
    });
  }
  return payload;
}
