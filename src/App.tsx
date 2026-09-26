import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Minus, X, Divide, RefreshCw, Delete, Play, Moon, Sun, User, Menu, Volume2, VolumeX, Vibrate, VibrateOff, Lightbulb, Trophy, Smartphone, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ModeDetail, saveUserStats, fetchLeaderboard as fetchLeaderboardApi, API_URL, getAuthHeader, submitGameSolve, submitGameSkip, buyHint, consumeHint } from './api';
import { TRANSLATIONS, LANGUAGES, Language, TranslationData } from './translations';
import { useImagePreloader } from './hooks/useImagePreloader';
import { LicensePlate } from './components/LicensePlate';
import { TicketCard } from './components/TicketCard';
import { UserProfile } from "./components/UserProfile";
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { Stopwatch } from './components/Stopwatch';

// Removed GITHUB_FOLDER_URL and FALLBACK_IMAGES

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
    start_param?: string;
  };
  version?: string;
  isVersionAtLeast?: (version: string) => boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
  requestFullscreen?: () => void;
  exitFullscreen?: () => void;
  disableVerticalSwipes?: () => void;
  enableVerticalSwipes?: () => void;
  isFullscreen?: boolean;
  isVerticalSwipesEnabled?: boolean;
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

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
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

/**
 * Умная защитная клавиатура (Smart Button Guard):
 * Подсчет незакрытых открывающих скобок '(' в выражении до указанного слота
 */
function getUnclosedParenCount(gaps: string[], upToSlotIdx: number): number {
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
function getTotalParenBalance(gaps: string[]): { totalOpen: number; totalClosed: number } {
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
function isOpAllowed(
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

function TelegramLoadingOverlay({ t }: { t: TranslationData }) {
  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center max-w-xs text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center mb-4">
          <RefreshCw size={28} className="animate-spin text-orange-500" />
        </div>
        <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">Make 100</h2>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {t.authorizingTg || 'Авторизация в Telegram...'}
        </p>
      </div>
    </div>
  );
}

const getPlayerDisplayName = (player: { username?: string; firstName?: string }, t?: any) => {
  if (player.username && player.username.trim() !== '') {
    return `@${player.username}`;
  }
  return player.firstName || (t?.player || 'Игрок');
};

// Безопасная инициализация Telegram WebApp с проверкой версии Bot API
const safeInitTelegramWebApp = (tg?: TelegramWebApp | null) => {
  if (!tg) return;

  try {
    if (typeof tg.ready === 'function') {
      tg.ready();
    }
  } catch (e) {
    console.warn('tg.ready error:', e);
  }

  try {
    if (typeof tg.expand === 'function') {
      tg.expand();
    }
  } catch (e) {
    console.warn('tg.expand error:', e);
  }

  // Полноэкранный режим отключен: при необходимости безопасно выходим из него
  try {
    if (tg.isFullscreen && typeof tg.exitFullscreen === 'function') {
      tg.exitFullscreen();
    }
  } catch (e) {
    // Игнорируем ошибки неподдерживаемых методов
  }

  // disableVerticalSwipes поддерживается начиная с Telegram Bot API 7.7
  try {
    const isAtLeast77 = typeof tg.isVersionAtLeast === 'function' ? tg.isVersionAtLeast('7.7') : false;
    if (isAtLeast77 && typeof tg.disableVerticalSwipes === 'function') {
      tg.disableVerticalSwipes();
    }
  } catch (e) {
    // Метод не поддерживается текущей версией Telegram WebApp
  }
};

function detectInitialLanguage(): Language {
  // 1. Проверяем язык, сохраненный пользователем вручную
  try {
    const hasChosen = typeof window !== 'undefined' ? localStorage.getItem('make100_user_chose_lang') : null;
    const saved = typeof window !== 'undefined' ? localStorage.getItem('make100_language') : null;
    if (hasChosen && saved && saved in TRANSLATIONS) {
      return saved as Language;
    }
  } catch (e) {}

  // 2. Определение языка из Telegram WebApp (с нормализацией кодов вроде ru-RU, ru_RU -> ru)
  try {
    const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
    const rawTg = tg?.initDataUnsafe?.user?.language_code;
    if (rawTg) {
      const code = rawTg.toLowerCase().split(/[-_]/)[0];
      if (code in TRANSLATIONS) {
        return code as Language;
      }
    }
  } catch (e) {}

  // 3. Системный язык браузера / устройства
  try {
    if (typeof navigator !== 'undefined') {
      const navLangs = navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language || (navigator as any).userLanguage || ''];
      for (const rawNav of navLangs) {
        if (rawNav) {
          const code = rawNav.toLowerCase().split(/[-_]/)[0];
          if (code in TRANSLATIONS) {
            return code as Language;
          }
        }
      }
    }
  } catch (e) {}

  // 4. По умолчанию для нашей игры — русский язык ('ru')!
  return 'ru';
}

const preloadedImageUrlsSet = new Set<string>();

const preloadImagePool = (urls: string[]) => {
  if (!urls || urls.length === 0) return;
  const toLoad = urls.filter(u => u && !preloadedImageUrlsSet.has(u));
  if (toLoad.length === 0) return;
  
  let index = 0;
  const loadNext = () => {
    if (index >= toLoad.length) return;
    const url = toLoad[index++];
    preloadedImageUrlsSet.add(url);
    const img = new Image();
    img.onload = () => setTimeout(loadNext, 50);
    img.onerror = () => setTimeout(loadNext, 50);
    img.src = url;
  };
  loadNext();
  loadNext();
};

export default function App() {
  // Первоначальная инициализация Telegram Mini App при монтировании компонента (до отрисовки игры)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;

        // 1. Уведомляем клиент Telegram о готовности приложения
        if (typeof webApp.ready === 'function') {
          webApp.ready();
        }

        // 2. Раскрываем WebView на 100% высоты viewport
        if (typeof webApp.expand === 'function') {
          webApp.expand();
        }

        // 3. Если приложение случайно открылось в fullscreen, безопасно выходим из него
        if (webApp.isFullscreen && typeof webApp.exitFullscreen === 'function') {
          try {
            webApp.exitFullscreen();
          } catch (e) {
            // Игнорируем ошибки неподдерживаемых методов
          }
        }

        // 4. Отключение вертикальных свайпов для предотвращения случайного закрытия шторки
        if (typeof webApp.disableVerticalSwipes === 'function') {
          try {
            webApp.disableVerticalSwipes();
          } catch (e) {
            // Игнорируем ошибки неподдерживаемых методов
          }
        }
      }
    } catch (e) {
      console.warn('Ошибка инициализации Telegram WebApp при запуске:', e);
    }
  }, []);

  const isStatsLoadedRef = useRef(false);
  const lastRoundExpressionRef = useRef<string>('');
  const lastRoundSolveTimeMsRef = useRef<number>(0);
  const [lastEarnedScore, setLastEarnedScore] = useState<number>(0);
  const [lastEarnedCoins, setLastEarnedCoins] = useState<number>(0);
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
  const [carImageLoaded, setCarImageLoaded] = useState<boolean>(false);
  const carImagesListRef = useRef<string[]>([]);
  const ticketImagesListRef = useRef<any[]>([]);
  const nextTicketRef = useRef<{ item: any; img: HTMLImageElement } | null>(null);
  const nextCarRef = useRef<{ url: string; img: HTMLImageElement } | null>(null);
  const [recentCarUrls, setRecentCarUrls] = useState<string[]>([]);
  const [recentTicketUrls, setRecentTicketUrls] = useState<string[]>([]);

  const getSmartRandomItem = (pool: any[], recentUrls: string[], bufferSize: number = 6) => {
    if (!pool || pool.length === 0) return { item: null, updatedUrls: recentUrls };
    
    // Filter out recently shown URLs
    let available = pool.filter(item => !recentUrls.includes(item.url || item.imageUrl || item));
    
    // Fallback if the pool is smaller than the buffer size
    if (available.length === 0) {
      available = pool;
    }
    
    const randomIndex = Math.floor(Math.random() * available.length);
    const chosenItem = available[randomIndex];
    const chosenUrl = chosenItem.url || chosenItem.imageUrl || chosenItem;
    
    // Update history: add to front, slice to keep max buffer size
    const updatedUrls = [chosenUrl, ...recentUrls.filter(url => url !== chosenUrl)].slice(0, bufferSize);
    
    return { item: chosenItem, updatedUrls };
  };

  const prepareNextTicket = useCallback(() => {
    if (!ticketImagesListRef.current || ticketImagesListRef.current.length === 0) return;
    const { item: nextTicket } = getSmartRandomItem(ticketImagesListRef.current, recentTicketUrls, 6);
    if (nextTicket) {
      const url = nextTicket.imageUrl || nextTicket.url;
      if (url) {
        const img = new Image();
        img.src = url;
        nextTicketRef.current = { item: nextTicket, img };
      }
    }
  }, [recentTicketUrls]);

  const prepareNextCar = useCallback(() => {
    if (!carImagesListRef.current || carImagesListRef.current.length === 0) return;
    const { item: nextUrl } = getSmartRandomItem(carImagesListRef.current, recentCarUrls, 6);
    if (nextUrl) {
      const img = new Image();
      img.src = nextUrl;
      nextCarRef.current = { url: nextUrl, img };
    }
  }, [recentCarUrls]);

  const [ticketBg, setTicketBg] = useState<{
    imageUrl: string;
    category: string;
    categoryName: string;
  } | null>(null);

  const fetchRandomTicket = useCallback(async () => {
    setIsVisualReady(false);
    
    // 1. Проверяем, есть ли уже упреждающе загруженный билет в памяти
    if (nextTicketRef.current && nextTicketRef.current.item) {
      const prepared = nextTicketRef.current;
      nextTicketRef.current = null;
      const chosenTicket = prepared.item;
      const chosenUrl = chosenTicket.imageUrl || chosenTicket.url;
      
      setRecentTicketUrls(prev => [chosenUrl, ...prev.filter(u => u !== chosenUrl)].slice(0, 6));
      
      let isDone = false;
      const handleDone = () => {
        if (isDone) return;
        isDone = true;
        setTicketBg({
          imageUrl: chosenUrl,
          category: chosenTicket.category || 'default',
          categoryName: chosenTicket.categoryName || ''
        });
        setIsVisualReady(true);
      };

      if (prepared.img.complete) {
        handleDone();
      } else {
        prepared.img.onload = handleDone;
        prepared.img.onerror = handleDone;
        setTimeout(handleDone, 5000);
      }
      return;
    }

    // 2. Если упреждающего нет в очереди, выбираем из локального пула
    if (ticketImagesListRef.current && ticketImagesListRef.current.length > 0) {
      setRecentTicketUrls(prev => {
        const { item: chosenTicket, updatedUrls } = getSmartRandomItem(ticketImagesListRef.current, prev, 6);
        if (chosenTicket) {
          const chosenUrl = chosenTicket.imageUrl || chosenTicket.url;
          const img = new Image();
          let isDone = false;
          const handleDone = () => {
            if (isDone) return;
            isDone = true;
            setTicketBg({
              imageUrl: chosenUrl,
              category: chosenTicket.category || 'default',
              categoryName: chosenTicket.categoryName || ''
            });
            setIsVisualReady(true);
          };
          img.onload = handleDone;
          img.onerror = handleDone;
          setTimeout(handleDone, 5000);
          img.src = chosenUrl;
          if (img.complete) {
            handleDone();
          }
        } else {
          setIsVisualReady(true);
        }
        return updatedUrls;
      });
      return;
    }

    // 3. Fallback, если пул пуст
    try {
      const response = await fetch(`${API_URL}/api/tickets/random`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.ticket) {
          const chosenUrl = data.ticket.imageUrl || data.ticket.url;
          setRecentTicketUrls(prev => {
            const updatedUrls = [chosenUrl, ...prev.filter(u => u !== chosenUrl)].slice(0, 6);
            return updatedUrls;
          });
          const img = new Image();
          let isDone = false;
          const handleDone = () => {
            if (isDone) return;
            isDone = true;
            setTicketBg({
              imageUrl: chosenUrl,
              category: data.ticket.category || 'default',
              categoryName: data.ticket.categoryName || ''
            });
            setIsVisualReady(true);
          };
          img.onload = handleDone;
          img.onerror = handleDone;
          setTimeout(handleDone, 5000);
          img.src = chosenUrl;
          if (img.complete) {
            handleDone();
          }
        } else {
          setIsVisualReady(true);
        }
      } else {
        setIsVisualReady(true);
      }
    } catch (e) {
      console.warn('Failed to fetch random ticket:', e);
      setIsVisualReady(true);
    }
  }, []);

  const [gaps, setGaps] = useState<string[]>(['', '', '', '', '', '', '']);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(1);
  const [won, setWon] = useState(false);
  const [isHinting, setIsHinting] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isVisualReady, setIsVisualReady] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [noSolutionMessage, setNoSolutionMessage] = useState(false);

  const elapsedTimeRef = useRef<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [stopwatchResetKey, setStopwatchResetKey] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [lastRoundTimeMs, setLastRoundTimeMs] = useState<number>(0);
  const roundStartTimeRef = useRef<number>(Date.now());

  const handleStopwatchTick = useCallback((elapsedMs: number) => {
    elapsedTimeRef.current = elapsedMs / 1000;
  }, []);

  const startTimer = useCallback(() => {
    roundStartTimeRef.current = Date.now();
    setStopwatchResetKey(prev => prev + 1);
    setIsTimerRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

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
  
  const [gameMode, setGameMode] = useState<'ticket' | 'car'>(() => {
    return (typeof window !== 'undefined' ? (localStorage.getItem('make100_game_mode') as 'ticket' | 'car') : null) || 'ticket';
  });
  
  // Предзагрузка изображений машин
  useImagePreloader(carImagesListRef.current);

  const [themePreference, setThemePreference] = useState<'auto' | 'dark' | 'light'>(() => {
    return (typeof window !== 'undefined' ? (localStorage.getItem('make100_theme_preference') as 'auto' | 'dark' | 'light') : null) || 'auto';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
    if (tg?.colorScheme) return tg.colorScheme;
    const systemPrefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });
  const [language, setLanguage] = useState<Language>(detectInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem('make100_language', language);
    } catch (e) {}
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem('make100_game_mode', gameMode);
    } catch (e) {}
  }, [gameMode]);

  useEffect(() => {
    try {
      localStorage.setItem('make100_theme_preference', themePreference);
    } catch (e) {}
  }, [themePreference]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [showBuyHintModal, setShowBuyHintModal] = useState(false);
  const [showSaveBotModal, setShowSaveBotModal] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<number>(0);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('make100_sound_enabled') !== 'false' : true;
  });
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('make100_vibration_enabled') !== 'false' : true;
  });
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('make100_sound_enabled', String(soundEnabled));
    } catch (e) {}
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('make100_vibration_enabled', String(vibrationEnabled));
    } catch (e) {}
  }, [vibrationEnabled]);
  
  useEffect(() => {
    if (tgUser && tgUser.id && tgUser.id !== 9999 && tgUser.id !== 1) {
      try {
        localStorage.setItem('make100_tgUser', JSON.stringify(tgUser));
      } catch (e) {
        console.error("Failed to save tgUser to localStorage:", e);
      }
    }
  }, [tgUser]);

  useEffect(() => {
    if (typeof window !== 'undefined' && tgUser && tgUser.id && tgUser.id !== 9999 && tgUser.id !== 1) {
      try {
        const isDismissed = localStorage.getItem('make100_save_bot_dismissed');
        if (!isDismissed) {
          const timer = setTimeout(() => {
            setShowSaveBotModal(true);
          }, 2000);
          return () => clearTimeout(timer);
        }
      } catch (e) {}
    }
  }, [tgUser]);
  
  const t: any = TRANSLATIONS[language];

  // Load cached images from localStorage immediately on mount to prevent any delay or rate limit issues
  useEffect(() => {
    try {
      const cached = localStorage.getItem('make100_kv_images');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          carImagesListRef.current = parsed;
          setRecentCarUrls(prev => {
            const { item: newUrl, updatedUrls } = getSmartRandomItem(parsed, prev, 6);
            if (newUrl) {
              const img = new Image();
              img.onload = () => setCarImage(newUrl);
              img.src = newUrl;
            }
            return updatedUrls;
          });
          preloadImagePool(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached KV images:', e);
    }
    
    try {
      const cachedTickets = localStorage.getItem('make100_kv_ticket_images');
      if (cachedTickets) {
        const parsed = JSON.parse(cachedTickets);
        if (Array.isArray(parsed) && parsed.length > 0) {
          ticketImagesListRef.current = parsed;
          const initialTicket = parsed[Math.floor(Math.random() * parsed.length)];
          if (initialTicket) {
            setTicketBg(prev => prev || {
              imageUrl: initialTicket.imageUrl || initialTicket.url,
              category: initialTicket.category || 'default',
              categoryName: initialTicket.categoryName || ''
            });
          }
          const ticketUrls = parsed.map((t: any) => t.imageUrl || t.url).filter(Boolean);
          preloadImagePool(ticketUrls);
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached KV ticket images:', e);
    }
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      // 1. Пул картинок автомобилей
      try {
        const response = await fetch(`${API_URL}/api/cars/pool`);
        if (response.ok) {
          const data = await response.json();
          const images = Array.isArray(data) ? data : (data.cars || data.pool || []);
          
          const imageUrls = images.map((item: any) => typeof item === 'string' ? item : (item.imageUrl || item.url || item.dataUrl || ''));
          const validUrls = imageUrls.filter(Boolean);
          
          if (validUrls.length > 0) {
            carImagesListRef.current = validUrls;
            if (!carImage) {
              const newUrl = validUrls[Math.floor(Math.random() * validUrls.length)];
              const img = new Image();
              img.onload = () => setCarImage(newUrl);
              img.src = newUrl;
            }
            try {
              localStorage.setItem('make100_kv_images', JSON.stringify(validUrls));
            } catch (e) {
              console.warn('Failed to cache KV images:', e);
            }
            preloadImagePool(validUrls);
          }
        }
      } catch (err) {
        console.warn('Ошибка при получении картинок с бэкенда:', err);
      }

      // 2. Пул фонов билетов
      try {
        const response = await fetch(`${API_URL}/api/tickets/pool`);
        if (response.ok) {
          const data = await response.json();
          const tickets = Array.isArray(data) ? data : (data.tickets || data.pool || []);
          if (tickets && tickets.length > 0) {
            const formattedTickets = tickets.map((t: any) => ({
              id: t.id,
              category: t.category || 'default',
              categoryName: t.categoryName || '',
              imageUrl: t.imageUrl || t.url || ''
            })).filter((t: any) => Boolean(t.imageUrl));

            if (formattedTickets.length > 0) {
              ticketImagesListRef.current = formattedTickets;
              try {
                localStorage.setItem('make100_kv_ticket_images', JSON.stringify(formattedTickets));
              } catch (e) {
                console.warn('Failed to cache KV ticket images:', e);
              }
              setTicketBg(prev => {
                if (prev && prev.imageUrl) return prev;
                const initialTicket = formattedTickets[Math.floor(Math.random() * formattedTickets.length)];
                return {
                  imageUrl: initialTicket.imageUrl,
                  category: initialTicket.category,
                  categoryName: initialTicket.categoryName
                };
              });
              const ticketUrls = formattedTickets.map((t: any) => t.imageUrl);
              preloadImagePool(ticketUrls);
            }
          }
        }
      } catch (err) {
        console.warn('Ошибка при получении пула билетов с бэкенда:', err);
      }
    };
    
    fetchImages();
  }, [carImage]);

  useEffect(() => {
    if (isVisualReady) {
      prepareNextTicket();
      prepareNextCar();
    }
  }, [isVisualReady, prepareNextTicket, prepareNextCar]);

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

  // Interactive Tutorial State
  // По требованию: запускается один раз у ВСЕХ игроков (так как новый ключ отсутствует),
  // а после прохождения/пропуска сохраняется в localStorage и больше не навязывается.
  const [showTutorial, setShowTutorial] = useState(() => {
    try {
      return localStorage.getItem('make100_tutorial_completed_v2') !== 'true';
    } catch (e) {
      return false;
    }
  });

  const completeTutorial = () => {
    setShowTutorial(false);
    try {
      localStorage.setItem('make100_tutorial_completed_v2', 'true');
    } catch (e) {}
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

  const isGameInitializedRef = useRef(false);

  useEffect(() => {
    // Если статистика загружена и мы ЕЩЕ НЕ инициализировали игру
    if (statsLoaded && stats && !isGameInitializedRef.current) {
      isGameInitializedRef.current = true;
    }
  }, [stats, statsLoaded]);


  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Auth is handled by telegram token logic below.
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
      const data = await fetchLeaderboardApi(activeUserId);
      console.log("📥 Успешно загружен лидерборд:", data);
      setLeaderboardData(data.leaderboard || []);
      setMyRank(data.myRank !== undefined ? data.myRank : 0);
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
      safeInitTelegramWebApp(tg);
    }

    const loadStats = async () => {
      let referrerId: number | undefined = undefined;

      // 1. Из нативного Telegram WebApp start_param
      if (tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param) {
        const parsedId = parseInt(tg.initDataUnsafe.start_param, 10);
        if (!isNaN(parsedId)) {
          referrerId = parsedId;
        }
      }

      // 2. Резервный поиск в URL-параметрах окна (search и hash)
      if (!referrerId && typeof window !== 'undefined' && window.location) {
        try {
          const searchParams = new URLSearchParams(window.location.search);
          const hashString = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
          const hashParams = new URLSearchParams(hashString);
          const rawParam = searchParams.get('tgWebAppStartParam') || searchParams.get('startapp') || searchParams.get('start_param') || searchParams.get('ref') || searchParams.get('start')
            || hashParams.get('tgWebAppStartParam') || hashParams.get('startapp') || hashParams.get('start_param') || hashParams.get('ref') || hashParams.get('start');
          if (rawParam) {
            const parsedId = parseInt(rawParam, 10);
            if (!isNaN(parsedId)) {
              referrerId = parsedId;
            }
          }
        } catch (e) {}
      }

      const applyStatsToState = (data: any) => {
        setSolvedCount(data.solvedCount || 0);
        setUnsolvedCount(data.skippedCount || data.unsolvedCount || 0);
        setTotalSolveTime(data.totalTimeMs || data.totalSolveTime || 0);
        setTotalOperatorsUsed(data.totalCharacters || data.totalOperatorsUsed || 0);
        setBestTimeMs(data.bestTimeMs ?? null);
        setMinCharacters(data.minCharacters ?? null);
        if (localStorage.getItem('make100_theme_preference') === null && data.settings?.themePreference && (data.settings.themePreference === 'auto' || data.settings.themePreference === 'dark' || data.settings.themePreference === 'light')) {
          setThemePreference(data.settings.themePreference);
        }
        if (data.settings?.language && data.settings.language in TRANSLATIONS) {
          setLanguage(data.settings.language);
          localStorage.setItem('make100_language', data.settings.language);
          localStorage.setItem('make100_user_chose_lang', 'true');
        }
        if (localStorage.getItem('make100_game_mode') === null) {
          const savedMode = data.settings?.gameMode || (data.settings?.currentMode === 'tickets' ? 'ticket' : data.settings?.currentMode);
          if (savedMode === 'ticket' || savedMode === 'car') {
            setGameMode(savedMode);
          }
        }
        if (localStorage.getItem('make100_sound_enabled') === null && data.settings?.soundEnabled !== undefined && data.settings?.soundEnabled !== null) {
          setSoundEnabled(Boolean(data.settings.soundEnabled));
        }
        if (localStorage.getItem('make100_vibration_enabled') === null && data.settings?.vibrationEnabled !== undefined && data.settings?.vibrationEnabled !== null) {
          setVibrationEnabled(Boolean(data.settings.vibrationEnabled));
        }
        if (data.settings?.hasSeenOnboarding !== undefined && data.settings.hasSeenOnboarding !== null) {
          setHasSeenOnboarding(Boolean(data.settings.hasSeenOnboarding));
        }
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
          const userFetchUrl = referrerId ? `${API_URL}/api/user?referredBy=${referrerId}` : `${API_URL}/api/user`;
          const res = await fetch(userFetchUrl, { headers: getAuthHeader() });
          
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
        settings: {
          themePreference,
          language,
          gameMode,
          currentMode: gameMode === 'ticket' ? 'tickets' : 'car',
          soundEnabled,
          vibrationEnabled,
          hasSeenOnboarding
        }
      });
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


  const handleInviteFriend = () => {
    const userId = tgUser?.id || (stats as any)?.id;
    if (!userId) return;
    
    // Наша рабочая реферальная ссылка на бота
    const botUsername = (import.meta.env.VITE_NAME_BOT || 'Test_Make100_bot').replace(/\s+/g, '');
    const referralLink = `https://t.me/${botUsername}?start=${userId}`;
    
    // Красивый пригласительный текст для друзей
    const shareText = t.inviteShareText || `Привет! Прокачай логику в игре Make 100! 🧩🎯 Заходи по моей ссылке и получи 250 монет бонуса на старт!`;
    
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
    if (isHinting || won || !isVisualReady) return;
    
    const currentStats = statsRef.current;
    
    if (currentStats.hintsCount > 0) {
      setStats((prev: any) => {
        const newStats = { ...prev, hintsCount: prev.hintsCount - 1 };
        return newStats;
      });
      if (tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999) {
        consumeHint().then(res => {
          if (res && res.success && res.hintsCount !== undefined) {
            setStats((prev: any) => ({ ...prev, hintsCount: res.hintsCount! }));
          }
        }).catch(err => console.error("useHint error", err));
      }
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

  const handleSkip = async () => {
    if (isHinting || isPending || !isVisualReady) return;
    setIsPending(true);
    
    // Send API request
    try {
      const res = await submitGameSkip({ gameMode });
      if (res && res.success) {
        setStats((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            score: res.score !== undefined ? res.score : prev.score,
            coins: res.coins !== undefined ? res.coins : prev.coins,
            solvedCount: res.solvedCount !== undefined ? res.solvedCount : prev.solvedCount,
            modeStats: res.modeStats !== undefined ? res.modeStats : prev.modeStats
          };
        });
        if (res.solvedCount !== undefined) setSolvedCount(res.solvedCount);
        if (res.skippedCount !== undefined) setUnsolvedCount(res.skippedCount);
        if (res.totalTimeMs !== undefined) setTotalSolveTime(res.totalTimeMs);
        if (res.totalCharacters !== undefined) setTotalOperatorsUsed(res.totalCharacters);
      }
    } catch(e) {
      console.error(e);
    }
    
    // trigger next round
    initGame(false, true);
    setIsPending(false);
  };

  const initGame = useCallback((startAsIdle = false, isSkip = false) => {
    setIsVisualReady(false);
    setNoSolutionMessage(false);
    if (isSkip) {
      
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

    setIsVisualReady(false);
    // Set random car image
    if (gameMode === 'ticket') {
      fetchRandomTicket();
    } else {
      if (nextCarRef.current && nextCarRef.current.url) {
        const prepared = nextCarRef.current;
        nextCarRef.current = null;
        const newUrl = prepared.url;
        setRecentCarUrls(prev => [newUrl, ...prev.filter(u => u !== newUrl)].slice(0, 6));

        let isDone = false;
        const handleDone = () => {
          if (isDone) return;
          isDone = true;
          setCarImage(newUrl);
          setIsVisualReady(true);
        };

        if (prepared.img.complete) {
          handleDone();
        } else {
          prepared.img.onload = handleDone;
          prepared.img.onerror = handleDone;
          setTimeout(handleDone, 5000);
        }
      } else if (carImagesListRef.current.length > 0) {
        setRecentCarUrls(prev => {
          const { item: newUrl, updatedUrls } = getSmartRandomItem(carImagesListRef.current, prev, 6);
          if (newUrl) {
            const img = new Image();
            let isDone = false;
            const handleDone = () => {
              if (isDone) return;
              isDone = true;
              setCarImage(newUrl);
              setIsVisualReady(true);
            };
            img.onload = handleDone;
            img.onerror = handleDone;
            setTimeout(handleDone, 5000);
            img.src = newUrl;
            if (img.complete) {
              handleDone();
            }
          } else {
            setIsVisualReady(true);
          }
          return updatedUrls;
        });
      } else {
        setIsVisualReady(true);
      }
    }

    setGaps(['', '', '', '', '', '', '']);
    setSelectedSlot(1);
    setWon(false);
    setHintUsed(false);
    
    elapsedTimeRef.current = 0;
    setStopwatchResetKey(prev => prev + 1);
    setIsNewRecord(false);
    setLastRoundTimeMs(0);
    setGameState(startAsIdle === true ? 'idle' : 'playing');
    stopTimer();
  }, [playSound, playVibration, language, stopTimer, gameMode, fetchRandomTicket]);

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
          safeInitTelegramWebApp(tg);
          
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
              // Если язык еще не был выбран пользователем вручную, применяем язык из Telegram
              if (userToSet.language_code && !localStorage.getItem('make100_user_chose_lang')) {
                const code = userToSet.language_code.toLowerCase().split(/[-_]/)[0];
                if (code in TRANSLATIONS) {
                  setLanguage(code as Language);
                }
              }
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
    if (gameState === 'playing' && !won && isVisualReady) {
      roundStartTimeRef.current = Date.now();
      elapsedTimeRef.current = 0;
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [gameState, won, isVisualReady, startTimer, stopTimer]);

  const handleOp = useCallback((op: string) => {
    if (selectedSlot === null || won || !isVisualReady) return;
    
    if (!isOpAllowed(op, selectedSlot, digits, gaps, won, isVisualReady)) {
      playVibration('light');
      return;
    }

    const newGaps = [...gaps];
    const curr = newGaps[selectedSlot] || '';
    const lastChar = curr.length > 0 ? curr[curr.length - 1] : null;

    if (op === 'Backspace') {
      newGaps[selectedSlot] = curr.slice(0, -1);
      playSound('click');
      playVibration('light');
    } else if (['+', '-', '*', '/'].includes(op)) {
      if (['+', '-', '*', '/'].includes(lastChar || '')) {
        // Умная замена предыдущего знака на новый вместо дублирования
        newGaps[selectedSlot] = curr.slice(0, -1) + op;
      } else if (curr === ',') {
        // Замена запятой на оператор
        newGaps[selectedSlot] = op;
      } else {
        newGaps[selectedSlot] += op;
      }
      playSound('click');
      playVibration('medium');
    } else {
      newGaps[selectedSlot] += op;
      playSound('click');
      playVibration('medium');
    }
    setGaps(newGaps);
  }, [selectedSlot, gaps, won, isVisualReady, playSound, playVibration, digits]);

  const handleSlotClick = useCallback((idx: number) => {
    if (!isVisualReady || won) return;
    setSelectedSlot(idx);
    playSound('click');
    playVibration('light');
  }, [isVisualReady, won, playSound, playVibration]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || !isVisualReady) return;
      if (won) {
         if (e.key === 'Enter' || e.key === ' ') {
            initGame(false);
         }
         return;
      }
      if (selectedSlot === null) return;
      
      let opToApply: string | null = null;
      if (['+', '-', '*', '/', '(', ')', ','].includes(e.key)) {
        opToApply = e.key;
      } else if (e.key === '.') {
        opToApply = ',';
      } else if (e.key === 'Backspace') {
        opToApply = 'Backspace';
      }

      if (opToApply) {
        if (isOpAllowed(opToApply, selectedSlot, digits, gaps, won, isVisualReady)) {
          handleOp(opToApply);
        } else {
          playVibration('light');
        }
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
  }, [selectedSlot, handleOp, won, initGame, gameState, playSound, playVibration, digits, gaps, isVisualReady]);

  const currentResult = digits.length ? calculateResult(digits, gaps) : 0;
  const currentInput = gaps.join('');
  const isWin = currentResult === 100;

  useEffect(() => {
    if (isWin && !won && !hintUsed) {
      stopTimer();
      const exactSolveTimeMs = Date.now() - roundStartTimeRef.current;
      const exactSolveTimeSec = exactSolveTimeMs / 1000;
      elapsedTimeRef.current = exactSolveTimeSec;
      setWon(true);
      setGameState('idle');
      playSound('success');
      playVibration('success');
      
      setLastRoundTimeMs(exactSolveTimeMs);
      let fullExpression = gaps[0] || "";
      for (let i = 0; i < digits.length; i++) {
        fullExpression += digits[i];
        fullExpression += gaps[i + 1] || "";
      }
      fullExpression = fullExpression.replace(/\s+/g, '');
      
      lastRoundExpressionRef.current = fullExpression;
      lastRoundSolveTimeMsRef.current = exactSolveTimeMs;

      // Validate on server
      setIsPending(true);
      submitGameSolve({
        formula: fullExpression,
        digits: digits,
        elapsedTimeMs: exactSolveTimeMs,
        gameMode: gameMode
      }).then(res => {
        if (res && res.success) {
          setStats((prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              score: res.score !== undefined ? res.score : prev.score,
              coins: res.coins !== undefined ? res.coins : prev.coins,
              solvedCount: res.solvedCount !== undefined ? res.solvedCount : prev.solvedCount,
              modeStats: res.modeStats !== undefined ? res.modeStats : prev.modeStats
            };
          });

          if (res.roundScore !== undefined) setLastEarnedScore(res.roundScore);
          if (res.coinsEarned !== undefined) setLastEarnedCoins(res.coinsEarned);

        if (res.solvedCount !== undefined) setSolvedCount(res.solvedCount);
        if (res.skippedCount !== undefined) setUnsolvedCount(res.skippedCount);
        if (res.totalTimeMs !== undefined) setTotalSolveTime(res.totalTimeMs);
        if (res.totalCharacters !== undefined) setTotalOperatorsUsed(res.totalCharacters);

          if (res.isNewGlobalRecord) {
             setIsNewRecord(true);
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
               try { tg.HapticFeedback.notificationOccurred('success'); } catch (e) {}
             }
          }
        }
      }).finally(() => {
        setIsPending(false);
      });

      setSelectedSlot(null);
    }
  }, [isWin, won, hintUsed, gaps, playSound, playVibration, tgUser, digits, bestTimeMs, stopTimer]);

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
              {t.bannedDesc || 'Ваш игровой аккаунт был временно или навсегда заблокирован за нарушение правил честной игры и сообщества Make 100.'}
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
          MAKE 100
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          {t?.syncingDb || 'Синхронизация с базой данных...'}
        </p>
      </div>
    );
  }

  const renderLicensePlate = () => {
    return <LicensePlate ticketDigits={digits} letters={letters} />;
  };

  const renderTicket = () => {
    const baseCategory = ticketBg?.category ? ticketBg.category.split('_')[0] : 'default';
    return (
      <div className="absolute top-3 sm:top-3 left-1/2 -translate-x-1/2 scale-75 origin-top pointer-events-none z-20 w-full max-w-sm flex justify-center">
        <TicketCard 
          digits={digits} 
          category={baseCategory} 
          categoryName={ticketBg?.categoryName} 
          t={t}
        />
      </div>
    );
  };

  if (isTgValidating) {
    return (
      <TelegramLoadingOverlay t={t} />
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
            const botName = (import.meta.env.VITE_NAME_BOT || 'Test_Make100_bot').replace(/\s+/g, '');
            if (tg && typeof tg.openTelegramLink === 'function') {
              try {
                tg.openTelegramLink(`https://t.me/${botName}`);
              } catch (e) {
                window.open(`https://t.me/${botName}`, "_blank");
              }
            } else {
              window.open(`https://t.me/${botName}`, "_blank");
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


  // Считаем, сколько знаков ввёл игрок (как это уже делается в UI)
  const playerSignsCount = gaps.join('').replace(/[0-9.]/g, '').length;
  
  // Получаем оптимальное решение только когда игра выиграна (кешируем через useMemo)
  const aiSignsCount = React.useMemo(() => {
    if (!won) return 0;
    const solution = findSolution(digits);
    return solution ? solution.join('').replace(/[0-9.]/g, '').length : 0;
  }, [won, digits]);

  const handleWatchOptimal = () => {
    // Проверяем баланс подсказок
    if (stats.hintsCount > 0) {
      // Закрываем окно победы, чтобы игрок увидел игровое поле со знаками!
      setWon(false);
      setGameState('playing');
      setStats((prev: any) => ({ ...prev, hintsCount: prev.hintsCount - 1 }));
      if (tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999) {
        consumeHint().then(res => {
          if (res && res.success && res.hintsCount !== undefined) {
            setStats((prev: any) => ({ ...prev, hintsCount: res.hintsCount! }));
          }
        }).catch(err => console.error("useHint error", err));
      }
      showHintOnScreen();
      playSound('click');
      playVibration('light');
    } else {
      // Если подсказок нет, открываем стандартное модальное окно покупки подсказок
      setShowBuyHintModal(true);
      playSound('error');
    }
  };

  const isCarMode = gameMode === 'car';
  
  return (
    <div 
      className="fixed inset-0 w-full h-full min-h-screen bg-zinc-950 text-white overflow-hidden flex flex-col items-center justify-between"
      style={{
        paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 16px)) + 2px)',
        paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 16px)) + 2px)'
      }}
    >
      {isCarMode && carImage && (
        <img 
          src={carImage}
          alt="Car background"
          onLoad={() => setCarImageLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out pointer-events-none z-0 ${carImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {gameMode === 'ticket' && ticketBg?.imageUrl && (
        <img 
          src={ticketBg.imageUrl}
          alt="Ticket background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        />
      )}
      <div className={`fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]`} />
      
      {statsLoaded && (
        <div className="relative z-10 w-full max-w-[420px] sm:max-w-[460px] md:max-w-[480px] h-full flex flex-col justify-between items-center px-2 sm:px-3 pb-0 pt-0">
          {/* Header */}
          <header className="w-full max-w-md mx-auto px-2 pt-1 flex items-center justify-between gap-2 sm:gap-3 select-none mb-1 sm:mb-2 z-10 flex-shrink-0">
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

            {/* Блок баланса монет, подсказок и меню (единый стандарт 50% матового стекла) */}
            <div className="flex items-center gap-2 flex-1 justify-end font-mono">
              {/* Плашка монет */}
              <div className="flex items-center gap-1.5 py-2 px-3.5 bg-white/50 dark:bg-zinc-950/50 rounded-2xl border border-white/40 dark:border-white/10 shadow-md backdrop-blur-2xl text-zinc-900 dark:text-white font-mono font-black" title={t.coinsLabel || "Монеты"}>
                <span className="text-lg drop-shadow-sm">🪙</span>
                <span className="text-sm font-black tracking-tight">
                  {stats.coins}
                </span>
              </div>

              {/* Плашка подсказок */}
              <div className="flex items-center gap-1.5 py-2 px-3.5 bg-white/50 dark:bg-zinc-950/50 rounded-2xl border border-white/40 dark:border-white/10 shadow-md backdrop-blur-2xl text-zinc-900 dark:text-white font-mono font-black" title={t.hintsLabel || "Подсказки"}>
                <span className="text-lg drop-shadow-sm">💡</span>
                <span className="text-sm font-black tracking-tight">
                  {stats.hintsCount}
                </span>
              </div>

              {/* Кнопка лидерборда (Кубок) */}
              <button 
                onClick={() => { setIsLeaderboardOpen(true); playSound('click'); playVibration('light'); }}
                className="w-10 h-10 rounded-2xl bg-amber-500/80 hover:bg-amber-500 text-white border border-amber-300/60 shadow-md shadow-amber-500/25 backdrop-blur-2xl flex items-center justify-center transition-all active:scale-90 duration-150 cursor-pointer animate-pulse"
                title={t.leaderboard || 'Зал славы'}
              >
                <Trophy size={18} fill="currentColor" className="text-yellow-100" />
              </button>

              {/* Кнопка открытия бокового меню */}
              <button 
                onClick={() => { setIsMenuOpen(true); playSound('click'); playVibration('light'); }}
                className="p-2.5 rounded-2xl bg-white/50 dark:bg-zinc-950/50 border border-white/40 dark:border-white/10 text-zinc-900 dark:text-white hover:bg-white/70 dark:hover:bg-zinc-900/70 shadow-md backdrop-blur-2xl active:scale-95 transition-all cursor-pointer"
                title={t.settingsMenu || "Меню настроек"}
              >
                <Menu size={20} />
              </button>
            </div>
          </header>

      {/* Live Stopwatch & Character Counter (единый стандарт 50% матового стекла) */}
      <div className="w-full max-w-md mx-auto flex justify-center items-center my-0.5 sm:my-1 py-0.5 px-4 z-10 flex-shrink-0">
        <div className="flex justify-center items-center gap-4 sm:gap-6 py-2 px-5 sm:px-6 rounded-2xl sm:rounded-full font-mono bg-white/50 dark:bg-zinc-950/50 border border-white/40 dark:border-white/10 backdrop-blur-2xl shadow-md text-zinc-900 dark:text-white">
          {/* Секундомер в спортивном формате ММ:СС:мс */}
          <div className="flex items-center gap-2">
            <span className="animate-pulse text-lg sm:text-xl">⏱️</span>
            <Stopwatch isRunning={isTimerRunning} onTick={handleStopwatchTick} resetKey={stopwatchResetKey} />
          </div>
          
          {/* Вертикальный разделитель */}
          <div className="h-5 sm:h-6 w-[1.5px] bg-zinc-300 dark:bg-zinc-700/60"></div>

          {/* Счётчик символов в текущем вводе */}
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl">✍️</span>
            <span className="text-zinc-900 dark:text-white font-black text-lg sm:text-xl tracking-tight">
              {currentInput.length} <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-sans font-semibold ml-0.5">{t.charsShort || 'симв.'}</span>
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
              {/* Кнопка запуска интерактивного обучения */}
              <button 
                onClick={() => { 
                  setShowTutorial(true); 
                  setIsMenuOpen(false); 
                  playSound('click'); 
                  playVibration('light'); 
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles size={18} />
                <span>{t.howToPlayTutorial || '🎓 Обучение: Как играть'}</span>
              </button>

              {/* Game Mode */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.gameMode}</span>
                <div className="flex bg-slate-200/60 dark:bg-slate-900 p-1 rounded-2xl border border-slate-300/40 dark:border-slate-800">
                  <button 
                    onClick={() => { setGameMode('ticket'); fetchRandomTicket(); playSound('click'); playVibration('light'); }}
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
                      onClick={() => {
                        setLanguage(code);
                        try {
                          localStorage.setItem('make100_language', code);
                          localStorage.setItem('make100_user_chose_lang', 'true');
                        } catch (e) {}
                        playSound('click');
                        playVibration('light');
                      }}
                      className={`py-2.5 px-3.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${language === code ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-200/60 dark:bg-slate-900 border border-slate-300/40 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-800'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-center text-xs text-slate-400 dark:text-slate-600 font-mono">
                v1.00
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
                ⬅️ {t.back || 'Назад'}
              </button>
              <h1 className="text-base font-black tracking-wider uppercase text-orange-500">
                {t.leaderboard || 'Зал славы'}
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
                          <span className="text-xs font-bold truncate w-full text-center mt-2">{getPlayerDisplayName(leaderboardData[1] as any, t)}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-black text-sm">{leaderboardData[1]?.score || 0}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center w-24 opacity-40">
                          <div className="relative mb-2">
                            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-4 border-slate-200 dark:border-slate-800 shadow-lg"><User size={24} className="text-slate-400" /></div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-sm font-black text-slate-400 border-2 border-white dark:border-slate-900 shadow-md">2</div>
                          </div>
                          <span className="text-xs font-bold truncate w-full text-center mt-2 text-slate-400">{t.empty || 'Пусто'}</span>
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
                          <span className="text-sm font-bold truncate w-full text-center mt-2 text-amber-600 dark:text-amber-400">{getPlayerDisplayName(leaderboardData[0] as any, t)}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-black text-lg">{leaderboardData[0]?.score || 0}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center w-28 -translate-y-4 opacity-40">
                          <div className="relative mb-2">
                            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-4 border-slate-200 dark:border-slate-800 shadow-xl"><User size={32} className="text-slate-400" /></div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-base font-black text-slate-400 border-2 border-white dark:border-slate-900 shadow-md">1</div>
                          </div>
                          <span className="text-sm font-bold truncate w-full text-center mt-2 text-slate-400">{t.empty || 'Пусто'}</span>
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
                          <span className="text-xs font-bold truncate w-full text-center mt-2">{getPlayerDisplayName(leaderboardData[2] as any, t)}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-black text-sm">{leaderboardData[2]?.score || 0}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center w-24 opacity-40">
                          <div className="relative mb-2">
                            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-4 border-slate-200 dark:border-slate-800 shadow-lg"><User size={24} className="text-slate-400" /></div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-sm font-black text-slate-400 border-2 border-white dark:border-slate-900 shadow-md">3</div>
                          </div>
                          <span className="text-xs font-bold truncate w-full text-center mt-2 text-slate-400">{t.empty || 'Пусто'}</span>
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
                              {getPlayerDisplayName(player, t)}
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
                    (t.youAreOnRank ? t.youAreOnRank.replace('{rank}', String(myRank)).replace('{score}', String((stats as any)?.score || 0)) : `Вы на ${myRank} месте со своими ${(stats as any)?.score || 0} очками`)
                  ) : (
                    t.playRoundToEnter || 'Сыграйте раунд, чтобы войти в рейтинг!'
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
            className={`relative w-full h-full flex justify-center ${gameMode === 'ticket' ? 'items-center max-w-md' : 'items-center max-w-3xl'}`}
          >
            <div className={`origin-center w-full h-full flex justify-center items-center transition-all duration-300 ${isVisualReady ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
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
        {/* Expression Builder: Увеличенная плашка и крупные цифры/слоты */}
        <div className={`w-full max-w-md py-2.5 sm:py-3.5 px-1 sm:px-2.5 rounded-2xl sm:rounded-[1.75rem] shadow-xl mb-2 sm:mb-2.5 transition-colors flex flex-col items-center overflow-hidden bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl border border-white/40 dark:border-white/10`}>
          <div className={`flex flex-nowrap justify-center items-center gap-x-[clamp(0.12rem,0.6vw,0.4rem)] text-[clamp(1.85rem,7.8vw,2.85rem)] font-mono font-black py-0.5 sm:py-1 w-full text-zinc-900 dark:text-white`}>
            <Gap idx={0} value={isVisualReady ? gaps[0] : ''} selected={isVisualReady && selectedSlot === 0} onClick={handleSlotClick}  />
            
            {digits.map((digit, idx) => (
              <React.Fragment key={idx}>
                <span className={`drop-shadow-sm select-none flex-shrink-0 leading-none transition-all duration-300 ${isVisualReady ? 'text-zinc-800 dark:text-zinc-100 opacity-100 scale-100' : 'text-zinc-400/50 dark:text-zinc-600/50 opacity-40 scale-90 animate-pulse'}`}>
                  {isVisualReady ? digit : '•'}
                </span>
                <Gap idx={idx + 1} value={isVisualReady ? gaps[idx + 1] : ''} selected={isVisualReady && selectedSlot === idx + 1} onClick={handleSlotClick}  />
              </React.Fragment>
            ))}
          </div>
          <div className="h-8 sm:h-10 mt-1 sm:mt-1.5 flex items-center justify-center w-full">
            {!isVisualReady ? (
              <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 font-bold text-sm sm:text-base animate-pulse">
                <span>{t.loading}</span>
              </div>
            ) : gaps.some(g => g !== '') ? (
              <div className={`font-mono text-2xl sm:text-3xl font-black ${isWin ? 'text-emerald-500 animate-pulse' : isNaN(currentResult) ? 'text-red-400 dark:text-red-500/80' : 'text-zinc-600 dark:text-zinc-300'}`}>
                = {isNaN(currentResult) ? '?' : Number.isInteger(currentResult) ? currentResult : currentResult.toFixed(2)}
              </div>
            ) : (
              <p className="text-center text-sm sm:text-base font-black text-zinc-700 dark:text-zinc-300">{t.tapGaps}</p>
            )}
          </div>
        </div>

        {/* Keypad: Вариант А (эргономичная сетка 4x2 с максимальной контрастностью и защитной клавиатурой) */}
        <div className="w-full max-w-md p-1.5 sm:p-2 rounded-2xl sm:rounded-[1.75rem] bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-lg">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {/* Ряд 1: Основные арифметические операторы (сплошной оранжевый, максимальный контраст) */}
            <OperatorButton op="+" icon={<Plus size={24} strokeWidth={3.5} />} onClick={() => handleOp('+')} disabled={!isOpAllowed('+', selectedSlot, digits, gaps, won, isVisualReady)} variant="operator" />
            <OperatorButton op="-" icon={<Minus size={24} strokeWidth={3.5} />} onClick={() => handleOp('-')} disabled={!isOpAllowed('-', selectedSlot, digits, gaps, won, isVisualReady)} variant="operator" />
            <OperatorButton op="*" icon={<X size={24} strokeWidth={3.5} />} onClick={() => handleOp('*')} disabled={!isOpAllowed('*', selectedSlot, digits, gaps, won, isVisualReady)} variant="operator" />
            <OperatorButton op="/" icon={<Divide size={24} strokeWidth={3.5} />} onClick={() => handleOp('/')} disabled={!isOpAllowed('/', selectedSlot, digits, gaps, won, isVisualReady)} variant="operator" />

            {/* Ряд 2: Скобки, запятая и Backspace */}
            <OperatorButton op="(" icon={<span className="text-xl font-black">(</span>} onClick={() => handleOp('(')} disabled={!isOpAllowed('(', selectedSlot, digits, gaps, won, isVisualReady)} />
            <OperatorButton op=")" icon={<span className="text-xl font-black">)</span>} onClick={() => handleOp(')')} disabled={!isOpAllowed(')', selectedSlot, digits, gaps, won, isVisualReady)} />
            <OperatorButton op="," icon={<span className="text-xl font-black">,</span>} onClick={() => handleOp(',')} disabled={!isOpAllowed(',', selectedSlot, digits, gaps, won, isVisualReady)} />
            <OperatorButton op="Backspace" icon={<Delete size={22} strokeWidth={2.5} />} onClick={() => handleOp('Backspace')} disabled={!isOpAllowed('Backspace', selectedSlot, digits, gaps, won, isVisualReady)} variant="danger" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-1.5 sm:mt-2 w-full max-w-md grid grid-cols-2 gap-2 sm:gap-3 shrink-0 z-10">
          <button 
            onClick={showHint}
            disabled={isHinting || won || isPending || !isVisualReady}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 transition-all font-bold tracking-wide text-xs sm:text-base bg-white/50 dark:bg-zinc-950/50 border-white/40 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-zinc-800/70 backdrop-blur-xl shadow-sm ${isHinting || won || isPending || !isVisualReady ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
          >
            <Lightbulb size={16} className={`shrink-0 ${isHinting ? "animate-pulse text-yellow-500" : ""}`} />
            <span className="truncate">{t.hint}</span>
          </button>
          <button 
            onClick={handleSkip}
            disabled={isHinting || isPending || !isVisualReady}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 transition-all font-bold tracking-wide text-xs sm:text-base ${isHinting || isPending || !isVisualReady ? 'opacity-50 pointer-events-none cursor-not-allowed bg-white/50 dark:bg-zinc-950/50 border-white/40 dark:border-white/10 text-zinc-400 backdrop-blur-xl' : noSolutionMessage ? 'animate-pulse ring-4 ring-red-500/30 border-red-500 text-red-500 dark:text-red-400 bg-red-500/30 dark:bg-red-900/40 hover:bg-red-500/40 backdrop-blur-xl' : 'bg-white/50 dark:bg-zinc-950/50 border-white/40 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-zinc-800/70 backdrop-blur-xl shadow-sm'}`}
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
      </div>
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
                  onClick={async () => {
                    if (stats.coins >= 20) {
                      setShowBuyHintModal(false);
                      setWon(false);
                      setGameState('playing');
                      setStats((prev: any) => ({ ...prev, coins: Math.max(0, prev.coins - 20) }));
                      if (tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999) {
                        try {
                          const res = await buyHint();
                          if (res && res.success) {
                            setStats((prev: any) => ({
                              ...prev,
                              coins: res.coins !== undefined ? res.coins : prev.coins,
                              hintsCount: res.hintsCount !== undefined ? res.hintsCount : prev.hintsCount
                            }));
                          }
                        } catch (e) {
                          console.error("buyHint error", e);
                        }
                      }
                      showHintOnScreen();
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

        {showSaveBotModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/50 dark:bg-black/70 backdrop-blur-md flex items-center justify-center z-[310] p-4"
            onClick={() => {
              setShowSaveBotModal(false);
              try { localStorage.setItem('make100_save_bot_dismissed', 'true'); } catch (e) {}
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl text-zinc-900 dark:text-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-white/40 dark:border-zinc-700/40 relative flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  playVibration?.('light');
                  playSound?.('click');
                  setShowSaveBotModal(false);
                  try { localStorage.setItem('make100_save_bot_dismissed', 'true'); } catch (e) {}
                }}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-full cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30 animate-bounce">
                <Sparkles size={32} />
              </div>

              <h2 className="text-xl font-black text-center mb-2 leading-snug">
                {t.saveBotModalTitle || 'Не потеряй игру Make 100! 🧩'}
              </h2>

              <p className="text-center text-sm text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed whitespace-pre-line">
                {t.saveBotModalDesc || 'Закрепи бота в списке своих чатов, чтобы возвращаться к игре в любое время и сохранить свои рекорды и монеты.\n\nЗапусти бота прямо сейчас и получи бонус +250 🪙 монет!'}
              </p>

              <div className="w-full flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    playVibration?.('success');
                    playSound?.('success');
                    setShowSaveBotModal(false);
                    try { localStorage.setItem('make100_save_bot_dismissed', 'true'); } catch (e) {}
                    
                    const botName = (import.meta.env.VITE_NAME_BOT || 'Test_Make100_bot').replace(/\s+/g, '');
                    const botUrl = `https://t.me/${botName}?start=save_game`;
                    const tg = (window as any).Telegram?.WebApp;
                    if (tg && typeof tg.openTelegramLink === 'function') {
                      try {
                        tg.openTelegramLink(botUrl);
                      } catch (e) {
                        window.open(botUrl, '_blank');
                      }
                    } else {
                      window.open(botUrl, '_blank');
                    }
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white rounded-2xl font-black transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer text-base"
                >
                  {t.saveBotModalBtn || '🤖 Запустить бота (+250 🪙)'}
                </button>

                <button
                  onClick={() => {
                    playVibration?.('light');
                    playSound?.('click');
                    setShowSaveBotModal(false);
                    try { localStorage.setItem('make100_save_bot_dismissed', 'true'); } catch (e) {}
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-sm cursor-pointer"
                >
                  {t.saveBotModalLater || 'Позже'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        <AnimatePresence>
          {showTutorial && (
            <InteractiveTutorial
              onComplete={completeTutorial}
              t={t}
              theme={theme}
              playSound={playSound}
              playVibration={playVibration}
            />
          )}
        </AnimatePresence>

        {gameState === 'idle' && !won && !showTutorial && (
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
              <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tighter">Make 100</h2>
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
                  <span>{t.newRecordBanner ? (t.newRecordBanner.includes('{time}') ? t.newRecordBanner.replace('{time}', (lastRoundTimeMs / 1000).toFixed(2)) : `${t.newRecordBanner} ${(lastRoundTimeMs / 1000).toFixed(2)} ${t.secondsShort || 'sec.'}`) : `⚡️ НОВЫЙ РЕКОРД: ${(lastRoundTimeMs / 1000).toFixed(2)} сек!`}</span>
                </motion.div>
              )}
              <div className="flex flex-col items-center gap-1 mb-8">
                <p className="text-lg text-zinc-500 dark:text-zinc-400">{t.solvedIn} <span className="font-mono font-bold">{formatSolveTime(lastRoundTimeMs || (elapsedTimeRef.current * 1000))}</span></p>
                <p className="text-lg text-zinc-500 dark:text-zinc-400">{t.operatorsUsed} <span className="font-mono font-bold">{gaps.join('').replace(/[0-9.]/g, '').length}</span></p>
                
                <div className="text-center py-2 mt-2 flex flex-wrap justify-center gap-2">
                  <span className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-500 text-sm font-black animate-bounce">
                    🏆 +{lastEarnedScore} {t.earnedRatingPoints || 'очков рейтинга!'}
                  </span>
                  <span className="inline-block px-4 py-2 bg-yellow-500/10 border border-yellow-500/25 rounded-2xl text-yellow-600 dark:text-yellow-400 text-sm font-black animate-bounce" style={{ animationDelay: '100ms' }}>
                    🪙 +{lastEarnedCoins} {t.coins || 'монет'}
                  </span>
                </div>
              </div>

              {/* Блок сравнения решений (Игрок vs Бот) */}
              <div className="mb-6 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-center">
                {playerSignsCount <= aiSignsCount ? (
                  // Сценарий 1: Игрок нашел идеальное решение!
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">🏆</span>
                    <h4 className="font-black text-sm text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      {t.perfectSolution || 'Идеальное решение!'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {t.perfectSolutionDesc || 'Вы нашли самый лаконичный путь! Бот в шоке и снимает шляпу! 🎩🤖'}
                    </p>
                  </div>
                ) : (
                  // Сценарий 2: Бот может решить короче!
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <h4 className="font-black text-sm text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      {t.botIsJealous || 'Бот кусает локти...'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
                      {t.botCanSolveFasterP1 || "А ведь этот пример можно решить всего за "}<span className="font-bold text-amber-500 dark:text-amber-400">{aiSignsCount} {t.botCanSolveFasterP2 || "знака(ов)! Хотите узнать как?"}</span>
                    </p>
                    
                    <button
                      onClick={handleWatchOptimal}
                      className="mt-1 flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/10 active:scale-95 transition-transform cursor-pointer"
                    >
                      👁️ {t.viewSolution || 'Посмотреть решение'}
                      <span className="text-[10px] py-0.5 px-1.5 rounded-md bg-white/20 font-bold ml-1">
                        {stats.hintsCount > 0 ? "1 🧠" : "20 🪙"}
                      </span>
                    </button>
                  </div>
                )}
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
      <UserProfile 
        isOpen={isProfileOpen}
        onClose={() => { setIsProfileOpen(false); playSound('click'); playVibration('light'); }}
        stats={stats}
        tgUser={tgUser}
        language={language}
        t={t}
        solvedCount={solvedCount}
        unsolvedCount={unsolvedCount}
        totalSolveTime={totalSolveTime}
        bestTimeMs={bestTimeMs}
        minCharacters={minCharacters}
        formatBestTime={formatBestTime}
        formatTotalPlayTime={formatTotalPlayTime}
        formatRegistrationDate={formatRegistrationDate}
        handleInviteFriend={handleInviteFriend}
        playSound={playSound}
        playVibration={playVibration}
      />
    </div>
  );
}
function Gap({ idx, value, selected, onClick }: { idx: number, value: string, selected: boolean, onClick: (idx: number) => void }) {
  const charCount = value.length;
  const baseWidthRem = 1.35;
  const baseWidthVw = 6.6;
  const baseWidthMaxRem = 2.15;
  const extraWidthPerCharRem = 0.55;
  const extraWidthPerCharVw = 1.8;
  const extraWidthPerCharMaxRem = 0.9;
  const extraChars = Math.max(0, charCount - 1);
  const dynamicWidth = `clamp(${baseWidthRem + (extraChars * extraWidthPerCharRem)}rem, ${baseWidthVw + (extraChars * extraWidthPerCharVw)}vw, ${baseWidthMaxRem + (extraChars * extraWidthPerCharMaxRem)}rem)`;

  return (
    <button
      onClick={() => onClick(idx)}
      style={{ width: dynamicWidth }}
      className={`relative h-[clamp(2.35rem,9.8vw,3.35rem)] rounded-xl sm:rounded-2xl border-2 flex items-center justify-center transition-all duration-200 outline-none font-black flex-shrink-0 cursor-pointer touch-manipulation select-none before:absolute before:-inset-1.5 before:content-[''] ${
        selected
          ? 'border-orange-500 bg-orange-500/25 dark:bg-orange-500/35 text-orange-600 dark:text-orange-400 backdrop-blur-md shadow-[0_0_0_4px_rgba(249,115,22,0.2)] scale-105 z-20'
          : value
          ? 'border-zinc-800/80 dark:border-zinc-200/80 bg-zinc-800/70 dark:bg-zinc-200/80 text-white dark:text-zinc-900 backdrop-blur-md shadow-sm z-10'
          : 'border-dashed border-zinc-400/70 dark:border-zinc-500/60 hover:border-orange-400 text-zinc-400 dark:text-zinc-500 bg-white/30 dark:bg-zinc-800/30 backdrop-blur-md z-10'
      }`}
    >
      {value ? (
        <span className="text-[clamp(1.15rem,4.8vw,1.6rem)] whitespace-nowrap px-0.5 leading-none">{value}</span>
      ) : (
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-zinc-400 dark:bg-zinc-600"></span>
      )}
    </button>
  );
}

function OperatorButton({ 
  icon, 
  onClick, 
  variant = 'default',
  disabled = false
}: { 
  op: string, 
  icon: React.ReactNode, 
  onClick: () => void, 
  variant?: 'default' | 'operator' | 'danger',
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center w-full h-11 sm:h-12 md:h-14 rounded-xl sm:rounded-2xl font-black transition-all border-2 select-none backdrop-blur-md ${
        disabled
          ? 'opacity-25 cursor-not-allowed pointer-events-none border-transparent bg-zinc-200/40 dark:bg-zinc-800/20 text-zinc-400 dark:text-zinc-600 shadow-none'
          : `active:scale-95 cursor-pointer shadow-md touch-manipulation ${
              variant === 'operator'
                ? 'bg-orange-500/70 hover:bg-orange-500/85 text-white border-orange-400/80 dark:border-orange-400/70 shadow-orange-500/20 text-2xl'
                : variant === 'danger'
                ? 'bg-red-500/70 hover:bg-red-500/85 text-white border-red-400/80 dark:border-red-400/70 shadow-red-500/20'
                : 'bg-white/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white border-white/40 dark:border-white/15 hover:bg-white/70 dark:hover:bg-zinc-700/60 shadow-sm text-xl'
            }`
      }`}
    >
      {icon}
    </button>
  );
}
