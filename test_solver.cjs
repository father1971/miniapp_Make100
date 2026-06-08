const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const start = code.indexOf('function gcd');
const end = code.indexOf('const getTicketStyles');
const solverCode = code.substring(start, end);

eval(solverCode);

console.log("Solution for 253025:", findSolution(['2', '5', '3', '0', '2', '5']));
console.log("Solution for 094:", findSolution(['0', '9', '4']));
