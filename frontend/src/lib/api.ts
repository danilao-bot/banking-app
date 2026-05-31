import { clearAuth } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

function formatApiError(payload: any) {
  if (!payload) return 'Request failed.';
  if (typeof payload === 'string') return payload;
  if (typeof payload.detail === 'string') return payload.detail;
  if (Array.isArray(payload.detail)) {
    return payload.detail
      .map((errorItem: any) => {
        if (typeof errorItem === 'string') return errorItem;
        if (typeof errorItem === 'object') return errorItem.msg || errorItem.message || JSON.stringify(errorItem);
        return String(errorItem);
      })
      .join(' | ');
  }
  if (typeof payload.error === 'string') return payload.error;
  if (typeof payload.message === 'string') return payload.message;
  return JSON.stringify(payload);
}

async function parseResponse(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

/**
 * Handle 401 Unauthorized by clearing auth and redirecting to login.
 * This prevents stale/expired tokens from leaving users in a broken state.
 */
function handleUnauthorized(response: Response): void {
  if (response.status === 401) {
    clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

export async function postJson(path: string, body: unknown, token?: string | null) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    handleUnauthorized(response);
    throw new Error(formatApiError(data));
  }
  return data;
}

export async function getJson(path: string, token?: string | null) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    handleUnauthorized(response);
    throw new Error(formatApiError(data));
  }
  return data;
}
