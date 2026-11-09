import { API_URL } from '../api';

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
}

/**
 * Извлечение UTM-меток и реферера из адресной строки и хэша браузера
 */
export function getUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : hash);

    return {
      utmSource: params.get('utm_source') || hashParams.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || hashParams.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || hashParams.get('utm_campaign') || undefined,
      utmContent: params.get('utm_content') || hashParams.get('utm_content') || undefined,
      utmTerm: params.get('utm_term') || hashParams.get('utm_term') || undefined,
      referrer: document.referrer || undefined,
    };
  } catch (e) {
    return {};
  }
}

/**
 * Кэш отправленных событий, чтобы не дублировать page_view в рамках одной сессии
 */
const sentEventsSet = new Set<string>();

/**
 * Отправка события аналитики на бэкенд
 */
export async function trackAnalyticsEvent(
  event: 'page_view' | 'click_play_web' | 'click_play_telegram',
  options: { once?: boolean } = {}
): Promise<void> {
  if (options.once && sentEventsSet.has(event)) {
    return;
  }
  sentEventsSet.add(event);

  try {
    const utms = getUtmParams();
    await fetch(`${API_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        ...utms,
        path: window.location.pathname,
      }),
    });
  } catch (e) {
    // Ошибки аналитики никогда не блокируют работу интерфейса
    console.debug('Analytics send skipped:', e);
  }
}
