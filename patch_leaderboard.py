import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Find the start of Leaderboard Modal
start_idx = content.find("{/* Leaderboard Modal */}\n      <AnimatePresence>")

if start_idx == -1:
    print("Could not find Leaderboard Modal start")
    exit(1)

# Find the end of Leaderboard Modal AnimatePresence
end_idx = content.find("      </AnimatePresence>\n\n      {/* Visual Block (Ticket or Car) */}")

if end_idx == -1:
    print("Could not find Leaderboard Modal end")
    exit(1)

# Extract the podium and list logic from the existing content
existing_modal = content[start_idx:end_idx]

podium_start = existing_modal.find("{/* Podium (Top 3) */}")
podium_end = existing_modal.find("{/* List 4-100 */}")

list_start = existing_modal.find("{/* List 4-100 */}")
list_end = existing_modal.find("                  </div>\n                )}\n              </div>")

if podium_start == -1 or list_start == -1:
    print("Could not find podium or list sections")
    exit(1)

podium_content = existing_modal[podium_start:podium_end]
# Let's adjust zinc to slate in podium_content
podium_content = podium_content.replace('zinc-50', 'slate-50')
podium_content = podium_content.replace('zinc-900', 'slate-900')
podium_content = podium_content.replace('zinc-950', 'slate-950')
podium_content = podium_content.replace('zinc-300', 'slate-300')
podium_content = podium_content.replace('zinc-200', 'slate-200')
podium_content = podium_content.replace('zinc-600', 'slate-600')
podium_content = podium_content.replace('zinc-700', 'slate-700')
podium_content = podium_content.replace('zinc-400', 'slate-400')
podium_content = podium_content.replace('zinc-800', 'slate-800')
podium_content = podium_content.replace('rounded-2xl', 'rounded-3xl').replace('border-slate-100 dark:border-slate-800/50', 'border-slate-200/60 dark:border-slate-800/60')

list_content = existing_modal[list_start:list_end]
list_content = list_content.replace('zinc-800', 'slate-800')
list_content = list_content.replace('zinc-100', 'slate-100')
list_content = list_content.replace('zinc-700', 'slate-700')
list_content = list_content.replace('zinc-400', 'slate-400')
list_content = list_content.replace('zinc-500', 'slate-500')
list_content = list_content.replace('zinc-200', 'slate-200')


new_modal = """{/* Leaderboard Modal */}
      <AnimatePresence>
        {isLeaderboardOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white h-screen w-screen overflow-hidden animate-fade-in select-none">
            {/* Нативная верхняя панель (идентичная Профилю и Настройкам) */}
            <div 
              className="sticky top-0 z-10 w-full max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-900/80 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md shrink-0"
              style={{
                paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 16px)'
              }}
            >
              {/* Кнопка назад */}
              <button 
                onClick={() => { setIsLeaderboardOpen(false); playSound('click'); playVibration('light'); }}
                className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300/40 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition-transform cursor-pointer"
              >
                ⬅️ Назад
              </button>
              <h1 className="text-base font-black tracking-wider uppercase text-orange-500">
                Зал славы
              </h1>
              <div className="w-16"></div> {/* Заглушка для идеальной центровки */}
            </div>

            {/* Внутренний контейнер скролла */}
            <div className="w-full max-w-md mx-auto flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 pb-28">
              {isLoadingLeaderboard ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 text-slate-400 dark:text-slate-500">
                  <RefreshCw size={36} className="animate-spin text-amber-500" />
                  <span className="text-sm font-bold tracking-wider uppercase">{t.loadingLeaderboard || 'Загрузка...'}</span>
                </div>
              ) : leaderboardData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 text-slate-400 dark:text-slate-500 font-medium">
                  <Trophy size={56} className="opacity-20" />
                  <span className="text-sm font-bold tracking-wider uppercase">{t.noData || 'Пока нет данных'}</span>
                </div>
              ) : (
                <>
                  """ + podium_content + """
                  """ + list_content + """
                </>
              )}
            </div>

            {/* Sticky Bottom Bar (My Result) */}
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200/60 dark:border-slate-900/80 flex justify-center items-center shrink-0 z-10">
              <div className="w-full max-w-sm bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg shadow-amber-500/20 transition-transform active:scale-98">
                <span className="font-bold text-sm sm:text-base">
                  {myRank > 0 ? (
                    `Вы на ${myRank} месте со своими ${(stats as any)?.score || 0} очками`
                  ) : (
                    "Сыграйте раунд, чтобы войти в рейтинг!"
                  )}
                </span>
                <Trophy size={20} className="opacity-80 animate-pulse" />
              </div>
            </div>

          </div>
        )}
"""

content = content[:start_idx] + new_modal + content[end_idx:]

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Patch applied")
