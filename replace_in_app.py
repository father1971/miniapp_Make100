import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (r"⬅️ Назад", r"⬅️ {t.back || 'Назад'}"),
    (r"Зал славы", r"{t.leaderboard || 'Зал славы'}"),
    (r">Пусто<", r">{t.empty || 'Пусто'}<"),
    (r"`Вы на \${myRank} месте со своими \${.*?\.score \|\| 0} очками`", r"(t.youAreOnRank ? t.youAreOnRank.replace('{rank}', String(myRank)).replace('{score}', String((stats as any)?.score || 0)) : `Вы на ${myRank} месте со своими ${(stats as any)?.score || 0} очками`)"),
    (r'"Сыграйте раунд, чтобы войти в рейтинг!"', r"t.playRoundToEnter || 'Сыграйте раунд, чтобы войти в рейтинг!'"),
    (r"🏆 \+\{lastEarnedScore\} очков рейтинга!", r"🏆 +{lastEarnedScore} {t.earnedRatingPoints || 'очков рейтинга!'}"),
    (r"Идеальное решение!", r"{t.perfectSolution || 'Идеальное решение!'}"),
    (r"Вы нашли самый лаконичный путь! Бот в шоке и снимает шляпу! 🎩🤖", r"{t.perfectSolutionDesc || 'Вы нашли самый лаконичный путь! Бот в шоке и снимает шляпу! 🎩🤖'}"),
    (r"Бот кусает локти\.\.\.", r"{t.botIsJealous || 'Бот кусает локти...'}"),
    (r'А ведь этот пример можно решить всего за <span className="font-bold text-amber-500 dark:text-amber-400">\{aiSignsCount\} знака\(ов\)</span>! Хотите узнать как\?', r'{t.botCanSolveFasterP1 || "А ведь этот пример можно решить всего за "}<span className="font-bold text-amber-500 dark:text-amber-400">{aiSignsCount} {t.botCanSolveFasterP2 || "знака(ов)! Хотите узнать как?"}</span>'),
    (r"👁️ Посмотреть решение", r"👁️ {t.viewSolution || 'Посмотреть решение'}"),
    (r"Рейтинг \(XP\)", r"{t.ratingXp || 'Рейтинг (XP)'}")
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
