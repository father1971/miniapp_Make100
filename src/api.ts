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
    return initData ? { 'Authorization': `Bearer ${initData}` } : {};
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
  return Array.isArray(data) ? data : data.images || data.pool || null;
}

export async function fetchTicketsPoolApi(): Promise<any[] | null> {
  const data = await apiRequest<any>(`/api/tickets/pool`, { method: 'GET' });
  if (!data) return null;
  return Array.isArray(data) ? data : data.images || data.pool || null;
}

export { consumeHint as useHint };
