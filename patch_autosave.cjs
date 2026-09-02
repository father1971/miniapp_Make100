const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const dataToSave = \{[\s\S]*?lastRoundSolveTimeMsRef\.current = 0;\n    \}/;
const match = content.match(regex);
if (match) {
  const newSaveBlock = `const dataToSave = { 
      solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, 
      bestTimeMs, minCharacters, 
      settings: { themePreference, language, gameMode, soundEnabled, vibrationEnabled, hasSeenOnboarding }, 
      modeStats, coins: stats.coins, hintsCount: stats.hintsCount,
      referralCount: (stats as any)?.referralCount ?? 0,
      referredBy: (stats as any)?.referredBy ?? null,
      createdAt: (stats as any)?.createdAt
    };
    const statsStr = JSON.stringify(dataToSave);
    
    if (isPreviewEnv) {
      localStorage.setItem('stats_preview', statsStr);
      return;
    }
    
    if (tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999) {
      localStorage.setItem(\`stats_\${tgUser.id}\`, statsStr);
    } else {
      localStorage.setItem('make100_stats', statsStr);
    }

    if (tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999) {
      saveUserStats({
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
        avatarUrl: tgUser.photo_url,
        settings: {
          themePreference,
          language,
          gameMode,
          currentMode: gameMode === 'ticket' ? 'tickets' : 'car',
          soundEnabled,
          vibrationEnabled,
          hasSeenOnboarding
        }
      });
    }`;
  content = content.replace(regex, newSaveBlock);
  fs.writeFileSync('src/App.tsx', content, 'utf8');
}
