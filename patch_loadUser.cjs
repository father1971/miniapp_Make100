const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /      if \(tgUser && tgUser\.id && tgUser\.id !== 1 && tgUser\.id !== 9999\) \{[\s\S]*?console\.log\("New referral user registered on server immediately!"\);\n\n        setStatsLoaded\(true\);\n      \}/g;

const newBlock = `      if (tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999) {
        let isNewUser = false;
        let serverData = null;

        try {
          const res = await fetch(\`\${API_URL}/api/user\`, { headers: getAuthHeader() });
          
          if (res.status === 200) {
            const data = await res.json();
            if (data && data.id) {
              serverData = data;
            } else {
              // Status 200 but no ID - fallback just in case
              isNewUser = true;
            }
          } else if (res.status === 404 || res.status === 401) {
            // User definitely not in DB (New referral user)
            isNewUser = true;
          }
        } catch (e) {
          console.warn("Server unavailable, falling back to local cache:", e);
        }

        if (serverData) {
          applyStatsToState(serverData);
          localStorage.setItem(\`stats_\${tgUser.id}\`, JSON.stringify(serverData));
          setStatsLoaded(true);
          return;
        }

        if (isNewUser) {
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
          try {
            await fetch(\`\${API_URL}/api/user\`, {
              method: 'POST',
              headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                firstName: tgUser.first_name,
                lastName: tgUser.last_name,
                username: tgUser.username,
                avatarUrl: tgUser.photo_url,
                ...initialStats
              })
            });
            console.log("Новый реферал успешно зарегистрирован на сервере сразу при входе!");
          } catch (postErr) {
            console.error("Ошибка при регистрации реферала:", postErr);
          }

          setStatsLoaded(true);
          return;
        }

        // If it was a network error (serverData = null and isNewUser = false), try local cache
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

        // Failsafe initialization if local cache doesn't exist
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
      }`;

code = code.replace(regex, newBlock);
fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx load user patched");
