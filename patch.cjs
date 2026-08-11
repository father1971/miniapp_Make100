const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const handleGameUpdateStr = `  const handleGameUpdate = useCallback((isSolved: boolean, solutionLength: number, timeSpent: number) => {
    const activeMode = gameMode === 'ticket' ? 'tickets' : 'car';
    
    setModeStats(prev => {
      const currentModeStats = prev[activeMode] || {
        solvedCount: 0,
        skippedCount: 0,
        bestTimeMs: null,
        minCharacters: null,
        totalTimeMs: 0,
        totalCharacters: 0
      };
      
      const updatedModeStats = {
        ...prev,
        [activeMode]: {
          solvedCount: currentModeStats.solvedCount + (isSolved ? 1 : 0),
          skippedCount: currentModeStats.skippedCount + (isSolved ? 0 : 1),
          bestTimeMs: isSolved
            ? (currentModeStats.bestTimeMs === null ? timeSpent : Math.min(currentModeStats.bestTimeMs, timeSpent))
            : currentModeStats.bestTimeMs,
          minCharacters: isSolved
            ? (currentModeStats.minCharacters === null ? solutionLength : Math.min(currentModeStats.minCharacters, solutionLength))
            : currentModeStats.minCharacters,
          totalTimeMs: currentModeStats.totalTimeMs + timeSpent,
          totalCharacters: currentModeStats.totalCharacters + solutionLength
        }
      };
      return updatedModeStats;
    });

    if (isSolved) {
      setSolvedCount(prev => prev + 1);
      setTotalSolveTime(prev => prev + timeSpent);
      setTotalOperatorsUsed(prev => prev + solutionLength);
      setBestTimeMs(prev => (prev === null || timeSpent < prev) ? timeSpent : prev);
      setMinCharacters(prev => (prev === null || solutionLength < prev) ? solutionLength : prev);
    } else {
      setUnsolvedCount(prev => prev + 1);
      setTotalSolveTime(prev => prev + timeSpent);
      setTotalOperatorsUsed(prev => prev + solutionLength);
    }
  }, [gameMode]);`;

// Insert `handleGameUpdate` right before `initGame`
if (!code.includes('handleGameUpdate =')) {
  code = code.replace(
    '  const initGame = useCallback',
    handleGameUpdateStr + '\n\n  const initGame = useCallback'
  );
}

// Update `initGame` skip logic
code = code.replace(
  /setUnsolvedCount\(prev => prev \+ 1\);\s*playSound\('skip'\);/g,
  `handleGameUpdate(false, 0, elapsedTime);\n      playSound('skip');`
);

// Update Win useEffect
const winEffectMatch = code.match(/\/\/ Update statistics[\s\S]*?setSelectedSlot\(null\);/);
if (winEffectMatch) {
  code = code.replace(
    winEffectMatch[0],
    `// Update statistics via handleGameUpdate
      const operatorsUsed = gaps.join('').replace(/[0-9.]/g, '').length;
      handleGameUpdate(true, operatorsUsed, elapsedTime);
      
      setSelectedSlot(null);`
  );
}

fs.writeFileSync('src/App.tsx', code);
