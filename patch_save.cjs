const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace all 3 `saveUserStats` payloads to include `modeStats` and `currentMode`
code = code.replace(
  /settings: \{\s*themePreference: localStats\.themePreference \|\| 'auto',\s*language: localStats\.language \|\| 'ru',\s*gameMode: localStats\.gameMode \|\| 'ticket',/g,
  `settings: {
                  themePreference: localStats.themePreference || 'auto',
                  language: localStats.language || 'ru',
                  gameMode: localStats.gameMode || 'ticket',
                  currentMode: (localStats.gameMode || 'ticket') === 'ticket' ? 'tickets' : 'car',`
);

code = code.replace(
  /settings: \{\s*themePreference: localStats\?\.themePreference \|\| 'auto',\s*language: localStats\?\.language \|\| 'ru',\s*gameMode: localStats\?\.gameMode \|\| 'ticket',/g,
  `settings: {
                  themePreference: localStats?.themePreference || 'auto',
                  language: localStats?.language || 'ru',
                  gameMode: localStats?.gameMode || 'ticket',
                  currentMode: (localStats?.gameMode || 'ticket') === 'ticket' ? 'tickets' : 'car',`
);

code = code.replace(
  /settings: \{\s*themePreference,\s*language,\s*gameMode,/g,
  `settings: {
          themePreference,
          language,
          gameMode,
          currentMode: gameMode === 'ticket' ? 'tickets' : 'car',`
);

// Add `modeStats` after `settings: { ... }` closing brace
// For the first payload:
code = code.replace(
  /hasSeenOnboarding: localStats\.hasSeenOnboarding !== undefined \? localStats\.hasSeenOnboarding : false\s*\}\s*\}\);/g,
  `hasSeenOnboarding: localStats.hasSeenOnboarding !== undefined ? localStats.hasSeenOnboarding : false
                },
                modeStats: localStats.modeStats || {}
              });`
);

// For the second payload:
code = code.replace(
  /hasSeenOnboarding: localStats\?\.hasSeenOnboarding !== undefined \? localStats\.hasSeenOnboarding : false\s*\}\s*\}\);/g,
  `hasSeenOnboarding: localStats?.hasSeenOnboarding !== undefined ? localStats.hasSeenOnboarding : false
                },
                modeStats: localStats?.modeStats || {}
            });`
);

// For the third payload:
code = code.replace(
  /hasSeenOnboarding\s*\}\s*\}\);/g,
  `hasSeenOnboarding
        },
        modeStats
      });`
);

fs.writeFileSync('src/App.tsx', code);
