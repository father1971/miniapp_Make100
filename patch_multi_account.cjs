const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetCheckAndInitStart = `    const checkAndInit = async () => {
      if (isInitializing) return false;
      isInitializing = true;`;

const replacementCheckAndInitStart = `    const checkAndInit = async () => {
      if (isInitializing) return false;
      isInitializing = true;
      
      const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
      const tgUserId = tg?.initDataUnsafe?.user?.id;
      if (tgUserId) {
        const lastUserId = localStorage.getItem('last_logged_user_id');
        if (lastUserId !== String(tgUserId)) {
          localStorage.removeItem('make100_stats');
          localStorage.removeItem('make100_tgUser');
          localStorage.setItem('last_logged_user_id', String(tgUserId));
        }
      }`;

code = code.replace(targetCheckAndInitStart, replacementCheckAndInitStart);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx multi account shield patched!');
