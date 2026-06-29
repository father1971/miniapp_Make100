fetch('http://localhost:3005/assets/index-CYYhliyo.js').then(r => {
  console.log('Status:', r.status);
  console.log('Headers:', r.headers.get('content-type'));
  return r.text();
}).then(t => {
  console.log('Response length:', t.length);
  process.exit(0);
}).catch(console.error);
