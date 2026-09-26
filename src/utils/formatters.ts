import { TranslationData } from '../translations';

export const formatRegistrationDate = (
  timestamp: number | null | undefined,
  lang: string = 'ru',
  t?: TranslationData
): string => {
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

export const formatBestTime = (
  timeMs: number | null | undefined,
  t?: TranslationData
): string => {
  if (!timeMs) return t?.noRecord || 'Нет рекорда';
  return `${(timeMs / 1000).toFixed(2)} ${t?.secondsShort || 'сек'}`;
};

export const formatTotalPlayTime = (
  timeMs: number | null | undefined,
  t?: TranslationData
): string => {
  if (!timeMs) return `0 ${t?.secondsShort || 'сек'}`;
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes} ${t?.minutesShort || 'мин.'} ${seconds} ${t?.secondsShort || 'сек.'}`;
  }
  return `${seconds} ${t?.secondsShort || 'сек.'}`;
};

export const formatSolveTime = (
  timeMs: number | null | undefined,
  t?: TranslationData
): string => {
  const secStr = t?.secondsShort || 'сек.';
  const minStr = t?.minutesShort || 'мин.';
  if (!timeMs) return `0.0 ${secStr}`;
  const totalSeconds = timeMs / 1000;
  
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)} ${secStr}`;
  }
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedSeconds = seconds.toFixed(1);
  const paddedSeconds = seconds < 10 ? `0${formattedSeconds}` : formattedSeconds;
  
  return `${minutes} ${minStr} ${paddedSeconds} ${secStr}`;
};

export const getPlayerDisplayName = (
  player: { username?: string; firstName?: string },
  t?: TranslationData
): string => {
  if (player.username && player.username.trim() !== '') {
    return `@${player.username}`;
  }
  return player.firstName || (t?.player || 'Игрок');
};
