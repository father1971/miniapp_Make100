export interface UserStats {
  id?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  solvedCount?: number;
  skippedCount?: number;
  bestTimeMs?: number;
  minCharacters?: number;
  totalTimeMs?: number;
  totalCharacters?: number;
  settings?: any;
}

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export async function fetchUserStats(): Promise<UserStats | null> {
  if (!authToken) return null;
  try {
    const res = await fetch('/api/user', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    if (res.ok) {
      return await res.json();
    }
    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem('tgAuthToken');
      sessionStorage.removeItem('tgInitData');
      sessionStorage.removeItem('tgUser');
      // A reload might be harsh, but it forces re-auth
      window.location.reload();
    }
    return null;
  } catch (e) {
    console.error("Failed to fetch user stats", e);
    return null;
  }
}

export async function saveUserStats(stats: UserStats): Promise<void> {
  if (!authToken) return;
  try {
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(stats)
    });
    if (!res.ok) {
      console.error("Failed to save user stats, status:", res.status, await res.text());
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('tgAuthToken');
        sessionStorage.removeItem('tgInitData');
        sessionStorage.removeItem('tgUser');
        window.location.reload();
      }
    }
  } catch (e) {
    console.error("Failed to save user stats", e);
  }
}

export async function fetchLeaderboard(): Promise<UserStats[]> {
  try {
    const res = await fetch('/api/leaderboard');
    if (res.ok) {
      return await res.json();
    }
    return [];
  } catch (e) {
    console.error("Failed to fetch leaderboard", e);
    return [];
  }
}
