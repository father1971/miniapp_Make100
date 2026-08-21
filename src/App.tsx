import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Minus, X, Divide, RefreshCw, Delete, Play, Moon, Sun, Smartphone, Plane, Music, Film, Train, Bus, TramFront, CableCar, Star, CreditCard, Coins, User, Menu, Volume2, VolumeX, Vibrate, VibrateOff, Lightbulb, Trophy, Clock, Hash, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { fetchUserStats, saveUserStats, fetchLeaderboard as fetchLeaderboardApi, API_URL, getAuthHeader } from './api';
import { TRANSLATIONS, LANGUAGES, Language, TranslationData } from './translations';

// Вставьте сюда ссылку на папку image_cars в вашем GitHub репозитории.
// Пример: 'https://github.com/ВАШ_ЛОГИН/ВАШ_РЕПОЗИТОРИЙ/tree/main/image_cars'
const GITHUB_FOLDER_URL: string = 'https://github.com/father1971/Cars_image';

const FALLBACK_IMAGES = [
  '/car1.jpg',
  '/car2.jpg',
  '/car3.jpg',
  '/car4.jpg',
  '/cars/1.jpg',
  '/cars/2.jpg',
  '/cars/3.jpg',
  '/cars/4.jpg',
  '/cars/5.jpg',
  '/cars/6.jpg',
  '/cars/7.jpg',
  '/cars/8.jpg',
  '/cars/9.jpg',
  '/cars/10.jpg'
];

const getLevelInfo = (solved: number) => {
  const milestones = [0, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
  let level = 1;
  let nextMilestone = milestones[1];
  let prevMilestone = milestones[0];
  
  for (let i = 0; i < milestones.length; i++) {
    if (solved >= milestones[i]) {
      level = i + 1;
      prevMilestone = milestones[i];
      nextMilestone = milestones[i + 1] || milestones[i];
    }
  }
  
  const progress = nextMilestone === prevMilestone ? 100 : ((solved - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
  
  return { level, prevMilestone, nextMilestone, progress };
};

const formatRegistrationDate = (timestamp: number | null | undefined, lang: string = 'ru', t?: TranslationData) => {
  if (!timestamp) return t?.unknownDate || 'Неизвестно';
  try {
    const localeMap: Record<string, string> = {
      ru: 'ru-RU', en: 'en-US', de: 'de-DE', fr: 'fr-FR', pt: 'pt-BR', es: 'es-ES',
      zh: 'zh-CN', ja: 'ja-JP', it: 'it-IT', ko: 'ko-KR', tr: 'tr-TR', he: 'he-IL',
      ar: 'ar-SA', hi: 'hi-IN', la: 'la', eo: 'eo', elvish: 'en-GB', klingon: 'en-GB',
      dothraki: 'en-GB', valyrian: 'en-GB'
    };
    return new Date(timestamp).toLocaleDateString(localeMap[lang] || 'ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return new Date(timestamp).toLocaleDateString();
  }
};

const formatBestTime = (timeMs: number | null | undefined, t?: TranslationData) => {
  if (!timeMs) return t?.noRecord || 'Нет рекорда';
  return `${(timeMs / 1000).toFixed(2)} ${t?.secondsShort || 'сек'}`;
};

const formatTotalPlayTime = (timeMs: number | null | undefined, t?: TranslationData) => {
  if (!timeMs) return `0 ${t?.secondsShort || 'сек'}`;
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes} ${t?.minutesShort || 'мин.'} ${seconds} ${t?.secondsShort || 'сек.'}`;
  }
  return `${seconds} ${t?.secondsShort || 'сек.'}`;
};

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  };
  CloudStorage?: {
    setItem: (key: string, value: string, callback?: (err: Error | null, success: boolean) => void) => void;
    getItem: (key: string, callback: (err: Error | null, value: string) => void) => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  colorScheme?: 'light' | 'dark';
  onEvent?: (eventType: string, eventHandler: () => void) => void;
  offEvent?: (eventType: string, eventHandler: () => void) => void;
}


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

  function parseFrac(str: string) {
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

function findSolution(digits: string[]): string[] | null {
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

const getTicketStyles = (t: any) => [
  {
    id: 'flight',
    containerClass: 'bg-white rounded-xl shadow-2xl border-l-[12px] border-blue-600 p-5 sm:p-6',
    icon: Plane,
    iconClass: 'text-blue-600',
    title: t.tickets.flight.title || 'BOARDING PASS',
    subtitle: t.tickets.flight.subtitle || 'FIRST CLASS',
    labelClass: 'text-slate-400 font-bold uppercase tracking-wider text-xs',
    numberContainerClass: 'border-y-2 border-dashed border-slate-200 my-2',
    numberClass: 'text-slate-800',
    footerLeft: t.tickets.flight.footerLeft || 'GATE 14',
    footerRight: t.tickets.flight.footerRight || 'SEAT 2A',
    footerClass: 'text-slate-800 font-black uppercase text-sm',
    hasBarcode: true,
    pattern: 'radial-gradient(#e2e8f0 1px, transparent 1px)'
  },
  {
    id: 'concert',
    containerClass: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] p-5 sm:p-6 border border-purple-500/30 text-white',
    icon: Music,
    iconClass: 'text-pink-400',
    title: t.tickets.concert.title || 'LIVE CONCERT',
    subtitle: t.tickets.concert.subtitle || 'VIP ACCESS',
    labelClass: 'text-purple-300/70 font-bold uppercase tracking-widest text-xs',
    numberContainerClass: 'bg-black/40 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner my-2',
    numberClass: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]',
    footerLeft: t.tickets.concert.footerLeft || 'WORLD TOUR',
    footerRight: t.tickets.concert.footerRight || 'ROW 1',
    footerClass: 'text-white font-bold uppercase tracking-widest text-xs opacity-80',
    hasBarcode: false,
    pattern: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)'
  },
  {
    id: 'cinema',
    containerClass: 'bg-[#fdf6e3] rounded-sm shadow-xl p-5 sm:p-6 border-4 border-double border-[#d4af37] relative overflow-hidden',
    icon: Film,
    iconClass: 'text-[#d4af37]',
    title: t.tickets.cinema.title || 'CINEMA TICKET',
    subtitle: t.tickets.cinema.subtitle || 'ADMIT ONE',
    labelClass: 'text-[#8b7322] font-bold uppercase tracking-widest text-xs',
    numberContainerClass: 'my-4',
    numberClass: 'text-[#2c3e50] drop-shadow-sm',
    footerLeft: t.tickets.cinema.footerLeft || 'ROW F',
    footerRight: t.tickets.cinema.footerRight || 'SEAT 12',
    footerClass: 'text-[#2c3e50] font-black uppercase text-sm',
    hasBarcode: true,
    pattern: 'radial-gradient(rgba(212,175,55,0.1) 1px, transparent 1px)'
  },
  {
    id: 'train',
    containerClass: 'bg-[#e8dcc5] rounded-sm shadow-md p-5 sm:p-6 border-x-[16px] border-dashed border-[#5c4033]',
    icon: Train,
    iconClass: 'text-[#5c4033]',
    title: t.tickets.train.title || 'EXPRESS TRAIN',
    subtitle: t.tickets.train.subtitle || 'ONE WAY',
    labelClass: 'text-[#8b6b53] font-bold uppercase tracking-widest text-xs',
    numberContainerClass: 'border-y border-[#5c4033]/30 my-2',
    numberClass: 'text-[#8b0000] opacity-90',
    footerLeft: t.tickets.train.footerLeft || 'PLATFORM 9',
    footerRight: t.tickets.train.footerRight || 'CARRIAGE 4',
    footerClass: 'text-[#5c4033] font-bold uppercase tracking-widest text-xs',
    hasBarcode: false,
    pattern: 'radial-gradient(rgba(92,64,51,0.1) 1px, transparent 1px)'
  },
  {
    id: 'vintage-bus',
    containerClass: 'bg-[#e4d5b7] rounded-sm shadow-xl p-5 sm:p-6 border-2 border-[#8b7355] relative overflow-hidden',
    icon: Bus,
    iconClass: 'text-[#5c4a3d]',
    title: t.tickets['vintage-bus'].title || 'АВТОБУСНЫЙ БИЛЕТ',
    subtitle: t.tickets['vintage-bus'].subtitle || 'СЕРИЯ АВ',
    labelClass: 'text-[#5c4a3d] font-serif font-bold uppercase tracking-widest text-xs',
    numberContainerClass: 'border-y-2 border-dashed border-[#8b7355] my-4 py-4',
    numberClass: 'text-[#8b0000] font-serif tracking-[0.2em]',
    footerLeft: t.tickets['vintage-bus'].footerLeft || 'КОНТРОЛЬНЫЙ',
    footerRight: t.tickets['vintage-bus'].footerRight || 'БИЛЕТ',
    footerClass: 'text-[#5c4a3d] font-serif font-bold uppercase text-[10px] tracking-widest',
    hasBarcode: false,
    pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139,115,85,0.05) 10px, rgba(139,115,85,0.05) 20px)'
  },
  {
    id: 'vintage-tram',
    containerClass: 'bg-[#d9cbb8] rounded-none shadow-md p-4 sm:p-6 border-x-[12px] border-dotted border-[#6b5b4e] relative',
    icon: TramFront,
    iconClass: 'text-[#3e322b]',
    title: t.tickets['vintage-tram'].title || 'ТРАМВАЙ',
    subtitle: t.tickets['vintage-tram'].subtitle || 'РАЗОВЫЙ',
    labelClass: 'text-[#3e322b] font-serif font-bold uppercase tracking-widest text-[10px] sm:text-xs',
    numberContainerClass: 'my-5 bg-[#cbbda8] p-3 rounded-sm shadow-inner border border-[#a89a85]',
    numberClass: 'text-[#2c241f] font-serif tracking-[0.25em]',
    footerLeft: t.tickets['vintage-tram'].footerLeft || 'БЕЗ КОМПОСТЕРА',
    footerRight: t.tickets['vintage-tram'].footerRight || 'НЕДЕЙСТВИТЕЛЕН',
    footerClass: 'text-[#3e322b] font-serif font-bold uppercase text-[9px] sm:text-[10px] tracking-wider',
    hasBarcode: false,
    pattern: 'radial-gradient(rgba(0,0,0,0.04) 2px, transparent 2px)'
  },
  {
    id: 'soviet-trolleybus',
    containerClass: 'bg-[#c2d1c0] rounded-sm shadow-lg p-5 sm:p-6 border border-[#4a5d4e] relative',
    icon: CableCar,
    iconClass: 'text-[#2f3e33]',
    title: t.tickets['soviet-trolleybus'].title || 'ТРОЛЛЕЙБУС',
    subtitle: t.tickets['soviet-trolleybus'].subtitle || 'ГОРТРАНС',
    labelClass: 'text-[#2f3e33] font-serif font-bold uppercase tracking-widest text-xs',
    numberContainerClass: 'border-4 border-double border-[#4a5d4e] my-4 py-4 bg-[#b3c2b1]',
    numberClass: 'text-[#8b0000] font-serif tracking-[0.15em]',
    footerLeft: t.tickets['soviet-trolleybus'].footerLeft || 'СОХРАНЯТЬ ДО',
    footerRight: t.tickets['soviet-trolleybus'].footerRight || 'КОНЦА ПОЕЗДКИ',
    footerClass: 'text-[#2f3e33] font-serif font-bold uppercase text-[9px] sm:text-[10px] tracking-widest',
    hasBarcode: false,
    pattern: 'none'
  },
  {
    id: 'golden-ticket',
    containerClass: 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 rounded-lg shadow-[0_0_40px_rgba(234,179,8,0.5)] p-5 sm:p-6 border-4 border-yellow-200 relative overflow-hidden',
    icon: Star,
    iconClass: 'text-yellow-100',
    title: t.tickets['golden-ticket'].title || 'GOLDEN TICKET',
    subtitle: t.tickets['golden-ticket'].subtitle || 'LUCKY WINNER',
    labelClass: 'text-yellow-900 font-serif font-black uppercase tracking-widest text-xs',
    numberContainerClass: 'border-y-4 border-double border-yellow-700/30 my-4 py-4 bg-yellow-400/20',
    numberClass: 'text-yellow-900 font-serif tracking-[0.2em] drop-shadow-md',
    footerLeft: t.tickets['golden-ticket'].footerLeft || 'ADMIT 1',
    footerRight: t.tickets['golden-ticket'].footerRight || 'FACTORY TOUR',
    footerClass: 'text-yellow-900 font-serif font-bold uppercase text-[10px] tracking-widest',
    hasBarcode: false,
    pattern: 'radial-gradient(rgba(255,255,255,0.2) 2px, transparent 2px)'
  },
  {
    id: 'metro-pass',
    containerClass: 'bg-blue-600 rounded-2xl shadow-lg p-5 sm:p-6 border-2 border-blue-400 relative overflow-hidden text-white',
    icon: CreditCard,
    iconClass: 'text-blue-200',
    title: t.tickets['metro-pass'].title || 'METRO PASS',
    subtitle: t.tickets['metro-pass'].subtitle || 'MONTHLY',
    labelClass: 'text-blue-100 font-sans font-bold uppercase tracking-widest text-xs',
    numberContainerClass: 'bg-white rounded-lg my-4 py-4 shadow-inner',
    numberClass: 'text-blue-900 font-mono tracking-[0.2em]',
    footerLeft: t.tickets['metro-pass'].footerLeft || 'ZONE 1-3',
    footerRight: t.tickets['metro-pass'].footerRight || 'UNLIMITED',
    footerClass: 'text-blue-200 font-sans font-bold uppercase text-[10px] tracking-widest',
    hasBarcode: true,
    pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
  },
  {
    id: 'lottery',
    containerClass: 'bg-emerald-50 rounded-lg shadow-xl p-5 sm:p-6 border-4 border-emerald-500 relative overflow-hidden',
    icon: Coins,
    iconClass: 'text-emerald-600',
    title: t.tickets.lottery.title || 'LOTTERY TICKET',
    subtitle: t.tickets.lottery.subtitle || 'JACKPOT',
    labelClass: 'text-emerald-800 font-bold uppercase tracking-widest text-xs',
    numberContainerClass: 'bg-emerald-100 rounded-full my-4 py-3 border-2 border-emerald-300 shadow-inner',
    numberClass: 'text-emerald-700 font-mono tracking-[0.3em]',
    footerLeft: t.tickets.lottery.footerLeft || 'DRAW 42',
    footerRight: t.tickets.lottery.footerRight || 'GOOD LUCK',
    footerClass: 'text-emerald-600 font-bold uppercase text-[10px] tracking-widest',
    hasBarcode: true,
    pattern: 'radial-gradient(rgba(16,185,129,0.1) 2px, transparent 2px)'
  }
];

function DemoOverlay({ onComplete, t, isTgValidating }: { onComplete: () => void, t: typeof TRANSLATIONS['ru'], isTgValidating?: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 2500));
      if (!isMounted) return; setStep(1); // 98 _ 7 _ 6 _ 5 _ 4
      await new Promise(r => setTimeout(r, 2500));
      if (!isMounted) return; setStep(2); // 98 + 7 - 6 + 5 - 4 = 100
      await new Promise(r => setTimeout(r, 3500));
      if (!isMounted) return; setStep(3); // Fade out
      await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return; setStep(4); // Fade in with 1 2 3 4 1 0
      await new Promise(r => setTimeout(r, 2500));
      if (!isMounted) return; setStep(5); // (1 + 2 + 3 + 4) * 10 = 100
      await new Promise(r => setTimeout(r, 3500));
      if (!isMounted) return; setStep(6); // Play button
    };
    sequence();
    return () => { isMounted = false; };
  }, []);

  const messages = [
    t.demo1,
    t.demo2,
    t.demo3,
    t.demo4,
    t.demo5
  ];

  const getMessageIndex = (s: number) => {
    if (s === 0) return 0;
    if (s === 1) return 1;
    if (s === 2) return 2;
    if (s >= 3 && s <= 5) return 3;
    return 4;
  };

  return (
    <motion.div 
      key="demo"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-2 sm:p-4"
      style={{
        paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 16px)) + 16px)',
        paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 16px)) + 16px)'
      }}
    >
      <div className="w-full max-w-lg flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-6 text-center">{t.demoTitle}</h2>
        
        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full flex flex-col items-center relative overflow-hidden">
          <p className="text-zinc-600 dark:text-zinc-400 text-center h-12 mb-4 font-medium text-sm sm:text-base px-4 transition-opacity duration-300">
            {messages[getMessageIndex(step)]}
          </p>

          <div className={`flex items-center justify-center gap-0.5 sm:gap-1.5 text-2xl sm:text-4xl font-mono font-black text-zinc-900 dark:text-white mb-6 h-16 w-full px-2 transition-opacity duration-500 ${step === 3 ? 'opacity-0' : 'opacity-100'}`}>
             {step >= 4 && <div className="text-orange-500 font-black text-3xl sm:text-4xl mr-1">(</div>}
             
             <span>{step >= 4 ? '1' : '9'}</span>
             
             {/* Gap 1 */}
             <div className={`h-8 sm:h-12 border-2 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 overflow-hidden ${
               step === 0 ? 'w-6 sm:w-10 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800' : 
               step === 4 ? 'w-6 sm:w-10 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800' :
               step >= 5 ? 'w-6 sm:w-10 border-orange-500 bg-orange-500/20 scale-110' :
               'w-0 border-0 opacity-0 mx-[-2px] sm:mx-[-4px]'
             }`}>
                {step >= 5 && <span className="text-orange-500">+</span>}
             </div>
             
             <span>{step >= 4 ? '2' : '8'}</span>
             
             {/* Gap 2 */}
             <div className={`h-8 sm:h-12 border-2 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 overflow-hidden ${
               step === 2 ? 'w-6 sm:w-10 border-orange-500 bg-orange-500/20 scale-110' : 
               step >= 5 ? 'w-6 sm:w-10 border-orange-500 bg-orange-500/20 scale-110' : 
               'w-6 sm:w-10 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
             }`}>
                {step === 2 && <span className="text-orange-500">+</span>}
                {step >= 5 && <span className="text-orange-500">+</span>}
             </div>
             
             <span>{step >= 4 ? '3' : '7'}</span>
             
             {/* Gap 3 */}
             <div className={`h-8 sm:h-12 border-2 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 overflow-hidden ${
               step === 2 ? 'w-6 sm:w-10 border-orange-500 bg-orange-500/20 scale-110' :
               step >= 5 ? 'w-6 sm:w-10 border-orange-500 bg-orange-500/20 scale-110' :
               'w-6 sm:w-10 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
             }`}>
                {step === 2 && <span className="text-orange-500">-</span>}
                {step >= 5 && <span className="text-orange-500">+</span>}
             </div>
             
             <span>{step >= 4 ? '4' : '6'}</span>
             
             {/* Gap 4 */}
             <div className={`h-8 sm:h-12 border-2 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 overflow-hidden ${
               step === 2 ? 'w-6 sm:w-10 border-orange-500 bg-orange-500/20 scale-110' :
               step >= 5 ? 'w-10 sm:w-14 border-orange-500 bg-orange-500/20 scale-110' :
               'w-6 sm:w-10 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
             }`}>
                {step === 2 && <span className="text-orange-500">+</span>}
                {step >= 5 && <span className="text-orange-500 tracking-tighter">)*</span>}
             </div>
             
             <span>{step >= 4 ? '1' : '5'}</span>
             
             {/* Gap 5 */}
             <div className={`h-8 sm:h-12 border-2 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 overflow-hidden ${
               step === 2 ? 'w-6 sm:w-10 border-orange-500 bg-orange-500/20 scale-110' :
               step >= 4 ? 'w-0 border-0 opacity-0 mx-[-2px] sm:mx-[-4px]' :
               'w-6 sm:w-10 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
             }`}>
                {step === 2 && <span className="text-orange-500">-</span>}
             </div>
             
             <span>{step >= 4 ? '0' : '4'}</span>
          </div>

          <div className={`text-4xl sm:text-6xl font-black font-mono transition-all duration-500 h-16 flex items-center justify-center ${step === 3 ? 'opacity-0' : 'opacity-100'}`}>
              {step === 2 || step >= 5 ? <span className="text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">= 100</span> : <span className="text-zinc-400 dark:text-zinc-700">= ?</span>}
          </div>

          <div className="h-16 mt-6 flex items-center justify-center w-full">
            {isTgValidating ? (
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 opacity-65">
                <RefreshCw size={18} className="animate-spin text-orange-500" />
                <span>{t.authorizing}</span>
              </div>
            ) : step >= 6 ? (
              <motion.div initial={{scale: 0}} animate={{scale: 1}} className="w-full">
                <button onClick={onComplete} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl transition-all shadow-[0_8px_20px_rgba(249,115,22,0.25)]">
                  {t.play}
                </button>
              </motion.div>
            ) : (
              <div className="flex gap-1.5 sm:gap-2 w-full justify-center opacity-60 pointer-events-none">
                 <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center"><Plus size={20} className="text-zinc-500 dark:text-zinc-400"/></div>
                 <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center"><Minus size={20} className="text-zinc-500 dark:text-zinc-400"/></div>
                 <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center"><X size={20} className="text-zinc-500 dark:text-zinc-400"/></div>
                 <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center"><Divide size={20} className="text-zinc-500 dark:text-zinc-400"/></div>
              </div>
            )}
          </div>
        </div>
        
        {isTgValidating ? (
          <div className="mt-4 flex items-center gap-2 text-zinc-500 font-medium text-sm sm:text-base">
            <RefreshCw size={16} className="animate-spin text-orange-500" />
            <span>{t.authorizingTg}</span>
          </div>
        ) : (
          step < 6 && (
            <button onClick={onComplete} className="mt-4 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-bold px-6 py-2 transition-colors text-sm sm:text-base">
              {t.skipDemo}
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}

const getPlayerDisplayName = (player: { username?: string; firstName?: string }) => {
  if (player.username && player.username.trim() !== '') {
    return `@${player.username}`;
  }
  return player.firstName || 'Игрок';
};

export default function App() {
  const isStatsLoadedRef = useRef(false);
  const lastRoundExpressionRef = useRef<string>('');
  const lastRoundSolveTimeMsRef = useRef<number>(0);
  const [lastEarnedScore, setLastEarnedScore] = useState<number>(0);
  const isPreviewEnv = (() => {
    try {
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      const isDevOrPre = hostname.includes('ais-dev-') || hostname.includes('ais-pre-');
      return isLocalhost || isDevOrPre;
    } catch (e) {
      return false;
    }
  })();

  const [devBypassed, setDevBypassed] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem('make100_devBypassed');
    } catch (e) {}
  }, []);

  const [digits, setDigits] = useState<string[]>([]);
  const [letters, setLetters] = useState<string[]>(['A', 'B', 'C']);
  const [carImage, setCarImage] = useState<string>('');
  const carImagesListRef = useRef<string[]>(FALLBACK_IMAGES);
  const [gaps, setGaps] = useState<string[]>(['', '', '', '', '', '', '']);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(1);
  const [won, setWon] = useState(false);
  const [isHinting, setIsHinting] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [noSolutionMessage, setNoSolutionMessage] = useState(false);

  const [ticketStyleId, setTicketStyleId] = useState('flight');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [lastRoundTimeMs, setLastRoundTimeMs] = useState<number>(0);
  const roundStartTimeRef = useRef<number>(Date.now());

  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current as any);
      timerIntervalRef.current = null;
    }
    
    setElapsedTime(0);
    
    timerIntervalRef.current = setInterval(() => {
      if (roundStartTimeRef.current) {
        const diffMs = Date.now() - roundStartTimeRef.current;
        setElapsedTime(diffMs / 1000);
      }
    }, 50);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current as any);
      timerIntervalRef.current = null;
    }
  }, []);

  const formatLiveStopwatch = (sec: number) => {
    const totalMs = Math.max(0, Math.floor(sec * 1000));
    const mins = Math.floor(totalMs / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 10); // сотые доли (00..99)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(2, '0')}`;
  };

  const formatSolveTime = (timeMs: number) => {
    const secStr = t?.secondsShort || 'сек.';
    const minStr = t?.minutesShort || 'мин.';
    if (!timeMs) return `0.0 ${secStr}`;
    const totalSeconds = timeMs / 1000;
    
    if (totalSeconds < 60) {
      // Если меньше минуты — просто выводим секунды с одной цифрой после запятой
      return `${totalSeconds.toFixed(1)} ${secStr}`;
    }
    
    // Если больше минуты — рассчитываем минуты и секунды
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // Форматируем секунды, чтобы всегда была одна цифра после запятой
    const formattedSeconds = seconds.toFixed(1);
    
    // Добавляем лидирующий ноль, если секунд меньше 10 (например, "09.3" вместо "9.3")
    const paddedSeconds = seconds < 10 ? `0${formattedSeconds}` : formattedSeconds;
    
    return `${minutes} ${minStr} ${paddedSeconds} ${secStr}`;
  };

  const [gameState, setGameState] = useState<'idle' | 'playing'>('idle');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isBanned, setIsBanned] = useState<boolean>(false);
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [isTgValidating, setIsTgValidating] = useState<boolean>(true);
  
  const [gameMode, setGameMode] = useState<'ticket' | 'car'>('ticket');
  const [themePreference, setThemePreference] = useState<'auto' | 'dark' | 'light'>('auto');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
    if (tg?.colorScheme) return tg.colorScheme;
    const systemPrefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = typeof window !== 'undefined' ? localStorage.getItem('make100_language') : null;
    if (savedLang && savedLang in TRANSLATIONS) {
      return savedLang as Language;
    }
    const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
    const tgLang = tg?.initDataUnsafe?.user?.language_code;
    const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en';
    const detectedLang = tgLang || browserLang;

    if (detectedLang && detectedLang in TRANSLATIONS) {
      return detectedLang as Language;
    }
    
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem('make100_language', language);
    } catch (e) {}
  }, [language]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [showBuyHintModal, setShowBuyHintModal] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [myRank, setMyRank] = useState<number>(0);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  
  useEffect(() => {
    if (tgUser && tgUser.id && tgUser.id !== 9999 && tgUser.id !== 1) {
      try {
        localStorage.setItem('make100_tgUser', JSON.stringify(tgUser));
      } catch (e) {
        console.error("Failed to save tgUser to localStorage:", e);
      }
    }
  }, [tgUser]);
  
  const t: any = TRANSLATIONS[language];

  // Load cached images from localStorage immediately on mount to prevent any delay or rate limit issues
  useEffect(() => {
    try {
      const cached = localStorage.getItem('make100_github_images');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          carImagesListRef.current = parsed;
          setCarImage(parsed[Math.floor(Math.random() * parsed.length)]);
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached GitHub images:', e);
    }
  }, []);

  useEffect(() => {
    if (!GITHUB_FOLDER_URL) return;

    const fetchImages = async () => {
      try {
        let apiUrl = '';
        try {
          const urlObj = new URL(GITHUB_FOLDER_URL);
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          
          if (pathParts.length >= 2) {
            const owner = pathParts[0];
            const repo = pathParts[1];
            let branch = 'main';
            let path = '';
            
            if (pathParts.length >= 4 && pathParts[2] === 'tree') {
              branch = pathParts[3];
              path = pathParts.slice(4).join('/');
            }
            
            apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
          } else {
            console.warn('Неверный формат ссылки на GitHub.');
            return;
          }
        } catch (e) {
          console.warn('Неверный URL:', e);
          return;
        }
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Ошибка при загрузке данных с GitHub API');
        
        const data = await response.json();
        if (Array.isArray(data)) {
          const images = data
            .filter((file: { name: string }) => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
            .map((file: { download_url: string }) => file.download_url);
            
          if (images.length > 0) {
            carImagesListRef.current = images;
            setCarImage(images[Math.floor(Math.random() * images.length)]);
            try {
              localStorage.setItem('make100_github_images', JSON.stringify(images));
            } catch (e) {
              console.warn('Failed to cache GitHub images:', e);
            }
          }
        }
      } catch (err) {
        // Use console.warn instead of console.error to avoid raising fatal errors in test automation
        console.warn('Ошибка при получении картинок с GitHub:', err);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('background-color', '#09090b', 'important');
      body.style.setProperty('background-color', '#09090b', 'important');
      
      // Override Telegram theme variables with priority
      root.style.setProperty('--tg-theme-bg-color', '#09090b', 'important');
      root.style.setProperty('--tg-theme-secondary-bg-color', '#18181b', 'important');
      root.style.setProperty('--tg-theme-text-color', '#fafafa', 'important');
      root.style.setProperty('--tg-theme-hint-color', '#a1a1aa', 'important');
      
      root.style.setProperty('--app-bg', '#09090b', 'important');
      root.style.setProperty('--app-text', '#fafafa', 'important');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('background-color', '#fafafa', 'important');
      body.style.setProperty('background-color', '#fafafa', 'important');
      
      // Override Telegram theme variables with priority
      root.style.setProperty('--tg-theme-bg-color', '#fafafa', 'important');
      root.style.setProperty('--tg-theme-secondary-bg-color', '#f4f4f5', 'important');
      root.style.setProperty('--tg-theme-text-color', '#09090b', 'important');
      root.style.setProperty('--tg-theme-hint-color', '#71717a', 'important');
      
      root.style.setProperty('--app-bg', '#fafafa', 'important');
      root.style.setProperty('--app-text', '#09090b', 'important');
    }
  }, [theme]);
  
  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = useCallback((type: 'click' | 'success' | 'error' | 'skip') => {
    if (!soundEnabled) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.2);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'skip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }
  }, [soundEnabled]);

  const playVibration = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
    if (!vibrationEnabled) return;
    
    const tg = (window as unknown as { Telegram?: { WebApp: unknown } }).Telegram?.WebApp as {
      HapticFeedback?: {
        impactOccurred: (style: string) => void;
        notificationOccurred: (type: string) => void;
      }
    } | undefined;
    if (tg?.HapticFeedback) {
      if (type === 'light' || type === 'medium' || type === 'heavy') {
        tg.HapticFeedback.impactOccurred(type);
      } else if (type === 'success') {
        tg.HapticFeedback.notificationOccurred('success');
      } else if (type === 'error') {
        tg.HapticFeedback.notificationOccurred('error');
      }
    } else if (navigator.vibrate) {
      if (type === 'light') navigator.vibrate(10);
      else if (type === 'medium') navigator.vibrate(20);
      else if (type === 'heavy') navigator.vibrate(40);
      else if (type === 'success') navigator.vibrate([30, 50, 30]);
      else if (type === 'error') navigator.vibrate([50, 50, 50]);
    }
  }, [vibrationEnabled]);

  const completeDemo = () => {
    setShowDemo(false);
    setHasSeenOnboarding(true);
    setGameState('playing');
  };

  // Game Statistics
  const [solvedCount, setSolvedCount] = useState(0);
  const [unsolvedCount, setUnsolvedCount] = useState(0);
  const [totalSolveTime, setTotalSolveTime] = useState(0);
  const [totalOperatorsUsed, setTotalOperatorsUsed] = useState(0);
  const [bestTimeMs, setBestTimeMs] = useState<number | null>(null);
  const [minCharacters, setMinCharacters] = useState<number | null>(null);
  const [modeStats, setModeStats] = useState<Record<string, ModeDetail>>({});
  const [statsLoaded, setStatsLoaded] = useState(false);

  const [stats, setStats] = useState<any>({ coins: 0, hintsCount: 0, referralCount: 0 });
  const statsRef = useRef(stats);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);



  // Demo State
  const [showDemo, setShowDemo] = useState(true);

  useEffect(() => {
    if (statsLoaded) {
      if (hasSeenOnboarding || solvedCount > 0) {
        setShowDemo(false);
      }
    }
  }, [statsLoaded, hasSeenOnboarding, solvedCount]);


  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Auth is handled by telegram token logic below.
    // If we're not in TG, we can mock it
    setUser({ id: 1 });
    setIsAuthReady(true);
  }, []);

  const fetchLeaderboard = async () => {
    // Безопасно определяем ID активного пользователя
    const activeUserId = tgUser?.id || (stats as any)?.id;
    
    if (!activeUserId) {
      console.error("❌ Не удалось определить ID пользователя для лидерборда");
      return;
    }

    setIsLoadingLeaderboard(true);
    try {
      // Делаем запрос к абсолютному адресу бэкенда с использованием переменной окружения
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaderboard?userId=${activeUserId}`);
      if (res.ok) {
        const data = await res.json();
        console.log("📥 Успешно загружен лидерборд:", data);
        setLeaderboardData(data.leaderboard || []);
        setMyRank(data.myRank !== undefined ? data.myRank : 0);
      } else {
        console.error(`❌ Ошибка сервера при загрузке лидерборда: ${res.status}`);
      }
    } catch (err) {
      console.error("❌ Сетевая ошибка при загрузке лидерборда:", err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (isLeaderboardOpen) {
      fetchLeaderboard();
    }
  }, [isLeaderboardOpen, tgUser?.id]);

    useEffect(() => {
    if (!isAuthReady || isTgValidating) return;

    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
      } catch (e) {
        console.error(e);
      }
    }

    const loadStats = async () => {
      let referrerId: number | undefined = undefined;

      if (tg && tg.initDataUnsafe) {
        const startParam = tg.initDataUnsafe.start_param;
        if (startParam) {
          const parsedId = parseInt(startParam, 10);
          if (!isNaN(parsedId)) {
            referrerId = parsedId;
          }
        }
      }

      const applyStatsToState = (data: any) => {
        setSolvedCount(data.solvedCount || 0);
        setUnsolvedCount(data.skippedCount || data.unsolvedCount || 0);
        setTotalSolveTime(data.totalTimeMs || data.totalSolveTime || 0);
        setTotalOperatorsUsed(data.totalCharacters || data.totalOperatorsUsed || 0);
        setBestTimeMs(data.bestTimeMs ?? null);
        setMinCharacters(data.minCharacters ?? null);
        if (data.settings?.themePreference) setThemePreference(data.settings.themePreference);
        if (data.settings?.language) setLanguage(data.settings.language);
        if (data.settings?.gameMode) setGameMode(data.settings.gameMode);
        if (data.settings?.soundEnabled !== undefined) setSoundEnabled(data.settings.soundEnabled);
        if (data.settings?.vibrationEnabled !== undefined) setVibrationEnabled(data.settings.vibrationEnabled);
        if (data.settings?.hasSeenOnboarding !== undefined) setHasSeenOnboarding(data.settings.hasSeenOnboarding);
        if (data.modeStats) setModeStats(data.modeStats);
        setStats((prev: any) => ({ 
          ...prev,
          ...data,
          gamesStarted: data.gamesStarted !== undefined ? data.gamesStarted : (data.games_started !== undefined ? data.games_started : (prev?.gamesStarted ?? 0)),
          coins: data.coins !== undefined ? data.coins : 100, 
          hintsCount: data.hintsCount !== undefined ? data.hintsCount : 3,
          referralCount: data.referralCount ?? data.referralsCount ?? prev?.referralCount ?? 0,
          referredBy: data.referredBy ?? prev?.referredBy ?? null,
          createdAt: data.createdAt || data.created_at || prev?.createdAt || Date.now(),
          solvedCount: data.solvedCount || 0,
          skippedCount: data.skippedCount || data.unsolvedCount || 0,
          totalTimeMs: data.totalTimeMs || data.totalSolveTime || 0,
          bestTimeMs: data.bestTimeMs ?? null,
          minCharacters: data.minCharacters ?? null
        }));
      };

      if (isPreviewEnv) {
        const localStats = localStorage.getItem('stats_preview');
        if (localStats) {
          try {
            applyStatsToState(JSON.parse(localStats));
          } catch(e) {}
        }
        isStatsLoadedRef.current = true;
        setStatsLoaded(true);
        return;
      }

      if (tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999) {
        let isNewUser = false;
        let serverData = null;

        try {
          isStatsLoadedRef.current = false; // Сбрасываем флаг перед загрузкой
          const res = await fetch(`${API_URL}/api/user`, { headers: getAuthHeader() });
          
          // 🌟 ПЕРЕХВАТ БАНА:
          if (res.status === 403) {
            try {
              const errorData = await res.json();
              if (errorData.error === "banned") {
                setIsBanned(true); // Включаем режим блокировки на фронтенде
                return; // Прерываем дальнейшее выполнение функции
              }
            } catch (jsonErr) {
              setIsBanned(true);
              return;
            }
          }

          if (res.status === 200) {
            const data = await res.json();
            if (data && data.id) {
              serverData = data;
            } else {
              isNewUser = true;
            }
          } else if (res.status === 404 || res.status === 401) {
            isNewUser = true;
          }
        } catch (e) {
          console.warn("Server unavailable, falling back to local cache:", e);
        }

        if (serverData) {
          applyStatsToState(serverData);
          localStorage.setItem(`stats_${tgUser.id}`, JSON.stringify(serverData));
          isStatsLoadedRef.current = true; // Разрешаем автосохранения
          console.log("Данные старого пользователя успешно загружены с сервера.");
          setStatsLoaded(true);
          return;
        }

        if (isNewUser) {
          console.log("Регистрация нового пользователя. ID пригласителя:", referrerId);
          const initialStats = {
            solvedCount: 0,
            skippedCount: 0,
            totalTimeMs: 0,
            totalCharacters: 0,
            settings: {},
            modeStats: {},
            coins: referrerId ? 250 : 100,
            hintsCount: 3,
            referredBy: referrerId,
            referralCount: 0
          };

          try {
            await fetch(`${API_URL}/api/user`, {
              method: 'POST',
              headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                firstName: tgUser.first_name,
                lastName: tgUser.last_name,
                username: tgUser.username,
                avatarUrl: tgUser.photo_url,
                ...initialStats
              })
            });
            console.log("Новый пользователь успешно зарегистрирован в базе данных!");
          } catch (postErr) {
            console.error("Ошибка при регистрации реферала:", postErr);
          }

          applyStatsToState(initialStats);
          localStorage.setItem(`stats_${tgUser.id}`, JSON.stringify(initialStats));
          isStatsLoadedRef.current = true;
          setStatsLoaded(true);
          return;
        }

        // If it was a network error (serverData = null and isNewUser = false), try local cache
        const localStatsStr = localStorage.getItem(`stats_${tgUser.id}`);
        if (localStatsStr) {
          try {
            const localData = JSON.parse(localStatsStr);
            applyStatsToState(localData);
            console.log("Loaded local cache for ID:", tgUser.id);
            setStatsLoaded(true);
            return;
          } catch (err) {
            console.error("Local cache parse error:", err);
          }
        }

        // Failsafe initialization if local cache doesn't exist
        applyStatsToState({
          solvedCount: 0,
          skippedCount: 0,
          totalTimeMs: 0,
          totalCharacters: 0,
          settings: {},
          modeStats: {},
          coins: 100,
          hintsCount: 3,
          referralCount: 0
        });
        isStatsLoadedRef.current = true;
        setStatsLoaded(true);
      } else {
        const localStatsStr = localStorage.getItem('make100_stats');
        if (localStatsStr) {
          try {
            applyStatsToState(JSON.parse(localStatsStr));
          } catch(e) {}
        }
        isStatsLoadedRef.current = true;
        setStatsLoaded(true);
      }
    };

    const currentUserId = tg?.initDataUnsafe?.user?.id;
    if (currentUserId) {
      const lastLogged = localStorage.getItem('last_logged_user_id');
      if (lastLogged && lastLogged !== String(currentUserId)) {
        localStorage.removeItem('make100_stats');
        localStorage.removeItem(`stats_${lastLogged}`);
      }
      localStorage.setItem('last_logged_user_id', String(currentUserId));
    }
    
    loadStats();
  }, [isAuthReady, isTgValidating, tgUser]);

  useEffect(() => {
    if (!statsLoaded) return;
    if (!isStatsLoadedRef.current) {
      console.log('[Save Shield] Блокировка автосохранения: свежий профиль еще не загружен.');
      return;
    }
    
    const dataToSave = { 
      solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, 
      bestTimeMs, minCharacters, 
      settings: { themePreference, language, gameMode, soundEnabled, vibrationEnabled, hasSeenOnboarding }, 
      modeStats, coins: stats.coins, hintsCount: stats.hintsCount,
      referralCount: (stats as any)?.referralCount ?? 0,
      referredBy: (stats as any)?.referredBy ?? null,
      createdAt: (stats as any)?.createdAt
    };
    const statsStr = JSON.stringify(dataToSave);
    
    if (isPreviewEnv) {
      localStorage.setItem('stats_preview', statsStr);
      return;
    }
    
    if (tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999) {
      localStorage.setItem(`stats_${tgUser.id}`, statsStr);
    } else {
      localStorage.setItem('make100_stats', statsStr);
    }

    if (tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999) {
      saveUserStats({
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
        avatarUrl: tgUser.photo_url,
        solvedCount,
        skippedCount: unsolvedCount,
        totalTimeMs: totalSolveTime,
        totalCharacters: totalOperatorsUsed,
        bestTimeMs: bestTimeMs ?? undefined,
        minCharacters: minCharacters ?? undefined,
        coins: stats.coins,
        hintsCount: stats.hintsCount,
        referralCount: (stats as any)?.referralCount ?? 0,
        referredBy: (stats as any)?.referredBy ?? undefined,
        createdAt: (stats as any)?.createdAt,
        lastExpression: lastRoundExpressionRef.current || undefined,
        lastSolveTimeMs: lastRoundSolveTimeMsRef.current || undefined,
        settings: {
          themePreference,
          language,
          gameMode,
          currentMode: gameMode === 'ticket' ? 'tickets' : 'car',
          soundEnabled,
          vibrationEnabled,
          hasSeenOnboarding
        },
        modeStats
      }).then((updatedServerStats: any) => {
        if (updatedServerStats) {
          setStats((prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              score: updatedServerStats.score,
              coins: updatedServerStats.coins,
              solvedCount: updatedServerStats.solvedCount
            };
          });
        }
      });
      lastRoundExpressionRef.current = '';
      lastRoundSolveTimeMsRef.current = 0;
    }

    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initData && tg?.CloudStorage) {
      try {
        tg.CloudStorage.setItem('make100_stats', statsStr);
      } catch (e) {
        console.error("CloudStorage save error", e);
      }
    }
  }, [solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, bestTimeMs, minCharacters, theme, language, gameMode, soundEnabled, vibrationEnabled, statsLoaded, tgUser, modeStats, stats.coins, stats.hintsCount, (stats as any)?.referralCount]);

  useEffect(() => {
    setPlayerRank(null);
  }, [isAuthReady, user, solvedCount]);

  const handleInviteFriend = () => {
    const userId = tgUser?.id || (stats as any)?.id;
    if (!userId) return;
    
    // Наша рабочая реферальная ссылка на бота Test_Make100_bot
    const referralLink = `https://t.me/${import.meta.env.VITE_NAME_BOT || 'Test_Make100_bot'}/app?startapp=${userId}`;
    
    // Красивый пригласительный текст для друзей
    const shareText = t.inviteShareText || `Привет! Собери число 100 на скорость на крутых тачках! 🏎️🧠 Заходи по моей ссылке и получи 250 монет бонуса на старт!`;
    
    // Ссылка для вызова нативного Telegram Share Dialog
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    
    // Открываем Telegram-шеринг
    if ((window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.openTelegramLink(telegramShareUrl);
    } else {
      // Резервный вариант для тестирования в обычном браузере
      window.open(telegramShareUrl, '_blank');
    }
  };

  const showHint = () => {
    if (isHinting || won) return;
    
    const currentStats = statsRef.current;
    
    if (currentStats.hintsCount > 0) {
      setStats(prev => {
        const newStats = { ...prev, hintsCount: prev.hintsCount - 1 };
        return newStats;
      });
      showHintOnScreen();
    } else {
      setShowBuyHintModal(true);
    }
  };

  const showHintOnScreen = async () => {
    const solution = findSolution(digits);
    if (!solution) {
      setNoSolutionMessage(true);
      return;
    }

    setIsHinting(true);
    setHintUsed(true);
    setGaps(['', '', '', '', '', '', '']);
    setSelectedSlot(null);
    
    const newGaps = ['', '', '', '', '', '', ''];
    for (let i = 0; i <= 6; i++) {
      if (solution[i] !== '') {
        await new Promise(resolve => setTimeout(resolve, 600));
        newGaps[i] = solution[i];
        setGaps([...newGaps]);
        playSound('click');
        playVibration('light');
      }
    }
    
    // Ensure all gaps are set at the end, even empty ones
    setGaps([...solution]);
    setIsHinting(false);
  };

  const calculateRoundScore = (expr: string, solveTimeMs: number): number => {
    let roundScore = 10; // Базовые очки

    // Бонус за Скорость
    const sec = solveTimeMs / 1000;
    if (sec < 10) {
      roundScore += 10;
    } else if (sec >= 10 && sec <= 15) {
      roundScore += 5;
    }

    // Бонус за Краткость (все не-цифровые символы: знаки, скобки, запятые)
    const nonDigits = expr.replace(/\d/g, '').length;
    if (nonDigits === 1) {
      roundScore += 1000;
    } else if (nonDigits === 2) {
      roundScore += 500;
    } else if (nonDigits === 3) {
      roundScore += 30;
    } else if (nonDigits === 4) {
      roundScore += 15;
    } else if (nonDigits === 5) {
      roundScore += 5;
    }

    return roundScore;
  };

  const handleGameUpdate = useCallback((isSolved: boolean, solutionLength: number, timeSpent: number, isNewGlobalRecord?: boolean) => {
    const activeMode = gameMode === 'ticket' ? 'tickets' : 'car';
    
    setModeStats(prev => {
      const currentModeStats = prev[activeMode] || {
        solvedCount: 0,
        skippedCount: 0,
        bestTimeMs: null,
        minCharacters: null,
        totalTimeMs: 0,
        totalCharacters: 0
      };
      
      const updatedModeStats = {
        ...prev,
        [activeMode]: {
          solvedCount: currentModeStats.solvedCount + (isSolved ? 1 : 0),
          skippedCount: currentModeStats.skippedCount + (isSolved ? 0 : 1),
          bestTimeMs: isSolved
            ? (currentModeStats.bestTimeMs === null ? timeSpent : Math.min(currentModeStats.bestTimeMs, timeSpent))
            : currentModeStats.bestTimeMs,
          minCharacters: isSolved
            ? (currentModeStats.minCharacters === null ? solutionLength : Math.min(currentModeStats.minCharacters, solutionLength))
            : currentModeStats.minCharacters,
          totalTimeMs: currentModeStats.totalTimeMs + timeSpent,
          totalCharacters: currentModeStats.totalCharacters + solutionLength
        }
      };
      return updatedModeStats;
    });

    if (isSolved) {
      setStats(prev => {
        const prevBest = (prev as any)?.bestTimeMs ?? bestTimeMs ?? Infinity;
        const prevMin = (prev as any)?.minCharacters ?? minCharacters ?? Infinity;
        return {
          ...prev,
          coins: ((prev as any)?.coins ?? 0) + 10,
          solvedCount: ((prev as any)?.solvedCount ?? 0) + 1,
          totalTimeMs: ((prev as any)?.totalTimeMs ?? 0) + timeSpent,
          totalCharacters: ((prev as any)?.totalCharacters ?? 0) + solutionLength,
          bestTimeMs: (isNewGlobalRecord ?? (timeSpent < prevBest)) ? timeSpent : (prevBest === Infinity ? timeSpent : prevBest),
          minCharacters: (prevMin === Infinity || solutionLength < prevMin) ? solutionLength : prevMin
        };
      });
      setSolvedCount(prev => prev + 1);
      setTotalSolveTime(prev => prev + timeSpent);
      setTotalOperatorsUsed(prev => prev + solutionLength);
      setBestTimeMs(prev => {
        const previousGlobalBest = prev || Infinity;
        return (isNewGlobalRecord ?? (timeSpent < previousGlobalBest)) ? timeSpent : (prev ?? timeSpent);
      });
      setMinCharacters(prev => (prev === null || solutionLength < prev) ? solutionLength : prev);
    } else {
      setStats(prev => ({
        ...prev,
        skippedCount: ((prev as any)?.skippedCount ?? 0) + 1,
        totalTimeMs: ((prev as any)?.totalTimeMs ?? 0) + timeSpent,
        totalCharacters: ((prev as any)?.totalCharacters ?? 0) + solutionLength
      }));
      setUnsolvedCount(prev => prev + 1);
      setTotalSolveTime(prev => prev + timeSpent);
      setTotalOperatorsUsed(prev => prev + solutionLength);
    }
  }, [gameMode]);

  const initGame = useCallback((startAsIdle = false, isSkip = false) => {
    setNoSolutionMessage(false);
    if (isSkip) {
      const now = Date.now();
      const calculatedMs = now - roundStartTimeRef.current;
      const timeSpentMs = calculatedMs > 0 && calculatedMs < 3600000 ? calculatedMs : (elapsedTime || 1) * 1000;
      handleGameUpdate(false, 0, timeSpentMs);
      playSound('skip');
      playVibration('medium');
    } else if (!startAsIdle) {
      playSound('click');
      playVibration('light');
    }
    
    setDigits(Math.floor(Math.random() * 1000000).toString().padStart(6, '0').split(''));

    // Generate random letters for the license plate
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetters = [
      alphabet[Math.floor(Math.random() * alphabet.length)],
      alphabet[Math.floor(Math.random() * alphabet.length)],
      alphabet[Math.floor(Math.random() * alphabet.length)]
    ];
    setLetters(randomLetters);

    // Set random car image
    setCarImage(carImagesListRef.current[Math.floor(Math.random() * carImagesListRef.current.length)]);

    setGaps(['', '', '', '', '', '', '']);
    setSelectedSlot(1);
    setWon(false);
    setHintUsed(false);
    
    const styles = getTicketStyles(TRANSLATIONS[language] || TRANSLATIONS['ru']);
    setTicketStyleId(styles[Math.floor(Math.random() * styles.length)].id);
    setElapsedTime(0);
    roundStartTimeRef.current = Date.now();
    setIsNewRecord(false);
    setLastRoundTimeMs(0);
    setGameState(startAsIdle === true ? 'idle' : 'playing');
    if (startAsIdle !== true) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [playSound, playVibration, language, handleGameUpdate, elapsedTime, startTimer, stopTimer]);

  useEffect(() => {
    let attempts = 0;
    let isMounted = true;
    let isInitializing = false;

    const checkAndInit = async () => {
      if (isInitializing) return false;
      isInitializing = true;
      
      const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
      const tgUserId = tg?.initDataUnsafe?.user?.id;
      if (tgUserId) {
        const lastUserId = localStorage.getItem('last_logged_user_id');
        if (lastUserId !== String(tgUserId)) {
          localStorage.removeItem('make100_stats');
          localStorage.removeItem('make100_tgUser');
          localStorage.setItem('last_logged_user_id', String(tgUserId));
        }
      }

      try {
        // 1. Try Telegram Web App (Mini Apps) - High priority to capture actual Telegram user profiles
        const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
        if (tg && (tg.initData || tg.initDataUnsafe?.user)) {
          tg.ready();
          tg.expand();
          
          if (!tg.initData) {
            // Unsafe user fallback if initData is empty but user object is present
            if (isMounted) {
              if (isPreviewEnv) {
                const fallbackUser = tg.initDataUnsafe?.user || { id: 1, first_name: "Player" };
                setTgUser(fallbackUser);
              } else {
                setTgUser(null);
              }
              setIsTgValidating(false);
            }
            return true;
          }

          // Check session storage first
          try {
            const cachedInitData = sessionStorage.getItem('tgInitData');
            const cachedUser = sessionStorage.getItem('tgUser');
            if (tg.initData && cachedInitData === tg.initData && cachedUser) {
              if (isMounted) {
                setTgUser(JSON.parse(cachedUser));
                setIsTgValidating(false);
              }
              return true;
            }
          } catch (e) {
            console.error("Session storage error", e);
          }

          let userToSet = null;
          if (tg.initDataUnsafe?.user) {
            userToSet = tg.initDataUnsafe.user;
          }

          if (userToSet) {
            if (isMounted) {
              setTgUser(userToSet);
              setIsTgValidating(false);
            }
            try {
              sessionStorage.setItem('tgInitData', tg.initData);
              sessionStorage.setItem('tgUser', JSON.stringify(userToSet));
            } catch (e) {
              console.error("Failed to save to session storage", e);
            }
          } else {
             if (isMounted) {
                if (isPreviewEnv) {
                  const fallbackUser = { id: 1, first_name: "Player" };
                  setTgUser(fallbackUser);
                } else {
                  setTgUser(null);
                }
                setIsTgValidating(false);
             }
          }
          return true;
        }
          
        // 2. Try Telegram Game Proxy (HTML5 Games via Bot API)
        const gameProxy = (window as any).TelegramGameProxy;
        if (gameProxy && gameProxy.initParams && (gameProxy.initParams.user_id || gameProxy.initParams.chat_id)) {
          if (isMounted) {
            setTgUser({
              id: gameProxy.initParams.user_id || 1,
              first_name: "Player",
            });
            setIsTgValidating(false);
          }
          return true;
        }

        // 3. Try URL query and hash parameters direct fallback (super robust detecting game/bot launch params)
        if (isPreviewEnv) {
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.slice(1));
          const tgShareScoreUrl = urlParams.get('tgShareScoreUrl') || hashParams.get('tgShareScoreUrl');
          const tgUserId = urlParams.get('userId') || hashParams.get('userId') || 
                           urlParams.get('tg_user_id') || hashParams.get('tg_user_id') || 
                           urlParams.get('user_id') || hashParams.get('user_id');
          const tgInitData = urlParams.get('tgWebAppStartParam') || hashParams.get('tgWebAppStartParam') || urlParams.get('hash') || hashParams.get('hash');
          const tgGameId = urlParams.get('id') || hashParams.get('id');
          const tgChatId = urlParams.get('chatId') || hashParams.get('chatId') ||
                           urlParams.get('chat_id') || hashParams.get('chat_id');
          
          if (tgShareScoreUrl || tgUserId || tgInitData || tgGameId || tgChatId) {
            if (isMounted) {
              setTgUser({
                id: tgUserId ? Number(tgUserId) : 1,
                first_name: "Player",
              });
              setIsTgValidating(false);
            }
            return true;
          }
        }

        return false;
      } finally {
        isInitializing = false;
      }
    };

    const poll = async () => {
      attempts++;
      const success = await checkAndInit();
      if (success) return;

      if (attempts < 15 && isMounted) { // Poll up to 1.5 seconds (15 * 100ms)
        setTimeout(poll, 100);
      } else if (isMounted) {
        // Validation gave up. We didn't find telegram data.
        if (isPreviewEnv) {
          setTgUser({
            id: 9999,
            first_name: "Developer",
            last_name: "Preview"
          });
          setIsTgValidating(false);
        } else {
          setTgUser(null);
          setIsTgValidating(false);
        }
      }
    };

    poll();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
    
    const updateTheme = () => {
      if (themePreference === 'auto') {
        const systemPrefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(tg?.colorScheme || (systemPrefersDark ? 'dark' : 'light'));
      } else {
        setTheme(themePreference);
      }
    };

    updateTheme();

    if (tg?.onEvent) {
      tg.onEvent('themeChanged', updateTheme);
      return () => {
        if (tg.offEvent) tg.offEvent('themeChanged', updateTheme);
      };
    }
  }, [themePreference]);

  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
    if (tg) {
      try {
        const targetColor = theme === 'dark' ? '#09090b' : '#fafafa';
        tg.setHeaderColor(targetColor);
        tg.setBackgroundColor(targetColor);
      } catch (e) {
        try {
          tg.setHeaderColor('bg_color');
          tg.setBackgroundColor('bg_color');
        } catch (e2) {
          console.error("Failed to set Telegram colors", e2);
        }
      }
    }
  }, [theme]);

  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
    if (!tg?.BackButton) return;

    // Функция-обработчик для кнопки Назад
    const handleSystemBackButtonClick = () => {
      if (isProfileOpen) {
        setIsProfileOpen(false);
      } else if (isMenuOpen) {
        setIsMenuOpen(false);
      } else if (isLeaderboardOpen) {
        setIsLeaderboardOpen(false);
      }
    };

    // Если открыто либо Меню, либо Профиль — показываем нативную кнопку
    if (isMenuOpen || isProfileOpen || isLeaderboardOpen) {
      tg.BackButton.show();
      tg.BackButton.onClick(handleSystemBackButtonClick);
    } else {
      // Если всё закрыто — прячем кнопку
      tg.BackButton.hide();
    }

    // Обязательная очистка при размонтировании эффекта
    return () => {
      tg.BackButton.offClick(handleSystemBackButtonClick);
      tg.BackButton.hide();
    };
  }, [isMenuOpen, isProfileOpen, isLeaderboardOpen]);

  useEffect(() => {
    initGame(true);
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && !won) {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [gameState, won, startTimer, stopTimer]);

  const handleOp = useCallback((op: string) => {
    if (selectedSlot === null || won) return;
    
    const newGaps = [...gaps];
    if (op === 'Backspace') {
      newGaps[selectedSlot] = newGaps[selectedSlot].slice(0, -1);
      playSound('click');
      playVibration('light');
    } else {
      newGaps[selectedSlot] += op;
      playSound('click');
      playVibration('medium');
    }
    setGaps(newGaps);
  }, [selectedSlot, gaps, won, playSound, playVibration]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (won) {
         if (e.key === 'Enter' || e.key === ' ') {
            initGame(false);
         }
         return;
      }
      if (selectedSlot === null) return;
      
      if (['+', '-', '*', '/', '(', ')', ','].includes(e.key)) {
        handleOp(e.key);
      } else if (e.key === '.') {
        handleOp(',');
      } else if (e.key === 'Backspace') {
        handleOp('Backspace');
      } else if (e.key === 'ArrowLeft') {
        setSelectedSlot(Math.max(0, selectedSlot - 1));
        playSound('click');
        playVibration('light');
      } else if (e.key === 'ArrowRight') {
        setSelectedSlot(Math.min(6, selectedSlot + 1));
        playSound('click');
        playVibration('light');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSlot, handleOp, won, initGame, gameState, playSound, playVibration]);

  const currentResult = digits.length ? calculateResult(digits, gaps) : 0;
  const currentInput = gaps.join('');
  const isWin = currentResult === 100;

  useEffect(() => {
    if (isWin && !won && !hintUsed) {
      stopTimer();

      const exactSolveTimeMs = Date.now() - roundStartTimeRef.current;
      const exactSolveTimeSec = exactSolveTimeMs / 1000;
      setElapsedTime(exactSolveTimeSec);

      setWon(true);
      setGameState('idle');
      playSound('success');
      playVibration('success');
      
      setLastRoundTimeMs(exactSolveTimeMs);

      // 1. Проверяем, побит ли глобальный рекорд скорости (bestTimeMs в корне стейта)
      const previousGlobalBest = (stats as any)?.bestTimeMs || bestTimeMs || Infinity;
      const isNewGlobalRecord = exactSolveTimeMs < previousGlobalBest;

      if (isNewGlobalRecord) {
        setIsNewRecord(true);

        // 1. СИНХРОННО обновляем локальный стейт, чтобы Профиль мгновенно перерисовал рекорд!
        setStats(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            bestTimeMs: exactSolveTimeMs // Записываем новый рекорд прямо в память телефона
          };
        });

        // 2. Также не забываем обновить реф для синхронизации автосохранений
        if (statsRef.current) {
          (statsRef.current as any).bestTimeMs = exactSolveTimeMs;
        }

        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            zIndex: 9999
          });
        } catch (e) {}

        const tg = (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: { notificationOccurred: (type: string) => void } } } }).Telegram?.WebApp;
        if (tg?.HapticFeedback?.notificationOccurred) {
          try {
            tg.HapticFeedback.notificationOccurred('success');
          } catch (e) {}
        }
      }

      // Проверяем рекорд по краткости ввода (minCharacters)
      const currentMinChars = (stats as any)?.minCharacters || minCharacters;
      if (!currentMinChars || currentInput.length < currentMinChars) {
        setStats(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            minCharacters: currentInput.length
          };
        });
        
        if (statsRef.current) {
          (statsRef.current as any).minCharacters = currentInput.length;
        }
      }

      // Update statistics via handleGameUpdate
      const operatorsUsed = gaps.join('').replace(/[0-9.]/g, '').length;
      lastRoundExpressionRef.current = gaps.join('');
      lastRoundSolveTimeMsRef.current = exactSolveTimeMs;
      
      const earnedPoints = calculateRoundScore(currentInput, exactSolveTimeMs);
      setLastEarnedScore(earnedPoints);
      
      handleGameUpdate(true, operatorsUsed, exactSolveTimeMs, isNewGlobalRecord);
      
      setSelectedSlot(null);
    }
  }, [isWin, won, hintUsed, gaps, playSound, playVibration, tgUser, digits, handleGameUpdate, bestTimeMs, stopTimer]);

  // 🌟 Полноэкранный экран блокировки (Guard Clause)
  if (isBanned) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center select-none h-screen w-screen">
        <div className="max-w-xs space-y-6 animate-fade-in">
          {/* Иконка замка с мягким красным свечением */}
          <div className="relative w-24 h-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 shadow-lg shadow-red-500/10">
            <span className="text-5xl">🚫</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-red-500 uppercase tracking-wider">
              {t.bannedTitle || 'Доступ ограничен'}
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed">
              {t.bannedDesc || 'Ваш игровой аккаунт был временно или навсегда заблокирован за нарушение правил честной игры и сообщества Make100.'}
            </p>
          </div>

          {/* Информационная плашка */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-[11px] text-slate-500">
            {t.bannedNote || 'Если вы считаете, что блокировка произошла по ошибке, обратитесь к администратору нашего сообщества.'}
          </div>

          {/* Кнопка поддержки */}
          <div className="pt-2">
            <a 
              href="https://t.me/RotanovAV" // Ссылка на твой телеграм как админа проекта
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-3 px-6 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-red-600/25 active:scale-95 transition-transform"
            >
              {t.bannedContactSupport || '💬 Написать в поддержку'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Защитный экран загрузки (Предохранитель)
  if (!stats || !statsLoaded || !digits.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white font-sans">
        {/* Простой CSS-спиннер */}
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
        </div>
        <h1 className="text-xl font-black tracking-wider text-orange-500 animate-pulse">
          СДЕЛАЙ 100
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          Синхронизация с базой данных...
        </p>
      </div>
    );
  }

  const renderLicensePlate = () => {
    // A generic, clean CSS-based Russian-style license plate
    return (
      <div className="w-full h-full max-h-[650px] max-w-[1000px] mx-auto flex flex-col items-center justify-center gap-4">
        <div className="w-full h-full min-h-[150px] shrink rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-zinc-800 relative bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
          {!carImage && <span className="text-zinc-400">{t.loading}</span>}
          {carImage && (
            <>
              <img 
                src={carImage} 
                alt="Car Exterior" 
                className="w-full h-full object-cover absolute inset-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.opacity = '0';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const errorMsg = document.createElement('span');
                    errorMsg.className = 'text-red-500 font-bold absolute z-20';
                    errorMsg.innerText = t.imageLoadError;
                    parent.appendChild(errorMsg);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none"></div>
            </>
          )}

          {/* License Plate Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[60%] max-w-[196px] bg-white rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-[2px] border-zinc-900 overflow-hidden flex flex-col">
            <div className="flex items-stretch bg-gradient-to-b from-white to-zinc-100 h-10 sm:h-11">
              
              {/* Main number section */}
              <div className="w-2/3 flex items-center justify-center gap-0.5 px-1 border-r-[2px] border-zinc-900">
                <span className="font-sans text-xl sm:text-2xl font-black text-zinc-900 mt-0.5">{letters[0]}</span>
                <span className="font-mono text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">{digits.slice(0, 3).join('')}</span>
                <span className="font-sans text-xl sm:text-2xl font-black text-zinc-900 mt-0.5">{letters[1]}{letters[2]}</span>
              </div>

              {/* Region section */}
              <div className="w-1/3 flex flex-col items-center justify-center px-1">
                <span className="font-mono text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">{digits.slice(3).join('')}</span>
              </div>
            </div>
            
            {/* Screws for main plate (Left and Right edges) */}
            <div className="absolute top-1/2 -translate-y-1/2 left-1 w-1 h-1 rounded-full bg-zinc-300 border border-zinc-400 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-zinc-500 rotate-12"></div></div>
            <div className="absolute top-1/2 -translate-y-1/2 right-1 w-1 h-1 rounded-full bg-zinc-300 border border-zinc-400 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-zinc-500 -rotate-12"></div></div>
          </div>
        </div>
      </div>
    );
  };

  const renderTicket = () => {
    const styles = getTicketStyles(t);
    const ticketStyle = styles.find(s => s.id === ticketStyleId) || styles[0];
    const numStr = digits.join('');
    const Icon = ticketStyle.icon;
    const tTicket = t.tickets?.[ticketStyle.id as keyof typeof t.tickets] || ticketStyle;
    
    return (
      <div className={`relative w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto overflow-hidden ${ticketStyle.containerClass}`}>
        {/* Watermark / Pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: ticketStyle.pattern, backgroundSize: '10px 10px' }}></div>
        
        <div className="flex justify-between items-center mb-6 sm:mb-8 relative z-10">
          <div className="flex items-center gap-2">
            <Icon className={ticketStyle.iconClass} size={28} />
            <span className={`${ticketStyle.labelClass} text-base sm:text-lg`}>{tTicket.title}</span>
          </div>
          <span className={`${ticketStyle.labelClass} text-base sm:text-lg`}>{tTicket.subtitle}</span>
        </div>
        
        <div className={`py-10 sm:py-16 md:py-20 flex justify-center items-center relative z-10 ${ticketStyle.numberContainerClass}`}>
          <span className={`font-mono text-5xl sm:text-6xl md:text-8xl font-black tracking-[0.1em] sm:tracking-[0.2em] ml-1 sm:ml-3 ${ticketStyle.numberClass}`}>
            {numStr}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-6 sm:mt-8 relative z-10">
          <span className={`${ticketStyle.footerClass} text-lg sm:text-xl`}>{tTicket.footerLeft}</span>
          <span className={`${ticketStyle.footerClass} text-lg sm:text-xl`}>{tTicket.footerRight}</span>
        </div>
        
        {/* Barcode */}
        {ticketStyle.hasBarcode && (
          <div className="h-14 sm:h-16 w-full opacity-40 mt-8 sm:mt-10 relative z-10" style={{ backgroundImage: 'repeating-linear-gradient(to right, currentColor 0, currentColor 2px, transparent 2px, transparent 4px, currentColor 4px, currentColor 5px, transparent 5px, transparent 8px, currentColor 8px, currentColor 12px, transparent 12px, transparent 14px)' }}></div>
        )}
      </div>
    );
  };

  if (isTgValidating) {
    return (
      <DemoOverlay 
        onComplete={() => {}} 
        t={t} 
        isTgValidating={true} 
      />
    );
  }

  const isRealTelegramUser = isPreviewEnv || !!(tgUser && tgUser.id && tgUser.id !== 1 && (tgUser.id !== 9999 || isPreviewEnv));

  if (!isRealTelegramUser && !devBypassed) {
    return (
      <div className={`h-[100dvh] w-full ${theme === 'dark' ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-900'} flex flex-col items-center justify-center p-4 text-center`}>
        <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-full mb-4">
          <Smartphone size={32} className="text-blue-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">
          {t.accessRestricted || (language === 'ru' ? 'Доступ ограничен' : 'Telegram Only')}
        </h2>
        <p className="text-sm opacity-70 mb-6 max-w-xs">
          {t.tgOnlyDesc || (language === 'ru' 
            ? 'Пожалуйста, войдите в игру через официального Telegram-бота после авторизации.' 
            : 'Please play the game through our Telegram Bot.')}
        </p>
        <button 
          onClick={() => {
            const tg = (window as any).Telegram?.WebApp;
            if (tg && typeof tg.openTelegramLink === 'function') {
              try {
                tg.openTelegramLink(`https://t.me/${import.meta.env.VITE_NAME_BOT || 'Test_Make100_bot'}`);
              } catch (e) {
                window.open(`https://t.me/${import.meta.env.VITE_NAME_BOT || 'Test_Make100_bot'}`, "_blank");
              }
            } else {
              window.open(`https://t.me/${import.meta.env.VITE_NAME_BOT || 'Test_Make100_bot'}`, "_blank");
            }
          }}
          className="px-6 py-3 bg-blue-500 hover:opacity-90 text-white rounded-xl font-bold transition-colors shadow-lg mb-4 w-[240px]"
        >
          {t.openInTelegram || (language === 'ru' ? 'Открыть в Telegram' : 'Open in Telegram')}
        </button>

        <button 
          onClick={() => {
            setDevBypassed(true);
            setTgUser({ id: 9999, first_name: "Guest" });
          }} 
          className="px-6 py-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold transition-colors shadow mb-2 w-[240px]"
        >
          {t.playAsGuest || (language === 'ru' ? 'Играть как гость' : 'Play as Guest')}
        </button>
      </div>
    );
  }

  const levelInfo = getLevelInfo((stats as any)?.solvedCount ?? solvedCount);

  return (
    <div 
      className={`h-[100dvh] w-full ${theme} ${theme === 'dark' ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-900'} transition-colors duration-300 font-sans overflow-y-auto overflow-x-hidden relative flex flex-col items-center px-1 sm:px-4 md:px-6`}
      style={{
        paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 16px)) + 8px)',
        paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 16px)) + 8px)'
      }}
    >
      <div className={`fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]`} />
      
      {statsLoaded && (
        <>
          {/* Header */}
          <header className="w-full max-w-md mx-auto px-4 pt-4 flex items-center justify-between gap-3 select-none mb-2 sm:mb-3 z-10 flex-shrink-0">
            {/* Кликабельная аватарка с индикатором кликабельности */}
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="relative group active:scale-90 transition-all duration-150 focus:outline-none flex-shrink-0 cursor-pointer"
              title={t.openProfile || "Открыть профиль"}
            >
              {/* Пульсирующая внешняя рамка */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 opacity-75 blur-[2px] animate-pulse"></div>
              
              {/* Сама аватарка */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-950 shadow-md">
                {((stats as any)?.avatarUrl || tgUser?.photo_url) ? (
                  <img src={(stats as any)?.avatarUrl || tgUser?.photo_url} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white font-black text-base">
                    {String((stats as any)?.firstName || tgUser?.first_name || 'U').toUpperCase().charAt(0)}
                  </div>
                )}
              </div>

              {/* Маленький индикатор-шестеренка в углу */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-500 border border-white dark:border-slate-950 flex items-center justify-center shadow-md">
                <span className="text-[10px] text-white leading-none">⚙️</span>
              </div>
            </button>

            {/* Блок баланса монет, подсказок и меню */}
            <div className="flex items-center gap-2 flex-1 justify-end font-mono">
              {/* Плашка монет */}
              <div className="flex items-center gap-1.5 py-2 px-3.5 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm" title={t.coinsLabel || "Монеты"}>
                <span className="text-lg">🪙</span>
                <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">
                  {stats ? stats.coins : 0}
                </span>
              </div>

              {/* Плашка подсказок */}
              <div className="flex items-center gap-1.5 py-2 px-3.5 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm" title={t.hintsLabel || "Подсказки"}>
                <span className="text-lg">💡</span>
                <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">
                  {stats ? stats.hintsCount : 0}
                </span>
              </div>

              {/* Кнопка лидерборда (Кубок) */}
              <button 
                onClick={() => { setIsLeaderboardOpen(true); playSound('click'); playVibration('light'); }}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-transform active:scale-90 duration-150 cursor-pointer animate-pulse"
                title={t.leaderboard || "Зал славы"}
              >
                <Trophy size={18} fill="currentColor" className="text-yellow-100" />
              </button>

              {/* Кнопка открытия бокового меню */}
              <button 
                onClick={() => { setIsMenuOpen(true); playSound('click'); playVibration('light'); }}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-sm active:scale-95 transition-all cursor-pointer"
                title={t.settingsMenu || "Меню настроек"}
              >
                <Menu size={20} />
              </button>
            </div>
          </header>

      {/* Live Stopwatch & Character Counter (Top Bar) */}
      <div className="w-full max-w-4xl flex justify-center items-center mt-3 sm:mt-4 mb-2 sm:mb-3 z-10 flex-shrink-0 px-2">
        <div className="flex justify-center items-center gap-8 sm:gap-12 py-2.5 sm:py-3.5 px-6 sm:px-9 rounded-full font-mono bg-slate-900/40 dark:bg-slate-900/70 border border-slate-800/60 backdrop-blur-md shadow-md">
          {/* Секундомер в спортивном формате ММ:СС:мс */}
          <div className="flex items-center gap-2.5">
            <span className="animate-pulse text-xl sm:text-2xl">⏱️</span>
            <span className="text-zinc-900 dark:text-white font-black text-xl sm:text-2xl tracking-wider font-mono">
              {formatLiveStopwatch(elapsedTime)}
            </span>
          </div>
          
          {/* Вертикальный разделитель */}
          <div className="h-6 sm:h-7 w-[1.5px] bg-slate-700/60 dark:bg-slate-800"></div>

          {/* Счётчик символов в текущем вводе */}
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl">✍️</span>
            <span className="text-zinc-900 dark:text-white font-black text-xl sm:text-2xl tracking-tight">
              {currentInput.length} <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-sans font-semibold ml-0.5">{t.charsShort || 'симв.'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Menu Overlay (Full-Screen) */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white h-screen w-screen overflow-y-auto animate-fade-in select-none">
            
            {/* Нативная верхняя панель Меню (идентичная Профилю) */}
            <div 
              className="sticky top-0 z-10 w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-900/80 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md"
              style={{
                paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 16px)'
              }}
            >
              {/* Кнопка назад */}
              <button 
                onClick={() => { setIsMenuOpen(false); playSound('click'); playVibration('light'); }}
                className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300/40 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition-transform cursor-pointer"
              >
                ⬅️ {t.back || 'Назад'}
              </button>
              <h1 className="text-base font-black tracking-wider uppercase text-orange-500">
                {t.gameSettings || 'Настройки игры'}
              </h1>
              <div className="w-16"></div> {/* Заглушка для центровки заголовка */}
            </div>

            {/* Содержимое меню */}
            <div 
              className="flex-1 w-full max-w-md mx-auto px-4 pb-12 pt-6 overflow-y-auto space-y-6"
              style={{
                paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 36px)'
              }}
            >
              {/* Game Mode */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.gameMode}</span>
                <div className="flex bg-slate-200/60 dark:bg-slate-900 p-1 rounded-2xl border border-slate-300/40 dark:border-slate-800">
                  <button 
                    onClick={() => { setGameMode('ticket'); playSound('click'); playVibration('light'); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${gameMode === 'ticket' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {t.ticket}
                  </button>
                  <button 
                    onClick={() => { setGameMode('car'); playSound('click'); playVibration('light'); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${gameMode === 'car' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {t.car}
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.theme}</span>
                <div className="flex bg-slate-200/60 dark:bg-slate-900 p-1 rounded-2xl border border-slate-300/40 dark:border-slate-800">
                  <button 
                    onClick={() => { setThemePreference('auto'); playSound('click'); playVibration('light'); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${themePreference === 'auto' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    <Smartphone size={16} /> {t.auto}
                  </button>
                  <button 
                    onClick={() => { setThemePreference('light'); playSound('click'); playVibration('light'); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${themePreference === 'light' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    <Sun size={16} /> {t.light}
                  </button>
                  <button 
                    onClick={() => { setThemePreference('dark'); playSound('click'); playVibration('light'); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${themePreference === 'dark' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    <Moon size={16} /> {t.dark}
                  </button>
                </div>
              </div>

              {/* Sound & Vibration */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.soundAndVibration}</span>
                <div className="flex bg-slate-200/60 dark:bg-slate-900 p-1 rounded-2xl border border-slate-300/40 dark:border-slate-800">
                  <button 
                    onClick={() => { 
                      setSoundEnabled(!soundEnabled); 
                      if (!soundEnabled) {
                        setTimeout(() => playSound('click'), 50);
                      }
                      playVibration('light'); 
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${soundEnabled ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />} {t.sound}
                  </button>
                  <button 
                    onClick={() => { 
                      setVibrationEnabled(!vibrationEnabled); 
                      playSound('click');
                      if (!vibrationEnabled) {
                        setTimeout(() => playVibration('light'), 50);
                      }
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${vibrationEnabled ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {vibrationEnabled ? <Vibrate size={16} /> : <VibrateOff size={16} />} {t.vibration}
                  </button>
                </div>
              </div>

              {/* Language */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.language}</span>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => { setLanguage(code); playSound('click'); playVibration('light'); }}
                      className={`py-2.5 px-3.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${language === code ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-200/60 dark:bg-slate-900 border border-slate-300/40 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-800'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-center text-xs text-slate-400 dark:text-slate-600 font-mono">
                v1.91
              </div>
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {isLeaderboardOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white h-screen w-screen overflow-hidden animate-fade-in select-none">
            {/* Нативная верхняя панель (идентичная Профилю и Настройкам) */}
            <div 
              className="sticky top-0 z-10 w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-900/80 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md shrink-0"
              style={{
                paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 16px)'
              }}
            >
              {/* Кнопка назад */}
              <button 
                onClick={() => { setIsLeaderboardOpen(false); playSound('click'); playVibration('light'); }}
                className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300/40 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition-transform cursor-pointer"
              >
                ⬅️ Назад
              </button>
              <h1 className="text-base font-black tracking-wider uppercase text-orange-500">
                Зал славы
              </h1>
              <div className="w-16"></div> {/* Заглушка для идеальной центровки */}
            </div>

            {/* Внутренний контейнер скролла */}
            <div className="w-full max-w-md mx-auto flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 pb-28">
              {isLoadingLeaderboard ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 text-slate-400 dark:text-slate-500">
                  <RefreshCw size={36} className="animate-spin text-amber-500" />
                  <span className="text-sm font-bold tracking-wider uppercase">{t.loadingLeaderboard || 'Загрузка...'}</span>
                </div>
              ) : leaderboardData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 text-slate-400 dark:text-slate-500 font-medium">
                  <Trophy size={56} className="opacity-20" />
                  <span className="text-sm font-bold tracking-wider uppercase">{t.noData || 'Пока нет данных'}</span>
                </div>
              ) : (
                <>
                  {/* Podium (Top 3) */}
                    <div className="flex items-end justify-center gap-2 sm:gap-4 p-6 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                      {/* 2nd Place */}
                      {leaderboardData.length > 1 ? (
                        <div className="flex flex-col items-center w-24">
                          <div className="relative mb-2">
                            {leaderboardData[1]?.avatarUrl ? (
                              <img src={leaderboardData[1].avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-4 border-slate-300 shadow-lg shadow-slate-300/30" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-slate-300 flex items-center justify-center border-4 border-slate-200 shadow-lg"><User size={24} className="text-slate-600" /></div>
                            )}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-sm font-black text-slate-700 border-2 border-white dark:border-slate-900 shadow-md">2</div>
                          </div>
                          <span className="text-xs font-bold truncate w-full text-center mt-2">{getPlayerDisplayName(leaderboardData[1] as any)}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-black text-sm">{leaderboardData[1]?.score || 0}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center w-24 opacity-40">
                          <div className="relative mb-2">
                            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-4 border-slate-200 dark:border-slate-800 shadow-lg"><User size={24} className="text-slate-400" /></div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-sm font-black text-slate-400 border-2 border-white dark:border-slate-900 shadow-md">2</div>
                          </div>
                          <span className="text-xs font-bold truncate w-full text-center mt-2 text-slate-400">Пусто</span>
                        </div>
                      )}
                      
                      {/* 1st Place */}
                      {leaderboardData.length > 0 ? (
                        <div className="flex flex-col items-center w-28 -translate-y-4">
                          <div className="relative mb-2">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl drop-shadow-md">👑</div>
                            {leaderboardData[0]?.avatarUrl ? (
                              <img src={leaderboardData[0].avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-xl shadow-amber-400/40" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center border-4 border-amber-300 shadow-xl shadow-amber-400/40"><User size={32} className="text-amber-900" /></div>
                            )}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-9 h-9 bg-amber-400 rounded-full flex items-center justify-center text-base font-black text-amber-900 border-2 border-white dark:border-slate-900 shadow-md">1</div>
                          </div>
                          <span className="text-sm font-bold truncate w-full text-center mt-2 text-amber-600 dark:text-amber-400">{getPlayerDisplayName(leaderboardData[0] as any)}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-black text-lg">{leaderboardData[0]?.score || 0}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center w-28 -translate-y-4 opacity-40">
                          <div className="relative mb-2">
                            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-4 border-slate-200 dark:border-slate-800 shadow-xl"><User size={32} className="text-slate-400" /></div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-base font-black text-slate-400 border-2 border-white dark:border-slate-900 shadow-md">1</div>
                          </div>
                          <span className="text-sm font-bold truncate w-full text-center mt-2 text-slate-400">Пусто</span>
                        </div>
                      )}
                      
                      {/* 3rd Place */}
                      {leaderboardData.length > 2 ? (
                        <div className="flex flex-col items-center w-24">
                          <div className="relative mb-2">
                            {leaderboardData[2]?.avatarUrl ? (
                              <img src={leaderboardData[2].avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-4 border-orange-400 shadow-lg shadow-orange-400/30" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center border-4 border-orange-300 shadow-lg"><User size={24} className="text-orange-900" /></div>
                            )}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-sm font-black text-orange-900 border-2 border-white dark:border-slate-900 shadow-md">3</div>
                          </div>
                          <span className="text-xs font-bold truncate w-full text-center mt-2">{getPlayerDisplayName(leaderboardData[2] as any)}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-black text-sm">{leaderboardData[2]?.score || 0}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center w-24 opacity-40">
                          <div className="relative mb-2">
                            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-4 border-slate-200 dark:border-slate-800 shadow-lg"><User size={24} className="text-slate-400" /></div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-sm font-black text-slate-400 border-2 border-white dark:border-slate-900 shadow-md">3</div>
                          </div>
                          <span className="text-xs font-bold truncate w-full text-center mt-2 text-slate-400">Пусто</span>
                        </div>
                      )}
                    </div>

                    
                  {/* List 4-100 */}
                    <div className="flex flex-col px-3 sm:px-4 space-y-2 mt-4">
                      {(leaderboardData?.slice(3) || []).map((player: any, index: number) => (
                        <div key={player.id || index} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                          <div className="w-8 text-center text-sm font-black text-slate-400 dark:text-slate-500 shrink-0">
                            #{index + 4}
                          </div>
                          
                          {player.avatarUrl ? (
                            <img src={player.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                              <User size={18} />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block text-sm">
                              {getPlayerDisplayName(player)}
                            </span>
                          </div>
                          
                          <div className="font-black text-amber-500">
                            {player.score || 0}
                          </div>
                        </div>
                      ))}
                    </div>

                </>
              )}
            </div>

            {/* Sticky Bottom Bar (My Result) */}
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200/60 dark:border-slate-900/80 flex justify-center items-center shrink-0 z-10">
              <div className="w-full max-w-sm bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg shadow-amber-500/20 transition-transform active:scale-98">
                <span className="font-bold text-sm sm:text-base">
                  {myRank > 0 ? (
                    `Вы на ${myRank} месте со своими ${(stats as any)?.score || 0} очками`
                  ) : (
                    "Сыграйте раунд, чтобы войти в рейтинг!"
                  )}
                </span>
                <Trophy size={20} className="opacity-80 animate-pulse" />
              </div>
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* Visual Block (Ticket or Car) */}
      <div className="flex-1 min-h-0 w-full max-w-4xl flex items-center justify-center my-1 sm:my-2 z-10 relative">
          <motion.div 
            key={digits.join('') + gameMode}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`relative w-full h-full flex items-center justify-center ${gameMode === 'ticket' ? 'max-w-md' : 'max-w-3xl'}`}
          >
            <div className={`origin-center w-full h-full flex items-center justify-center ${gameMode === 'ticket' ? 'scale-[0.8] sm:scale-100' : ''}`}>
              {gameMode === 'ticket' ? renderTicket() : renderLicensePlate()}
            </div>
            
            <AnimatePresence>
              {noSolutionMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                >
                  <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-bold text-center shadow-2xl border-2 border-red-400 max-w-[90%]">
                    <div className="text-lg sm:text-xl mb-2">{t.noSolution}</div>
                    <div className="text-sm sm:text-base opacity-90 flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin-slow" />
                      {gameMode === 'ticket' ? t.skipTicket : t.skipCar}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
      </div>

      <div className="w-full flex flex-col items-center z-10 mt-auto flex-shrink-0">
        {/* Expression Builder */}
        <div className="w-full max-w-5xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/30 dark:border-zinc-800/60 p-1 sm:p-4 md:p-6 rounded-xl sm:rounded-[2rem] shadow-2xl mb-1 sm:mb-2 transition-colors flex flex-col items-center overflow-hidden">
          <div className="flex flex-nowrap justify-center items-center gap-x-[clamp(0.1rem,0.5vw,0.5rem)] text-[clamp(1.5rem,7vw,4rem)] font-mono font-black text-zinc-900 dark:text-white py-1 sm:py-2 w-full">
            <Gap idx={0} value={gaps[0]} selected={selectedSlot === 0} onClick={setSelectedSlot} />
            
            {digits.map((digit, idx) => (
              <React.Fragment key={idx}>
                <span className="text-zinc-800 dark:text-zinc-200 drop-shadow-sm select-none flex-shrink-0 leading-none">{digit}</span>
                <Gap idx={idx + 1} value={gaps[idx + 1]} selected={selectedSlot === idx + 1} onClick={setSelectedSlot} />
              </React.Fragment>
            ))}
          </div>

          <div className="mt-2 sm:mt-3 md:mt-4 flex items-center justify-center text-2xl sm:text-4xl md:text-6xl font-mono font-black">
            <span className="text-zinc-300 dark:text-zinc-600 mr-3 sm:mr-6">=</span>
            <span className={`transition-colors duration-300 ${isWin ? 'text-green-500' : 'text-zinc-900 dark:text-white'}`}>
              {Number.isNaN(currentResult) ? '?' : Number.isInteger(currentResult) ? currentResult : Number(currentResult.toFixed(2))}
            </span>
          </div>
          
          <p className="text-center text-zinc-400 dark:text-zinc-500 text-xs sm:text-sm md:text-base mt-2 md:mt-3 font-bold">{t.tapGaps}</p>
        </div>

        {/* Keypad */}
        <div className="flex gap-1 sm:gap-2 flex-nowrap justify-between sm:justify-center w-full max-w-3xl px-1 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <OperatorButton op="+" icon={<Plus size={20} strokeWidth={3} />} onClick={() => handleOp('+')} />
          <OperatorButton op="-" icon={<Minus size={20} strokeWidth={3} />} onClick={() => handleOp('-')} />
          <OperatorButton op="*" icon={<X size={20} strokeWidth={3} />} onClick={() => handleOp('*')} />
          <OperatorButton op="/" icon={<Divide size={20} strokeWidth={3} />} onClick={() => handleOp('/')} />
          <OperatorButton op="(" icon={<span className="text-xl font-black">(</span>} onClick={() => handleOp('(')} />
          <OperatorButton op=")" icon={<span className="text-xl font-black">)</span>} onClick={() => handleOp(')')} />
          <OperatorButton op="," icon={<span className="text-xl font-black">,</span>} onClick={() => handleOp(',')} />
          <OperatorButton op="Backspace" icon={<Delete size={20} strokeWidth={2.5} />} onClick={() => handleOp('Backspace')} variant="danger" />
        </div>

        {/* Action Buttons */}
        <div className="mt-2 sm:mt-4 w-full max-w-lg grid grid-cols-2 gap-2 sm:gap-3 shrink-0 z-10 pb-12 sm:pb-6">
          <button 
            onClick={showHint}
            disabled={isHinting || won}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all font-bold tracking-wide backdrop-blur-md text-xs sm:text-base ${isHinting || won ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Lightbulb size={16} className={`shrink-0 ${isHinting ? "animate-pulse text-yellow-500" : ""}`} />
            <span className="truncate">{t.hint}</span>
          </button>

          <button 
            onClick={() => initGame(false, true)}
            disabled={isHinting}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 transition-all font-bold tracking-wide backdrop-blur-md text-xs sm:text-base ${isHinting ? 'opacity-50 cursor-not-allowed border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400' : noSolutionMessage ? 'animate-pulse ring-4 ring-red-500/30 border-red-500 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40' : 'border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
          >
            <RefreshCw size={16} className={`shrink-0 ${isHinting ? "animate-spin" : ""}`} />
            <span className="truncate">
              {hintUsed 
                ? (gameMode === 'ticket' ? t.nextTicket : t.nextCar)
                : (gameMode === 'ticket' ? t.skipTicket : t.skipCar)}
            </span>
          </button>
        </div>
      </div>
      </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showBuyHintModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4"
            onClick={() => setShowBuyHintModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-zinc-100 dark:border-zinc-800 relative flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                <Lightbulb size={32} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-center mb-2">{t.outOfHints || 'Подсказки закончились'}</h2>
              <p className="text-center text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                {t.outOfHintsDesc || 'Ваш лимит подсказок исчерпан. Вы можете приобрести 1 подсказку за 20 монет.'}
                <br/><br/>
                {t.balance || 'Баланс:'} <span className="font-bold text-yellow-600 dark:text-yellow-500">{stats.coins} 🪙</span>
              </p>
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (stats.coins >= 20) {
                      setStats(prev => ({ ...prev, coins: prev.coins - 20, hintsCount: prev.hintsCount + 1 }));
                      setShowBuyHintModal(false);
                    }
                  }}
                  disabled={stats.coins < 20}
                  className={`w-full py-3.5 rounded-2xl font-bold transition-all text-sm sm:text-base flex justify-center items-center gap-2 ${stats.coins >= 20 ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md' : 'bg-zinc-200 dark:bg-zinc-800/50 text-zinc-400 cursor-not-allowed'}`}
                >
                  {t.buyForCoins ? t.buyForCoins.replace('{cost}', '20') : 'Купить за 20 🪙'}
                </button>
                <button
                  onClick={() => setShowBuyHintModal(false)}
                  className="w-full py-3.5 rounded-2xl font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-sm sm:text-base"
                >
                  {t.cancel || 'Отмена'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showDemo && <DemoOverlay onComplete={completeDemo} t={t} />}

        {gameState === 'idle' && !won && !showDemo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            style={{
              paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 16px)) + 16px)',
              paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 16px)) + 16px)'
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl text-center max-w-md w-full border border-zinc-100 dark:border-zinc-800 relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
                <Play size={36} className="ml-2" fill="currentColor" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tighter">Make100</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-lg leading-relaxed">{t.introText}</p>
              <button 
                onClick={() => setGameState('playing')}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xl rounded-2xl transition-all shadow-[0_8px_20px_rgba(249,115,22,0.25)] hover:shadow-[0_12px_25px_rgba(249,115,22,0.35)] hover:-translate-y-1"
              >
                {t.start}
              </button>
            </motion.div>
          </motion.div>
        )}

        {won && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            style={{
              paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 16px)) + 16px)',
              paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 16px)) + 16px)'
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl text-center max-w-md w-full border border-zinc-100 dark:border-zinc-800 relative overflow-hidden"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <span className="text-5xl sm:text-6xl">🎉</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black mb-3 tracking-tighter">{t.perfect}</h2>
              {isNewRecord && (
                <motion.div
                  initial={{ scale: 0.85, opacity: 0, y: -8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="mb-4 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5"
                >
                  <span>⚡️ {t.newRecordBanner ? t.newRecordBanner.replace('{time}', (lastRoundTimeMs / 1000).toFixed(2)) : `НОВЫЙ РЕКОРД: ${(lastRoundTimeMs / 1000).toFixed(2)} сек!`}</span>
                </motion.div>
              )}
              <div className="flex flex-col items-center gap-1 mb-8">
                <p className="text-lg text-zinc-500 dark:text-zinc-400">{t.solvedIn} <span className="font-mono font-bold">{formatSolveTime(lastRoundTimeMs || (elapsedTime * 1000))}</span></p>
                <p className="text-lg text-zinc-500 dark:text-zinc-400">{t.operatorsUsed} <span className="font-mono font-bold">{gaps.join('').replace(/[0-9.]/g, '').length}</span></p>
                
                <div className="text-center py-2 mt-2">
                  <span className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-500 text-sm font-black animate-bounce">
                    🏆 +{lastEarnedScore} очков рейтинга!
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => initGame(false)}
                  className="w-full py-4 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-black text-xl rounded-2xl transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_20px_rgba(255,255,255,0.15)] hover:-translate-y-1"
                >
                  {gameMode === 'ticket' ? t.nextTicket : t.nextCar}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal (Full-Screen Overlay) */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white h-screen w-screen overflow-y-auto animate-fade-in select-none">
          
          {/* Нативная верхняя панель Профиля */}
          <div 
            className="sticky top-0 z-10 w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-900/80 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md"
            style={{
              paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 12px)'
            }}
          >
            {/* Кнопка назад */}
            <button 
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300/40 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition-transform cursor-pointer"
            >
              ⬅️ {t.back || 'Назад'}
            </button>
            <h1 className="text-base font-black tracking-wider uppercase text-orange-500">
              {t.playerProfile || 'Профиль игрока'}
            </h1>
            <div className="w-16"></div> {/* Заглушка для центровки заголовка */}
          </div>

          {/* Основное содержимое профиля */}
          <div 
            className="flex-1 w-full max-w-md mx-auto px-4 pb-12 pt-6 overflow-y-auto space-y-6"
            style={{
              paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 36px)'
            }}
          >
            
            {/* Карточка пользователя */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-500 shadow-xl shadow-orange-500/20 mb-3">
                {((stats as any)?.avatarUrl || tgUser?.photo_url) ? (
                  <img src={(stats as any)?.avatarUrl || tgUser?.photo_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white font-black text-3xl">
                    {String((stats as any)?.firstName || tgUser?.first_name || 'U').toUpperCase().charAt(0)}
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {(stats as any)?.firstName || tgUser?.first_name || t.player} {(stats as any)?.lastName || tgUser?.last_name || ''}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                @{ (stats as any)?.username || tgUser?.username || 'user' }
              </p>
            </div>

            {/* Блок уровней и прогресса */}
            <div className="mt-6 p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-900/80 space-y-3">
              
              {/* Номер уровня и текстовый счетчик */}
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                    {t.playerRank || 'Ранг игрока'}
                  </span>
                  <span className="text-xl font-black text-orange-500 dark:text-orange-400">
                    {t.level} {levelInfo.level}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {t.solvedPuzzles || 'Решено примеров:'}
                  </span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {(stats as any)?.solvedCount ?? solvedCount} <span className="text-slate-400 font-normal">/ {levelInfo.nextMilestone}</span>
                  </p>
                </div>
              </div>

              {/* Шкала прогресса (Прогресс-бар) */}
              <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${levelInfo.progress}%` }}
                ></div>
              </div>

              {/* Мотивирующая подсказка до следующего уровня */}
              {levelInfo.level < 11 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                  {t.solveMorePrefix || 'Реши ещё'} <span className="font-bold text-slate-600 dark:text-slate-300">{levelInfo.nextMilestone - ((stats as any)?.solvedCount ?? solvedCount)}</span> {t.solveMoreSuffix || 'примеров до Уровня'} {levelInfo.level + 1}!
                </p>
              ) : (
                <p className="text-xs text-emerald-500 font-bold text-center animate-pulse">
                  {t.maxLevelReached || '👑 Достигнут максимальный уровень! Вы легенда математики!'}
                </p>
              )}
            </div>

            {/* Блок «Личные рекорды» */}
            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
                🏆 {t.personalRecords || 'Личные рекорды'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Рекорд скорости */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-900/80">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">
                    {t.lightningSpeed || 'Молния (Время)'}
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">
                    ⏱️ {formatBestTime((stats as any)?.bestTimeMs ?? bestTimeMs, t)}
                  </span>
                </div>

                {/* Рекорд минимальных символов */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-900/80">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">
                    {t.brevityChars || 'Краткость (Символы)'}
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">
                    ✍️ {((stats as any)?.minCharacters ?? minCharacters) ? `${(stats as any)?.minCharacters ?? minCharacters} ${t.charsShort || 'симв.'}` : (t.noRecord || 'Нет рекорда')}
                  </span>
                </div>
              </div>
            </div>

            {/* Блок «Общая статистика» */}
            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
                📊 {t.gameAnalytics || 'Игровая аналитика'}
              </h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-900/80 space-y-3">
                
                {/* Количество сессий */}
                <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/40 dark:border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🎮</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {t.sessionsPlayed || 'Сыграно сессий'}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-white">
                    {stats?.gamesStarted !== undefined ? stats.gamesStarted : 0}
                  </span>
                </div>

                {/* Решено / Пропущено */}
                <div className="flex justify-between items-center text-sm border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">{t.solvedSkipped || 'Решено / Пропущено:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ✅ {(stats as any)?.solvedCount ?? solvedCount} <span className="text-slate-300 dark:text-slate-700 mx-1">|</span> ❌ {(stats as any)?.skippedCount ?? (stats as any)?.unsolvedCount ?? unsolvedCount ?? 0}
                  </span>
                </div>

                {/* Всего времени в игре */}
                <div className="flex justify-between items-center text-sm border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">{t.thinkingTime || 'Время размышлений:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatTotalPlayTime((stats as any)?.totalTimeMs ?? totalSolveTime, t)}
                  </span>
                </div>

                {/* Дата регистрации */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t.firstGameDate || 'Дата первой игры:'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    📅 {formatRegistrationDate((stats as any)?.createdAt, language, t)}
                  </span>
                </div>

              </div>
            </div>

            {/* Блок «Реферальная программа» */}
            <div className="mt-5">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
                👥 {t.inviteFriend || 'Пригласи друга'}
              </h3>
              <div className="p-4 bg-gradient-to-br from-slate-50 to-orange-50/20 dark:from-slate-900/40 dark:to-orange-950/10 rounded-2xl border border-orange-100 dark:border-orange-900/30 space-y-4">
                
                {/* Статистика рефералов */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t.friendsInvited || 'Приглашено друзей:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {(stats as any)?.referralCount || 0} {t.peopleShort || 'чел.'}
                  </span>
                </div>

                {/* Заработанный бонус */}
                <div className="flex justify-between items-center text-sm border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                  <span className="text-slate-500 dark:text-slate-400">{t.bonusesEarned || 'Получено бонусов:'}</span>
                  <span className="font-extrabold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                    🪙 +{((stats as any)?.referralCount || 0) * 500} {t.coinsCount || 'монет'}
                  </span>
                </div>

                {/* Описание выгоды */}
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                  {t.referralPromoP1 || 'Позови друга в игру! Ты получишь'} <span className="font-bold text-orange-500">500 {t.coinsCount || 'монет'}</span>{t.referralPromoP2 || ', а друг —'} <span className="font-bold text-orange-500">250 {t.coinsCount || 'монет'}</span> {t.referralPromoP3 || 'приветственного бонуса!'}
                </p>

                {/* Большая интерактивная кнопка приглашения */}
                <button
                  onClick={handleInviteFriend}
                  className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 text-white font-black text-sm rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🚀</span> {t.inviteFriendBtn || 'Пригласить друга'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function Gap({ idx, value, selected, onClick }: { idx: number, value: string, selected: boolean, onClick: (idx: number) => void }) {
  const charCount = value.length;
  // Calculate dynamic width based on character count.
  // Base width is for 0-1 chars. Add extra width for each additional char.
  const baseWidthRem = 1.25;
  const baseWidthVw = 7;
  const baseWidthMaxRem = 3.5;
  
  const extraWidthPerCharRem = 0.8;
  const extraWidthPerCharVw = 2;
  const extraWidthPerCharMaxRem = 1.5;

  const extraChars = Math.max(0, charCount - 1);
  
  const dynamicWidth = `clamp(${baseWidthRem + (extraChars * extraWidthPerCharRem)}rem, ${baseWidthVw + (extraChars * extraWidthPerCharVw)}vw, ${baseWidthMaxRem + (extraChars * extraWidthPerCharMaxRem)}rem)`;

  return (
    <button
      onClick={() => onClick(idx)}
      style={{ width: dynamicWidth }}
      className={`h-[clamp(1.75rem,9vw,4.5rem)] rounded-lg sm:rounded-xl border-2 flex items-center justify-center transition-all duration-200 outline-none font-bold flex-shrink-0 ${
        selected
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-[0_0_0_4px_rgba(249,115,22,0.15)] scale-110 z-20'
          : value
            ? 'border-zinc-800 dark:border-zinc-200 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 shadow-sm z-10'
            : 'border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900 z-10'
      }`}
    >
      {value ? (
        <span className="text-[clamp(1rem,5vw,2.5rem)] whitespace-nowrap px-1">{value}</span>
      ) : (
        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
      )}
    </button>
  );
}

function OperatorButton({ icon, onClick, variant = 'default' }: { op: string, icon: React.ReactNode, onClick: () => void, variant?: 'default' | 'danger' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center flex-1 min-w-[2rem] sm:min-w-[2.5rem] max-w-[3rem] sm:max-w-[3.5rem] md:max-w-[4rem] h-10 sm:h-12 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl font-bold transition-all active:scale-95 border-2 flex-shrink-0 ${
        variant === 'danger'
          ? 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 hover:border-red-200 dark:hover:border-red-500/40 shadow-sm'
          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 shadow-sm'
      }`}
    >
      {icon}
    </button>
  );
}
