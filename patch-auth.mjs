import fs from 'fs';

const filePath = './src/App.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const target = `
            if (userToSet) {
              setTgUser(userToSet);`;

const replacement = `
            if (data.token) {
              setAuthToken(data.token);
              try {
                sessionStorage.setItem('tgAuthToken', data.token);
              } catch(e){}
            }

            if (userToSet) {
              setTgUser(userToSet);`;

content = content.replace(target, replacement);

// We should also load it from session storage at the start if available
const target2 = `            if (tg.initData && cachedInitData === tg.initData && cachedUser) {
              if (isMounted) {
                setTgUser(JSON.parse(cachedUser));
                setIsTgValidating(false);
              }
              return true;
            }`;

const replacement2 = `            if (tg.initData && cachedInitData === tg.initData && cachedUser) {
              if (isMounted) {
                const cachedToken = sessionStorage.getItem('tgAuthToken');
                if (cachedToken) setAuthToken(cachedToken);
                setTgUser(JSON.parse(cachedUser));
                setIsTgValidating(false);
              }
              return true;
            }`;

content = content.replace(target2, replacement2);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Patched auth token logic in App.tsx");
