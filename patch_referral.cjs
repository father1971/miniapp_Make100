const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tgParamCode = `    const loadStats = async () => {
      // Получаем данные от Telegram
      const tg = (window as any).Telegram?.WebApp;
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
`;

code = code.replace(/    const loadStats = async \(\) => \{/, tgParamCode);

const firstTimeCode = `            if (localStats?.modeStats) setModeStats(localStats.modeStats);
            
            // Apply referral bonus for new users
            const startingCoins = referrerId ? 250 : (localStats?.coins || 100);
            const startingHints = localStats?.hintsCount !== undefined ? localStats.hintsCount : 3;
            setStats({ coins: startingCoins, hintsCount: startingHints });

            await saveUserStats({
                firstName: tgUser.first_name,
                lastName: tgUser.last_name,
                username: tgUser.username,
                avatarUrl: tgUser.photo_url,
                solvedCount: currentSolved,
                skippedCount: currentUnsolved,
                totalTimeMs: currentSolveTime,
                totalCharacters: currentOperators,
                bestTimeMs: localStats?.bestTimeMs ?? undefined,
                minCharacters: localStats?.minCharacters ?? undefined,
                coins: startingCoins,
                hintsCount: startingHints,
                referredBy: referrerId,
                referralCount: 0,
`;

code = code.replace(/            if \(localStats\?\.modeStats\) setModeStats\(localStats\.modeStats\);\n            if \(localStats\?\.coins !== undefined\) setStats\(\{ coins: localStats\.coins, hintsCount: localStats\.hintsCount \|\| 0 \}\);\n\n            await saveUserStats\(\{[\s\S]*?minCharacters: localStats\?\.minCharacters \?\? undefined,\n                coins: localStats\?\.coins \|\| 0,\n                hintsCount: localStats\?\.hintsCount \|\| 0,/, firstTimeCode);

fs.writeFileSync('src/App.tsx', code);
console.log('Referral logic injected in loadStats');
