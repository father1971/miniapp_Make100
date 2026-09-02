const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const isWinRegex = /if \(isWin && !won && !hintUsed\) \{[\s\S]*?setSelectedSlot\(null\);\n    \}/m;
const isWinMatch = content.match(isWinRegex);

if (isWinMatch) {
  const replacement = `if (isWin && !won && !hintUsed) {
      stopTimer();
      const exactSolveTimeMs = Date.now() - roundStartTimeRef.current;
      const exactSolveTimeSec = exactSolveTimeMs / 1000;
      setElapsedTime(exactSolveTimeSec);
      setWon(true);
      setGameState('idle');
      playSound('success');
      playVibration('success');
      
      setLastRoundTimeMs(exactSolveTimeMs);
      const currentInput = gaps.join('');
      lastRoundExpressionRef.current = currentInput;
      lastRoundSolveTimeMsRef.current = exactSolveTimeMs;

      // Validate on server
      submitGameSolve({
        formula: currentInput,
        digits: digits,
        elapsedTimeMs: exactSolveTimeMs,
        gameMode: gameMode
      }).then(res => {
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
          
          if (res.isNewGlobalRecord) {
             setIsNewRecord(true);
             try {
                confetti({
                  particleCount: 100,
                  spread: 80,
                  origin: { y: 0.6 },
                  zIndex: 9999
                });
             } catch (e) {}
             const tg = (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: { notificationOccurred: (type: string) => void } } } }).Telegram?.WebApp;
             if (tg?.HapticFeedback?.notificationOccurred) {
               try { tg.HapticFeedback.notificationOccurred('success'); } catch (e) {}
             }
          }
        }
      });

      setSelectedSlot(null);
    }`;
    content = content.replace(isWinRegex, replacement);
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
