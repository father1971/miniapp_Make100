import { Page } from '@playwright/test';

/**
 * Telegram WebApp Mock для E2E тестирования
 * Позволяет эмулировать запуск игры как внутри Telegram Mini App, так и в браузере.
 */

export interface TelegramMockOptions {
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  };
  start_param?: string;
  colorScheme?: 'dark' | 'light';
  version?: string;
  platform?: string;
}

export function createTelegramMockScript(options: TelegramMockOptions = {}): string {
  const user = options.user || {
    id: 12345678,
    first_name: 'TestUser',
    last_name: 'E2E',
    username: 'test_player',
    language_code: 'ru',
    is_premium: false,
  };

  const startParam = options.start_param || '';
  const colorScheme = options.colorScheme || 'dark';
  const version = options.version || '7.10';
  const platform = options.platform || 'mobile';

  // Формируем query_string initData
  const initDataObj: Record<string, string> = {
    query_id: 'AAHdF6IQAAAAAN0XohD12345',
    user: JSON.stringify(user),
    auth_date: Math.floor(Date.now() / 1000).toString(),
    hash: 'mock_valid_hmac_hash_for_e2e_tests',
  };
  if (startParam) {
    initDataObj.start_param = startParam;
  }

  const initDataQuery = Object.entries(initDataObj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  return `
    (function() {
      const mockStorage = {};
      const backButtonCallbacks = [];
      const mainButtonCallbacks = [];

      window.__telegramHapticCalls = [];
      window.__telegramOpenedLinks = [];

      const mockWebApp = {
        initData: "${initDataQuery}",
        initDataUnsafe: {
          query_id: "${initDataObj.query_id}",
          user: ${JSON.stringify(user)},
          auth_date: ${initDataObj.auth_date},
          hash: "${initDataObj.hash}",
          ${startParam ? `start_param: "${startParam}",` : ''}
        },
        version: "${version}",
        platform: "${platform}",
        colorScheme: "${colorScheme}",
        themeParams: {
          bg_color: "${colorScheme === 'dark' ? '#0f172a' : '#ffffff'}",
          text_color: "${colorScheme === 'dark' ? '#f8fafc' : '#0f172a'}",
          hint_color: "#94a3b8",
          link_color: "#38bdf8",
          button_color: "#f97316",
          button_text_color: "#ffffff",
          secondary_bg_color: "${colorScheme === 'dark' ? '#1e293b' : '#f1f5f9'}"
        },
        isExpanded: true,
        viewportHeight: window.innerHeight,
        viewportStableHeight: window.innerHeight,
        headerColor: "#0f172a",
        backgroundColor: "#0f172a",
        ready: function() { console.log('[Mock TG] ready() called'); },
        expand: function() { console.log('[Mock TG] expand() called'); this.isExpanded = true; },
        close: function() { console.log('[Mock TG] close() called'); },
        disableVerticalSwipes: function() { console.log('[Mock TG] disableVerticalSwipes() called'); },
        setHeaderColor: function(c) { this.headerColor = c; },
        setBackgroundColor: function(c) { this.backgroundColor = c; },
        openTelegramLink: function(url) {
          console.log('[Mock TG] openTelegramLink:', url);
          window.__telegramOpenedLinks.push(url);
        },
        openLink: function(url) {
          console.log('[Mock TG] openLink:', url);
          window.__telegramOpenedLinks.push(url);
        },
        shareToStory: function(url, params) {
          console.log('[Mock TG] shareToStory:', url, params);
        },
        BackButton: {
          isVisible: false,
          show: function() { this.isVisible = true; },
          hide: function() { this.isVisible = false; },
          onClick: function(cb) { backButtonCallbacks.push(cb); },
          offClick: function(cb) {
            const idx = backButtonCallbacks.indexOf(cb);
            if (idx >= 0) backButtonCallbacks.splice(idx, 1);
          },
          _trigger: function() {
            backButtonCallbacks.forEach(cb => cb());
          }
        },
        MainButton: {
          text: '',
          color: '#f97316',
          textColor: '#ffffff',
          isVisible: false,
          isActive: true,
          isProgressVisible: false,
          setText: function(t) { this.text = t; },
          show: function() { this.isVisible = true; },
          hide: function() { this.isVisible = false; },
          enable: function() { this.isActive = true; },
          disable: function() { this.isActive = false; },
          showProgress: function() { this.isProgressVisible = true; },
          hideProgress: function() { this.isProgressVisible = false; },
          onClick: function(cb) { mainButtonCallbacks.push(cb); },
          offClick: function(cb) {
            const idx = mainButtonCallbacks.indexOf(cb);
            if (idx >= 0) mainButtonCallbacks.splice(idx, 1);
          }
        },
        HapticFeedback: {
          impactOccurred: function(style) {
            window.__telegramHapticCalls.push({ type: 'impact', style });
          },
          notificationOccurred: function(type) {
            window.__telegramHapticCalls.push({ type: 'notification', notifType: type });
          },
          selectionChanged: function() {
            window.__telegramHapticCalls.push({ type: 'selection' });
          }
        },
        CloudStorage: {
          setItem: function(key, val, cb) {
            mockStorage[key] = val;
            if (cb) cb(null, true);
          },
          getItem: function(key, cb) {
            const val = mockStorage[key] || '';
            if (cb) cb(null, val);
          },
          getItems: function(keys, cb) {
            const res = {};
            keys.forEach(k => { res[k] = mockStorage[k] || ''; });
            if (cb) cb(null, res);
          },
          removeItem: function(key, cb) {
            delete mockStorage[key];
            if (cb) cb(null, true);
          },
          removeItems: function(keys, cb) {
            keys.forEach(k => delete mockStorage[k]);
            if (cb) cb(null, true);
          },
          getKeys: function(cb) {
            if (cb) cb(null, Object.keys(mockStorage));
          }
        }
      };

      // Блокируем перезапись внешним скриптом telegram-web-app.js
      window.Telegram = window.Telegram || {};
      Object.defineProperty(window.Telegram, 'WebApp', {
        get: () => mockWebApp,
        set: () => {},
        configurable: false,
        enumerable: true
      });
    })();
  `;
}

export async function applyTelegramMock(page: Page, options: TelegramMockOptions = {}) {
  // Перехватываем внешний скрипт телеграма, чтобы не делать лишний сетевой запрос
  await page.route('**/*telegram-web-app.js*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: '/* Telegram WebApp script mocked by Playwright */'
    });
  });

  const script = createTelegramMockScript(options);
  await page.addInitScript(script);
}
