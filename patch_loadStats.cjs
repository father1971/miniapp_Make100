const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetRegex = /useEffect\(\(\) => \{\n    if \(\!isAuthReady \|\| isTgValidating\) return;\n\n    const loadStats = async \(\) => \{[\s\S]*?loadStats\(\);\n  \}, \[isAuthReady, isTgValidating, tgUser\]\);/g;

const newBlock = `  useEffect(() => {
    if (!isAuthReady || isTgValidating) return;

    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
      } catch (e) {
        console.error(e);
      }
    }

    const loadStats = async () => {
      let referrerId: number | undefined = undefined;

      if (tg && tg.initDataUnsafe) {
        const startParam = tg.initDataUnsafe.start_param;
        if (startParam) {
          const parsedId = parseInt(startParam, 10);
          if (!isNaN(parsedId)) {
            referrerId = parsedId;
          }
        }
      }

      const applyStatsToState = (data: any) => {
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

        const initialStats = {
          solvedCount: 0,
          skippedCount: 0,
          totalTimeMs: 0,
          totalCharacters: 0,
          settings: {},
          modeStats: {},
          coins: referrerId ? 250 : 100,
          hintsCount: 3,
          referredBy: referrerId,
          referralCount: 0
        };

        applyStatsToState(initialStats);
        localStorage.setItem(\`stats_\${tgUser.id}\`, JSON.stringify(initialStats));
        
        // Immediately save the new user to server to record referral
        saveUserStats({
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
          avatarUrl: tgUser.photo_url,
          ...initialStats
        });
        console.log("New referral user registered on server immediately!");

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
    };

    const currentUserId = tg?.initDataUnsafe?.user?.id;
    if (currentUserId) {
      const lastLogged = localStorage.getItem('last_logged_user_id');
      if (lastLogged && lastLogged !== String(currentUserId)) {
        localStorage.removeItem('make100_stats');
        localStorage.removeItem(\`stats_\${lastLogged}\`);
      }
      localStorage.setItem('last_logged_user_id', String(currentUserId));
    }
    
    loadStats();
  }, [isAuthReady, isTgValidating, tgUser]);`;

code = code.replace(targetRegex, newBlock);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx loadStats patched successfully.');
