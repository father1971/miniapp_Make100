import { Page, expect } from '@playwright/test';

/**
 * Валидатор верстки и адаптивности:
 * - Проверяет отсутствие нежелательного горизонтального скролла на мобильных
 * - Проверяет видимость и доступность интерактивных элементов
 */

export async function checkNoHorizontalOverflow(page: Page, description: string = '') {
  const overflow = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    const bodyWidth = document.body.scrollWidth;
    const maxScroll = Math.max(docWidth, bodyWidth);

    // Допускаем 2px погрешности из-за субпиксельного рендеринга
    const hasHorizontalOverflow = maxScroll > winWidth + 2;

    return {
      hasHorizontalOverflow,
      maxScroll,
      winWidth,
      diff: maxScroll - winWidth,
    };
  });

  expect(
    overflow.hasHorizontalOverflow,
    `Horizontal overflow detected ${description}: scrollWidth (${overflow.maxScroll}px) > innerWidth (${overflow.winWidth}px) by ${overflow.diff}px`
  ).toBe(false);
}

export async function checkElementWithinViewport(page: Page, selector: string) {
  const isWithin = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, selector);

  expect(isWithin, `Element ${selector} is not within viewport boundaries`).toBe(true);
}
