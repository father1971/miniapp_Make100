import re

translations = {
    'ru': {
        'empty': 'Пусто',
        'youAreOnRank': 'Вы на {rank} месте со своими {score} очками',
        'playRoundToEnter': 'Сыграйте раунд, чтобы войти в рейтинг!',
        'earnedRatingPoints': 'очков рейтинга!',
        'perfectSolution': 'Идеальное решение!',
        'perfectSolutionDesc': 'Вы нашли самый лаконичный путь! Бот в шоке и снимает шляпу! 🎩🤖',
        'botIsJealous': 'Бот кусает локти...',
        'botCanSolveFasterP1': 'А ведь этот пример можно решить всего за ',
        'botCanSolveFasterP2': ' знака(ов)! Хотите узнать как?',
        'viewSolution': 'Посмотреть решение',
        'ratingXp': 'Рейтинг (XP)',
    },
    'en': {
        'empty': 'Empty',
        'youAreOnRank': 'You are rank {rank} with {score} points',
        'playRoundToEnter': 'Play a round to enter the leaderboard!',
        'earnedRatingPoints': 'rating points!',
        'perfectSolution': 'Perfect solution!',
        'perfectSolutionDesc': 'You found the most concise path! The bot is shocked and tips its hat! 🎩🤖',
        'botIsJealous': 'The bot is jealous...',
        'botCanSolveFasterP1': 'This puzzle can be solved in just ',
        'botCanSolveFasterP2': ' sign(s)! Want to know how?',
        'viewSolution': 'View solution',
        'ratingXp': 'Rating (XP)',
    },
    'de': {
        'empty': 'Leer',
        'youAreOnRank': 'Du bist auf Platz {rank} mit {score} Punkten',
        'playRoundToEnter': 'Spiele eine Runde, um in die Rangliste zu kommen!',
        'earnedRatingPoints': 'Ranglistenpunkte!',
        'perfectSolution': 'Perfekte Lösung!',
        'perfectSolutionDesc': 'Du hast den kürzesten Weg gefunden! Der Bot ist schockiert und zieht den Hut! 🎩🤖',
        'botIsJealous': 'Der Bot ist eifersüchtig...',
        'botCanSolveFasterP1': 'Dieses Rätsel kann in nur ',
        'botCanSolveFasterP2': ' Zeichen gelöst werden! Willst du wissen wie?',
        'viewSolution': 'Lösung ansehen',
        'ratingXp': 'Rang (XP)',
    },
    'fr': {
        'empty': 'Vide',
        'youAreOnRank': 'Vous êtes au rang {rank} avec {score} points',
        'playRoundToEnter': 'Jouez une partie pour entrer dans le classement !',
        'earnedRatingPoints': 'points de classement !',
        'perfectSolution': 'Solution parfaite !',
        'perfectSolutionDesc': 'Vous avez trouvé le chemin le plus concis ! Le bot est choqué et tire son chapeau ! 🎩🤖',
        'botIsJealous': 'Le bot est jaloux...',
        'botCanSolveFasterP1': 'Ce puzzle peut être résolu en seulement ',
        'botCanSolveFasterP2': ' signe(s) ! Voulez-vous savoir comment ?',
        'viewSolution': 'Voir la solution',
        'ratingXp': 'Classement (XP)',
    },
    'es': {
        'empty': 'Vacío',
        'youAreOnRank': 'Estás en el puesto {rank} con {score} puntos',
        'playRoundToEnter': '¡Juega una ronda para entrar en la clasificación!',
        'earnedRatingPoints': 'puntos de clasificación!',
        'perfectSolution': '¡Solución perfecta!',
        'perfectSolutionDesc': '¡Has encontrado el camino más conciso! ¡El bot está en shock y se quita el sombrero! 🎩🤖',
        'botIsJealous': 'El bot está celoso...',
        'botCanSolveFasterP1': '¡Este acertijo se puede resolver en solo ',
        'botCanSolveFasterP2': ' signo(s)! ¿Quieres saber cómo?',
        'viewSolution': 'Ver solución',
        'ratingXp': 'Rango (XP)',
    },
    'it': {
        'empty': 'Vuoto',
        'youAreOnRank': 'Sei al grado {rank} con {score} punti',
        'playRoundToEnter': 'Gioca una partita per entrare in classifica!',
        'earnedRatingPoints': 'punti classifica!',
        'perfectSolution': 'Soluzione perfetta!',
        'perfectSolutionDesc': 'Hai trovato il percorso più conciso! Il bot è scioccato e si toglie il cappello! 🎩🤖',
        'botIsJealous': 'Il bot è geloso...',
        'botCanSolveFasterP1': 'Questo puzzle può essere risolto in soli ',
        'botCanSolveFasterP2': ' segni! Vuoi sapere come?',
        'viewSolution': 'Vedi soluzione',
        'ratingXp': 'Classifica (XP)',
    },
    'pt': {
        'empty': 'Vazio',
        'youAreOnRank': 'Você está na posição {rank} com {score} pontos',
        'playRoundToEnter': 'Jogue uma rodada para entrar no placar!',
        'earnedRatingPoints': 'pontos de classificação!',
        'perfectSolution': 'Solução perfeita!',
        'perfectSolutionDesc': 'Você encontrou o caminho mais conciso! O bot está chocado e tira o chapéu! 🎩🤖',
        'botIsJealous': 'O bot está com ciúmes...',
        'botCanSolveFasterP1': 'Este enigma pode ser resolvido em apenas ',
        'botCanSolveFasterP2': ' sinal(is)! Quer saber como?',
        'viewSolution': 'Ver solução',
        'ratingXp': 'Classificação (XP)',
    },
    'tr': {
        'empty': 'Boş',
        'youAreOnRank': '{score} puanla {rank}. sıradasınız',
        'playRoundToEnter': 'Skor tablosuna girmek için bir tur oynayın!',
        'earnedRatingPoints': 'derece puanı!',
        'perfectSolution': 'Mükemmel çözüm!',
        'perfectSolutionDesc': 'En kısa yolu buldunuz! Bot şokta ve şapkasını çıkarıyor! 🎩🤖',
        'botIsJealous': 'Bot kıskandı...',
        'botCanSolveFasterP1': 'Bu bulmaca sadece ',
        'botCanSolveFasterP2': ' işaretle çözülebilir! Nasıl olduğunu bilmek ister misiniz?',
        'viewSolution': 'Çözümü gör',
        'ratingXp': 'Derece (XP)',
    },
    'ar': {
        'empty': 'فارغ',
        'youAreOnRank': 'أنت في المرتبة {rank} برصيد {score} نقطة',
        'playRoundToEnter': 'العب جولة لدخول قائمة المتصدرين!',
        'earnedRatingPoints': 'نقطة تصنيف!',
        'perfectSolution': 'حل مثالي!',
        'perfectSolutionDesc': 'لقد وجدت المسار الأكثر إيجازًا! الروبوت في حالة صدمة ويرفع قبعته! 🎩🤖',
        'botIsJealous': 'الروبوت يشعر بالغيرة...',
        'botCanSolveFasterP1': 'يمكن حل هذا اللغز في ',
        'botCanSolveFasterP2': ' علامة/علامات فقط! هل تريد أن تعرف كيف؟',
        'viewSolution': 'عرض الحل',
        'ratingXp': 'التصنيف (XP)',
    },
    'he': {
        'empty': 'רֵיק',
        'youAreOnRank': 'אתה במקום {rank} עם {score} נקודות',
        'playRoundToEnter': 'שחק סיבוב כדי להיכנס לטבלת המובילים!',
        'earnedRatingPoints': 'נקודות דירוג!',
        'perfectSolution': 'פתרון מושלם!',
        'perfectSolutionDesc': 'מצאת את הדרך התמציתית ביותר! הבוט בהלם ומסיר את כובעו! 🎩🤖',
        'botIsJealous': 'הבוט מקנא...',
        'botCanSolveFasterP1': 'אפשר לפתור את הפאזל הזה ב-',
        'botCanSolveFasterP2': ' סימנים בלבד! רוצה לדעת איך?',
        'viewSolution': 'צפה בפתרון',
        'ratingXp': 'דירוג (XP)',
    },
    'hi': {
        'empty': 'खाली',
        'youAreOnRank': 'आप {score} अंकों के साथ {rank} रैंक पर हैं',
        'playRoundToEnter': 'लीडरबोर्ड में प्रवेश करने के लिए एक राउंड खेलें!',
        'earnedRatingPoints': 'रैंक अंक!',
        'perfectSolution': 'सही समाधान!',
        'perfectSolutionDesc': 'आपने सबसे संक्षिप्त रास्ता ढूंढ लिया है! बॉट सदमे में है और अपनी टोपी उतारता है! 🎩🤖',
        'botIsJealous': 'बॉट जल रहा है...',
        'botCanSolveFasterP1': 'यह पहेली केवल ',
        'botCanSolveFasterP2': ' चिह्नों में हल की जा सकती है! जानना चाहते हैं कैसे?',
        'viewSolution': 'समाधान देखें',
        'ratingXp': 'रैंकिंग (XP)',
    },
    'zh': {
        'empty': '空',
        'youAreOnRank': '您以 {score} 分排在第 {rank} 名',
        'playRoundToEnter': '玩一局以进入排行榜！',
        'earnedRatingPoints': '排行榜积分！',
        'perfectSolution': '完美解答！',
        'perfectSolutionDesc': '你找到了最简洁的路径！机器人惊呆了，脱帽致敬！🎩🤖',
        'botIsJealous': '机器人嫉妒了...',
        'botCanSolveFasterP1': '这个谜题只需 ',
        'botCanSolveFasterP2': ' 个符号就能解决！想知道怎么做吗？',
        'viewSolution': '查看解答',
        'ratingXp': '排名 (XP)',
    },
    'ja': {
        'empty': '空',
        'youAreOnRank': 'あなたは{score}ポイントで{rank}位です',
        'playRoundToEnter': 'ラウンドをプレイしてリーダーボードに参加しよう！',
        'earnedRatingPoints': 'ランキングポイント！',
        'perfectSolution': '完璧な解決策！',
        'perfectSolutionDesc': '最も簡潔な道を見つけました！ボットはショックを受けて帽子を脱ぎます！🎩🤖',
        'botIsJealous': 'ボットは嫉妬しています...',
        'botCanSolveFasterP1': 'このパズルはたった ',
        'botCanSolveFasterP2': ' 個の記号で解決できます！方法を知りたいですか？',
        'viewSolution': '解決策を見る',
        'ratingXp': 'ランク (XP)',
    },
    'ko': {
        'empty': '비어 있음',
        'youAreOnRank': '귀하는 {score}점으로 {rank}위입니다',
        'playRoundToEnter': '라운드를 플레이하여 순위표에 진입하세요!',
        'earnedRatingPoints': '순위 포인트!',
        'perfectSolution': '완벽한 해결책!',
        'perfectSolutionDesc': '가장 간결한 경로를 찾았습니다! 봇이 충격을 받고 모자를 벗습니다! 🎩🤖',
        'botIsJealous': '봇이 질투합니다...',
        'botCanSolveFasterP1': '이 퍼즐은 단 ',
        'botCanSolveFasterP2': ' 개의 기호로 풀 수 있습니다! 방법을 알고 싶으신가요?',
        'viewSolution': '해결책 보기',
        'ratingXp': '순위 (XP)',
    },
    'la': {
        'empty': 'Inane',
        'youAreOnRank': 'In gradu {rank} es cum {score} punctis',
        'playRoundToEnter': 'Lude ut in tabulam ducum intres!',
        'earnedRatingPoints': 'puncta gradus!',
        'perfectSolution': 'Solutio perfecta!',
        'perfectSolutionDesc': 'Viam brevissimam invenisti! Machina stupet et petasum tollit! 🎩🤖',
        'botIsJealous': 'Machina invidet...',
        'botCanSolveFasterP1': 'Hoc aenigma in solis ',
        'botCanSolveFasterP2': ' signis solvi potest! Visne scire quomodo?',
        'viewSolution': 'Vide solutionem',
        'ratingXp': 'Gradus (XP)',
    },
    'eo': {
        'empty': 'Malplena',
        'youAreOnRank': 'Vi estas en rango {rank} kun {score} poentoj',
        'playRoundToEnter': 'Ludu rondon por eniri la gvidtabulon!',
        'earnedRatingPoints': 'rangaj poentoj!',
        'perfectSolution': 'Perfekta solvo!',
        'perfectSolutionDesc': 'Vi trovis la plej koncizan vojon! La roboto estas ŝokita kaj demetas sian ĉapelon! 🎩🤖',
        'botIsJealous': 'La roboto ĵaluzas...',
        'botCanSolveFasterP1': 'Ĉi tiu enigmo povas esti solvita per nur ',
        'botCanSolveFasterP2': ' signo(j)! Ĉu vi volas scii kiel?',
        'viewSolution': 'Vidi solvon',
        'ratingXp': 'Rango (XP)',
    },
    'elvish': {
        'empty': 'Lusta',
        'youAreOnRank': 'Nalyë ranko {rank} as {score} panti',
        'playRoundToEnter': 'Tyala rondo an tuler i cundu-pano!',
        'earnedRatingPoints': 'cundu panti!',
        'perfectSolution': 'Mára tië!',
        'perfectSolutionDesc': 'Hirnelyë i sinta tië! I hyalma ëa marya!',
        'botIsJealous': 'I hyalma ëa marya...',
        'botCanSolveFasterP1': 'Lerya sina as er ',
        'botCanSolveFasterP2': ' tengwi! Merilyë ista manen?',
        'viewSolution': 'Tira tië',
        'ratingXp': 'Cundu (XP)',
    },
    'klingon': {
        'empty': 'ChIm',
        'youAreOnRank': 'batlh {score} mI\' {rank} jer',
        'playRoundToEnter': 'Quj yIqem!',
        'earnedRatingPoints': 'batlh mI\'!',
        'perfectSolution': 'pItlh!',
        'perfectSolutionDesc': 'yIn nI\' yISIQ! tlhIngan maH!',
        'botIsJealous': 'qoH rur...',
        'botCanSolveFasterP1': 'neH ',
        'botCanSolveFasterP2': ' mI\' ghap! chay\'?',
        'viewSolution': 'mI\' yIlaD',
        'ratingXp': 'batlh (XP)',
    },
    'dothraki': {
        'empty': 'Vos',
        'youAreOnRank': 'Yer {rank} as {score} hos',
        'playRoundToEnter': 'Dothras anha khalasar!',
        'earnedRatingPoints': 'hos!',
        'perfectSolution': 'Zhey dothras!',
        'perfectSolutionDesc': "Yer dothras k'athjilari! Khal ëa marya!",
        'botIsJealous': 'Khal ëa marya...',
        'botCanSolveFasterP1': 'Idrik as er ',
        'botCanSolveFasterP2': ' vezh! Hash yer dothras?',
        'viewSolution': 'Tira dothras',
        'ratingXp': 'Khal (XP)',
    },
    'valyrian': {
        'empty': 'Daor',
        'youAreOnRank': 'Ao issi {rank} syt {score} gēlenka',
        'playRoundToEnter': 'Sōvegon arlī zaldrīzes!',
        'earnedRatingPoints': 'gēlenka!',
        'perfectSolution': 'Keligon sōvegon!',
        'perfectSolutionDesc': 'Ao rhaenagon iōr sōvegon! Zaldrīzes ëa marya!',
        'botIsJealous': 'Zaldrīzes ëa marya...',
        'botCanSolveFasterP1': 'Keligon syt ',
        'botCanSolveFasterP2': ' tegun! Skoros?',
        'viewSolution': 'Rūklon keligon',
        'ratingXp': 'Morghon (XP)',
    }
}

with open('src/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if 'empty: string;' not in content:
    content = content.replace(
        '  authorizingTg: string;',
        """  authorizingTg: string;
  empty: string;
  youAreOnRank: string;
  playRoundToEnter: string;
  earnedRatingPoints: string;
  perfectSolution: string;
  perfectSolutionDesc: string;
  botIsJealous: string;
  botCanSolveFasterP1: string;
  botCanSolveFasterP2: string;
  viewSolution: string;
  ratingXp: string;"""
    )

for lang, data in translations.items():
    new_keys_str = ", ".join([f"{k}: \"{v}\"" for k, v in data.items()])
    
    pattern = re.compile(r'(\s+)sessionsPlayed:\s*"([^"]+)",')
    
    def repl(m):
        return f"{m.group(0)}{m.group(1)}{new_keys_str},"
    
    parts = content.split(f'  {lang}: {{')
    if len(parts) > 1:
        parts[1] = pattern.sub(repl, parts[1], count=1)
        content = f'  {lang}: {{'.join(parts)

with open('src/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)
