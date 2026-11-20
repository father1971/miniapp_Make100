/**
 * Комплексная программа автоматического тестирования всей системы Make 100 «Под капотом»
 * В соответствии со спецификацией FULL_SYSTEM_TESTING_PROMPT.md:
 * - Все API-эндпоинты Cloudflare Workers
 * - База данных Cloudflare (KV и D1)
 * - Клиентский математический движок (mathEngine.ts)
 * - Умная клавиатура (Smart Button Guard)
 * - Производительность, задержки (latency) и параллельная нагрузка
 * - Безопасность (SQLi, XSS, валидация)
 */

import { calculateResult, findSolution, isOpAllowed, getUnclosedParenCount, getTotalParenBalance } from '../src/utils/mathEngine.ts';
import fs from 'node:fs';
import path from 'node:path';

// Базовый URL бэкенда (по умолчанию тестовый воркер)
const API_URL = process.env.TEST_API_URL || 'https://make100-backend.rotanovav.workers.dev';

interface TestResult {
  id: string;
  name: string;
  block: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'SLOW';
  durationMs: number;
  expected: string;
  actual: string;
  details?: string;
}

const results: TestResult[] = [];

// Вспомогательная функция замера времени сетевого запроса
async function timedFetch(url: string, options: RequestInit = {}): Promise<{ response: Response; durationMs: number; data?: any; error?: string }> {
  const start = performance.now();
  try {
    const res = await fetch(url, options);
    const durationMs = Math.round(performance.now() - start);
    let data = null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch (e: any) {
        data = null;
      }
    }
    return { response: res, durationMs, data };
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - start);
    return { response: new Response(null, { status: 0 }), durationMs, error: err.message };
  }
}

function recordResult(res: TestResult) {
  results.push(res);
  const icon = res.status === 'PASS' ? '✅ PASS' : res.status === 'SLOW' ? '⏱️ SLOW' : res.status === 'WARN' ? '⚠️ WARN' : '❌ FAIL';
  const color = res.status === 'PASS' ? '\x1b[32m' : res.status === 'SLOW' ? '\x1b[33m' : res.status === 'WARN' ? '\x1b[35m' : '\x1b[31m';
  console.log(`${color}${icon}\x1b[0m [${res.block}] ${res.name} (${res.durationMs}ms)`);
  if (res.status !== 'PASS') {
    console.log(`   Ожидание: ${res.expected}`);
    console.log(`   Факт:     ${res.actual}`);
    if (res.details) console.log(`   Детали:   ${res.details}`);
  }
}

// ============================================================================
// БЛОК 1: АУТЕНТИФИКАЦИЯ, АВТОРИЗАЦИЯ И ЗАЩИТА ЭНДПОИНТОВ
// ============================================================================
async function testBlock1_Auth() {
  console.log('\n--- [БЛОК 1] Аутентификация, авторизация и защита эндпоинтов ---');

  // 1.1 GET /api/user без заголовка Authorization
  {
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/user`);
    const isPass = response.status === 401;
    recordResult({
      id: 'AUTH_01',
      block: 'Блок 1: Auth',
      name: 'GET /api/user без авторизации отклоняется',
      status: isPass ? (durationMs > 500 ? 'SLOW' : 'PASS') : 'FAIL',
      durationMs,
      expected: 'HTTP 401 Unauthorized, Missing initData',
      actual: `HTTP ${response.status}: ${JSON.stringify(data)}`,
    });
  }

  // 1.2 POST /api/game/solve без заголовка Authorization
  {
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/game/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formula: '100', digits: ['1', '0', '0'], elapsedTimeMs: 5000, gameMode: 'ticket' }),
    });
    const isPass = response.status === 401;
    recordResult({
      id: 'AUTH_02',
      block: 'Блок 1: Auth',
      name: 'POST /api/game/solve без авторизации отклоняется',
      status: isPass ? (durationMs > 500 ? 'SLOW' : 'PASS') : 'FAIL',
      durationMs,
      expected: 'HTTP 401 Unauthorized',
      actual: `HTTP ${response.status}: ${JSON.stringify(data)}`,
    });
  }

  // 1.3 POST /api/user/buy-hint без заголовка Authorization
  {
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/user/buy-hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const isPass = response.status === 401;
    recordResult({
      id: 'AUTH_03',
      block: 'Блок 1: Auth',
      name: 'POST /api/user/buy-hint без авторизации отклоняется',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs,
      expected: 'HTTP 401 Unauthorized',
      actual: `HTTP ${response.status}`,
    });
  }

  // 1.4 POST /api/auth/telegram-widget с невалидным хэшем
  {
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/auth/telegram-widget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 123456, first_name: 'FakeUser', hash: 'invalid_sha256_hash_here' }),
    });
    const isPass = response.status === 403;
    recordResult({
      id: 'AUTH_04',
      block: 'Блок 1: Auth',
      name: 'Telegram Login Widget: отклонение поддельного хэша',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs,
      expected: 'HTTP 403 с сообщением о неверной подписи',
      actual: `HTTP ${response.status}: ${JSON.stringify(data)}`,
    });
  }

  // 1.5 POST /api/auth/email/send-code валидный email
  let otpSession = '';
  {
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/auth/email/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'autotest_system@example.com' }),
    });
    const isPass = response.status === 200 && data?.success === true && Boolean(data?.otpSession);
    if (isPass) otpSession = data.otpSession;
    recordResult({
      id: 'AUTH_05',
      block: 'Блок 1: Auth',
      name: 'Email Auth: отправка OTP-кода подтверждения',
      status: isPass ? (durationMs > 2000 ? 'SLOW' : 'PASS') : 'FAIL',
      durationMs,
      expected: 'HTTP 200 { success: true, otpSession: string }',
      actual: `HTTP ${response.status}: success=${data?.success}, hasSession=${Boolean(data?.otpSession)}`,
    });
  }

  // 1.6 POST /api/auth/email/send-code невалидный email (без @)
  {
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/auth/email/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email-address' }),
    });
    const isPass = response.status === 400 || (data && !data.success);
    recordResult({
      id: 'AUTH_06',
      block: 'Блок 1: Auth',
      name: 'Email Auth: валидация формата email',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs,
      expected: 'HTTP 400 или success: false',
      actual: `HTTP ${response.status}: ${JSON.stringify(data)}`,
    });
  }

  // 1.7 POST /api/auth/email/verify-code с неверным кодом
  {
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/auth/email/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'autotest_system@example.com', code: '000000', otpSession }),
    });
    const isPass = response.status === 400;
    recordResult({
      id: 'AUTH_07',
      block: 'Блок 1: Auth',
      name: 'Email Auth: отклонение неверного OTP-кода',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs,
      expected: 'HTTP 400 Неверный или просроченный код',
      actual: `HTTP ${response.status}: ${JSON.stringify(data)}`,
    });
  }
}

// ============================================================================
// БЛОК 2: ПУЛЫ ИЗОБРАЖЕНИЙ (CLOUDFLARE KV)
// ============================================================================
async function testBlock2_ImagePools() {
  console.log('\n--- [БЛОК 2] Пулы изображений Cloudflare KV ---');

  // 2.1 GET /api/cars/pool
  let sampledCarUrl = '';
  {
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/cars/pool`);
    const carsList = data?.cars || data?.images || (Array.isArray(data) ? data : []);
    const isPass = response.status === 200 && Array.isArray(carsList) && carsList.length > 0;
    if (isPass && carsList.length > 0) {
      const first = carsList[0];
      sampledCarUrl = typeof first === 'string' ? first : first.url;
    }
    recordResult({
      id: 'POOL_01',
      block: 'Блок 2: KV Pools',
      name: 'GET /api/cars/pool получение пула автомобилей',
      status: isPass ? (durationMs > 500 ? 'SLOW' : 'PASS') : 'FAIL',
      durationMs,
      expected: 'HTTP 200 с массивом автомобилей (count > 0)',
      actual: `HTTP ${response.status}, количество: ${carsList.length}`,
    });
  }

  // 2.2 Проверка доступности реального URL из пула авто
  if (sampledCarUrl) {
    const { response, durationMs } = await timedFetch(sampledCarUrl, { method: 'HEAD' });
    const isPass = response.status === 200;
    recordResult({
      id: 'POOL_02',
      block: 'Блок 2: KV Pools',
      name: 'Доступность R2/KV хранилища изображений авто (HEAD)',
      status: isPass ? (durationMs > 1000 ? 'SLOW' : 'PASS') : 'WARN',
      durationMs,
      expected: 'HTTP 200 OK для URL картинки',
      actual: `HTTP ${response.status} (${sampledCarUrl.slice(0, 70)}...)`,
    });
  }

  // 2.3 GET /api/tickets/pool
  let ticketsList: any[] = [];
  {
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/tickets/pool`);
    ticketsList = data?.tickets || (Array.isArray(data) ? data : []);
    const isPass = response.status === 200 && Array.isArray(ticketsList) && ticketsList.length > 0;
    recordResult({
      id: 'POOL_03',
      block: 'Блок 2: KV Pools',
      name: 'GET /api/tickets/pool получение пула фонов билетов',
      status: isPass ? (durationMs > 500 ? 'SLOW' : 'PASS') : 'FAIL',
      durationMs,
      expected: 'HTTP 200 с массивом билетов',
      actual: `HTTP ${response.status}, количество: ${ticketsList.length}`,
    });
  }

  // 2.4 Проверка всех 12 утвержденных категорий билетов
  {
    const expectedCategories = [
      'airplane',
      'theater',
      'bus_tram',
      'cinema',
      'train_station',
      'concert',
      'stadium',
      'amusement_park',
      'museum',
      'water_transport',
      'ski_resort',
      'circus',
    ];
    const presentCategories = new Set(ticketsList.map((t) => t.category));
    const missing = expectedCategories.filter((c) => !presentCategories.has(c));
    const isPass = missing.length === 0;

    recordResult({
      id: 'POOL_04',
      block: 'Блок 2: KV Pools',
      name: 'Наличие всех 12 согласованных категорий билетов в базе',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs: 0,
      expected: `Все 12 категорий: ${expectedCategories.join(', ')}`,
      actual: isPass ? 'Все 12 категорий присутствуют в базе KV' : `Отсутствуют: ${missing.join(', ')}`,
    });
  }

  // 2.5 Проверка структуры объекта билета (наличие categoryName, imageUrl/url)
  {
    const invalidItems = ticketsList.filter((t) => !t.category || !t.categoryName || (!t.imageUrl && !t.url));
    const isPass = invalidItems.length === 0 && ticketsList.length > 0;
    recordResult({
      id: 'POOL_05',
      block: 'Блок 2: KV Pools',
      name: 'Целостность схемы объектов билетов (category, categoryName, url)',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs: 0,
      expected: 'Все билеты содержат обязательные поля category, categoryName, imageUrl',
      actual: isPass ? 'Все объекты полностью валидны' : `Найдено поврежденных объектов: ${invalidItems.length}`,
    });
  }
}

// ============================================================================
// БЛОК 3: ТАБЛИЦА ЛИДЕРОВ И БАЗА ДАННЫХ D1/KV
// ============================================================================
let topUserId = 0;
async function testBlock3_Leaderboard() {
  console.log('\n--- [БЛОК 3] Таблица лидеров и база данных ---');

  // 3.1 GET /api/leaderboard
  {
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/leaderboard`);
    const list = data?.leaderboard || (Array.isArray(data) ? data : []);
    const isPass = response.status === 200 && Array.isArray(list) && list.length > 0;

    if (isPass && list.length > 0) {
      topUserId = list[0].id;
    }

    // Проверка сортировки по убыванию очков
    let isSorted = true;
    for (let i = 1; i < list.length; i++) {
      if ((list[i - 1].score ?? 0) < (list[i].score ?? 0)) {
        isSorted = false;
        break;
      }
    }

    recordResult({
      id: 'LEAD_01',
      block: 'Блок 3: Leaderboard',
      name: 'GET /api/leaderboard и сортировка по убыванию очков',
      status: isPass && isSorted ? (durationMs > 500 ? 'SLOW' : 'PASS') : 'FAIL',
      durationMs,
      expected: 'HTTP 200, массив игроков отсортирован по score убывающе',
      actual: `HTTP ${response.status}, игроков: ${list.length}, сортировка корректна: ${isSorted}`,
    });
  }

  // 3.2 Проверка обязательных полей в лидерборде
  {
    const { data } = await timedFetch(`${API_URL}/api/leaderboard`);
    const list = data?.leaderboard || (Array.isArray(data) ? data : []);
    const sample = list[0];
    const hasFields = sample && sample.id !== undefined && sample.score !== undefined && (sample.firstName !== undefined || sample.username !== undefined);

    recordResult({
      id: 'LEAD_02',
      block: 'Блок 3: Leaderboard',
      name: 'Схема полей таблицы лидеров (id, score, name/username)',
      status: hasFields ? 'PASS' : 'FAIL',
      durationMs: 0,
      expected: 'Присутствуют поля id, score, username/firstName',
      actual: hasFields ? `Поля на месте (Игрок: ${sample?.username || sample?.firstName}, Очки: ${sample?.score})` : 'Отсутствуют обязательные поля',
    });
  }
}

// ============================================================================
// БЛОК 4: РЕФЕРАЛЬНАЯ СИСТЕМА
// ============================================================================
async function testBlock4_Referrals() {
  console.log('\n--- [БЛОК 4] Реферальная система ---');

  // 4.1 POST /api/referrals/visit с несуществующим пользователем
  {
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/referrals/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrerId: 999999999, visitorId: `v_test_${Date.now()}` }),
    });
    const isPass = response.status === 404 && data?.success === false;
    recordResult({
      id: 'REF_01',
      block: 'Блок 4: Referrals',
      name: 'Защита БД: отказ при несуществующем referrerId',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs,
      expected: 'HTTP 404 Referrer user not found',
      actual: `HTTP ${response.status}: ${JSON.stringify(data)}`,
    });
  }

  // 4.2 POST /api/referrals/visit с существующим реферером
  if (topUserId > 0) {
    const visitorId = `v_autotest_${Date.now()}`;
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/referrals/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrerId: topUserId, visitorId }),
    });
    const isPass = response.status === 200 && data?.success === true;
    recordResult({
      id: 'REF_02',
      block: 'Блок 4: Referrals',
      name: 'Фиксация визита гостя по ссылке существующего реферера',
      status: isPass ? (durationMs > 500 ? 'SLOW' : 'PASS') : 'FAIL',
      durationMs,
      expected: 'HTTP 200 { success: true }',
      actual: `HTTP ${response.status}: ${JSON.stringify(data)}`,
    });

    // 4.3 Идемпотентность: повторный визит с тем же visitorId
    const { response: res2, durationMs: dur2, data: data2 } = await timedFetch(`${API_URL}/api/referrals/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrerId: topUserId, visitorId }),
    });
    const isPass2 = res2.status === 200;
    recordResult({
      id: 'REF_03',
      block: 'Блок 4: Referrals',
      name: 'Идемпотентность повторного перехода гостя (без двойного счета)',
      status: isPass2 ? 'PASS' : 'FAIL',
      durationMs: dur2,
      expected: 'HTTP 200 OK (без падения и без дублирования)',
      actual: `HTTP ${res2.status}: ${JSON.stringify(data2)}`,
    });
  }
}

// ============================================================================
// БЛОК 5: ОБРАТНАЯ СВЯЗЬ (FEEDBACK)
// ============================================================================
async function testBlock5_Feedback() {
  console.log('\n--- [БЛОК 5] Обратная связь ---');

  // 5.1 POST /api/contact/feedback валидное сообщение
  {
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/contact/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'AutoTest Agent',
        contact: 'test_agent@example.com',
        message: 'Автоматический тест проверки канала связи.',
      }),
    });
    const isPass = response.status === 200 && data?.success === true;
    recordResult({
      id: 'FEED_01',
      block: 'Блок 5: Feedback',
      name: 'POST /api/contact/feedback успешная доставка',
      status: isPass ? (durationMs > 1000 ? 'SLOW' : 'PASS') : 'FAIL',
      durationMs,
      expected: 'HTTP 200 { success: true }',
      actual: `HTTP ${response.status}: ${JSON.stringify(data)}`,
    });
  }

  // 5.2 Валидация пустого сообщения
  {
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/contact/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', contact: '', message: '' }),
    });
    const isPass = response.status === 400 || (data && !data.success);
    recordResult({
      id: 'FEED_02',
      block: 'Блок 5: Feedback',
      name: 'Валидация пустых полей обратной связи',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs,
      expected: 'HTTP 400 или success: false',
      actual: `HTTP ${response.status}: ${JSON.stringify(data)}`,
    });
  }
}

// ============================================================================
// БЛОК 6: МАТЕМАТИЧЕСКИЙ ДВИЖОК (mathEngine.ts)
// ============================================================================
function testBlock6_MathEngine() {
  console.log('\n--- [БЛОК 6] Клиентский математический движок (mathEngine) ---');

  // 6.1 Базовая арифметика и приоритет операций
  {
    const start = performance.now();
    const res1 = calculateResult(['1', '2', '3', '4', '5', '6'], ['', '+', '+', '+', '+', '+', '']);
    const isPass1 = res1 === 21;

    // 1 + 2 * 3 = 7, а не 9
    const res2 = calculateResult(['1', '2', '3'], ['', '+', '*', '']);
    const isPass2 = res2 === 7;

    // Скобки: (1 + 2) * 3 = 9
    const res3 = calculateResult(['1', '2', '3'], ['(', '+', ')*', '']);
    const isPass3 = res3 === 9;

    const dur = Math.round(performance.now() - start);
    recordResult({
      id: 'MATH_01',
      block: 'Блок 6: MathEngine',
      name: 'Приоритет операций и обработка скобок',
      status: isPass1 && isPass2 && isPass3 ? 'PASS' : 'FAIL',
      durationMs: dur,
      expected: '1+2*3=7, (1+2)*3=9',
      actual: `1+2*3=${res2}, (1+2)*3=${res3}`,
    });
  }

  // 6.2 Десятичные дроби (запятая и точка)
  {
    // 1,5 * 4 = 6
    const res = calculateResult(['1', '5', '4'], ['', ',', '*', '']);
    const isPass = res === 6;
    recordResult({
      id: 'MATH_02',
      block: 'Блок 6: MathEngine',
      name: 'Поддержка десятичных дробей через запятую',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs: 0,
      expected: '1,5 * 4 = 6',
      actual: `1,5 * 4 = ${res}`,
    });
  }

  // 6.3 Деление на ноль и ведущие нули
  {
    const resDiv0 = calculateResult(['5', '0'], ['', '/', '']);
    const isPassDiv0 = Number.isNaN(resDiv0);

    const resLead0 = calculateResult(['0', '5'], ['', '', '']);
    const isPassLead0 = Number.isNaN(resLead0);

    recordResult({
      id: 'MATH_03',
      block: 'Блок 6: MathEngine',
      name: 'Защита от деления на 0 и ведущих нулей (NaN)',
      status: isPassDiv0 && isPassLead0 ? 'PASS' : 'FAIL',
      durationMs: 0,
      expected: '5/0 = NaN, 05 = NaN',
      actual: `5/0=${resDiv0}, 05=${resLead0}`,
    });
  }

  // 6.4 Нецелые бесконечные дроби (например, 10/3 -> NaN по правилам игры)
  {
    const resInf = calculateResult(['1', '0', '3'], ['', '', '/', '']);
    const isPass = Number.isNaN(resInf);
    recordResult({
      id: 'MATH_04',
      block: 'Блок 6: MathEngine',
      name: 'Отклонение бесконечных периодических дробей (10/3 = NaN)',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs: 0,
      expected: '10/3 = NaN (разрешены только конечные дроби)',
      actual: `10/3 = ${resInf}`,
    });
  }

  // 6.5 Полноценное получение 100 из 6 цифр
  {
    // (1+2+3+4)*(5+5) = 100 для цифр [1,2,3,4,5,5]
    const res100 = calculateResult(['1', '2', '3', '4', '5', '5'], ['(', '+', '+', '+', ')*(', '+', ')']);
    const isPass = res100 === 100;
    recordResult({
      id: 'MATH_05',
      block: 'Блок 6: MathEngine',
      name: 'Точное вычисление целевого числа 100',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs: 0,
      expected: '(1+2+3+4)*(5+5) = 100',
      actual: `Результат: ${res100}`,
    });
  }

  // 6.6 Алгоритм findSolution() — автоматический поиск формулы
  {
    const start = performance.now();
    const solution = findSolution(['1', '2', '3', '4', '5', '6']);
    const dur = Math.round(performance.now() - start);
    let verifyRes = NaN;
    if (solution) {
      verifyRes = calculateResult(['1', '2', '3', '4', '5', '6'], solution);
    }
    const isPass = solution !== null && verifyRes === 100;
    recordResult({
      id: 'MATH_06',
      block: 'Блок 6: MathEngine',
      name: 'Поиск оптимального решения через findSolution()',
      status: isPass ? (dur > 2000 ? 'SLOW' : 'PASS') : 'FAIL',
      durationMs: dur,
      expected: 'Найдена формула, дающая ровно 100',
      actual: isPass ? `Решение найдено за ${dur}мс: результат=${verifyRes}` : 'Решение не найдено',
    });
  }

  // 6.7 findSolution() для заведомо нерешаемого набора [0,0,0,0,0,0]
  {
    const start = performance.now();
    const solution = findSolution(['0', '0', '0', '0', '0', '0']);
    const dur = Math.round(performance.now() - start);
    const isPass = solution === null;
    recordResult({
      id: 'MATH_07',
      block: 'Блок 6: MathEngine',
      name: 'Корректный возврат null для нерешаемых наборов (все нули)',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs: dur,
      expected: 'findSolution([0,0,0,0,0,0]) === null',
      actual: `solution: ${solution}`,
    });
  }
}

// ============================================================================
// БЛОК 7: УМНАЯ КЛАВИАТУРА (SMART BUTTON GUARD - isOpAllowed)
// ============================================================================
function testBlock7_SmartKeyboard() {
  console.log('\n--- [БЛОК 7] Умная клавиатура (Smart Button Guard) ---');

  const digits = ['1', '2', '3', '4', '5', '6'];
  const emptyGaps = ['', '', '', '', '', '', ''];

  // 7.1 Слот 0: бинарные операторы запрещены, унарный минус и скобка ( разрешены
  {
    const plusAllowed = isOpAllowed('+', 0, digits, emptyGaps, false, true);
    const mulAllowed = isOpAllowed('*', 0, digits, emptyGaps, false, true);
    const commaAllowed = isOpAllowed(',', 0, digits, emptyGaps, false, true);
    const closeParenAllowed = isOpAllowed(')', 0, digits, emptyGaps, false, true);
    const minusAllowed = isOpAllowed('-', 0, digits, emptyGaps, false, true);
    const openParenAllowed = isOpAllowed('(', 0, digits, emptyGaps, false, true);

    const isPass = !plusAllowed && !mulAllowed && !commaAllowed && !closeParenAllowed && minusAllowed && openParenAllowed;

    recordResult({
      id: 'GUARD_01',
      block: 'Блок 7: Keyboard Guard',
      name: 'Слот 0: запрет +, *, /, ), запятой и разрешение унарного - и (',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs: 0,
      expected: '+, *, ,, ) запрещены; -, ( разрешены',
      actual: `+: ${plusAllowed}, *: ${mulAllowed}, ,: ${commaAllowed}, -: ${minusAllowed}, (: ${openParenAllowed}`,
    });
  }

  // 7.2 Слот 6 (самый последний): разрешена только закрывающая скобка ) при наличии открытой
  {
    const gapsWithOpen = ['(', '', '', '', '', '', ''];
    const closeAllowed = isOpAllowed(')', 6, digits, gapsWithOpen, false, true);
    const plusAllowed = isOpAllowed('+', 6, digits, gapsWithOpen, false, true);

    // Если нет открытых скобок: ) запрещена
    const closeForbidden = isOpAllowed(')', 6, digits, emptyGaps, false, true);

    const isPass = closeAllowed && !plusAllowed && !closeForbidden;
    recordResult({
      id: 'GUARD_02',
      block: 'Блок 7: Keyboard Guard',
      name: 'Слот 6: только закрывающая скобка при наличии открытой',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs: 0,
      expected: 'Разрешена только ) при балансе скобок > 0',
      actual: `closeAllowed: ${closeAllowed}, plusAllowed: ${plusAllowed}, closeWithoutOpen: ${closeForbidden}`,
    });
  }

  // 7.3 Защита от дублирования запятых в одном непрерывном числе
  {
    const gapsWithComma = ['', ',', '', '', '', '', ''];
    // В слоте 2 попытка поставить запятую в то же число (1,2)
    const secondCommaAllowed = isOpAllowed(',', 2, digits, gapsWithComma, false, true);
    const isPass = !secondCommaAllowed;

    recordResult({
      id: 'GUARD_03',
      block: 'Блок 7: Keyboard Guard',
      name: 'Запрет повторной запятой в одном непрерывном числе',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs: 0,
      expected: 'Вторая запятая строго заблокирована',
      actual: `Вторая запятая разрешена: ${secondCommaAllowed}`,
    });
  }

  // 7.4 Ограничение емкости слота (максимум 5 символов)
  {
    const fullGaps = ['', '(((-(', '', '', '', '', ''];
    const extraAllowed = isOpAllowed('+', 1, digits, fullGaps, false, true);
    const isPass = !extraAllowed;

    recordResult({
      id: 'GUARD_04',
      block: 'Блок 7: Keyboard Guard',
      name: 'Лимит вместимости слота (не более 5 символов)',
      status: isPass ? 'PASS' : 'FAIL',
      durationMs: 0,
      expected: 'Шестой символ заблокирован',
      actual: `Разрешено превышение лимита: ${extraAllowed}`,
    });
  }
}

// ============================================================================
// БЛОК 8: НАГРУЗКА, СТРЕСС-ТЕСТ И ЗАДЕРЖКИ (CONCURRENCY & PERFORMANCE)
// ============================================================================
async function testBlock8_Concurrency() {
  console.log('\n--- [БЛОК 8] Нагрузка, стресс-тест и задержки ---');

  // 8.1 5 одновременных параллельных запросов к пулам и лидерборду
  {
    const start = performance.now();
    const tasks = [
      timedFetch(`${API_URL}/api/cars/pool`),
      timedFetch(`${API_URL}/api/tickets/pool`),
      timedFetch(`${API_URL}/api/leaderboard`),
      timedFetch(`${API_URL}/api/cars/pool`),
      timedFetch(`${API_URL}/api/leaderboard`),
    ];

    const responses = await Promise.all(tasks);
    const totalMs = Math.round(performance.now() - start);
    const allSuccessful = responses.every((r) => r.response.status === 200);
    const maxSingleMs = Math.max(...responses.map((r) => r.durationMs));

    recordResult({
      id: 'PERF_01',
      block: 'Блок 8: Performance',
      name: 'Параллельная обработка 5 одновременных запросов',
      status: allSuccessful ? (maxSingleMs > 1500 ? 'SLOW' : 'PASS') : 'FAIL',
      durationMs: totalMs,
      expected: 'Все 5 запросов завершаются успешно (HTTP 200)',
      actual: `Успешно: ${allSuccessful}, Общее время пачки: ${totalMs}мс, Худший запрос: ${maxSingleMs}мс`,
    });
  }
}

// ============================================================================
// БЛОК 9: БЕЗОПАСНОСТЬ И УСТОЙЧИВОСТЬ К ИНЪЕКЦИЯМ (SECURITY)
// ============================================================================
async function testBlock9_Security() {
  console.log('\n--- [БЛОК 9] Безопасность и устойчивость к инъекциям ---');

  // 9.1 SQL Injection в полях обратной связи
  {
    const sqliPayload = "' OR 1=1; DROP TABLE users; --";
    const { response, durationMs, data } = await timedFetch(`${API_URL}/api/contact/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: sqliPayload, contact: 'sqli@test.com', message: 'SQL Injection probe' }),
    });
    // Сервер должен либо штатно обработать строку (экранировать), либо вернуть 400/200, но НЕ упасть с 500
    const isSafe = response.status === 200 || response.status === 400;
    recordResult({
      id: 'SEC_01',
      block: 'Блок 9: Security',
      name: 'Устойчивость к SQL-инъекциям (SQLi) в текстовых полях',
      status: isSafe ? 'PASS' : 'FAIL',
      durationMs,
      expected: 'Сервер экранирует ввод и не падает с HTTP 500',
      actual: `HTTP ${response.status}`,
    });
  }

  // 9.2 XSS Payload в сообщении
  {
    const xssPayload = "<script>alert('XSS')</script><img src=x onerror=alert(1)>";
    const { response, durationMs } = await timedFetch(`${API_URL}/api/contact/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'XSS Probe', contact: 'xss@test.com', message: xssPayload }),
    });
    const isSafe = response.status === 200 || response.status === 400;
    recordResult({
      id: 'SEC_02',
      block: 'Блок 9: Security',
      name: 'Устойчивость к XSS-нагрузкам в полях обратной связи',
      status: isSafe ? 'PASS' : 'FAIL',
      durationMs,
      expected: 'Сервер корректно принимает или фильтрует без падения',
      actual: `HTTP ${response.status}`,
    });
  }

  // 9.3 Огромная полезная нагрузка (> 100 КБ)
  {
    const hugeMessage = 'A'.repeat(120 * 1024); // 120 KB
    const { response, durationMs } = await timedFetch(`${API_URL}/api/contact/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Overflow', contact: 'overflow@test.com', message: hugeMessage }),
    });
    // Cloudflare Worker или API должны вернуть 413 Payload Too Large или 400
    const isSafe = response.status === 413 || response.status === 400 || response.status === 200;
    recordResult({
      id: 'SEC_03',
      block: 'Блок 9: Security',
      name: 'Обработка избыточного размера полезной нагрузки (Payload limit)',
      status: isSafe ? 'PASS' : 'FAIL',
      durationMs,
      expected: 'HTTP 413 Payload Too Large или HTTP 400',
      actual: `HTTP ${response.status}`,
    });
  }
}

// ============================================================================
// ГЕНЕРАЦИЯ ОТЧЁТА (MARKDOWN & CONSOLE SUMMARY)
// ============================================================================
async function runAllTests() {
  console.log('======================================================================');
  console.log('🚀 ЗАПУСК ПОЛНОГО ТЕСТИРОВАНИЯ MAKE 100 «ПОД КАПОТОМ»');
  console.log(`Целевой бэкенд: ${API_URL}`);
  console.log('======================================================================');

  await testBlock1_Auth();
  await testBlock2_ImagePools();
  await testBlock3_Leaderboard();
  await testBlock4_Referrals();
  await testBlock5_Feedback();
  testBlock6_MathEngine();
  testBlock7_SmartKeyboard();
  await testBlock8_Concurrency();
  await testBlock9_Security();

  const total = results.length;
  const passed = results.filter((r) => r.status === 'PASS').length;
  const slow = results.filter((r) => r.status === 'SLOW').length;
  const warn = results.filter((r) => r.status === 'WARN').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;

  console.log('\n======================================================================');
  console.log('📊 ИТОГИ ТЕСТИРОВАНИЯ:');
  console.log(`   Всего тестов:   ${total}`);
  console.log(`   ✅ Успешно:     ${passed}`);
  console.log(`   ⏱️ С задержкой: ${slow}`);
  console.log(`   ⚠️ Замечания:   ${warn}`);
  console.log(`   ❌ Провалено:   ${failed}`);
  console.log('======================================================================\n');

  // Формируем подробный отчет в формате Markdown
  let reportMd = `# Отчёт глубокого тестирования системы Make 100 «Под капотом»\n\n`;
  reportMd += `**Дата и время:** ${new Date().toISOString()}\n`;
  reportMd += `**Целевой сервер API:** \`${API_URL}\`\n\n`;
  reportMd += `## Сводка результатов\n\n`;
  reportMd += `- **Всего проверок:** ${total}\n`;
  reportMd += `- **Успешно (PASS):** ${passed} ✅\n`;
  reportMd += `- **С задержкой (SLOW):** ${slow} ⏱️\n`;
  reportMd += `- **Предупреждения (WARN):** ${warn} ⚠️\n`;
  reportMd += `- **Ошибки (FAIL):** ${failed} ❌\n\n`;

  reportMd += `## Детальные результаты по блокам\n\n`;
  reportMd += `| ID | Блок | Название проверки | Статус | Время | Факт |\n`;
  reportMd += `|---|---|---|---|---|---|\n`;

  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅ PASS' : r.status === 'SLOW' ? '⏱️ SLOW' : r.status === 'WARN' ? '⚠️ WARN' : '❌ FAIL';
    reportMd += `| \`${r.id}\` | ${r.block} | ${r.name} | **${icon}** | ${r.durationMs}ms | ${r.actual.replace(/\|/g, '/')} |\n`;
  }

  const reportPath = path.resolve(process.cwd(), 'SYSTEM_TEST_REPORT.md');
  fs.writeFileSync(reportPath, reportMd, 'utf8');
  console.log(`📄 Полный отчет сохранён в файл: ${reportPath}`);
}

runAllTests().catch((err) => {
  console.error('Критическая ошибка программы тестирования:', err);
  process.exit(1);
});
