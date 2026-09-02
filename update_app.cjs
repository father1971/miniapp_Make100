const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace imports
content = content.replace(
  "import { fetchUserStats, saveUserStats, fetchLeaderboard as fetchLeaderboardApi, API_URL, getAuthHeader } from './api';",
  "import { fetchUserStats, saveUserStats, fetchLeaderboard as fetchLeaderboardApi, API_URL, getAuthHeader, submitGameSolve, submitGameSkip } from './api';"
);
content = content.replace(
  "import { fetchUserStats, saveUserStats, fetchLeaderboard as fetchLeaderboardApi, API_URL, getAuthHeader, submitGameSolve, submitGameSkip, submitGameSolve, submitGameSkip } from './api';",
  "import { fetchUserStats, saveUserStats, fetchLeaderboard as fetchLeaderboardApi, API_URL, getAuthHeader, submitGameSolve, submitGameSkip } from './api';"
);

// We need to rewrite handleSkip
const skipFunction = `  const handleSkip = async () => {
    if (isHinting) return;
    
    // Send API request
    try {
      const res = await submitGameSkip({ gameMode });
      if (res && res.success) {
        setStats(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            score: res.score !== undefined ? res.score : prev.score,
            coins: res.coins !== undefined ? res.coins : prev.coins,
            solvedCount: res.solvedCount !== undefined ? res.solvedCount : prev.solvedCount,
            modeStats: res.modeStats !== undefined ? res.modeStats : prev.modeStats
          };
        });
      }
    } catch(e) {
      console.error(e);
    }
    
    // trigger next round
    initGame(false, true);
  };
`;
// Insert before initGame
content = content.replace('const initGame = useCallback((startAsIdle = false, isSkip = false) => {', skipFunction + '\n  const initGame = useCallback((startAsIdle = false, isSkip = false) => {');

// Remove calculateRoundScore and handleGameUpdate
// We can just regex replace them or find their indices.
const calcScoreStart = content.indexOf('const calculateRoundScore = (expr: string, solveTimeMs: number): number => {');
const initGameStart = content.indexOf('const handleSkip = async () => {');
if (calcScoreStart !== -1 && initGameStart !== -1) {
  content = content.substring(0, calcScoreStart) + content.substring(initGameStart);
}

// In initGame, remove handleGameUpdate
content = content.replace('handleGameUpdate(false, 0, timeSpentMs);', '');

// Now the win logic!
// It's in the useEffect, around 'if (isWin && !won && !hintUsed) {'
