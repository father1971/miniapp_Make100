import jwt from 'jsonwebtoken';

async function run() {
  const secret = process.env.JWT_SECRET || 'local_development_secret_do_not_use_in_prod';
  const token = jwt.sign({ tgId: 999999, mock: false }, secret, { expiresIn: '24h' });
  
  console.log("Token:", token);
  
  // 1. Fetch user stats (should be 404, user not found)
  const fetchRes1 = await fetch('http://localhost:3000/api/user', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log("Fetch 1 status:", fetchRes1.status);
  
  let apiStats = null;
  if (fetchRes1.ok) {
     apiStats = await fetchRes1.json();
  }
  console.log("Fetch 1 API stats:", apiStats);

  // 2. Save user stats (like the frontend does for new user)
  const saveStats = {
    firstName: 'TestUser',
    lastName: undefined,
    username: 'test',
    avatarUrl: undefined,
    solvedCount: 0,
    skippedCount: 0,
    totalTimeMs: 0,
    totalCharacters: 0,
    settings: {
      themePreference: 'auto',
      language: 'ru',
      gameMode: 'ticket',
      soundEnabled: true,
      vibrationEnabled: true,
      hasSeenOnboarding: false
    }
  };

  const saveRes = await fetch('http://localhost:3000/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(saveStats)
  });
  console.log("Save status:", saveRes.status);
  console.log("Save response:", await saveRes.text());

  // 3. Fetch user stats again (should be 200)
  const fetchRes2 = await fetch('http://localhost:3000/api/user', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log("Fetch 2 status:", fetchRes2.status);
  if (fetchRes2.ok) {
     console.log("Fetch 2 API stats:", await fetchRes2.json());
  }
}

run();
