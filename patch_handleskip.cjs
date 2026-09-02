const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const skipFunction = `
  const handleSkip = async () => {
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
        if (res.solvedCount !== undefined) setSolvedCount(res.solvedCount);
        if (res.skippedCount !== undefined) setUnsolvedCount(res.skippedCount);
        if (res.totalTimeMs !== undefined) setTotalSolveTime(res.totalTimeMs);
        if (res.totalCharacters !== undefined) setTotalOperatorsUsed(res.totalCharacters);
      }
    } catch(e) {
      console.error(e);
    }
    
    // trigger next round
    initGame(false, true);
  };
`;

content = content.replace('  const initGame = useCallback((startAsIdle = false, isSkip = false) => {', skipFunction + '\n  const initGame = useCallback((startAsIdle = false, isSkip = false) => {');

fs.writeFileSync('src/App.tsx', content, 'utf8');
