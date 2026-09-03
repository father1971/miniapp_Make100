import React, { useState } from 'react';
import { User, X } from 'lucide-react';
import { UserStats } from '../api';
import { TranslationData, Language } from '../translations';

export interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats | null;
  tgUser: any | null;
  language: Language;
  t: TranslationData | any;
  solvedCount: number;
  unsolvedCount: number;
  totalSolveTime: number;
  bestTimeMs: number | null;
  minCharacters: number | null;
  formatBestTime: (timeMs: number | null | undefined, t?: any) => string;
  formatTotalPlayTime: (timeMs: number | null | undefined, t?: any) => string;
  formatRegistrationDate: (timestamp: number | null | undefined, lang: string, t?: any) => string;
  handleInviteFriend: () => void;
  playSound: (type: 'click' | 'success' | 'error' | 'skip') => void;
  playVibration: (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => void;
}

export function UserProfile({
  isOpen,
  onClose,
  stats,
  tgUser,
  language,
  t,
  solvedCount,
  unsolvedCount,
  totalSolveTime,
  bestTimeMs,
  minCharacters,
  formatBestTime,
  formatTotalPlayTime,
  formatRegistrationDate,
  handleInviteFriend,
  playSound,
  playVibration
}: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'referral'>('stats');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white h-screen w-screen overflow-y-auto animate-fade-in select-none">
      
      {/* Native Top Bar */}
      <div 
        className="sticky top-0 z-10 w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-900/80 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md"
        style={{
          paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 12px)'
        }}
      >
        <button 
          onClick={() => {
            onClose();
          }}
          className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300/40 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition-transform cursor-pointer"
        >
          ⬅️ {t.back || 'Назад'}
        </button>
        <h1 className="text-base font-black tracking-wider uppercase text-orange-500">
          {t.playerProfile || 'Профиль игрока'}
        </h1>
      </div>

      <div className="p-4 pb-12 w-full max-w-md mx-auto">
        {/* Horizontal Avatar Block */}
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-900/80 shadow-sm">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-full overflow-hidden border-2 border-orange-500 shadow-lg shadow-orange-500/20">
            {((stats as any)?.avatarUrl || tgUser?.photo_url) ? (
              <img src={(stats as any)?.avatarUrl || tgUser?.photo_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white font-black text-2xl sm:text-3xl">
                {String((stats as any)?.firstName || tgUser?.first_name || 'U').toUpperCase().charAt(0)}
              </div>
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
              {(stats as any)?.firstName || tgUser?.first_name || t.player} {(stats as any)?.lastName || tgUser?.last_name || ''}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              @{ (stats as any)?.username || tgUser?.username || 'user' }
            </p>
          </div>
        </div>

        {/* Compact Stats Bar */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {/* Rating */}
          <div className="py-3 px-1 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-900/80 flex flex-col items-center justify-center text-center">
            <span className="text-xl mb-1">🏆</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100">
              {(stats as any)?.score || 0}
            </span>
          </div>
          
          {/* Solved */}
          <div className="py-3 px-1 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-900/80 flex flex-col items-center justify-center text-center">
            <span className="text-xl mb-1">✅</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100">
              {(stats as any)?.solvedCount ?? solvedCount}
            </span>
          </div>

          {/* Coins */}
          <div className="py-3 px-1 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-900/80 flex flex-col items-center justify-center text-center">
            <span className="text-xl mb-1">🪙</span>
            <span className="text-lg font-black text-amber-500 dark:text-amber-400">
              {(stats as any)?.coins || 0}
            </span>
          </div>

          {/* Hints */}
          <div className="py-3 px-1 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-900/80 flex flex-col items-center justify-center text-center">
            <span className="text-xl mb-1">💡</span>
            <span className="text-lg font-black text-blue-500 dark:text-blue-400">
              {(stats as any)?.hintsCount || 0}
            </span>
          </div>
        </div>

        {/* Segmented Tab Switch */}
        <div className="mt-6 flex bg-slate-200/60 dark:bg-slate-900 p-1 rounded-2xl border border-slate-300/40 dark:border-slate-800">
          <button 
            onClick={() => { setActiveTab('stats'); playSound('click'); playVibration('light'); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'stats' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
          >
            📊 {t.stats || 'Статистика'}
          </button>
          <button 
            onClick={() => { setActiveTab('referral'); playSound('click'); playVibration('light'); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'referral' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
          >
            👥 {t.referral || 'Приглашения'}
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'stats' ? (
            <div className="animate-fade-in">
              {/* Speed / Brevity Records */}
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
                🏆 {t.personalRecords || 'Личные рекорды'}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-900/80">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">
                    {t.lightningSpeed || 'Молния (Время)'}
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">
                    ⏱️ {formatBestTime((stats as any)?.bestTimeMs ?? bestTimeMs, t)}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-900/80">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">
                    {t.brevityChars || 'Краткость (Символы)'}
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">
                    ✍️ {((stats as any)?.minCharacters ?? minCharacters) ? `${(stats as any)?.minCharacters ?? minCharacters} ${t.charsShort || 'симв.'}` : (t.noRecord || 'Нет рекорда')}
                  </span>
                </div>
              </div>

              {/* Game Analytics */}
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
                📊 {t.gameAnalytics || 'Игровая аналитика'}
              </h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-900/80 space-y-3">
                
                <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/40 dark:border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🎮</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {t.sessionsPlayed || 'Сыграно сессий'}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-white">
                    {stats?.gamesStarted !== undefined ? stats.gamesStarted : 0}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">{t.solvedSkipped || 'Решено / Пропущено:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ✅ {(stats as any)?.solvedCount ?? solvedCount} <span className="text-slate-300 dark:text-slate-700 mx-1">|</span> ❌ {(stats as any)?.skippedCount ?? (stats as any)?.unsolvedCount ?? unsolvedCount ?? 0}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">{t.thinkingTime || 'Время размышлений:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatTotalPlayTime((stats as any)?.totalTimeMs ?? totalSolveTime, t)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t.firstGameDate || 'Дата первой игры:'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    📅 {formatRegistrationDate((stats as any)?.createdAt, language, t)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="p-4 bg-gradient-to-br from-slate-50 to-orange-50/20 dark:from-slate-900/40 dark:to-orange-950/10 rounded-2xl border border-orange-100 dark:border-orange-900/30 space-y-4">
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t.friendsInvited || 'Приглашено друзей:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {(stats as any)?.referralCount || 0} {t.peopleShort || 'чел.'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                  <span className="text-slate-500 dark:text-slate-400">{t.bonusesEarned || 'Получено бонусов:'}</span>
                  <span className="font-extrabold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                    🪙 +{((stats as any)?.referralCount || 0) * 500} {t.coinsCount || 'монет'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                  {t.referralPromoP1 || 'Позови друга в игру! Ты получишь'} <span className="font-bold text-orange-500">500 {t.coinsCount || 'монет'}</span>{t.referralPromoP2 || ', а друг —'} <span className="font-bold text-orange-500">250 {t.coinsCount || 'монет'}</span> {t.referralPromoP3 || 'приветственного бонуса!'}
                </p>

                <button
                  onClick={handleInviteFriend}
                  className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 text-white font-black text-sm rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🚀</span> {t.inviteFriendBtn || 'Пригласить друга'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
