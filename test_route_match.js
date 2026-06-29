import express from 'express';
const app = express();
try {
  app.get('*', (req, res) => res.send('matched *'));
} catch (e) {
  console.log('* failed:', e.message);
}
try {
  app.get('(.*)', (req, res) => res.send('matched (.*)'));
} catch (e) {
  console.log('(.*) failed:', e.message);
}

app.listen(3002, () => {
    fetch('http://localhost:3002/foo/bar').then(r => r.text()).then(t => console.log('Response:', t)).finally(() => process.exit(0));
});
