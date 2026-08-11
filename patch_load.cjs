const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add modeStats to the stats loaded/saved from localStorage in useEffect
code = code.replace(
  /const stats = \{ solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, bestTimeMs, minCharacters, themePreference, language, gameMode, soundEnabled, vibrationEnabled, hasSeenOnboarding \};/g,
  'const stats = { solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, bestTimeMs, minCharacters, themePreference, language, gameMode, soundEnabled, vibrationEnabled, hasSeenOnboarding, modeStats };'
);

// In the API stats restore section, add restoring of modeStats
code = code.replace(
  /if \(apiStats\.settings\) \{/g,
  `if (apiStats.modeStats) setModeStats(apiStats.modeStats);\n              if (apiStats.settings) {`
);

// Also save it when setting localStorage from apiStats
code = code.replace(
  /hasSeenOnboarding: apiStats\.settings\?\.hasSeenOnboarding !== undefined \? apiStats\.settings\.hasSeenOnboarding : false\n              \}\)\);/g,
  `hasSeenOnboarding: apiStats.settings?.hasSeenOnboarding !== undefined ? apiStats.settings.hasSeenOnboarding : false,
                modeStats: apiStats.modeStats || {}
              }));`
);

// When restoring localStats where localSolved > serverSolved, also restore modeStats
code = code.replace(
  /if \(localStats\.hasSeenOnboarding !== undefined\) setHasSeenOnboarding\(localStats\.hasSeenOnboarding\);/g,
  `if (localStats.hasSeenOnboarding !== undefined) setHasSeenOnboarding(localStats.hasSeenOnboarding);
              if (localStats.modeStats) setModeStats(localStats.modeStats);`
);

// When first time sync from local
code = code.replace(
  /if \(localStats\?\.hasSeenOnboarding !== undefined\) setHasSeenOnboarding\(localStats\.hasSeenOnboarding\);/g,
  `if (localStats?.hasSeenOnboarding !== undefined) setHasSeenOnboarding(localStats.hasSeenOnboarding);
            if (localStats?.modeStats) setModeStats(localStats.modeStats);`
);

fs.writeFileSync('src/App.tsx', code);
