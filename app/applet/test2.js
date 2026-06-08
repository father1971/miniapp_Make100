const digits = ['6', '2', '6', '0', '9', '9'];

function getNumbers(arr) {
  let str = arr.join('');
  let res = [{ val: parseFloat(str), expr: str }];
  for (let i = 1; i < str.length; i++) {
    res.push({ val: parseFloat(str.slice(0, i) + '.' + str.slice(i)), expr: str.slice(0, i) + '.' + str.slice(i) });
  }
  return res;
}

function getPartitions(arr) {
  if (arr.length === 0) return [[]];
  let result = [];
  for (let i = 1; i <= arr.length; i++) {
    let firsts = getNumbers(arr.slice(0, i));
    let rests = getPartitions(arr.slice(i));
    for (let f of firsts) {
      for (let r of rests) {
        result.push([f, ...r]);
      }
    }
  }
  return result;
}

function generateExpressions(nums) {
  if (nums.length === 1) return [{ val: nums[0].val, expr: nums[0].expr, prec: 3 }];
  let results = [];
  for (let i = 1; i < nums.length; i++) {
    let lefts = generateExpressions(nums.slice(0, i));
    let rights = generateExpressions(nums.slice(i));
    for (let l of lefts) {
      for (let r of rights) {
        let exprAdd = (l.prec < 1 ? '(' + l.expr + ')' : l.expr) + '+' + (r.prec < 1 ? '(' + r.expr + ')' : r.expr);
        results.push({ val: l.val + r.val, expr: exprAdd, prec: 1 });
        
        let exprSub = (l.prec < 1 ? '(' + l.expr + ')' : l.expr) + '-' + (r.prec <= 1 ? '(' + r.expr + ')' : r.expr);
        results.push({ val: l.val - r.val, expr: exprSub, prec: 1 });
        
        let exprMul = (l.prec < 2 ? '(' + l.expr + ')' : l.expr) + '*' + (r.prec < 2 ? '(' + r.expr + ')' : r.expr);
        results.push({ val: l.val * r.val, expr: exprMul, prec: 2 });
        
        if (Math.abs(r.val) > 1e-9) {
          let exprDiv = (l.prec < 2 ? '(' + l.expr + ')' : l.expr) + '/' + (r.prec <= 2 ? '(' + r.expr + ')' : r.expr);
          results.push({ val: l.val / r.val, expr: exprDiv, prec: 2 });
        }
      }
    }
  }
  return results;
}

const partitions = getPartitions(digits);
let validExprs = [];

for (let part of partitions) {
  let exprs = generateExpressions(part);
  for (let e of exprs) {
    if (Math.abs(e.val - 100) < 1e-6) {
      validExprs.push(e);
    }
  }
}

console.log(validExprs.map(e => e.expr + ' = ' + e.val));
