export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b > 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

export class Frac {
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

export function parseFrac(str: string): Frac {
  if (str.includes('.')) {
    const parts = str.split('.');
    if (parts.length > 2) throw new Error("Invalid number");
    const decLen = parts[1].length;
    const n = parseInt(parts[0] + parts[1], 10);
    const d = Math.pow(10, decLen);
    return new Frac(n, d);
  }
  return new Frac(parseInt(str, 10), 1);
}

/**
 * Вычисляет итоговый математический результат выражения из цифр и промежутков (gaps).
 * Поддерживает дроби, скобки, операторы +, -, *, /.
 */
export function calculateResult(digits: string[], gaps: string[]): number {
  let expr = gaps[0] || '';
  for (let i = 0; i < digits.length; i++) {
    expr += digits[i];
    if (i < gaps.length - 1) {
      expr += gaps[i + 1] || '';
    }
  }
  expr = expr.replace(/,/g, '.');
  
  try {
    const openParens = (expr.match(/\(/g) || []).length;
    const closeParens = (expr.match(/\)/g) || []).length;
    if (openParens !== closeParens) return NaN;
    
    // Prevent empty parentheses
    if (/\(\s*\)/.test(expr)) return NaN;

    // Prevent multi-digit numbers starting with 0 (e.g., 025)
    if (/\b0[0-9]/.test(expr)) return NaN;
    
    if (!expr.trim()) return NaN;
    if (/[^0-9+\-\*/().\s]/.test(expr)) return NaN;

    // Handle unary plus/minus
    expr = expr.replace(/(^|\()(\s*)([+-])/g, '$1$20$3');

    // Evaluate strict
    const tokens: (Frac | string)[] = [];
    let num = '';
    for (let i = 0; i < expr.length; i++) {
      const c = expr[i];
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
    
    if (stack.length !== 1) return NaN;
    
    const finalRes = stack[0];
    if (finalRes.d === 1) return finalRes.n;
    return finalRes.n / finalRes.d;
  } catch (e) {
    return NaN;
  }
}

/**
 * Рекурсивный поиск оптимального решения для получения 100 из заданных цифр.
 */
export function findSolution(digits: string[]): string[] | null {
  function getNumbers(arr: string[]) {
    const str = arr.join('');
    const res = [];
    
    if (str.length === 1 || str[0] !== '0') {
      res.push({ val: parseFrac(str), expr: str });
    }
    
    for (let i = 1; i < str.length; i++) {
      const intPart = str.slice(0, i);
      if (intPart.length > 1 && intPart[0] === '0') continue;
      
      const decStr = str.slice(0, i) + '.' + str.slice(i);
      const exprStr = str.slice(0, i) + ',' + str.slice(i);
      res.push({ val: parseFrac(decStr), expr: exprStr });
    }
    return res;
  }

  function getPartitions(arr: string[]): any[] {
    if (arr.length === 0) return [[]];
    const result = [];
    for (let i = 1; i <= arr.length; i++) {
      const firsts = getNumbers(arr.slice(0, i));
      const rests = getPartitions(arr.slice(i));
      for (const f of firsts) {
        for (const r of rests) {
          result.push([f, ...r]);
        }
      }
    }
    return result;
  }

  const exprMemo = new Map<string, any[]>();
  function generateExpressions(nums: any[]): any[] {
    const key = nums.map(n => n.expr).join('|');
    if (exprMemo.has(key)) return exprMemo.get(key)!;

    if (nums.length === 1) return [{ val: nums[0].val, expr: nums[0].expr, prec: 3 }];
    const results = [];
    for (let i = 1; i < nums.length; i++) {
      const lefts = generateExpressions(nums.slice(0, i));
      const rights = generateExpressions(nums.slice(i));
      for (const l of lefts) {
        for (const r of rights) {
          // +
          const valAdd = l.val.add(r.val);
          const exprAdd = (l.prec < 1 ? '(' + l.expr + ')' : l.expr) + '+' + (r.prec < 1 ? '(' + r.expr + ')' : r.expr);
          results.push({ val: valAdd, expr: exprAdd, prec: 1 });
          
          // -
          const valSub = l.val.sub(r.val);
          const exprSub = (l.prec < 1 ? '(' + l.expr + ')' : l.expr) + '-' + (r.prec <= 1 ? '(' + r.expr + ')' : r.expr);
          results.push({ val: valSub, expr: exprSub, prec: 1 });
          
          // *
          const valMul = l.val.mul(r.val);
          const exprMul = (l.prec < 2 ? '(' + l.expr + ')' : l.expr) + '*' + (r.prec < 2 ? '(' + r.expr + ')' : r.expr);
          results.push({ val: valMul, expr: exprMul, prec: 2 });
          
          // /
          if (r.val.n !== 0) {
            const valDiv = l.val.div(r.val);
            if (valDiv.isTerm()) {
              const exprDiv = (l.prec < 2 ? '(' + l.expr + ')' : l.expr) + '/' + (r.prec <= 2 ? '(' + r.expr + ')' : r.expr);
              results.push({ val: valDiv, expr: exprDiv, prec: 2 });
            }
          }
        }
      }
    }
    exprMemo.set(key, results);
    return results;
  }

  function scoreExpression(expr: string): number {
    let score = 0;
    for (const char of expr) {
      if (char === '+' || char === '-') score += 10;
      if (char === '*' || char === '/') score += 12;
      if (char === '(') score += 5;
    }
    score += expr.length;
    return score;
  }

  const partitions = getPartitions(digits);
  const validExprs: string[] = [];

  for (const part of partitions) {
    const exprs = generateExpressions(part);
    for (const e of exprs) {
      if (e.val.n === 100 && e.val.d === 1) {
        validExprs.push(e.expr);
      }
    }
  }

  if (validExprs.length === 0) return null;

  validExprs.sort((a, b) => scoreExpression(a) - scoreExpression(b));
  const bestExpr = validExprs[0];

  // Map the expression back to the gaps array
  let gaps = Array(digits.length + 1).fill('');
  let exprIdx = 0;
  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i];
    const digitIdx = bestExpr.indexOf(digit, exprIdx);
    gaps[i] = bestExpr.slice(exprIdx, digitIdx);
    exprIdx = digitIdx + 1;
  }
  gaps[digits.length] = bestExpr.slice(exprIdx);

  // Clean up unnecessary outer parentheses if they exist
  while (gaps[0].startsWith('(') && gaps[digits.length].endsWith(')')) {
    // Check if removing them keeps the expression valid
    const tempGaps = [...gaps];
    tempGaps[0] = tempGaps[0].substring(1);
    tempGaps[digits.length] = tempGaps[digits.length].slice(0, -1);
    if (calculateResult(digits, tempGaps) === 100) {
      gaps = tempGaps;
    } else {
      break;
    }
  }

  return gaps;
}

/**
 * Умная защитная клавиатура (Smart Button Guard):
 * Подсчет незакрытых открывающих скобок '(' в выражении до указанного слота
 */
export function getUnclosedParenCount(gaps: string[], upToSlotIdx: number): number {
  let count = 0;
  for (let i = 0; i <= upToSlotIdx; i++) {
    const s = gaps[i] || '';
    for (let c = 0; c < s.length; c++) {
      if (s[c] === '(') count++;
      else if (s[c] === ')') count--;
    }
  }
  return Math.max(0, count);
}

/**
 * Умная защитная клавиатура: общий баланс скобок во всем выражении
 */
export function getTotalParenBalance(gaps: string[]): { totalOpen: number; totalClosed: number } {
  let totalOpen = 0;
  let totalClosed = 0;
  for (const s of gaps) {
    if (!s) continue;
    for (let c = 0; c < s.length; c++) {
      if (s[c] === '(') totalOpen++;
      else if (s[c] === ')') totalClosed++;
    }
  }
  return { totalOpen, totalClosed };
}

/**
 * Умная защитная клавиатура (Smart Button Guard):
 * Проверка допустимости нажатия клавиши в текущем активном слоте
 */
export function isOpAllowed(
  op: string,
  selectedSlot: number | null,
  digits: string[],
  gaps: string[],
  won: boolean,
  isVisualReady: boolean
): boolean {
  if (selectedSlot === null || won || !isVisualReady) return false;
  if (selectedSlot < 0 || selectedSlot > digits.length) return false;

  const curr = gaps[selectedSlot] || '';
  const lastChar = curr.length > 0 ? curr[curr.length - 1] : null;

  // 1. Backspace (стереть)
  if (op === 'Backspace') {
    return curr.length > 0;
  }

  // Ограничение емкости слота (максимум 5 символов, если это не замена оператора)
  const isReplacingOp = ['+', '-', '*', '/'].includes(op) && (['+', '-', '*', '/'].includes(lastChar || '') || lastChar === ',');
  if (!isReplacingOp && curr.length >= 5) {
    return false;
  }

  // 2. Слот 6 (после самой последней цифры)
  if (selectedSlot === digits.length) {
    if (op !== ')') return false;
    const unclosedToLeft = getUnclosedParenCount(gaps, selectedSlot);
    const { totalOpen, totalClosed } = getTotalParenBalance(gaps);
    if (unclosedToLeft <= 0 || totalOpen <= totalClosed) return false;
    if (curr.length > 0 && !curr.endsWith(')')) return false;
    return true;
  }

  // 3. Слот 0 (перед первой цифрой)
  if (selectedSlot === 0) {
    // Бинарные операторы +, *, /, закрывающая скобка и запятая запрещены
    if (['+', '*', '/', ')', ','].includes(op)) return false;

    if (op === '-') {
      // Унарный минус допустим в пустом слоте, после '(' или как замена существующего '-'
      if (curr === '' || curr.endsWith('(') || curr === '-') return true;
      return false;
    }

    if (op === '(') {
      // Открывающая скобка допустима в пустом слоте, после '(' или после '-'
      if (curr === '' || curr.endsWith('(') || curr.endsWith('-')) return true;
      return false;
    }

    return false;
  }

  // 4. Промежуточные слоты (1..5)
  // --- Десятичная запятая ',' ---
  if (op === ',') {
    if (curr.length > 0) return false;

    // Проверяем, нет ли уже запятой в этом непрерывном числе (поиск влево)
    for (let i = selectedSlot - 1; i >= 0; i--) {
      const g = gaps[i] || '';
      if (g.includes(',') || g.includes('.')) return false;
      if (/[+\-*/()]/.test(g)) break;
    }

    // Поиск вправо
    for (let i = selectedSlot + 1; i <= digits.length; i++) {
      const g = gaps[i] || '';
      if (g.includes(',') || g.includes('.')) return false;
      if (/[+\-*/()]/.test(g)) break;
    }

    return true;
  }

  // --- Закрывающая скобка ')' ---
  if (op === ')') {
    const unclosedToLeft = getUnclosedParenCount(gaps, selectedSlot);
    const { totalOpen, totalClosed } = getTotalParenBalance(gaps);
    if (unclosedToLeft <= 0 || totalOpen <= totalClosed) return false;

    // Нельзя закрывать сразу после оператора, '(' или ','
    if (curr.length > 0) {
      return curr.endsWith(')');
    }
    // Если слот пустой, перед ним стоит цифра digits[selectedSlot - 1]
    return true;
  }

  // --- Открывающая скобка '(' (Вариант А) ---
  if (op === '(') {
    // В пустом промежуточном слоте '(' неактивна, пока не нажат оператор!
    if (curr === '') return false;
    // Разрешена после оператора (+, -, *, /) или после другой '('
    if (['+', '-', '*', '/'].includes(lastChar || '') || lastChar === '(') {
      return true;
    }
    return false;
  }

  // --- Арифметические операторы (+, -, *, /) ---
  if (['+', '-', '*', '/'].includes(op)) {
    // Если в слоте стоит запятая, оператор заменяет ее
    if (curr === ',') return true;

    // Если последний символ — оператор:
    if (['+', '-', '*', '/'].includes(lastChar || '')) {
      const prevChar = curr.length > 1 ? curr[curr.length - 2] : null;
      if (prevChar === '(') {
        return op === '-'; // После '(' разрешен только унарный минус '-'
      }
      return true; // Замена оператора (+, -, *, /)
    }

    // В пустом слоте (перед ним цифра)
    if (curr === '') return true;

    // После закрывающей скобки ')'
    if (lastChar === ')') return true;

    // Сразу после '(' допустим только унарный минус '-'
    if (lastChar === '(') {
      return op === '-';
    }

    return false;
  }

  return true;
}
