const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add ref
code = code.replace("export default function App() {", 
"export default function App() {\n  const isStatsLoadedRef = useRef(false);");

// 2. Protect auto-save
code = code.replace("  useEffect(() => {\n    if (!statsLoaded) return;", 
"  useEffect(() => {\n    if (!statsLoaded) return;\n    if (!isStatsLoadedRef.current) {\n      console.log('[Save Shield] Блокировка автосохранения: свежий профиль еще не загружен.');\n      return;\n    }");

// 3. Rewrite loadStats body
const loadStatsRegex = /      if \(tgUser && tgUser\.id && tgUser\.id !== 1 && tgUser\.id !== 9999\) \{[\s\S]*?\/\/ If it was a network error \(serverData = null and isNewUser = false\), try local cache/;

const newLoadStats = `      if (tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999) {
        let isNewUser = false;
        let serverData = null;

        try {
          isStatsLoadedRef.current = false; // Сбрасываем флаг перед загрузкой
          const res = await fetch(\`\${API_URL}/api/user\`, { headers: getAuthHeader() });
          
          if (res.status === 200) {
            const data = await res.json();
            if (data && data.id) {
              serverData = data;
            } else {
              isNewUser = true;
            }
          } else if (res.status === 404 || res.status === 401) {
            isNewUser = true;
          }
        } catch (e) {
          console.warn("Server unavailable, falling back to local cache:", e);
        }

        if (serverData) {
          applyStatsToState(serverData);
          localStorage.setItem(\`stats_\${tgUser.id}\`, JSON.stringify(serverData));
          isStatsLoadedRef.current = true; // Разрешаем автосохранения
          console.log("Данные старого пользователя успешно загружены с сервера.");
          setStatsLoaded(true);
          return;
        }

        if (isNewUser) {
          console.log("Регистрация нового пользователя. ID пригласителя:", referrerId);
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
            console.log("Новый пользователь успешно зарегистрирован в базе данных!");
          } catch (postErr) {
            console.error("Ошибка при регистрации реферала:", postErr);
          }

          applyStatsToState(initialStats);
          localStorage.setItem(\`stats_\${tgUser.id}\`, JSON.stringify(initialStats));
          isStatsLoadedRef.current = true;
          setStatsLoaded(true);
          return;
        }

        // If it was a network error (serverData = null and isNewUser = false), try local cache`;

if (loadStatsRegex.test(code)) {
    code = code.replace(loadStatsRegex, newLoadStats);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Successfully patched App.tsx");
} else {
    console.log("Regex did not match");
}
