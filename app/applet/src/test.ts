const digits = ['6', '2', '6', '0', '9', '9'];

function getNumbers(arr: string[]) {
  const str = arr.join('');
  const res = [{ val: parseFloat(str), expr: str }];
  for (let i = 1; i < str.length; i++) {
    res.push({ val: parseFloat(str.slice(0, i) + '.' + str.slice(i)), expr: str.slice(0, i) + '.' + str.slice(i) });
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

function generateExpressions(nums: any[]): any[] {
  if (nums.length === 1) return [{ val: nums[0].val, expr: nums[0].expr, prec: 3 }];
  const results = [];
  for (let i = 1; i < nums.length; i++) {
    const lefts = generateExpressions(nums.slice(0, i));
    const rights = generateExpressions(nums.slice(i));
    for (const l of lefts) {
      for (const r of rights) {
        const exprAdd = (l.prec < 1 ? '(' + l.expr + ')' : l.expr) + '+' + (r.prec < 1 ? '(' + r.expr + ')' : r.expr);
        results.push({ val: l.val + r.val, expr: exprAdd, prec: 1 });
        
        const exprSub = (l.prec < 1 ? '(' + l.expr + ')' : l.expr) + '-' + (r.prec <= 1 ? '(' + r.expr + ')' : r.expr);
        results.push({ val: l.val - r.val, expr: exprSub, prec: 1 });
        
        const exprMul = (l.prec < 2 ? '(' + l.expr + ')' : l.expr) + '*' + (r.prec < 2 ? '(' + r.expr + ')' : r.expr);
        results.push({ val: l.val * r.val, expr: exprMul, prec: 2 });
        
        if (Math.abs(r.val) > 1e-9) {
          const exprDiv = (l.prec < 2 ? '(' + l.expr + ')' : l.expr) + '/' + (r.prec <= 2 ? '(' + r.expr + ')' : r.expr);
          results.push({ val: l.val / r.val, expr: exprDiv, prec: 2 });
        }
      }
    }
  }
  return results;
}

const partitions = getPartitions(digits);
const validExprs = [];

for (const part of partitions) {
  const exprs = generateExpressions(part);
  for (const e of exprs) {
    if (Math.abs(e.val - 100) < 1e-6) {
      validExprs.push(e);
    }
  }
}

console.log(validExprs.map(e => e.expr + ' = ' + e.val));
