import fs from 'fs';

const filePath = './src/App.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const replacement = `
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Auth is handled by telegram token logic below.
    // If we're not in TG, we can mock it
    setUser({ id: 1 });
    setIsAuthReady(true);
  }, []);

  const fetchLeaderboardData = async () => {
    if (isPreviewEnv) {
      setIsLoadingLeaderboard(true);
      setTimeout(() => {
        setLeaderboardData([
          { id: '1', displayName: 'Алексей Иванов', solvedCount: 142, totalOperatorsUsed: 432, unsolvedCount: 12, totalSolveTime: 2311 },
          { id: '2', displayName: 'Мария Петрова', solvedCount: 115, totalOperatorsUsed: 360, unsolvedCount: 8, totalSolveTime: 1894 }
        ]);
        setIsLoadingLeaderboard(false);
      }, 500);
      return;
    }

    setIsLoadingLeaderboard(true);
    try {
      const data = await fetchLeaderboard();
      setLeaderboardData(data.map((p: any) => ({
        id: p.id,
        displayName: [p.firstName, p.lastName].filter(Boolean).join(' ') || p.username || 'Player',
        photoURL: p.avatarUrl || '',
        ...p
      })));
    } catch (e) {
      console.error(e);
      setLeaderboardData([]);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  // We assign it to the same name so the UI continues working
  const fetchLeaderboard = fetchLeaderboardData;

  useEffect(() => {
    if (!isAuthReady || isTgValidating) return;

    const loadStats = async () => {
      const loadFromLocal = () => {
        const localStats = localStorage.getItem('make100_stats');
        if (localStats) {
          try {
            const parsed = JSON.parse(localStats);
            setSolvedCount(parsed.solvedCount || 0);
            setUnsolvedCount(parsed.unsolvedCount || 0);
            setTotalSolveTime(parsed.totalSolveTime || 0);
            setTotalOperatorsUsed(parsed.totalOperatorsUsed || 0);
            if (parsed.themePreference) setThemePreference(parsed.themePreference);
            if (parsed.language) setLanguage(parsed.language);
            if (parsed.gameMode) setGameMode(parsed.gameMode);
            if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
            if (parsed.vibrationEnabled !== undefined) setVibrationEnabled(parsed.vibrationEnabled);
            if (parsed.hasSeenOnboarding !== undefined) setHasSeenOnboarding(parsed.hasSeenOnboarding);
            return true;
          } catch (e) { console.error(e); }
        }
        return false;
      };

      if (isPreviewEnv) {
        loadFromLocal();
        setStatsLoaded(true);
        return;
      }

      if (tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999 && getAuthToken()) {
        try {
          const apiStats = await fetchUserStats();
          const localStatsStr = localStorage.getItem('make100_stats');
          let localStats: any = null;
          if (localStatsStr) {
            try {
              localStats = JSON.parse(localStatsStr);
            } catch(e) {}
          }
          const localSolved = localStats?.solvedCount || 0;

          if (apiStats) {
            const serverSolved = apiStats.solvedCount || 0;
            if (localSolved > serverSolved) {
              setSolvedCount(localSolved);
              setUnsolvedCount(localStats.unsolvedCount || 0);
              setTotalSolveTime(localStats.totalSolveTime || 0);
              setTotalOperatorsUsed(localStats.totalOperatorsUsed || 0);
              if (localStats.themePreference) setThemePreference(localStats.themePreference);
              if (localStats.language) setLanguage(localStats.language);
              if (localStats.gameMode) setGameMode(localStats.gameMode);
              if (localStats.soundEnabled !== undefined) setSoundEnabled(localStats.soundEnabled);
              if (localStats.vibrationEnabled !== undefined) setVibrationEnabled(localStats.vibrationEnabled);
              if (localStats.hasSeenOnboarding !== undefined) setHasSeenOnboarding(localStats.hasSeenOnboarding);
              
              await saveUserStats({
                firstName: tgUser.first_name,
                lastName: tgUser.last_name,
                username: tgUser.username,
                avatarUrl: tgUser.photo_url,
                solvedCount: localSolved,
                skippedCount: localStats.unsolvedCount || 0,
                totalTimeMs: localStats.totalSolveTime || 0,
                totalCharacters: localStats.totalOperatorsUsed || 0,
                settings: {
                  themePreference: localStats.themePreference || 'auto',
                  language: localStats.language || 'ru',
                  gameMode: localStats.gameMode || 'ticket',
                  soundEnabled: localStats.soundEnabled !== undefined ? localStats.soundEnabled : true,
                  vibrationEnabled: localStats.vibrationEnabled !== undefined ? localStats.vibrationEnabled : true,
                  hasSeenOnboarding: localStats.hasSeenOnboarding !== undefined ? localStats.hasSeenOnboarding : false
                }
              });
            } else {
              setSolvedCount(serverSolved);
              setUnsolvedCount(apiStats.skippedCount || 0);
              setTotalSolveTime(apiStats.totalTimeMs || 0);
              setTotalOperatorsUsed(apiStats.totalCharacters || 0);
              if (apiStats.settings) {
                if (apiStats.settings.themePreference) setThemePreference(apiStats.settings.themePreference);
                if (apiStats.settings.language) setLanguage(apiStats.settings.language);
                if (apiStats.settings.gameMode) setGameMode(apiStats.settings.gameMode);
                if (apiStats.settings.soundEnabled !== undefined) setSoundEnabled(apiStats.settings.soundEnabled);
                if (apiStats.settings.vibrationEnabled !== undefined) setVibrationEnabled(apiStats.settings.vibrationEnabled);
                if (apiStats.settings.hasSeenOnboarding !== undefined) setHasSeenOnboarding(apiStats.settings.hasSeenOnboarding);
              }
              localStorage.setItem('make100_stats', JSON.stringify({
                solvedCount: serverSolved,
                unsolvedCount: apiStats.skippedCount || 0,
                totalSolveTime: apiStats.totalTimeMs || 0,
                totalOperatorsUsed: apiStats.totalCharacters || 0,
                themePreference: apiStats.settings?.themePreference || 'auto',
                language: apiStats.settings?.language || 'ru',
                gameMode: apiStats.settings?.gameMode || 'ticket',
                soundEnabled: apiStats.settings?.soundEnabled !== undefined ? apiStats.settings.soundEnabled : true,
                vibrationEnabled: apiStats.settings?.vibrationEnabled !== undefined ? apiStats.settings.vibrationEnabled : true,
                hasSeenOnboarding: apiStats.settings?.hasSeenOnboarding !== undefined ? apiStats.settings.hasSeenOnboarding : false
              }));
            }
          } else {
            // First time sync from local
            const currentSolved = localSolved || 0;
            const currentUnsolved = localStats?.unsolvedCount || 0;
            const currentSolveTime = localStats?.totalSolveTime || 0;
            const currentOperators = localStats?.totalOperatorsUsed || 0;
            
            setSolvedCount(currentSolved);
            setUnsolvedCount(currentUnsolved);
            setTotalSolveTime(currentSolveTime);
            setTotalOperatorsUsed(currentOperators);
            if (localStats?.themePreference) setThemePreference(localStats.themePreference);
            if (localStats?.language) setLanguage(localStats.language);
            if (localStats?.gameMode) setGameMode(localStats.gameMode);
            if (localStats?.soundEnabled !== undefined) setSoundEnabled(localStats.soundEnabled);
            if (localStats?.vibrationEnabled !== undefined) setVibrationEnabled(localStats.vibrationEnabled);
            if (localStats?.hasSeenOnboarding !== undefined) setHasSeenOnboarding(localStats.hasSeenOnboarding);

            await saveUserStats({
                firstName: tgUser.first_name,
                lastName: tgUser.last_name,
                username: tgUser.username,
                avatarUrl: tgUser.photo_url,
                solvedCount: currentSolved,
                skippedCount: currentUnsolved,
                totalTimeMs: currentSolveTime,
                totalCharacters: currentOperators,
                settings: {
                  themePreference: localStats?.themePreference || 'auto',
                  language: localStats?.language || 'ru',
                  gameMode: localStats?.gameMode || 'ticket',
                  soundEnabled: localStats?.soundEnabled !== undefined ? localStats.soundEnabled : true,
                  vibrationEnabled: localStats?.vibrationEnabled !== undefined ? localStats.vibrationEnabled : true,
                  hasSeenOnboarding: localStats?.hasSeenOnboarding !== undefined ? localStats.hasSeenOnboarding : false
                }
            });
          }
          setStatsLoaded(true);
          return;
        } catch (e) {
          console.error("API load error", e);
        }
      }

      loadFromLocal();
      setStatsLoaded(true);
    };

    loadStats();
  }, [isAuthReady, isTgValidating, tgUser]);

  useEffect(() => {
    if (!statsLoaded) return;
    
    const stats = { solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, themePreference, language, gameMode, soundEnabled, vibrationEnabled, hasSeenOnboarding };
    const statsStr = JSON.stringify(stats);
    
    localStorage.setItem('make100_stats', statsStr);

    if (isPreviewEnv) {
      return;
    }

    if (tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999 && getAuthToken()) {
      saveUserStats({
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
        avatarUrl: tgUser.photo_url,
        solvedCount,
        skippedCount: unsolvedCount,
        totalTimeMs: totalSolveTime,
        totalCharacters: totalOperatorsUsed,
        settings: {
          themePreference,
          language,
          gameMode,
          soundEnabled,
          vibrationEnabled,
          hasSeenOnboarding
        }
      });
    }

    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initData && tg?.CloudStorage) {
      try {
        tg.CloudStorage.setItem('make100_stats', statsStr);
      } catch (e) {
        console.error("CloudStorage save error", e);
      }
    }
  }, [solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, theme, language, gameMode, soundEnabled, vibrationEnabled, statsLoaded, tgUser]);

  useEffect(() => {
    setPlayerRank(null);
  }, [isAuthReady, user, solvedCount]);
`;

const startIndex = content.indexOf('  // Firebase Auth State');
const endIndex = content.indexOf('  const showHint = async () => {');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + replacement + '\n' + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log("Successfully replaced auth/db sync logic in App.tsx");
} else {
  console.log("Could not find start or end index.");
}
