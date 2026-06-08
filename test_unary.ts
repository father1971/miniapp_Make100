import fs from 'fs';
import { parse } from 'path';

function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b > 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  class Frac {
    n: number;
    d: number;
    constructor(n: number, d: number) {
      const g = gcd(n, d);
      this.n = n / g;
      this.d = d / g;
      if (this.d < 0) {
        this.n = -this.n;
        this.d = -this.d;
      }
    }
    add(o: Frac) { return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o: Frac) { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o: Frac) { return new Frac(this.n * o.n, this.d * o.d); }
    div(o: Frac) { return new Frac(this.n * o.d, this.d * o.n); }
    isTerm() {
      let d = this.d;
      while (d % 2 === 0) d /= 2;
      while (d % 5 === 0) d /= 5;
      return d === 1;
    }
  }

  function parseFrac(str: string): Frac {
    if (str.includes('.')) {
      const parts = str.split('.');
      const decLen = parts[1].length;
      const n = parseInt(parts[0] + parts[1], 10);
      const d = Math.pow(10, decLen);
      return new Frac(n, d);
    }
    return new Frac(parseInt(str, 10), 1);
  }

function calculateResult(digits: string[], gaps: string[]): number {
  let expr = gaps[0];
  for (let i = 0; i < digits.length; i++) {
    expr += digits[i];
    if (i < gaps.length - 1) {
      expr += gaps[i + 1];
    }
  }
  expr = expr.replace(/,/g, '.');
  
  try {
    const openParens = (expr.match(/\(/g) || []).length;
    const closeParens = (expr.match(/\)/g) || []).length;
    if (openParens !== closeParens) return NaN;
    
    // Prevent multi-digit numbers starting with 0 (e.g., 025)
    if (/\b0[0-9]/.test(expr)) return NaN;
    
    if (!expr.trim()) return NaN;
    if (/[^0-9+\-\*/().\s]/.test(expr)) return NaN;

    // Evaluate strict
    const tokens: (Frac | string)[] = [];
    let num = '';
    for (let i = 0; i < expr.length; i++) {
      const c = expr[i];
      if (/[0-9.]/.test(c)) {
        num += c;
      } else {
        if (num) {
          tokens.push(parseFrac(num));
          num = '';
        }
        tokens.push(c);
      }
    }
    if (num) tokens.push(parseFrac(num));

    const output: (Frac | string)[] = [];
    const ops: string[] = [];
    const prec: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
    for (const t of tokens) {
      if (t instanceof Frac) {
        output.push(t);
      } else if (t === '(') {
        ops.push(t as string);
      } else if (t === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') {
          output.push(ops.pop()!);
        }
        ops.pop();
      } else {
        while (ops.length && prec[ops[ops.length - 1]] >= prec[t as string]) {
          output.push(ops.pop()!);
        }
        ops.push(t as string);
      }
    }
    while (ops.length) output.push(ops.pop()!);

    const stack: Frac[] = [];
    for (const t of output) {
      if (t instanceof Frac) {
        stack.push(t);
      } else {
        const b = stack.pop()!;
        const a = stack.pop()!;
        if (t === '+') stack.push(a.add(b));
        if (t === '-') stack.push(a.sub(b));
        if (t === '*') stack.push(a.mul(b));
        if (t === '/') {
          if (b.n === 0) return NaN;
          const res = a.div(b);
          if (!res.isTerm()) return NaN;
          stack.push(res);
        }
      }
    }
    
    const finalRes = stack[0];
    if (finalRes.d === 1) return finalRes.n;
    return finalRes.n / finalRes.d;
  } catch (e) {
    return NaN;
  }
}

console.log("Result for 100.0.1:", calculateResult(['1', '0', '0', '0', '1'], ['', '', '', ',', ',']));
