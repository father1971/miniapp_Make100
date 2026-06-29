import fs from 'fs';

const filePath = './src/App.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the gameProxy branch
const targetGameProxy = `        // 2. Try Telegram Game Proxy (HTML5 Games via Bot API)
        const gameProxy = (window as any).TelegramGameProxy;
        if (gameProxy && gameProxy.initParams && (gameProxy.initParams.user_id || gameProxy.initParams.chat_id)) {
          if (isMounted) {
            setTgUser({
              id: gameProxy.initParams.user_id || 1,
              first_name: "Player",
            });
            setIsTgValidating(false);
          }
          return true;
        }`;

const replaceGameProxy = `        // 2. Try Telegram Game Proxy (HTML5 Games via Bot API)
        const gameProxy = (window as any).TelegramGameProxy;
        if (gameProxy && gameProxy.initParams && (gameProxy.initParams.user_id || gameProxy.initParams.chat_id)) {
          const fallbackId = gameProxy.initParams.user_id || 1;
          try {
            const response = await fetch('/api/auth/telegram', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fallbackUserId: fallbackId })
            });
            const data = await response.json();
            if (response.ok && data.token) {
              setAuthToken(data.token);
              try { sessionStorage.setItem('tgAuthToken', data.token); } catch(e){}
            }
          } catch(e) {}

          if (isMounted) {
            setTgUser({
              id: fallbackId,
              first_name: "Player",
            });
            setIsTgValidating(false);
          }
          return true;
        }`;
content = content.replace(targetGameProxy, replaceGameProxy);

// Replace the fallback branch
const targetFallback = `          if (tgShareScoreUrl || tgUserId || tgInitData || tgGameId || tgChatId) {
            if (isMounted) {
              setTgUser({
                id: tgUserId ? Number(tgUserId) : 1,
                first_name: "Player",
              });
              setIsTgValidating(false);
            }
            return true;
          }`;

const replaceFallback = `          if (tgShareScoreUrl || tgUserId || tgInitData || tgGameId || tgChatId) {
            const fallbackId = tgUserId ? Number(tgUserId) : 1;
            try {
              const response = await fetch('/api/auth/telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fallbackUserId: fallbackId })
              });
              const data = await response.json();
              if (response.ok && data.token) {
                setAuthToken(data.token);
                try { sessionStorage.setItem('tgAuthToken', data.token); } catch(e){}
              }
            } catch(e) {}

            if (isMounted) {
              setTgUser({
                id: fallbackId,
                first_name: "Player",
              });
              setIsTgValidating(false);
            }
            return true;
          }`;
content = content.replace(targetFallback, replaceFallback);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Patched App.tsx with fallback token logic");
