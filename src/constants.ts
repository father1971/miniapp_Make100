export const GAME_MODES = {
  TICKETS: 'ticket',
  CAR: 'car',
} as const;

export type GameModeType = typeof GAME_MODES[keyof typeof GAME_MODES];

export const THEME_PREFERENCES = {
  AUTO: 'auto',
  DARK: 'dark',
  LIGHT: 'light',
} as const;

export type ThemePreferenceType = typeof THEME_PREFERENCES[keyof typeof THEME_PREFERENCES];

export const HINT_COST_COINS = 20;
export const REFERRAL_BONUS_COINS = 500;
export const REFERRAL_WELCOME_COINS = 250;
export const NEW_USER_COINS = 100;
export const DEFAULT_HINTS_COUNT = 3;

export const STORAGE_KEYS = {
  DEV_BYPASSED: 'make100_devBypassed',
  LANGUAGE: 'make100_lang',
  GAME_MODE: 'make100_gameMode',
  THEME_PREFERENCE: 'make100_theme_preference',
  SOUND: 'make100_sound',
  VIBRATION: 'make100_vibration',
  TG_USER: 'make100_tgUser',
  SAVE_BOT_DISMISSED: 'make100_save_bot_dismissed',
  ONBOARDING_SEEN: 'make100_tutorial_completed_v3',
  KV_IMAGES: 'make100_kv_images',
  KV_TICKETS: 'make100_kv_ticket_images',
  STATS_PREFIX: 'stats_',
  LAST_LOGGED_USER_ID: 'last_logged_user_id',
} as const;
