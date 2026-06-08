function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b > 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

class Frac {
  constructor(n, d) {
    let g = gcd(n, d);
    this.n = n / g;
    this.d = d / g;
    if (this.d < 0) {
      this.n = -this.n;
      this.d = -this.d;
    }
  }
  add(o) { return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Frac(this.n * o.n, this.d * o.d); }
  div(o) { 
    if (o.n === 0) throw new Error("Division by zero");
    let res = new Frac(this.n * o.d, this.d * o.n); 
    if (!res.isTerm()) throw new Error("Infinite decimal");
    return res;
  }
  isTerm() {
    let d = this.d;
    while (d % 2 === 0) d /= 2;
    while (d % 5 === 0) d /= 5;
    return d === 1;
  }
}

function parseFrac(str) {
  if (str.includes('.')) {
    let parts = str.split('.');
    let decLen = parts[1].length;
    let n = parseInt(parts[0] + parts[1], 10);
    let d = Math.pow(10, decLen);
    return new Frac(n, d);
  }
  return new Frac(parseInt(str, 10), 1);
}

function evaluateStrict(expr) {
  // Tokenize
  let tokens = [];
  let num = '';
  for (let i = 0; i < expr.length; i++) {
    let c = expr[i];
    if (/[0-9.]/.test(c)) {
      num += c;
    } else if (/[+\-*/()]/.test(c)) {
      if (num) {
        tokens.push(parseFrac(num));
        num = '';
      }
      tokens.push(c);
    }
  }
  if (num) tokens.push(parseFrac(num));

  // Shunting yard
  let output = [];
  let ops = [];
  let prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
  for (let t of tokens) {
    if (t instanceof Frac) {
      output.push(t);
    } else if (t === '(') {
      ops.push(t);
    } else if (t === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') {
        output.push(ops.pop());
      }
      ops.pop();
    } else {
      while (ops.length && prec[ops[ops.length - 1]] >= prec[t]) {
        output.push(ops.pop());
      }
      ops.push(t);
    }
  }
  while (ops.length) output.push(ops.pop());

  // Evaluate postfix
  let stack = [];
  for (let t of output) {
    if (t instanceof Frac) {
      stack.push(t);
    } else {
      let b = stack.pop();
      let a = stack.pop();
      if (t === '+') stack.push(a.add(b));
      if (t === '-') stack.push(a.sub(b));
      if (t === '*') stack.push(a.mul(b));
      if (t === '/') stack.push(a.div(b));
    }
  }
  return stack[0];
}

try {
  let res1 = evaluateStrict("(6-2+6)/(0.9/9)");
  console.log("res1", res1.n, res1.d);
} catch (e) {
  console.log("res1 error", e.message);
}

try {
  let res2 = evaluateStrict("(6-2+6)/0.9*9");
  console.log("res2", res2.n, res2.d);
} catch (e) {
  console.log("res2 error", e.message);
}
