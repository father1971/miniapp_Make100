export interface ModeDetail {
  solvedCount?: number;
  skippedCount?: number;
  bestTimeMs: number | null;
  minCharacters: number | null;
  totalTimeMs?: number;
  totalCharacters?: number;
}

export interface UserSettings {
  currentMode?: 'tickets' | 'car';
  sound?: boolean;
  vibration?: boolean;
  theme?: 'auto' | 'dark' | 'light';
  language?: string;
  [key: string]: any;
}

export interface UserStats {
  id?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  score?: number;
  solvedCount?: number;
  skippedCount?: number;
  bestTimeMs?: number | null;
  minCharacters?: number | null;
  totalTimeMs?: number;
  totalCharacters?: number;
  coins?: number;
  hintsCount?: number;
  referredBy?: number | null;
  referralCount?: number;
  gamesStarted?: number;
  createdAt?: number;
  settings?: UserSettings;
  modeStats?: {
    tickets?: ModeDetail;
    car?: ModeDetail;
    [key: string]: any;
  };
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramWebApp {
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
  openTelegramLink?: (url: string) => void;
}

export interface LeaderboardResponse {
  leaderboard: UserStats[];
  myRank?: number;
  myScore?: number;
}

export interface GameSolvePayload {
  formula: string;
  digits: string[];
  elapsedTimeMs: number;
  gameMode: string;
}

export interface GameSkipPayload {
  gameMode: string;
}

export interface HintOperationResponse {
  success: boolean;
  coins?: number;
  hintsCount?: number;
  error?: string;
}

export interface RandomTicketResponse {
  imageUrl: string;
  category: string;
  categoryName: string;
}

export interface ImagePoolResponse {
  images?: string[];
  pool?: string[];
  [key: string]: any;
}
