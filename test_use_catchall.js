import express from 'express';
const app = express();
app.use((req, res) => res.send('matched catch-all use'));
app.listen(3002, () => {
    fetch('http://localhost:3002/foo/bar').then(r => r.text()).then(t => console.log('Response:', t)).finally(() => process.exit(0));
});
