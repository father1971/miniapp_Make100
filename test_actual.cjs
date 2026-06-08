const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const start = code.indexOf('function gcd');
const end = code.indexOf('const getTicketStyles');
const solverCode = code.substring(start, end);

eval(solverCode);

console.log("Result for 100 0 0 0:", calculateResult(['1', '0', '0', '0', '0', '0'], ['', '', '', ' ', ' ', ' ', '']));
console.log("Result for 100.0.1:", calculateResult(['1', '0', '0', '0', '1'], ['', '', ',', ',', '']));
console.log("Result for 100():", calculateResult(['1', '0', '0'], ['', '', '()']));
console.log("Result for -5+105:", calculateResult(['5', '1', '0', '5'], ['-', '+', '', '']));
