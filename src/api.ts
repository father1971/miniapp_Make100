export interface ModeDetail {
  solvedCount: number;
  skippedCount: number;
  bestTimeMs: number | null;
  minCharacters: number | null;
  totalTimeMs: number;
  totalCharacters: number;
}

export interface UserStats {
  id?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  solvedCount: number;
  skippedCount: number;
  bestTimeMs?: number | null;
  minCharacters?: number | null;
  totalTimeMs: number;
  totalCharacters: number;
  coins?: number;
  hintsCount?: number;
  referredBy?: number | null;
  referralCount?: number;
  settings: {
    currentMode?: 'tickets' | 'car';
    [key: string]: any;
  };
  modeStats: {
    tickets?: ModeDetail;
    car?: ModeDetail;
    [key: string]: any;
  };
}

export const API_URL = import.meta.env.VITE_API_URL || 'https://make100-backend.rotanovav.workers.dev';

export function getAuthHeader(): Record<string, string> {
  // @ts-expect-error - Telegram WebApp is injected globally
  const initData = window.Telegram?.WebApp?.initData;
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

export async function saveUserStats(stats: UserStats): Promise<void> {
  const headers = getAuthHeader();
  if (!headers.Authorization) return;
  try {
    await fetch(`${API_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(stats)
    });
  } catch (e) {
    console.error("Failed to save user stats", e);
  }
}

export async function fetchLeaderboard(): Promise<UserStats[]> {
  try {
    const headers = getAuthHeader();
    const res = await fetch(`${API_URL}/api/leaderboard`, { headers });
    if (res.ok) {
      return await res.json();
    }
    return [];
  } catch (e) {
    console.error("Failed to fetch leaderboard", e);
    return [];
  }
}
