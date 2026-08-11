const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add economy state and ref
const stateInsertion = `  const [stats, setStats] = useState({ coins: 0, hintsCount: 0 });
  const statsRef = useRef(stats);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

`;
code = code.replace(
  /  const \[modeStats, setModeStats\] = useState<Record<string, ModeDetail>>\(\{\}\);\n  const \[statsLoaded, setStatsLoaded\] = useState\(false\);/,
  `  const [modeStats, setModeStats] = useState<Record<string, ModeDetail>>({});
  const [statsLoaded, setStatsLoaded] = useState(false);

${stateInsertion}`
);

// 2. Add loading from apiStats
// When server is authoritative
code = code.replace(
  /              setMinCharacters\(apiStats\.minCharacters \?\? null\);/g,
  `              setMinCharacters(apiStats.minCharacters ?? null);
              setStats({ coins: apiStats.coins || 0, hintsCount: apiStats.hintsCount || 0 });`
);

// When local is authoritative (localStats > serverSolved)
code = code.replace(
  /              if \(localStats\.modeStats\) setModeStats\(localStats\.modeStats\);/g,
  `              if (localStats.modeStats) setModeStats(localStats.modeStats);
              if (localStats.coins !== undefined) setStats({ coins: localStats.coins, hintsCount: localStats.hintsCount || 0 });`
);

// First time sync from local
code = code.replace(
  /            if \(localStats\?\.modeStats\) setModeStats\(localStats\.modeStats\);/g,
  `            if (localStats?.modeStats) setModeStats(localStats.modeStats);
            if (localStats?.coins !== undefined) setStats({ coins: localStats.coins, hintsCount: localStats.hintsCount || 0 });`
);

// Add to saveUserStats payload (when local > server)
code = code.replace(
  /                minCharacters: localStats\.minCharacters \?\? undefined,/g,
  `                minCharacters: localStats.minCharacters ?? undefined,
                coins: localStats.coins || 0,
                hintsCount: localStats.hintsCount || 0,`
);
// And when first time sync from local
code = code.replace(
  /                minCharacters: localStats\?\.minCharacters \?\? undefined,/g,
  `                minCharacters: localStats?.minCharacters ?? undefined,
                coins: localStats?.coins || 0,
                hintsCount: localStats?.hintsCount || 0,`
);

// Also add coins/hintsCount to localStorage
code = code.replace(
  /                hasSeenOnboarding: apiStats\.settings\?\.hasSeenOnboarding !== undefined \? apiStats\.settings\.hasSeenOnboarding : false,\n                modeStats: apiStats\.modeStats \|\| \{\}\n              \}\)\);/g,
  `                hasSeenOnboarding: apiStats.settings?.hasSeenOnboarding !== undefined ? apiStats.settings.hasSeenOnboarding : false,
                modeStats: apiStats.modeStats || {},
                coins: apiStats.coins || 0,
                hintsCount: apiStats.hintsCount || 0
              }));`
);

// 3. Rename `stats` in useEffect and add economy to dependencies
code = code.replace(
  /    const stats = \{ solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, bestTimeMs, minCharacters, themePreference, language, gameMode, soundEnabled, vibrationEnabled, hasSeenOnboarding, modeStats \};/g,
  `    const dataToSave = { solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, bestTimeMs, minCharacters, themePreference, language, gameMode, soundEnabled, vibrationEnabled, hasSeenOnboarding, modeStats, coins: stats.coins, hintsCount: stats.hintsCount };`
);
code = code.replace(
  /    const statsStr = JSON\.stringify\(stats\);/g,
  `    const statsStr = JSON.stringify(dataToSave);`
);

// 4. Update saveUserStats payload in useEffect
code = code.replace(
  /        minCharacters: minCharacters \?\? undefined,/g,
  `        minCharacters: minCharacters ?? undefined,
        coins: stats.coins,
        hintsCount: stats.hintsCount,`
);

// update dependency array of that useEffect
code = code.replace(
  /statsLoaded, tgUser, modeStats\]\);/g,
  `statsLoaded, tgUser, modeStats, stats.coins, stats.hintsCount]);`
);


// 5. Add +10 coins on win
code = code.replace(
  /    if \(isSolved\) \{\n      setSolvedCount\(prev => prev \+ 1\);/g,
  `    if (isSolved) {
      setStats(prev => ({ ...prev, coins: prev.coins + 10 }));
      setSolvedCount(prev => prev + 1);`
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched part 1');
