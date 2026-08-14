const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `          // Immediately save the new user to server to record referral
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
          }`;

const replacement = `          // Immediately save the new user to server to record referral (background, no await)
          fetch(\`\${API_URL}/api/user\`, {
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
          }).then(() => {
            console.log("Фоновая регистрация нового пользователя завершена успешно!");
          }).catch(err => {
            console.error("Ошибка фоновой регистрации профиля:", err);
          });`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx background post patched.');
