import { API_URL } from '../api';

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  landingUrl?: string;
  timestamp?: number;
}

const STORAGE_KEY = 'make100_utm_params';

/**
 * Извлечение UTM-меток и реферера из URL или сохраненных данных в хранилище
 */
export function getUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};

  try {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : hash);

    const sourceFromUrl = params.get('utm_source') || hashParams.get('utm_source') || params.get('ref') || params.get('from');
    const mediumFromUrl = params.get('utm_medium') || hashParams.get('utm_medium');
    const campaignFromUrl = params.get('utm_campaign') || hashParams.get('utm_campaign');
    const contentFromUrl = params.get('utm_content') || hashParams.get('utm_content');
    const termFromUrl = params.get('utm_term') || hashParams.get('utm_term');

    // Если в текущем URL есть UTM-метки, обновляем постоянное хранилище
    if (sourceFromUrl || mediumFromUrl || campaignFromUrl) {
      const freshParams: UtmParams = {
        utmSource: sourceFromUrl || undefined,
        utmMedium: mediumFromUrl || undefined,
        utmCampaign: campaignFromUrl || undefined,
        utmContent: contentFromUrl || undefined,
        utmTerm: termFromUrl || undefined,
        referrer: document.referrer || undefined,
        landingUrl: window.location.href,
        timestamp: Date.now(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(freshParams));
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(freshParams));
      } catch (e) {}
      return freshParams;
    }

    // Если в текущем URL меток нет, читаем ранее сохраненные из сессии / хранилища
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}

    // Если меток не было вообще, сохраняем хотя бы реферер
    const fallbackParams: UtmParams = {
      referrer: document.referrer || undefined,
      landingUrl: window.location.href,
      timestamp: Date.now(),
    };
    return fallbackParams;
  } catch (e) {
    return {};
  }
}

/**
 * Формирование ссылки на Telegram-бота с сохранением источника рекламы или реферера
 */
export function buildTelegramStartUrl(botUsername: string, actionTagOrReferrer: string = 'web'): string {
  // Если передан ID реферера (числовой или с префиксом ref_)
  const cleanReferrer = actionTagOrReferrer.replace(/^ref_/, '');
  if (/^\d+$/.test(cleanReferrer)) {
    return `https://t.me/${botUsername}?start=${cleanReferrer}`;
  }

  const utms = getUtmParams();
  const source = utms.utmSource ? utms.utmSource.replace(/[^a-zA-Z0-9_]/g, '') : 'direct';
  const campaign = utms.utmCampaign ? `_${utms.utmCampaign.replace(/[^a-zA-Z0-9_]/g, '')}` : '';
  
  // Telegram start параметр ограничен 64 символами a-zA-Z0-9_-
  const startParam = `${actionTagOrReferrer}_${source}${campaign}`.slice(0, 64);
  return `https://t.me/${botUsername}?start=${startParam}`;
}

/**
 * Кэш отправленных событий, чтобы не дублировать page_view в рамках одной сессии
 */
const sentEventsSet = new Set<string>();

export type AnalyticsEventType = 
  | 'page_view'
  | 'landing_visit'
  | 'funnel_telegram'
  | 'funnel_email_start'
  | 'funnel_email_code_sent'
  | 'funnel_email_success'
  | 'funnel_guest'
  | 'first_game_solve'
  | 'click_share';

/**
 * Отправка события сквозной аналитики на бэкенд
 */
export async function trackAnalyticsEvent(
  event: AnalyticsEventType | string,
  options: { once?: boolean; extraData?: Record<string, any> } = {}
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
        extraData: options.extraData,
        path: typeof window !== 'undefined' ? window.location.pathname : '/',
      }),
    });
  } catch (e) {
    // Ошибки аналитики никогда не блокируют работу интерфейса
    console.debug('Analytics send skipped:', e);
  }
}
