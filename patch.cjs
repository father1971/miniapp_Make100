const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetFormulaBlock = `      const currentInput = gaps.join('');
      
      let fullExpression = "";
      for (let i = 0; i < digits.length; i++) {
        fullExpression += digits[i];
        if (i < gaps.length && gaps[i]) {
          fullExpression += gaps[i];
        }
      }
      
      lastRoundExpressionRef.current = fullExpression;`;

const newFormulaBlock = `      let fullExpression = gaps[0] || "";
      for (let i = 0; i < digits.length; i++) {
        fullExpression += digits[i];
        fullExpression += gaps[i + 1] || "";
      }
      fullExpression = fullExpression.replace(/\\s+/g, '');
      
      lastRoundExpressionRef.current = fullExpression;`;

content = content.replace(targetFormulaBlock, newFormulaBlock);

const targetStateUpdateBlock = `          setStats(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              score: res.score !== undefined ? res.score : prev.score,
              coins: res.coins !== undefined ? res.coins : prev.coins,
              solvedCount: res.solvedCount !== undefined ? res.solvedCount : prev.solvedCount,
              modeStats: res.modeStats !== undefined ? res.modeStats : prev.modeStats
            };
          });

        if (res.solvedCount !== undefined) setSolvedCount(res.solvedCount);`;

const newStateUpdateBlock = `          setStats(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              score: res.score !== undefined ? res.score : prev.score,
              coins: res.coins !== undefined ? res.coins : prev.coins,
              solvedCount: res.solvedCount !== undefined ? res.solvedCount : prev.solvedCount,
              modeStats: res.modeStats !== undefined ? res.modeStats : prev.modeStats
            };
          });

          if (res.roundScore !== undefined) setLastEarnedScore(res.roundScore);
          if (res.coinsEarned !== undefined) setLastEarnedCoins(res.coinsEarned);

        if (res.solvedCount !== undefined) setSolvedCount(res.solvedCount);`;

content = content.replace(targetStateUpdateBlock, newStateUpdateBlock);

const targetUIBlock = `<div className="text-center py-2 mt-2">
                  <span className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-500 text-sm font-black animate-bounce">
                    🏆 +{lastEarnedScore} {t.earnedRatingPoints || 'очков рейтинга!'}
                  </span>
                </div>`;

const newUIBlock = `<div className="text-center py-2 mt-2 flex flex-wrap justify-center gap-2">
                  <span className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-500 text-sm font-black animate-bounce">
                    🏆 +{lastEarnedScore} {t.earnedRatingPoints || 'очков рейтинга!'}
                  </span>
                  <span className="inline-block px-4 py-2 bg-yellow-500/10 border border-yellow-500/25 rounded-2xl text-yellow-600 dark:text-yellow-400 text-sm font-black animate-bounce" style={{ animationDelay: '100ms' }}>
                    🪙 +{lastEarnedCoins} {t.coins || 'монет'}
                  </span>
                </div>`;

content = content.replace(targetUIBlock, newUIBlock);

fs.writeFileSync('src/App.tsx', content, 'utf8');
