import jwt from 'jsonwebtoken';
import crypto from 'crypto';

async function run() {
  const secret = process.env.JWT_SECRET || 'local_development_secret_do_not_use_in_prod';
  
  const saveRes = await fetch('http://localhost:3000/api/auth/telegram', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fallbackUserId: 888888
    })
  });
  
  console.log("Auth status:", saveRes.status);
  const data = await saveRes.json();
  console.log("Auth response:", data);

  if (data.token) {
    const saveStats = await fetch('http://localhost:3000/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`
      },
      body: JSON.stringify({
        firstName: 'Test888',
        solvedCount: 1,
        totalTimeMs: 100,
        totalCharacters: 1
      })
    });
    console.log("Save status:", saveStats.status);
    console.log("Save response:", await saveStats.text());
  }
}

run();
