import express from "express";
const app = express();
app.get('*all', (req, res) => res.send('ok'));
console.log('Success');
