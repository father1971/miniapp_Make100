const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace loadFromLocal and fetchUserStats block
const oldLoadBlockRegex = /const loadFromLocal = \(\) => \{[\s\S]*?loadFromLocal\(\);\n      setStatsLoaded\(true\);\n    \};/g;

const newLoadBlock = `      const applyStatsToState = (data: any) => {
        setSolvedCount(data.solvedCount || 0);
        setUnsolvedCount(data.skippedCount || data.unsolvedCount || 0);
        setTotalSolveTime(data.totalTimeMs || data.totalSolveTime || 0);
        setTotalOperatorsUsed(data.totalCharacters || data.totalOperatorsUsed || 0);
        setBestTimeMs(data.bestTimeMs ?? null);
        setMinCharacters(data.minCharacters ?? null);
        if (data.settings?.themePreference) setThemePreference(data.settings.themePreference);
        if (data.settings?.language) setLanguage(data.settings.language);
        if (data.settings?.gameMode) setGameMode(data.settings.gameMode);
        if (data.settings?.soundEnabled !== undefined) setSoundEnabled(data.settings.soundEnabled);
        if (data.settings?.vibrationEnabled !== undefined) setVibrationEnabled(data.settings.vibrationEnabled);
        if (data.settings?.hasSeenOnboarding !== undefined) setHasSeenOnboarding(data.settings.hasSeenOnboarding);
        if (data.modeStats) setModeStats(data.modeStats);
        setStats({ coins: data.coins !== undefined ? data.coins : 100, hintsCount: data.hintsCount !== undefined ? data.hintsCount : 3 });
      };

      if (isPreviewEnv) {
        const localStats = localStorage.getItem('stats_preview');
        if (localStats) {
          try {
            applyStatsToState(JSON.parse(localStats));
          } catch(e) {}
        }
        setStatsLoaded(true);
        return;
      }

      if (tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999) {
        try {
          const apiStats = await fetchUserStats();
          if (apiStats && apiStats.id) {
            applyStatsToState(apiStats);
            localStorage.setItem(\`stats_\${tgUser.id}\`, JSON.stringify(apiStats));
            setStatsLoaded(true);
            return;
          }
        } catch (e) {
          console.warn("Server unavailable, trying local cache:", e);
        }

        const localStatsStr = localStorage.getItem(\`stats_\${tgUser.id}\`);
        if (localStatsStr) {
          try {
            const localData = JSON.parse(localStatsStr);
            applyStatsToState(localData);
            console.log("Loaded local cache for ID:", tgUser.id);
            setStatsLoaded(true);
            return;
          } catch (err) {
            console.error("Local cache parse error:", err);
          }
        }

        applyStatsToState({
          solvedCount: 0,
          skippedCount: 0,
          totalTimeMs: 0,
          totalCharacters: 0,
          settings: {},
          modeStats: {},
          coins: 100,
          hintsCount: 3,
          referralCount: 0
        });
        setStatsLoaded(true);
      } else {
        const localStatsStr = localStorage.getItem('make100_stats');
        if (localStatsStr) {
          try {
            applyStatsToState(JSON.parse(localStatsStr));
          } catch(e) {}
        }
        setStatsLoaded(true);
      }
    };`;

code = code.replace(oldLoadBlockRegex, newLoadBlock);

fs.writeFileSync('src/App.tsx', code);
console.log('Load block patched.');
