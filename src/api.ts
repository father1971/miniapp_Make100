export interface ModeDetail {
  solvedCount?: number;
  skippedCount?: number;
  bestTimeMs: number | null;
  minCharacters: number | null;
  totalTimeMs?: number;
  totalCharacters?: number;
}

export interface UserStats {
  id?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  solvedCount?: number;
  skippedCount?: number;
  bestTimeMs?: number | null;
  minCharacters?: number | null;
  totalTimeMs?: number;
  totalCharacters?: number;
  coins?: number;
  hintsCount?: number;
  referredBy?: number | null;
  referralCount?: number;
  gamesStarted?: number;
  createdAt?: number;
  settings: {
    currentMode?: 'tickets' | 'car';
    [key: string]: any;
  };
  modeStats?: {
    tickets?: ModeDetail;
    car?: ModeDetail;
    [key: string]: any;
  };
}

export const API_URL = import.meta.env.VITE_API_URL || 'https://make100-backend.rotanovav.workers.dev';

export function getAuthHeader(): Record<string, string> {
  const initData = (window as any).Telegram?.WebApp?.initData;
  return initData ? { 'Authorization': `Bearer ${initData}` } : {};
}

export async function fetchUserStats(): Promise<UserStats | null> {
  const headers = getAuthHeader();
  if (!headers.Authorization) return null;
  try {
    const res = await fetch(`${API_URL}/api/user`, { headers });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (e) {
    console.error("Failed to fetch user stats", e);
    return null;
  }
}

export async function saveUserStats(stats: UserStats): Promise<any> {
  const headers = getAuthHeader();
  if (!headers.Authorization) return null;
  try {
    const res = await fetch(`${API_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(stats)
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (e) {
    console.error("Failed to save user stats", e);
    return null;
  }
}

export interface LeaderboardResponse {
  leaderboard: UserStats[];
  myRank?: number;
  myScore?: number;
}

export async function fetchLeaderboard(userId?: number | null): Promise<LeaderboardResponse> {
  try {
    const headers = getAuthHeader();
    const query = userId ? `?userId=${userId}` : '';
    const res = await fetch(`${API_URL}/api/leaderboard${query}`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return { leaderboard: data };
      }
      return {
        leaderboard: data.leaderboard || [],
        myRank: data.myRank,
        myScore: data.myScore
      };
    }
    return { leaderboard: [] };
  } catch (e) {
    console.error("Failed to fetch leaderboard", e);
    return { leaderboard: [] };
  }
}

export async function submitGameSolve(payload: { formula: string, digits: string[], elapsedTimeMs: number, gameMode: string }): Promise<any> {
  const headers = getAuthHeader();
  if (!headers.Authorization) return null;
  try {
    const res = await fetch(`${API_URL}/api/game/solve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (e) {
    console.error("Failed to submit game solve", e);
    return null;
  }
}

export async function submitGameSkip(payload: { gameMode: string }): Promise<any> {
  const headers = getAuthHeader();
  if (!headers.Authorization) return null;
  try {
    const res = await fetch(`${API_URL}/api/game/skip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (e) {
    console.error("Failed to submit game skip", e);
    return null;
  }
}

export async function buyHint(): Promise<{ success: boolean; coins?: number; hintsCount?: number; error?: string } | null> {
  const headers = getAuthHeader();
  if (!headers.Authorization) return null;
  try {
    const res = await fetch(`${API_URL}/api/user/buy-hint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (e) {
    console.error("Failed to buy hint", e);
    return null;
  }
}

export async function consumeHint(): Promise<{ success: boolean; hintsCount?: number; error?: string } | null> {
  const headers = getAuthHeader();
  if (!headers.Authorization) return null;
  try {
    const res = await fetch(`${API_URL}/api/user/use-hint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (e) {
    console.error("Failed to use hint", e);
    return null;
  }
}

export { consumeHint as useHint };
