import jwt from 'jsonwebtoken';

async function run() {
  const secret = process.env.JWT_SECRET || 'local_development_secret_do_not_use_in_prod';
  const token = jwt.sign({ tgId: 123456, mock: false }, secret, { expiresIn: '24h' });
  
  console.log("Token:", token);
  
  const saveRes = await fetch('http://localhost:3000/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      solvedCount: 5,
      totalTimeMs: 5000,
      totalCharacters: 20
    })
  });
  
  console.log("Save status:", saveRes.status);
  console.log("Save response:", await saveRes.text());
  
  const getRes = await fetch('http://localhost:3000/api/user', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log("Get status:", getRes.status);
  console.log("Get response:", await getRes.text());
}

run();
