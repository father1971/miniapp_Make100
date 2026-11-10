import {
  UserStats,
  LeaderboardResponse,
  GameSolvePayload,
  GameSkipPayload,
  HintOperationResponse,
  RandomTicketResponse,
} from './types';

export * from './types';

export const API_URL = import.meta.env.VITE_API_URL || 'https://make100-backend.rotanovav.workers.dev';

export function getAuthHeader(): Record<string, string> {
  try {
    const initData = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp?.initData : undefined;
    if (initData) return { 'Authorization': `Bearer ${initData}` };
    const webToken = typeof window !== 'undefined' ? localStorage.getItem('make100_web_auth_token') : undefined;
    if (webToken) return { 'Authorization': `Bearer ${webToken}` };
    return {};
  } catch (e) {
    return {};
  }
}

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

/**
 * Единый HTTP-клиент с AbortController, тайм-аутом и возможностью retry для идемпотентных запросов.
 */
export async function apiRequest<T>(endpoint: string, options: FetchOptions = {}): Promise<T | null> {
  const { timeoutMs = 15000, retries = (options.method === 'GET' || !options.method ? 2 : 0), ...fetchOptions } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const authHeader = getAuthHeader();
      const res = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...authHeader,
          ...(fetchOptions.headers || {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        // Если сервер вернул 5xx ошибку и это попытка с retry, пробуем еще раз
        if (res.status >= 500 && attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt)));
          continue;
        }
        // Для 4xx ответов парсим тело, чтобы клиент мог обработать ошибки (banned, insufficient funds и т.д.)
        if (res.status >= 400 && res.status < 500) {
          try {
            return (await res.json()) as T;
          } catch (e) {}
        }
        console.warn(`API request to ${endpoint} failed with status: ${res.status}`);
        return null;
      }

      return (await res.json()) as T;
    } catch (e: any) {
      clearTimeout(timeoutId);
      lastError = e;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt)));
      }
    }
  }

  console.error(`API request to ${endpoint} completely failed:`, lastError);
  return null;
}

export async function fetchUserStats(userId?: number | null): Promise<UserStats | null> {
  const query = userId ? `?userId=${userId}` : '';
  return apiRequest<UserStats>(`/api/user${query}`, { method: 'GET' });
}

export async function saveUserStats(stats: UserStats): Promise<{ success: boolean; stats?: UserStats } | null> {
  return apiRequest<{ success: boolean; stats?: UserStats }>(`/api/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stats),
  });
}

export async function fetchLeaderboard(userId?: number | null): Promise<LeaderboardResponse> {
  const query = userId ? `?userId=${userId}` : '';
  const data = await apiRequest<any>(`/api/leaderboard${query}`, { method: 'GET' });
  if (!data) {
    return { leaderboard: [] };
  }
  if (Array.isArray(data)) {
    return { leaderboard: data };
  }
  return {
    leaderboard: data.leaderboard || [],
    myRank: data.myRank,
    myScore: data.myScore,
  };
}

export async function submitGameSolve(payload: GameSolvePayload): Promise<any> {
  return apiRequest<any>(`/api/game/solve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function submitGameSkip(payload: GameSkipPayload): Promise<any> {
  return apiRequest<any>(`/api/game/skip`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function buyHint(): Promise<HintOperationResponse | null> {
  return apiRequest<HintOperationResponse>(`/api/user/buy-hint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function consumeHint(): Promise<HintOperationResponse | null> {
  return apiRequest<HintOperationResponse>(`/api/user/use-hint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function fetchRandomTicketApi(): Promise<RandomTicketResponse | null> {
  return apiRequest<RandomTicketResponse>(`/api/tickets/random`, { method: 'GET' });
}

export async function fetchCarsPoolApi(): Promise<string[] | null> {
  const data = await apiRequest<any>(`/api/cars/pool`, { method: 'GET' });
  if (!data) return null;
  if (Array.isArray(data)) return data;
  // Бэкенд возвращает { success, count, cars: [{id, url}] }
  const cars = data.cars || data.images || data.pool;
  if (!Array.isArray(cars)) return null;
  return cars.map((c: any) => typeof c === 'string' ? c : c.url).filter(Boolean);
}

export async function fetchTicketsPoolApi(): Promise<any[] | null> {
  const data = await apiRequest<any>(`/api/tickets/pool`, { method: 'GET' });
  if (!data) return null;
  // Бэкенд возвращает { success, count, tickets: [...] }
  return Array.isArray(data) ? data : data.tickets || data.images || data.pool || null;
}

export { consumeHint as useHint };

export async function submitFeedbackApi(payload: { name: string; contact: string; message: string }): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await apiRequest<{ success: boolean; message?: string; error?: string }>(`/api/contact/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res || { success: false, error: 'Network error' };
}

export async function authTelegramWidgetApi(widgetData: any): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  const res = await apiRequest<{ success: boolean; token?: string; user?: any; error?: string }>(`/api/auth/telegram-widget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(widgetData)
  });
  if (res && res.success && res.token) {
    localStorage.setItem('make100_web_auth_token', res.token);
    if (res.user) {
      localStorage.setItem('make100_web_user', JSON.stringify(res.user));
    }
  }
  return res || { success: false, error: 'Network error' };
}

export async function sendEmailOtpApi(payload: { email: string; name?: string }): Promise<{ success: boolean; message?: string; devCode?: string; error?: string }> {
  const res = await apiRequest<{ success: boolean; message?: string; devCode?: string; error?: string }>(`/api/auth/email/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res || { success: false, error: 'Network error' };
}

export async function verifyEmailOtpApi(payload: { email: string; code: string; name?: string }): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  const res = await apiRequest<{ success: boolean; token?: string; user?: any; error?: string }>(`/api/auth/email/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (res && res.success && res.token) {
    localStorage.setItem('make100_web_auth_token', res.token);
    if (res.user) {
      localStorage.setItem('make100_web_user', JSON.stringify(res.user));
    }
  }
  return res || { success: false, error: 'Network error' };
}

export function getSavedWebUser(): any | null {
  try {
    const raw = localStorage.getItem('make100_web_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function logoutWebApi(): void {
  try {
    localStorage.removeItem('make100_web_auth_token');
    localStorage.removeItem('make100_web_user');
  } catch (e) {}
}
