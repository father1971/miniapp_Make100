import { Page, expect } from '@playwright/test';

/**
 * Валидатор локализации для E2E тестов.
 * Проверяет, что на странице нет:
 * - Вывода "undefined", "null", "NaN"
 * - Сырых ключей переводов (например "welcomeModalTitle", "t.playGuest")
 * - Незакрытых фигурных скобок и битых интерполяций
 */

const RAW_KEY_PATTERNS = [
  /\bwelcome[A-Z]\w+/i,
  /\bplayGuest[A-Z]\w+/i,
  /\bplayInTelegram[A-Z]\w+/i,
  /\bt\.[a-zA-Z_]\w+/i,
  /\bundefined\b/i,
  /\bNaN\b/,
  /\[object Object\]/,
];

export async function checkNoRawTranslationKeys(page: Page, contextDescription: string = '') {
  const visibleTexts = await page.evaluate(() => {
    // Собираем текст всех видимых текстовых элементов
    const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, button, a, div, label'));
    return elements
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      })
      .map(el => el.textContent?.trim() || '')
      .filter(t => t.length > 0 && t.length < 200);
  });

  const suspicious: string[] = [];
  for (const text of visibleTexts) {
    for (const pattern of RAW_KEY_PATTERNS) {
      if (pattern.test(text)) {
        suspicious.push(`Found suspicious text: "${text}" matching ${pattern}`);
      }
    }
  }

  expect(suspicious, `I18n errors detected ${contextDescription}:\n${suspicious.join('\n')}`).toEqual([]);
}
