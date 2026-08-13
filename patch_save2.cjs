const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetSaveStart = `const dataToSave = { solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, bestTimeMs, minCharacters, themePreference, language, gameMode, soundEnabled, vibrationEnabled, hasSeenOnboarding, modeStats, coins: stats.coins, hintsCount: stats.hintsCount };
    const statsStr = JSON.stringify(dataToSave);
    
    localStorage.setItem('make100_stats', statsStr);

    if (isPreviewEnv) {
      return;
    }`;

const newSaveStart = `const dataToSave = { 
      solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, 
      bestTimeMs, minCharacters, 
      settings: { themePreference, language, gameMode, soundEnabled, vibrationEnabled, hasSeenOnboarding }, 
      modeStats, coins: stats.coins, hintsCount: stats.hintsCount 
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
    }`;

code = code.replace(targetSaveStart, newSaveStart);

const targetCloudStorage = `    if (tg?.initData && tg?.CloudStorage) {
      try {
        tg.CloudStorage.setItem('make100_stats', statsStr);
      } catch (e) {
        console.error("Failed to save to CloudStorage", e);
      }
    }`;

const newCloudStorage = `    if (tg?.initData && tg?.CloudStorage && tgUser?.id) {
      try {
        tg.CloudStorage.setItem(\`stats_\${tgUser.id}\`, statsStr);
      } catch (e) {
        console.error("Failed to save to CloudStorage", e);
      }
    }`;

code = code.replace(targetCloudStorage, newCloudStorage);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx save patched');
