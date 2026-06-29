const crypto = require('crypto');
const token = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';

// Key is 'WebAppData', Data is token
const secretA = crypto.createHmac('sha256', 'WebAppData').update(token).digest();

console.log(secretA.toString('hex'));
