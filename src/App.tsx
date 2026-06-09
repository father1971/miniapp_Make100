import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Minus, X, Divide, RefreshCw, Delete, Play, Moon, Sun, Smartphone, Plane, Music, Film, Train, Bus, TramFront, CableCar, Star, CreditCard, Coins, User, Menu, Volume2, VolumeX, Vibrate, VibrateOff, Lightbulb, Trophy, Clock, Hash, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, OperationType, handleFirestoreError } from './firebase';
import { signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, getCountFromServer, where, deleteDoc } from 'firebase/firestore';

// Вставьте сюда ссылку на папку image_cars в вашем GitHub репозитории.
// Пример: 'https://github.com/ВАШ_ЛОГИН/ВАШ_РЕПОЗИТОРИЙ/tree/main/image_cars'
const GITHUB_FOLDER_URL: string = 'https://github.com/father1971/Cars_image';

const FALLBACK_IMAGES = [
  '/car1.jpg',
  '/car2.jpg',
  '/car3.jpg',
  '/car4.jpg'
];

const getLevelInfo = (solved: number) => {
  const milestones = [0, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
  let level = 1;
  let nextMilestone = milestones[1];
  let prevMilestone = milestones[0];
  
  for (let i = 0; i < milestones.length; i++) {
    if (solved >= milestones[i]) {
      level = i + 1;
      prevMilestone = milestones[i];
      nextMilestone = milestones[i + 1] || milestones[i];
    }
  }
  
  const progress = nextMilestone === prevMilestone ? 100 : ((solved - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
  
  return { level, nextMilestone, progress };
};

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
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
}

const TRANSLATIONS = {
  ru: {
    title: "Make100",
    player: "Игрок",
    gameMode: "Режим",
    car: "Автомобиль",
    ticket: "Билет",
    solved: "Решено",
    skipped: "Пропущено",
    operators: "Знаков",
    current: "Текущее",
    total: "Общее",
    theme: "Тема",
    language: "Язык",
    auto: "Авто",
    light: "Светлая",
    dark: "Темная",
    menu: "Меню",
    play: "Играть!",
    skipDemo: "Пропустить демо",
    demoTitle: "Как играть?",
    demo1: "Вам даны 6 случайных цифр",
    demo2: "Пустой промежуток объединяет их в числа",
    demo3: "Нажимайте на квадраты и выбирайте знаки",
    demo4: "Используйте +, -, *, / и скобки",
    demo5: "Соберите ровно 100!",
    soundAndVibration: "Звук и вибрация",
    sound: "Звук",
    vibration: "Вибро",
    tapGaps: "Нажимайте на промежутки и вставляйте знаки",
    skipTicket: "Пропустить билет",
    skipCar: "Пропустить номер",
    hint: "Подсказка",
    noSolution: "У этой комбинации нет решения",
    introText: "Соберите 100 из цифр на билете, используя математические знаки.",
    start: "Старт",
    perfect: "Идеально!",
    solvedIn: "Решено за:",
    operatorsUsed: "Использовано знаков:",
    nextTicket: "Следующий билет",
    nextCar: "Следующий номер",
    close: "Закрыть",
    leaderboard: "Рейтинг",
    topPlayers: "Лучшие игроки",
    loadingLeaderboard: "Загрузка рейтинга...",
    noData: "Пока нет данных",
    time: "Время",
    shareScore: "Поделиться",
    playAsGuest: "Играть как гость",
    tickets: {
      flight: { title: 'ПОСАДОЧНЫЙ ТАЛОН', subtitle: 'ПЕРВЫЙ КЛАСС', footerLeft: 'ГЕЙТ 14', footerRight: 'МЕСТО 2А' },
      concert: { title: 'LIVE КОНЦЕРТ', subtitle: 'VIP ДОСТУП', footerLeft: 'МИРОВОЙ ТУР', footerRight: 'РЯД 1' },
      cinema: { title: 'БИЛЕТ В КИНО', subtitle: 'НА ОДНОГО', footerLeft: 'РЯД F', footerRight: 'МЕСТО 12' },
      train: { title: 'ЭКСПРЕСС ПОЕЗД', subtitle: 'В ОДНУ СТОРОНУ', footerLeft: 'ПЛАТФОРМА 9', footerRight: 'ВАГОН 4' },
      'vintage-bus': { title: 'АВТОБУСНЫЙ БИЛЕТ', subtitle: 'СЕРИЯ АВ', footerLeft: 'КОНТРОЛЬНЫЙ', footerRight: 'БИЛЕТ' },
      'vintage-tram': { title: 'ТРАМВАЙ', subtitle: 'РАЗОВЫЙ', footerLeft: 'БЕЗ КОМПОСТЕРА', footerRight: 'НЕДЕЙСТВИТЕЛЕН' },
      'soviet-trolleybus': { title: 'ТРОЛЛЕЙБУС', subtitle: 'ГОРТРАНС', footerLeft: 'СОХРАНЯТЬ ДО', footerRight: 'КОНЦА ПОЕЗДКИ' },
      'golden-ticket': { title: 'ЗОЛОТОЙ БИЛЕТ', subtitle: 'СЧАСТЛИВЧИК', footerLeft: 'ПРОПУСК 1', footerRight: 'ТУР НА ФАБРИКУ' },
      'metro-pass': { title: 'ПРОЕЗДНОЙ', subtitle: 'НА МЕСЯЦ', footerLeft: 'ЗОНА 1-3', footerRight: 'БЕЗЛИМИТ' },
      lottery: { title: 'ЛОТЕРЕЙНЫЙ БИЛЕТ', subtitle: 'ДЖЕКПОТ', footerLeft: 'ДАТА РОЗЫГРЫША', footerRight: 'СЕГОДНЯ' }
    }
  },
  en: {
    title: "Make100",
    player: "Player",
    gameMode: "Mode",
    car: "Car",
    ticket: "Ticket",
    solved: "Solved",
    skipped: "Skipped",
    operators: "Operators",
    current: "Current",
    total: "Total",
    theme: "Theme",
    language: "Language",
    auto: "Auto",
    light: "Light",
    dark: "Dark",
    menu: "Menu",
    play: "Play!",
    skipDemo: "Skip demo",
    demoTitle: "How to play?",
    demo1: "You are given 6 random digits",
    demo2: "An empty gap combines them into numbers",
    demo3: "Tap the squares and choose operators",
    demo4: "Use +, -, *, / and brackets",
    demo5: "Make exactly 100!",
    soundAndVibration: "Sound & Vibration",
    sound: "Sound",
    vibration: "Vibration",
    tapGaps: "Tap the gaps and insert operators",
    skipTicket: "Skip ticket",
    skipCar: "Skip car",
    hint: "Hint",
    noSolution: "No solution exists for this combination",
    introText: "Make 100 from the digits on the ticket using mathematical operators.",
    start: "Start",
    perfect: "Perfect!",
    solvedIn: "Solved in:",
    operatorsUsed: "Operators used:",
    nextTicket: "Next ticket",
    nextCar: "Next car",
    close: "Close",
    leaderboard: "Leaderboard",
    topPlayers: "Top Players",
    loadingLeaderboard: "Loading leaderboard...",
    noData: "No data yet",
    time: "Time",
    shareScore: "Share",
    playAsGuest: "Play as guest",
    tickets: {
      flight: { title: 'BOARDING PASS', subtitle: 'FIRST CLASS', footerLeft: 'GATE 14', footerRight: 'SEAT 2A' },
      concert: { title: 'LIVE CONCERT', subtitle: 'VIP ACCESS', footerLeft: 'WORLD TOUR', footerRight: 'ROW 1' },
      cinema: { title: 'CINEMA TICKET', subtitle: 'ADMIT ONE', footerLeft: 'ROW F', footerRight: 'SEAT 12' },
      train: { title: 'EXPRESS TRAIN', subtitle: 'ONE WAY', footerLeft: 'PLATFORM 9', footerRight: 'CARRIAGE 4' },
      'vintage-bus': { title: 'BUS TICKET', subtitle: 'SERIES AB', footerLeft: 'CONTROL', footerRight: 'TICKET' },
      'vintage-tram': { title: 'TRAM', subtitle: 'SINGLE', footerLeft: 'WITHOUT PUNCH', footerRight: 'INVALID' },
      'soviet-trolleybus': { title: 'TROLLEYBUS', subtitle: 'CITY TRANSIT', footerLeft: 'KEEP UNTIL', footerRight: 'END OF TRIP' },
      'golden-ticket': { title: 'GOLDEN TICKET', subtitle: 'LUCKY WINNER', footerLeft: 'ADMIT 1', footerRight: 'FACTORY TOUR' },
      'metro-pass': { title: 'METRO PASS', subtitle: 'MONTHLY', footerLeft: 'ZONE 1-3', footerRight: 'UNLIMITED' },
      lottery: { title: 'LOTTERY TICKET', subtitle: 'JACKPOT', footerLeft: 'DRAW DATE', footerRight: 'TODAY' }
    }
  },
  de: {
    title: "Make100",
    player: "Spieler",
    gameMode: "Modus",
    car: "Auto",
    ticket: "Ticket",
    solved: "Gelöst",
    skipped: "Übersprungen",
    operators: "Zeichen",
    current: "Aktuell",
    total: "Gesamt",
    theme: "Thema",
    language: "Sprache",
    auto: "Auto",
    light: "Hell",
    dark: "Dunkel",
    menu: "Menü",
    play: "Spielen!",
    skipDemo: "Demo überspringen",
    demoTitle: "Spielanleitung?",
    demo1: "Sie erhalten 6 zufällige Ziffern",
    demo2: "Eine Lücke verbindet sie zu Zahlen",
    demo3: "Tippen Sie auf Quadrate und wählen Sie Zeichen",
    demo4: "Verwenden Sie +, -, *, / und Klammern",
    demo5: "Erreichen Sie genau 100!",
    soundAndVibration: "Ton & Vibration",
    sound: "Ton",
    vibration: "Vibration",
    tapGaps: "Tippen Sie auf die Lücken und fügen Sie Zeichen ein",
    skipTicket: "Ticket überspringen",
    skipCar: "Auto überspringen",
    hint: "Tipp",
    noSolution: "Für diese Kombination gibt es keine Lösung",
    introText: "Erreichen Sie 100 aus den Ziffern auf dem Ticket mit mathematischen Zeichen.",
    start: "Start",
    perfect: "Perfekt!",
    solvedIn: "Gelöst in:",
    operatorsUsed: "Verwendete Zeichen:",
    nextTicket: "Nächstes Ticket",
    nextCar: "Nächstes Auto",
    close: "Schließen",
    leaderboard: "Rangliste",
    topPlayers: "Beste Spieler",
    loadingLeaderboard: "Rangliste wird geladen...",
    noData: "Noch keine Daten",
    time: "Zeit",
    shareScore: "Teilen",
    tickets: {
      flight: { title: 'BORDKARTE', subtitle: 'ERSTE KLASSE', footerLeft: 'GATE 14', footerRight: 'SITZ 2A' },
      concert: { title: 'LIVE-KONZERT', subtitle: 'VIP-ZUGANG', footerLeft: 'WELTTOURNEE', footerRight: 'REIHE 1' },
      cinema: { title: 'KINOKARTE', subtitle: 'EINTRITT EINS', footerLeft: 'REIHE F', footerRight: 'SITZ 12' },
      train: { title: 'EXPRESSZUG', subtitle: 'EINFACHE FAHRT', footerLeft: 'GLEIS 9', footerRight: 'WAGEN 4' },
      'vintage-bus': { title: 'BUSFAHRKARTE', subtitle: 'SERIE AB', footerLeft: 'KONTROLLE', footerRight: 'TICKET' },
      'vintage-tram': { title: 'STRASSENBAHN', subtitle: 'EINZELFAHRT', footerLeft: 'OHNE ENTWERTUNG', footerRight: 'UNGÜLTIG' },
      'soviet-trolleybus': { title: 'OBUS', subtitle: 'STADTVERKEHR', footerLeft: 'BEHALTEN BIS', footerRight: 'FAHRTENDE' },
      'golden-ticket': { title: 'GOLDENES TICKET', subtitle: 'GLÜCKLICHER GEWINNER', footerLeft: 'EINTRITT 1', footerRight: 'FABRIKTOUR' },
      'metro-pass': { title: 'U-BAHN-PASS', subtitle: 'MONATLICH', footerLeft: 'ZONE 1-3', footerRight: 'UNBEGRENZT' },
      lottery: { title: 'LOTTERIELOS', subtitle: 'JACKPOT', footerLeft: 'ZIEHUNGSDATUM', footerRight: 'HEUTE' }
    }
  },
  fr: {
    title: "Make100",
    player: "Joueur",
    gameMode: "Mode",
    car: "Voiture",
    ticket: "Billet",
    solved: "Résolu",
    skipped: "Passé",
    operators: "Signes",
    current: "Actuel",
    total: "Total",
    theme: "Thème",
    language: "Langue",
    auto: "Auto",
    light: "Clair",
    dark: "Sombre",
    menu: "Menu",
    play: "Jouer!",
    skipDemo: "Passer la démo",
    demoTitle: "Comment jouer?",
    demo1: "Vous avez 6 chiffres aléatoires",
    demo2: "Un espace vide les combine en nombres",
    demo3: "Appuyez sur les carrés et choisissez les signes",
    demo4: "Utilisez +, -, *, / et les parenthèses",
    demo5: "Faites exactement 100!",
    soundAndVibration: "Son et vibration",
    sound: "Son",
    vibration: "Vibration",
    tapGaps: "Appuyez sur les espaces et insérez des signes",
    skipTicket: "Passer le billet",
    skipCar: "Passer la voiture",
    hint: "Indice",
    noSolution: "Aucune solution n'existe pour cette combinaison",
    introText: "Faites 100 à partir des chiffres sur le billet en utilisant des signes mathématiques.",
    start: "Démarrer",
    perfect: "Parfait!",
    solvedIn: "Résolu en:",
    operatorsUsed: "Signes utilisés:",
    nextTicket: "Billet suivant",
    nextCar: "Voiture suivante",
    close: "Fermer",
    leaderboard: "Classement",
    topPlayers: "Meilleurs joueurs",
    loadingLeaderboard: "Chargement du classement...",
    noData: "Pas encore de données",
    time: "Temps",
    shareScore: "Partager",
    tickets: {
      flight: { title: 'CARTE D\'EMBARQUEMENT', subtitle: 'PREMIÈRE CLASSE', footerLeft: 'PORTE 14', footerRight: 'SIÈGE 2A' },
      concert: { title: 'CONCERT LIVE', subtitle: 'ACCÈS VIP', footerLeft: 'TOURNÉE MONDIALE', footerRight: 'RANG 1' },
      cinema: { title: 'BILLET DE CINÉMA', subtitle: 'UNE ENTRÉE', footerLeft: 'RANG F', footerRight: 'SIÈGE 12' },
      train: { title: 'TRAIN EXPRESS', subtitle: 'ALLER SIMPLE', footerLeft: 'QUAI 9', footerRight: 'VOITURE 4' },
      'vintage-bus': { title: 'BILLET DE BUS', subtitle: 'SÉRIE AB', footerLeft: 'CONTRÔLE', footerRight: 'BILLET' },
      'vintage-tram': { title: 'TRAMWAY', subtitle: 'ALLER SIMPLE', footerLeft: 'SANS COMPOSTAGE', footerRight: 'INVALIDE' },
      'soviet-trolleybus': { title: 'TROLLEYBUS', subtitle: 'TRANSIT URBAIN', footerLeft: 'GARDER JUSQU\'À', footerRight: 'FIN DU TRAJET' },
      'golden-ticket': { title: 'TICKET D\'OR', subtitle: 'HEUREUX GAGNANT', footerLeft: 'ENTRÉE 1', footerRight: 'VISITE D\'USINE' },
      'metro-pass': { title: 'PASS MÉTRO', subtitle: 'MENSUEL', footerLeft: 'ZONE 1-3', footerRight: 'ILLIMITÉ' },
      lottery: { title: 'BILLET DE LOTERIE', subtitle: 'JACKPOT', footerLeft: 'DATE DE TIRAGE', footerRight: 'AUJOURD\'HUI' }
    }
  },
  pt: {
    title: "Make100",
    player: "Jogador",
    gameMode: "Modo",
    car: "Carro",
    ticket: "Bilhete",
    solved: "Resolvido",
    skipped: "Pulado",
    operators: "Sinais",
    current: "Atual",
    total: "Total",
    theme: "Tema",
    language: "Idioma",
    auto: "Auto",
    light: "Claro",
    dark: "Escuro",
    menu: "Menu",
    play: "Jogar!",
    skipDemo: "Pular demo",
    demoTitle: "Como jogar?",
    demo1: "Você recebe 6 dígitos aleatórios",
    demo2: "Um espaço vazio os combina em números",
    demo3: "Toque nos quadrados e escolha os sinais",
    demo4: "Use +, -, *, / e parênteses",
    demo5: "Faça exatamente 100!",
    soundAndVibration: "Som e Vibração",
    sound: "Som",
    vibration: "Vibração",
    tapGaps: "Toque nos espaços e insira os sinais",
    skipTicket: "Pular bilhete",
    skipCar: "Pular carro",
    hint: "Dica",
    noSolution: "Nenhuma solução existe para esta combinação",
    introText: "Faça 100 a partir dos dígitos no bilhete usando sinais matemáticos.",
    start: "Iniciar",
    perfect: "Perfeito!",
    solvedIn: "Resolvido em:",
    operatorsUsed: "Sinais usados:",
    nextTicket: "Próximo bilhete",
    nextCar: "Próximo carro",
    close: "Fechar",
    leaderboard: "Classificação",
    topPlayers: "Melhores jogadores",
    loadingLeaderboard: "Carregando classificação...",
    noData: "Ainda sem dados",
    time: "Tempo",
    shareScore: "Compartilhar",
    tickets: {
      flight: { title: 'CARTÃO DE EMBARQUE', subtitle: 'PRIMEIRA CLASSE', footerLeft: 'PORTÃO 14', footerRight: 'ASSENTO 2A' },
      concert: { title: 'CONCERTO AO VIVO', subtitle: 'ACESSO VIP', footerLeft: 'TURNÊ MUNDIAL', footerRight: 'FILA 1' },
      cinema: { title: 'BILHETE DE CINEMA', subtitle: 'UMA ENTRADA', footerLeft: 'FILA F', footerRight: 'ASSENTO 12' },
      train: { title: 'TREM EXPRESSO', subtitle: 'SÓ IDA', footerLeft: 'PLATAFORMA 9', footerRight: 'VAGÃO 4' },
      'vintage-bus': { title: 'BILHETE DE ÔNIBUS', subtitle: 'SÉRIE AB', footerLeft: 'CONTROLE', footerRight: 'BILHETE' },
      'vintage-tram': { title: 'BONDE', subtitle: 'VIAGEM ÚNICA', footerLeft: 'SEM PICOTAR', footerRight: 'INVÁLIDO' },
      'soviet-trolleybus': { title: 'TRÓLEBUS', subtitle: 'TRÂNSITO URBANO', footerLeft: 'GUARDAR ATÉ', footerRight: 'FIM DA VIAGEM' },
      'golden-ticket': { title: 'BILHETE DOURADO', subtitle: 'VENCEDOR SORTUDO', footerLeft: 'ENTRADA 1', footerRight: 'TOUR NA FÁBRICA' },
      'metro-pass': { title: 'PASSE DE METRÔ', subtitle: 'MENSAL', footerLeft: 'ZONA 1-3', footerRight: 'ILIMITADO' },
      lottery: { title: 'BILHETE DE LOTERIA', subtitle: 'JACKPOT', footerLeft: 'DATA DO SORTEIO', footerRight: 'HOJE' }
    }
  },
  es: {
    title: "Make100",
    player: "Jugador",
    gameMode: "Modo",
    car: "Coche",
    ticket: "Boleto",
    solved: "Resuelto",
    skipped: "Saltado",
    operators: "Signos",
    current: "Actual",
    total: "Total",
    theme: "Tema",
    language: "Idioma",
    auto: "Auto",
    light: "Claro",
    dark: "Oscuro",
    menu: "Menú",
    play: "¡Jugar!",
    skipDemo: "Saltar demo",
    demoTitle: "¿Cómo jugar?",
    demo1: "Tienes 6 dígitos aleatorios",
    demo2: "Un espacio vacío los combina en números",
    demo3: "Toca los cuadrados y elige los signos",
    demo4: "Usa +, -, *, / y paréntesis",
    demo5: "¡Haz exactamente 100!",
    soundAndVibration: "Sonido y Vibración",
    sound: "Sonido",
    vibration: "Vibración",
    tapGaps: "Toca los espacios e inserta los signos",
    skipTicket: "Saltar boleto",
    skipCar: "Saltar coche",
    hint: "Pista",
    noSolution: "No existe solución para esta combinación",
    introText: "Haz 100 a partir de los dígitos en el boleto usando signos matemáticos.",
    start: "Empezar",
    perfect: "¡Perfecto!",
    solvedIn: "Resuelto en:",
    operatorsUsed: "Signos usados:",
    nextTicket: "Siguiente boleto",
    nextCar: "Siguiente coche",
    close: "Cerrar",
    leaderboard: "Clasificación",
    topPlayers: "Mejores jugadores",
    loadingLeaderboard: "Cargando clasificación...",
    noData: "Aún no hay datos",
    time: "Tiempo",
    shareScore: "Compartir",
    tickets: {
      flight: { title: 'TARJETA DE EMBARQUE', subtitle: 'PRIMERA CLASSE', footerLeft: 'PUERTA 14', footerRight: 'ASIENTO 2A' },
      concert: { title: 'CONCIERTO EN VIVO', subtitle: 'ACCESO VIP', footerLeft: 'GIRA MUNDIAL', footerRight: 'FILA 1' },
      cinema: { title: 'BOLETO DE CINE', subtitle: 'UNA ENTRADA', footerLeft: 'FILA F', footerRight: 'ASIENTO 12' },
      train: { title: 'TREN EXPRESO', subtitle: 'SOLO IDA', footerLeft: 'ANDÉN 9', footerRight: 'VAGÓN 4' },
      'vintage-bus': { title: 'BOLETO DE AUTOBÚS', subtitle: 'SERIE AB', footerLeft: 'CONTROL', footerRight: 'BOLETO' },
      'vintage-tram': { title: 'TRANVÍA', subtitle: 'VIAJE ÚNICO', footerLeft: 'SIN PICAR', footerRight: 'INVÁLIDO' },
      'soviet-trolleybus': { title: 'TROLEBÚS', subtitle: 'TRÁNSITO URBANO', footerLeft: 'GUARDAR HASTA', footerRight: 'FIN DEL VIAJE' },
      'golden-ticket': { title: 'BOLETO DORADO', subtitle: 'GANADOR AFORTUNADO', footerLeft: 'ENTRADA 1', footerRight: 'TOUR DE FÁBRICA' },
      'metro-pass': { title: 'PASE DE METRO', subtitle: 'MENSUAL', footerLeft: 'ZONA 1-3', footerRight: 'ILIMITADO' },
      lottery: { title: 'BOLETO DE LOTERÍA', subtitle: 'PREMIO MAYOR', footerLeft: 'FECHA DE SORTEO', footerRight: 'HOY' }
    }
  },
  zh: {
    title: "Make100",
    player: "玩家",
    gameMode: "模式",
    car: "汽车",
    ticket: "门票",
    solved: "已解决",
    skipped: "已跳过",
    operators: "符号",
    current: "当前",
    total: "总计",
    theme: "主题",
    language: "语言",
    auto: "自动",
    light: "浅色",
    dark: "深色",
    menu: "菜单",
    play: "开始!",
    skipDemo: "跳过演示",
    demoTitle: "怎么玩？",
    demo1: "给你6个随机数字",
    demo2: "空白处将它们组合成数字",
    demo3: "点击方块并选择符号",
    demo4: "使用 +, -, *, / 和括号",
    demo5: "正好凑成100！",
    soundAndVibration: "声音和震动",
    sound: "声音",
    vibration: "震动",
    tapGaps: "点击空白处并插入符号",
    skipTicket: "跳过门票",
    skipCar: "跳过汽车",
    hint: "提示",
    noSolution: "此组合无解",
    introText: "使用数学符号将门票上的数字凑成100。",
    start: "开始",
    perfect: "完美！",
    solvedIn: "解决时间:",
    operatorsUsed: "使用符号:",
    nextTicket: "下一张门票",
    nextCar: "下一辆汽车",
    close: "关闭",
    leaderboard: "排行榜",
    topPlayers: "顶尖玩家",
    loadingLeaderboard: "正在加载排行榜...",
    noData: "暂无数据",
    time: "时间",
    shareScore: "分享",
    tickets: {
      flight: { title: '登机牌', subtitle: '头等舱', footerLeft: '登机口 14', footerRight: '座位 2A' },
      concert: { title: '现场演唱会', subtitle: 'VIP 通道', footerLeft: '世界巡演', footerRight: '第 1 排' },
      cinema: { title: '电影票', subtitle: '单人票', footerLeft: 'F 排', footerRight: '座位 12' },
      train: { title: '特快列车', subtitle: '单程', footerLeft: '站台 9', footerRight: '车厢 4' },
      'vintage-bus': { title: '公交车票', subtitle: 'AB 系列', footerLeft: '检票', footerRight: '车票' },
      'vintage-tram': { title: '有轨电车', subtitle: '单程', footerLeft: '未打孔', footerRight: '无效' },
      'soviet-trolleybus': { title: '无轨电车', subtitle: '城市交通', footerLeft: '保留至', footerRight: '行程结束' },
      'golden-ticket': { title: '金奖券', subtitle: '幸运赢家', footerLeft: '入场 1', footerRight: '工厂参观' },
      'metro-pass': { title: '地铁通行证', subtitle: '月票', footerLeft: '区域 1-3', footerRight: '无限次' },
      lottery: { title: '彩票', subtitle: '头奖', footerLeft: '开奖日期', footerRight: '今天' }
    }
  },
  ja: {
    title: "Make100",
    player: "プレイヤー",
    gameMode: "モード",
    car: "車",
    ticket: "チケット",
    solved: "解決済み",
    skipped: "スキップ",
    operators: "記号",
    current: "現在",
    total: "合計",
    theme: "テーマ",
    language: "言語",
    auto: "自動",
    light: "ライト",
    dark: "ダーク",
    menu: "メニュー",
    play: "プレイ！",
    skipDemo: "デモをスキップ",
    demoTitle: "遊び方",
    demo1: "6つのランダムな数字が与えられます",
    demo2: "空白はそれらを数字に結合します",
    demo3: "四角をタップして記号を選びます",
    demo4: "+, -, *, /, 括弧を使用します",
    demo5: "ちょうど100を作ってください！",
    soundAndVibration: "音と振動",
    sound: "音",
    vibration: "振動",
    tapGaps: "空白をタップして記号を挿入",
    skipTicket: "チケットをスキップ",
    skipCar: "車をスキップ",
    hint: "ヒント",
    noSolution: "この組み合わせには解決策がありません",
    introText: "数学記号を使用して、チケットの数字から100を作ります。",
    start: "スタート",
    perfect: "完璧！",
    solvedIn: "解決時間:",
    operatorsUsed: "使用した記号:",
    nextTicket: "次のチケット",
    nextCar: "次の車",
    close: "閉じる",
    leaderboard: "ランキング",
    topPlayers: "トッププレイヤー",
    loadingLeaderboard: "ランキングを読み込み中...",
    noData: "まだデータがありません",
    time: "時間",
    shareScore: "シェア",
    tickets: {
      flight: { title: '搭乗券', subtitle: 'ファーストクラス', footerLeft: 'ゲート 14', footerRight: '座席 2A' },
      concert: { title: 'ライブコンサート', subtitle: 'VIPアクセス', footerLeft: 'ワールドツアー', footerRight: '1列目' },
      cinema: { title: '映画のチケット', subtitle: '1名入場', footerLeft: 'F列', footerRight: '座席 12' },
      train: { title: '特急列車', subtitle: '片道', footerLeft: 'プラットフォーム 9', footerRight: '4号車' },
      'vintage-bus': { title: 'バスのチケット', subtitle: 'ABシリーズ', footerLeft: 'コントロール', footerRight: 'チケット' },
      'vintage-tram': { title: '路面電車', subtitle: '片道', footerLeft: 'パンチなし', footerRight: '無効' },
      'soviet-trolleybus': { title: 'トロリーバス', subtitle: '市内交通', footerLeft: '最後まで', footerRight: '保管してください' },
      'golden-ticket': { title: 'ゴールデンチケット', subtitle: '幸運な勝者', footerLeft: '入場 1', footerRight: '工場見学' },
      'metro-pass': { title: '地下鉄パス', subtitle: '月間', footerLeft: 'ゾーン 1-3', footerRight: '無制限' },
      lottery: { title: '宝くじ', subtitle: 'ジャックポット', footerLeft: '抽選日', footerRight: '今日' }
    }
  },
  it: {
    title: "Make100",
    player: "Giocatore",
    gameMode: "Modalità",
    car: "Auto",
    ticket: "Biglietto",
    solved: "Risolti",
    skipped: "Saltati",
    operators: "Operatori",
    current: "Attuale",
    total: "Totale",
    theme: "Tema",
    language: "Lingua",
    auto: "Auto",
    light: "Chiaro",
    dark: "Scuro",
    menu: "Menu",
    play: "Gioca!",
    skipDemo: "Salta demo",
    demoTitle: "Come si gioca?",
    demo1: "Ti vengono date 6 cifre casuali",
    demo2: "Uno spazio vuoto le unisce in numeri",
    demo3: "Tocca i quadrati e scegli gli operatori",
    demo4: "Usa +, -, *, / e le parentesi",
    demo5: "Ottieni esattamente 100!",
    soundAndVibration: "Suono e Vibrazione",
    sound: "Suono",
    vibration: "Vibrazione",
    tapGaps: "Tocca gli spazi e inserisci gli operatori",
    skipTicket: "Salta biglietto",
    skipCar: "Salta auto",
    hint: "Suggerimento",
    noSolution: "Non esiste soluzione per questa combinazione",
    introText: "Ottieni 100 dalle cifre sul biglietto usando gli operatori matematici.",
    start: "Inizia",
    perfect: "Perfetto!",
    solvedIn: "Risolto in:",
    operatorsUsed: "Operatori usati:",
    nextTicket: "Prossimo biglietto",
    nextCar: "Prossima auto",
    close: "Chiudi",
    leaderboard: "Classifica",
    topPlayers: "Migliori Giocatori",
    loadingLeaderboard: "Caricamento classifica...",
    noData: "Nessun dato ancora",
    time: "Tempo",
    shareScore: "Condividi",
    tickets: {
      flight: { title: 'CARTA D\'IMBARCO', subtitle: 'PRIMA CLASSE', footerLeft: 'GATE 14', footerRight: 'POSTO 2A' },
      concert: { title: 'CONCERTO LIVE', subtitle: 'ACCESSO VIP', footerLeft: 'TOUR MONDIALE', footerRight: 'FILA 1' },
      cinema: { title: 'BIGLIETTO CINEMA', subtitle: 'INGRESSO SINGOLO', footerLeft: 'FILA F', footerRight: 'POSTO 12' },
      train: { title: 'TRENO ESPRESSO', subtitle: 'SOLA ANDATA', footerLeft: 'BINARIO 9', footerRight: 'CARROZZA 4' },
      'vintage-bus': { title: 'BIGLIETTO AUTOBUS', subtitle: 'SERIE AB', footerLeft: 'CONTROLLO', footerRight: 'BIGLIETTO' },
      'vintage-tram': { title: 'TRAM', subtitle: 'CORSA SINGOLA', footerLeft: 'SENZA TIMBRO', footerRight: 'NON VALIDO' },
      'soviet-trolleybus': { title: 'FILOBUS', subtitle: 'TRASPORTO URBANO', footerLeft: 'CONSERVARE FINO', footerRight: 'A FINE CORSA' },
      'golden-ticket': { title: 'BIGLIETTO D\'ORO', subtitle: 'VINCITORE FORTUNATO', footerLeft: 'INGRESSO 1', footerRight: 'TOUR FABBRICA' },
      'metro-pass': { title: 'ABBONAMENTO METRO', subtitle: 'MENSILE', footerLeft: 'ZONA 1-3', footerRight: 'ILLIMITATO' },
      lottery: { title: 'BIGLIETTO LOTTERIA', subtitle: 'JACKPOT', footerLeft: 'DATA ESTRAZIONE', footerRight: 'OGGI' }
    }
  },
  ko: {
    title: "Make100",
    player: "플레이어",
    gameMode: "모드",
    car: "자동차",
    ticket: "티켓",
    solved: "해결됨",
    skipped: "건너뜀",
    operators: "기호",
    current: "현재",
    total: "총",
    theme: "테마",
    language: "언어",
    auto: "자동",
    light: "라이트",
    dark: "다크",
    menu: "메뉴",
    play: "플레이!",
    skipDemo: "데모 건너뛰기",
    demoTitle: "게임 방법",
    demo1: "6개의 무작위 숫자가 주어집니다",
    demo2: "빈칸은 숫자를 결합합니다",
    demo3: "사각형을 탭하고 기호를 선택하세요",
    demo4: "+, -, *, /, 괄호를 사용하세요",
    demo5: "정확히 100을 만드세요!",
    soundAndVibration: "소리 및 진동",
    sound: "소리",
    vibration: "진동",
    tapGaps: "빈칸을 탭하고 기호 삽입",
    skipTicket: "티켓 건너뛰기",
    skipCar: "자동차 건너뛰기",
    hint: "힌트",
    noSolution: "이 조합에 대한 해결책이 없습니다",
    introText: "수학 기호를 사용하여 티켓의 숫자로 100을 만드세요.",
    start: "시작",
    perfect: "완벽해요!",
    solvedIn: "해결 시간:",
    operatorsUsed: "사용된 기호:",
    nextTicket: "다음 티켓",
    nextCar: "다음 자동차",
    close: "닫기",
    leaderboard: "순위표",
    topPlayers: "최고의 플레이어",
    loadingLeaderboard: "순위표 로드 중...",
    noData: "아직 데이터가 없습니다",
    time: "시간",
    shareScore: "공유하기",
    tickets: {
      flight: { title: '탑승권', subtitle: '일등석', footerLeft: '게이트 14', footerRight: '좌석 2A' },
      concert: { title: '라이브 콘서트', subtitle: 'VIP 입장', footerLeft: '월드 투어', footerRight: '1열' },
      cinema: { title: '영화 티켓', subtitle: '1인 입장', footerLeft: 'F열', footerRight: '좌석 12' },
      train: { title: '급행 열차', subtitle: '편도', footerLeft: '플랫폼 9', footerRight: '4호차' },
      'vintage-bus': { title: '버스 티켓', subtitle: 'AB 시리즈', footerLeft: '검표', footerRight: '티켓' },
      'vintage-tram': { title: '트램', subtitle: '편도', footerLeft: '펀치 없음', footerRight: '무효' },
      'soviet-trolleybus': { title: '트롤리버스', subtitle: '도시 교통', footerLeft: '보관 기한', footerRight: '여행 종료' },
      'golden-ticket': { title: '골든 티켓', subtitle: '행운의 당첨자', footerLeft: '입장 1', footerRight: '공장 투어' },
      'metro-pass': { title: '지하철 패스', subtitle: '월간', footerLeft: '구역 1-3', footerRight: '무제한' },
      lottery: { title: '복권', subtitle: '잭팟', footerLeft: '추첨일', footerRight: '오늘' }
    }
  },
  tr: {
    title: "Make100",
    player: "Oyuncu",
    gameMode: "Mod",
    car: "Araba",
    ticket: "Bilet",
    solved: "Çözüldü",
    skipped: "Atlandı",
    operators: "İşaretler",
    current: "Mevcut",
    total: "Toplam",
    theme: "Tema",
    language: "Dil",
    auto: "Otomatik",
    light: "Açık",
    dark: "Koyu",
    menu: "Menü",
    play: "Oyna!",
    skipDemo: "Demoyu geç",
    demoTitle: "Nasıl oynanır?",
    demo1: "Size rastgele 6 rakam verilir",
    demo2: "Boşluk onları sayılara dönüştürür",
    demo3: "Karelere dokunun ve işaretleri seçin",
    demo4: "+, -, *, / ve parantezleri kullanın",
    demo5: "Tam olarak 100 yapın!",
    soundAndVibration: "Ses ve Titreşim",
    sound: "Ses",
    vibration: "Titreşim",
    tapGaps: "Boşluklara dokunun ve işaret ekleyin",
    skipTicket: "Bileti geç",
    skipCar: "Arabayı geç",
    hint: "İpucu",
    noSolution: "Bu kombinasyon için çözüm yok",
    introText: "Matematiksel işaretleri kullanarak biletteki rakamlardan 100 yapın.",
    start: "Başla",
    perfect: "Mükemmel!",
    solvedIn: "Çözüm süresi:",
    operatorsUsed: "Kullanılan işaretler:",
    nextTicket: "Sonraki bilet",
    nextCar: "Sonraki araba",
    close: "Kapat",
    leaderboard: "Liderlik Tablosu",
    topPlayers: "En İyi Oyuncular",
    loadingLeaderboard: "Liderlik tablosu yükleniyor...",
    noData: "Henüz veri yok",
    time: "Zaman",
    shareScore: "Paylaş",
    tickets: {
      flight: { title: 'BİNİŞ KARTI', subtitle: 'BİRİNCİ SINIF', footerLeft: 'KAPI 14', footerRight: 'KOLTUK 2A' },
      concert: { title: 'CANLI KONSER', subtitle: 'VIP GİRİŞ', footerLeft: 'DÜNYA TURU', footerRight: 'SIRA 1' },
      cinema: { title: 'SİNEMA BİLETİ', subtitle: 'TEK KİŞİLİK', footerLeft: 'SIRA F', footerRight: 'KOLTUK 12' },
      train: { title: 'EKSPRES TREN', subtitle: 'TEK YÖN', footerLeft: 'PERON 9', footerRight: 'VAGON 4' },
      'vintage-bus': { title: 'OTOBÜS BİLETİ', subtitle: 'SERİ AB', footerLeft: 'KONTROL', footerRight: 'BİLET' },
      'vintage-tram': { title: 'TRAMVAY', subtitle: 'TEK YÖN', footerLeft: 'DELİKSİZ', footerRight: 'GEÇERSİZ' },
      'soviet-trolleybus': { title: 'TROLLEYBÜS', subtitle: 'ŞEHİR İÇİ', footerLeft: 'SAKLAYIN', footerRight: 'YOLCULUK SONUNA' },
      'golden-ticket': { title: 'ALTIN BİLET', subtitle: 'ŞANSLI KAZANAN', footerLeft: 'GİRİŞ 1', footerRight: 'FABRİKA TURU' },
      'metro-pass': { title: 'METRO KARTI', subtitle: 'AYLIK', footerLeft: 'BÖLGE 1-3', footerRight: 'SINIRSIZ' },
      lottery: { title: 'PİYANGO BİLETİ', subtitle: 'BÜYÜK İKRAMİYE', footerLeft: 'ÇEKİLİŞ TARİHİ', footerRight: 'BUGÜN' }
    }
  },
  he: {
    title: "Make100",
    player: "שחקן",
    gameMode: "מצב",
    car: "מכונית",
    ticket: "כרטיס",
    solved: "נפתר",
    skipped: "דולג",
    operators: "סימנים",
    current: "נוכחי",
    total: "סה\"כ",
    theme: "ערכת נושא",
    language: "שפה",
    auto: "אוטומטי",
    light: "בהיר",
    dark: "כהה",
    menu: "תפריט",
    play: "שחק!",
    skipDemo: "דלג על הדגמה",
    demoTitle: "איך לשחק?",
    demo1: "ניתנות לך 6 ספרות אקראיות",
    demo2: "רווח ריק מחבר אותן למספרים",
    demo3: "הקש על הריבועים ובחר סימנים",
    demo4: "השתמש ב- +, -, *, / וסוגריים",
    demo5: "הגע בדיוק ל-100!",
    soundAndVibration: "צליל ורטט",
    sound: "צליל",
    vibration: "רטט",
    tapGaps: "הקש על הרווחים והכנס סימנים",
    skipTicket: "דלג על כרטיס",
    skipCar: "דלג על מכונית",
    hint: "רמז",
    noSolution: "אין פתרון לשילוב זה",
    introText: "הגע ל-100 מהספרות שעל הכרטיס בעזרת סימנים מתמטיים.",
    start: "התחל",
    perfect: "מושלם!",
    solvedIn: "נפתר ב:",
    operatorsUsed: "סימנים בשימוש:",
    nextTicket: "כרטיס הבא",
    nextCar: "מכונית הבאה",
    close: "סגור",
    leaderboard: "טבלת מובילים",
    topPlayers: "השחקנים הטובים ביותר",
    loadingLeaderboard: "טוען טבלת מובילים...",
    noData: "אין נתונים עדיין",
    time: "זמן",
    shareScore: "שיתוף",
    tickets: {
      flight: { title: 'כרטיס עלייה למטוס', subtitle: 'מחלקה ראשונה', footerLeft: 'שער 14', footerRight: 'מושב 2A' },
      concert: { title: 'הופעה חיה', subtitle: 'גישת VIP', footerLeft: 'סיבוב הופעות עולמי', footerRight: 'שורה 1' },
      cinema: { title: 'כרטיס קולנוע', subtitle: 'כניסה ליחיד', footerLeft: 'שורה F', footerRight: 'מושב 12' },
      train: { title: 'רכבת אקספרס', subtitle: 'כיוון אחד', footerLeft: 'רציף 9', footerRight: 'קרון 4' },
      'vintage-bus': { title: 'כרטיס אוטובוס', subtitle: 'סדרה AB', footerLeft: 'ביקורת', footerRight: 'כרטיס' },
      'vintage-tram': { title: 'חשמלית', subtitle: 'נסיעה בודדת', footerLeft: 'ללא ניקוב', footerRight: 'לא תקף' },
      'soviet-trolleybus': { title: 'טרוליבוס', subtitle: 'תחבורה עירונית', footerLeft: 'שמור עד', footerRight: 'סוף הנסיעה' },
      'golden-ticket': { title: 'כרטיס זהב', subtitle: 'זוכה מאושר', footerLeft: 'כניסה 1', footerRight: 'סיור במפעל' },
      'metro-pass': { title: 'כרטיס מטרו', subtitle: 'חודשי', footerLeft: 'אזור 1-3', footerRight: 'ללא הגבלה' },
      lottery: { title: 'כרטיס הגרלה', subtitle: 'קופה', footerLeft: 'תאריך הגרלה', footerRight: 'היום' }
    }
  },
  ar: {
    title: "Make100",
    player: "اللاعب",
    gameMode: "الوضع",
    car: "سيارة",
    ticket: "تذكرة",
    solved: "تم الحل",
    skipped: "تم التخطي",
    operators: "العلامات",
    current: "الحالي",
    total: "المجموع",
    theme: "المظهر",
    language: "اللغة",
    auto: "تلقائي",
    light: "فاتح",
    dark: "داكن",
    menu: "القائمة",
    play: "العب!",
    skipDemo: "تخطي العرض",
    demoTitle: "كيف تلعب؟",
    demo1: "يتم إعطاؤك 6 أرقام عشوائية",
    demo2: "الفراغ يجمعها في أرقام",
    demo3: "اضغط على المربعات واختر العلامات",
    demo4: "استخدم +، -، *، / والأقواس",
    demo5: "اجعلها 100 بالضبط!",
    soundAndVibration: "الصوت والاهتزاز",
    sound: "الصوت",
    vibration: "الاهتزاز",
    tapGaps: "اضغط على الفراغات وأدخل العلامات",
    skipTicket: "تخطي التذكرة",
    skipCar: "تخطي السيارة",
    hint: "تلميح",
    noSolution: "لا يوجد حل لهذه المجموعة",
    introText: "اجعل 100 من الأرقام الموجودة على التذكرة باستخدام العلامات الرياضية.",
    start: "ابدأ",
    perfect: "ممتاز!",
    solvedIn: "تم الحل في:",
    operatorsUsed: "العلامات المستخدمة:",
    nextTicket: "التذكرة التالية",
    nextCar: "السيارة التالية",
    close: "إغلاق",
    leaderboard: "لوحة المتصدرين",
    topPlayers: "أفضل اللاعبين",
    loadingLeaderboard: "جاري تحميل لوحة المتصدرين...",
    noData: "لا توجد بيانات بعد",
    time: "الوقت",
    shareScore: "مشاركة",
    tickets: {
      flight: { title: 'بطاقة صعود', subtitle: 'الدرجة الأولى', footerLeft: 'بوابة 14', footerRight: 'مقعد 2A' },
      concert: { title: 'حفل مباشر', subtitle: 'دخول VIP', footerLeft: 'جولة عالمية', footerRight: 'صف 1' },
      cinema: { title: 'تذكرة سينما', subtitle: 'دخول شخص واحد', footerLeft: 'صف F', footerRight: 'مقعد 12' },
      train: { title: 'قطار سريع', subtitle: 'اتجاه واحد', footerLeft: 'رصيف 9', footerRight: 'عربة 4' },
      'vintage-bus': { title: 'تذكرة حافلة', subtitle: 'سلسلة AB', footerLeft: 'مراقبة', footerRight: 'تذكرة' },
      'vintage-tram': { title: 'ترام', subtitle: 'رحلة واحدة', footerLeft: 'بدون ثقب', footerRight: 'غير صالح' },
      'soviet-trolleybus': { title: 'حافلة كهربائية', subtitle: 'نقل حضري', footerLeft: 'احتفظ بها حتى', footerRight: 'نهاية الرحلة' },
      'golden-ticket': { title: 'التذكرة الذهبية', subtitle: 'فائز محظوظ', footerLeft: 'دخول 1', footerRight: 'جولة في المصنع' },
      'metro-pass': { title: 'بطاقة مترو', subtitle: 'شهري', footerLeft: 'منطقة 1-3', footerRight: 'غير محدود' },
      lottery: { title: 'تذكرة يانصيب', subtitle: 'الجائزة الكبرى', footerLeft: 'تاريخ السحب', footerRight: 'اليوم' }
    }
  },
  hi: {
    title: "Make100",
    player: "खिलाड़ी",
    gameMode: "मोड",
    car: "कार",
    ticket: "टिकट",
    solved: "हल किया",
    skipped: "छोड़ दिया",
    operators: "चिह्न",
    current: "वर्तमान",
    total: "कुल",
    theme: "थीम",
    language: "भाषा",
    auto: "ऑटो",
    light: "लाइट",
    dark: "डार्क",
    menu: "मेनू",
    play: "खेलें!",
    skipDemo: "डेमो छोड़ें",
    demoTitle: "कैसे खेलें?",
    demo1: "आपको 6 यादृच्छिक अंक दिए गए हैं",
    demo2: "एक खाली जगह उन्हें संख्याओं में मिलाती है",
    demo3: "वर्गों पर टैप करें और चिह्न चुनें",
    demo4: "+, -, *, / और कोष्ठक का उपयोग करें",
    demo5: "बिल्कुल 100 बनाएं!",
    soundAndVibration: "ध्वनि और कंपन",
    sound: "ध्वनि",
    vibration: "कंपन",
    tapGaps: "रिक्त स्थान पर टैप करें और चिह्न डालें",
    skipTicket: "टिकट छोड़ें",
    skipCar: "कार छोड़ें",
    hint: "संकेत",
    noSolution: "इस संयोजन का कोई समाधान नहीं है",
    introText: "गणितीय चिह्नों का उपयोग करके टिकट पर अंकों से 100 बनाएं।",
    start: "शुरू करें",
    perfect: "बिल्कुल सही!",
    solvedIn: "में हल किया:",
    operatorsUsed: "उपयोग किए गए चिह्न:",
    nextTicket: "अगला टिकट",
    nextCar: "अगली कार",
    close: "बंद करें",
    leaderboard: "लीडरबोर्ड",
    topPlayers: "शीर्ष खिलाड़ी",
    loadingLeaderboard: "लीडरबोर्ड लोड हो रहा है...",
    noData: "अभी तक कोई डेटा नहीं",
    time: "समय",
    shareScore: "साझा करें",
    tickets: {
      flight: { title: 'बोर्डिंग पास', subtitle: 'प्रथम श्रेणी', footerLeft: 'गेट 14', footerRight: 'सीट 2A' },
      concert: { title: 'लाइव कॉन्सर्ट', subtitle: 'वीआईपी एक्सेस', footerLeft: 'वर्ल्ड टूर', footerRight: 'पंक्ति 1' },
      cinema: { title: 'सिनेमा टिकट', subtitle: 'एक प्रवेश', footerLeft: 'पंक्ति F', footerRight: 'सीट 12' },
      train: { title: 'एक्सप्रेस ट्रेन', subtitle: 'एक तरफा', footerLeft: 'प्लेटफॉर्म 9', footerRight: 'डिब्बा 4' },
      'vintage-bus': { title: 'बस टिकट', subtitle: 'सीरीज़ AB', footerLeft: 'नियंत्रण', footerRight: 'टिकट' },
      'vintage-tram': { title: 'ट्राम', subtitle: 'सिंगल', footerLeft: 'बिना पंच के', footerRight: 'अमान्य' },
      'soviet-trolleybus': { title: 'ट्रॉलीबस', subtitle: 'सिटी ट्रांजिट', footerLeft: 'तक रखें', footerRight: 'यात्रा के अंत' },
      'golden-ticket': { title: 'गोल्डन टिकट', subtitle: 'भाग्यशाली विजेता', footerLeft: 'प्रवेश 1', footerRight: 'फैक्ट्री टूर' },
      'metro-pass': { title: 'मेट्रो पास', subtitle: 'मासिक', footerLeft: 'ज़ोन 1-3', footerRight: 'असीमित' },
      lottery: { title: 'लॉटरी टिकट', subtitle: 'जैकपॉट', footerLeft: 'ड्रा तिथि', footerRight: 'आज' }
    }
  },
  la: {
    title: "Make100",
    player: "Lusor",
    gameMode: "Modus",
    car: "Currus",
    ticket: "Tessera",
    solved: "Solutum",
    skipped: "Omissum",
    operators: "Signa",
    current: "Praesens",
    total: "Summa",
    theme: "Thema",
    language: "Lingua",
    auto: "Auto",
    light: "Clarum",
    dark: "Obscurum",
    menu: "Tabula",
    play: "Lude!",
    skipDemo: "Omitte demo",
    demoTitle: "Quomodo ludere?",
    demo1: "Dantur tibi 6 numeri fortuiti",
    demo2: "Spatium vacuum eos in numeros iungit",
    demo3: "Tange quadra et elige signa",
    demo4: "Utere +, -, *, / et uncis",
    demo5: "Fac prorsus 100!",
    soundAndVibration: "Sonus et Vibratio",
    sound: "Sonus",
    vibration: "Vibratio",
    tapGaps: "Tange spatia et inscribe signa",
    skipTicket: "Omitte tesseram",
    skipCar: "Omitte currum",
    hint: "Indiciolum",
    noSolution: "Nulla solutio huic compositioni est",
    introText: "Fac 100 ex numeris in tessera utens signis mathematicis.",
    start: "Incipe",
    perfect: "Perfectum!",
    solvedIn: "Solutum in:",
    operatorsUsed: "Signa adhibita:",
    nextTicket: "Proxima tessera",
    nextCar: "Proximus currus",
    close: "Claude",
    leaderboard: "Tabula principum",
    topPlayers: "Optimi lusores",
    loadingLeaderboard: "Onerans tabulam principum...",
    noData: "Nulla data adhuc",
    time: "Tempus",
    shareScore: "Communicare",
    tickets: {
      flight: { title: 'TESSERA CONSCENDENDI', subtitle: 'PRIMA CLASSIS', footerLeft: 'PORTA 14', footerRight: 'SEDES 2A' },
      concert: { title: 'CONCENTUS VIVUS', subtitle: 'ADITUS VIP', footerLeft: 'ITER MUNDANUM', footerRight: 'ORDO 1' },
      cinema: { title: 'TESSERA CINEMATOGRAPHICA', subtitle: 'ADMITTE UNUM', footerLeft: 'ORDO F', footerRight: 'SEDES 12' },
      train: { title: 'TRAMEN EXPRESSUM', subtitle: 'UNA VIA', footerLeft: 'CREPIDO 9', footerRight: 'CURRUS 4' },
      'vintage-bus': { title: 'TESSERA LAOPHORII', subtitle: 'SERIES AB', footerLeft: 'INSPECTIO', footerRight: 'TESSERA' },
      'vintage-tram': { title: 'TRAMEN URBANUM', subtitle: 'SIMPLEX', footerLeft: 'SINE PERFORATIONE', footerRight: 'IRRITA' },
      'soviet-trolleybus': { title: 'TROLLEYBUS', subtitle: 'TRANSITUS URBANUS', footerLeft: 'SERVA USQUE AD', footerRight: 'FINEM ITINERIS' },
      'golden-ticket': { title: 'TESSERA AUREA', subtitle: 'VICTOR FELIX', footerLeft: 'ADMITTE 1', footerRight: 'ITER OFFICINAE' },
      'metro-pass': { title: 'TESSERA METROPOLITANA', subtitle: 'MENSTRUA', footerLeft: 'ZONA 1-3', footerRight: 'INFINITA' },
      lottery: { title: 'TESSERA SORTITIONIS', subtitle: 'PRAEMIUM MAXIMUM', footerLeft: 'DIES SORTITIONIS', footerRight: 'HODIE' }
    }
  },
  eo: {
    title: "Make100",
    player: "Ludanto",
    gameMode: "Reĝimo",
    car: "Aŭto",
    ticket: "Bileto",
    solved: "Solvita",
    skipped: "Preterlasita",
    operators: "Signoj",
    current: "Nuna",
    total: "Entute",
    theme: "Etoso",
    language: "Lingvo",
    auto: "Aŭto",
    light: "Hela",
    dark: "Malhela",
    menu: "Menuo",
    play: "Ludu!",
    skipDemo: "Preterlasi demon",
    demoTitle: "Kiel ludi?",
    demo1: "Vi ricevas 6 hazardajn ciferojn",
    demo2: "Malplena spaco kunigas ilin en nombrojn",
    demo3: "Tuŝu la kvadratojn kaj elektu signojn",
    demo4: "Uzu +, -, *, / kaj krampojn",
    demo5: "Faru precize 100!",
    soundAndVibration: "Sono kaj Vibrado",
    sound: "Sono",
    vibration: "Vibrado",
    tapGaps: "Tuŝu la spacojn kaj enmetu signojn",
    skipTicket: "Preterlasi bileton",
    skipCar: "Preterlasi aŭton",
    hint: "Indiko",
    noSolution: "Ne ekzistas solvo por ĉi tiu kombinaĵo",
    introText: "Faru 100 el la ciferoj sur la bileto uzante matematikajn signojn.",
    start: "Komenci",
    perfect: "Perfekte!",
    solvedIn: "Solvita en:",
    operatorsUsed: "Signoj uzitaj:",
    nextTicket: "Sekva bileto",
    nextCar: "Sekva aŭto",
    close: "Fermi",
    leaderboard: "Gvidtabulo",
    topPlayers: "Plej bonaj ludantoj",
    loadingLeaderboard: "Ŝargante gvidtabulon...",
    noData: "Ankoraŭ neniuj datumoj",
    time: "Tempo",
    shareScore: "Dividi",
    tickets: {
      flight: { title: 'ENIRBILETO', subtitle: 'UNUA KLASO', footerLeft: 'PORDEGO 14', footerRight: 'SEĜO 2A' },
      concert: { title: 'VIVA KONCERTO', subtitle: 'VIP-ALIRO', footerLeft: 'MONDA TURNEO', footerRight: 'VICO 1' },
      cinema: { title: 'KINEJA BILETO', subtitle: 'UNU PERSONO', footerLeft: 'VICO F', footerRight: 'SEĜO 12' },
      train: { title: 'EKSPRESA TRAJNO', subtitle: 'UNUDIREKTA', footerLeft: 'KAJO 9', footerRight: 'VAGONO 4' },
      'vintage-bus': { title: 'BUSA BILETO', subtitle: 'SERIO AB', footerLeft: 'KONTROLO', footerRight: 'BILETO' },
      'vintage-tram': { title: 'TRAMO', subtitle: 'UNUOPA', footerLeft: 'SEN TRUO', footerRight: 'NEVALIFA' },
      'soviet-trolleybus': { title: 'TROLEBUSO', subtitle: 'URBA TRANSITO', footerLeft: 'KONSERVU ĜIS', footerRight: 'FINO DE VOJAĜO' },
      'golden-ticket': { title: 'ORA BILETO', subtitle: 'FELIĈA GAJNINTO', footerLeft: 'ENIRO 1', footerRight: 'FABRIKA TURNEO' },
      'metro-pass': { title: 'METROA BILETO', subtitle: 'MONATA', footerLeft: 'ZONO 1-3', footerRight: 'SENLIMA' },
      lottery: { title: 'LOTERIA BILETO', subtitle: 'ĈEFPREMIO', footerLeft: 'TIRA DATO', footerRight: 'HODIAŬ' }
    }
  },
  elvish: {
    title: "Make100",
    player: "Tyalo",
    gameMode: "Tárië",
    car: "Racar",
    ticket: "Tarma",
    solved: "Sinyar",
    skipped: "Lelyar",
    operators: "Tengwar",
    current: "Sina",
    total: "Ilya",
    theme: "Cala",
    language: "Lambë",
    auto: "Auto",
    light: "Calina",
    dark: "Morna",
    menu: "Tengwa",
    play: "Tyalië!",
    skipDemo: "Lelya demo",
    demoTitle: "Manen tyalië?",
    demo1: "Natyar 6 onti",
    demo2: "Lusta yanta te",
    demo3: "Palpa cantali ar cil tengwar",
    demo4: "Yuhta +, -, *, / ar quingi",
    demo5: "Carië 100!",
    soundAndVibration: "Lamma ar Palpa",
    sound: "Lamma",
    vibration: "Palpa",
    tapGaps: "Palpa lusta ar panya tengwar",
    skipTicket: "Lelya tarma",
    skipCar: "Lelya racar",
    hint: "Tengwë",
    noSolution: "Lá sinya",
    introText: "Carië 100 onti tarma yuhta tengwar.",
    start: "Yesta",
    perfect: "Mára!",
    solvedIn: "Sinyar mi:",
    operatorsUsed: "Tengwar yuhta:",
    nextTicket: "Enta tarma",
    nextCar: "Enta racar",
    close: "Holya",
    leaderboard: "Tárië",
    topPlayers: "Mára tyalië",
    loadingLeaderboard: "Tulta tárië...",
    noData: "Lá quenta",
    time: "Lúmë",
    shareScore: "Gweria",
    tickets: {
      flight: { title: 'TARMA', subtitle: 'MINYA', footerLeft: 'ANDO 14', footerRight: 'HAMA 2A' },
      concert: { title: 'LINDIË', subtitle: 'VIP', footerLeft: 'AMBAR', footerRight: 'TÉMA 1' },
      cinema: { title: 'TARMA', subtitle: 'MIN', footerLeft: 'TÉMA F', footerRight: 'HAMA 12' },
      train: { title: 'RACAR', subtitle: 'MINYA', footerLeft: 'ANDO 9', footerRight: 'RACAR 4' },
      'vintage-bus': { title: 'TARMA', subtitle: 'AB', footerLeft: 'TIR', footerRight: 'TARMA' },
      'vintage-tram': { title: 'RACAR', subtitle: 'MIN', footerLeft: 'LÁ', footerRight: 'LÁ' },
      'soviet-trolleybus': { title: 'RACAR', subtitle: 'OSTO', footerLeft: 'HARYA', footerRight: 'METTA' },
      'golden-ticket': { title: 'LAURË TARMA', subtitle: 'MÁRA', footerLeft: 'MIN', footerRight: 'TIR' },
      'metro-pass': { title: 'TARMA', subtitle: 'ASTA', footerLeft: 'ZONA 1-3', footerRight: 'ILYA' },
      lottery: { title: 'TARMA', subtitle: 'MÁRA', footerLeft: 'AURI', footerRight: 'SÍ' }
    }
  },
  klingon: {
    title: "Make100",
    player: "Qujwl'",
    gameMode: "mIw",
    car: "Duj",
    ticket: "chaw'",
    solved: "ta'",
    skipped: "buS",
    operators: "Degh",
    current: "DaH",
    total: "Hoch",
    theme: "Segh",
    language: "Hol",
    auto: "Auto",
    light: "wov",
    dark: "hurgh",
    menu: "HIDjolev",
    play: "Quj!",
    skipDemo: "buS demo",
    demoTitle: "chay' Quj?",
    demo1: "jav mI' nob",
    demo2: "mI' tay' chIm",
    demo3: "Degh wIv",
    demo4: "+, -, *, / lo'",
    demo5: "wa'vatlh chenmoH!",
    soundAndVibration: "wab je mup",
    sound: "wab",
    vibration: "mup",
    tapGaps: "Degh chel",
    skipTicket: "buS chaw'",
    skipCar: "buS Duj",
    hint: "chov",
    noSolution: "ta' ghobe'",
    introText: "wa'vatlh chenmoH lo' Degh.",
    start: "tagh",
    perfect: "majQa'!",
    solvedIn: "ta' poH:",
    operatorsUsed: "Degh lo':",
    nextTicket: "veb chaw'",
    nextCar: "veb Duj",
    close: "SoQ",
    leaderboard: "laSvargh",
    topPlayers: "Quj nIv",
    loadingLeaderboard: "laSvargh lIgh...",
    noData: "De' ghobe'",
    time: "poH",
    shareScore: "Quv",
    tickets: {
      flight: { title: 'chaw\'', subtitle: 'wa\'DIch', footerLeft: 'lojmIt 14', footerRight: 'quS 2A' },
      concert: { title: 'bom', subtitle: 'VIP', footerLeft: 'qo\'', footerRight: 'tlhegh 1' },
      cinema: { title: 'chaw\'', subtitle: 'wa\'', footerLeft: 'tlhegh F', footerRight: 'quS 12' },
      train: { title: 'Duj', subtitle: 'wa\'', footerLeft: 'lojmIt 9', footerRight: 'Duj 4' },
      'vintage-bus': { title: 'chaw\'', subtitle: 'AB', footerLeft: 'chov', footerRight: 'chaw\'' },
      'vintage-tram': { title: 'Duj', subtitle: 'wa\'', footerLeft: 'ghobe\'', footerRight: 'ghobe\'' },
      'soviet-trolleybus': { title: 'Duj', subtitle: 'veng', footerLeft: 'pol', footerRight: 'van' },
      'golden-ticket': { title: 'SuD chaw\'', subtitle: 'Qap', footerLeft: 'wa\'', footerRight: 'legh' },
      'metro-pass': { title: 'chaw\'', subtitle: 'jar', footerLeft: '1-3', footerRight: 'Hoch' },
      lottery: { title: 'chaw\'', subtitle: 'Qap', footerLeft: 'jaj', footerRight: 'DaHjaj' }
    }
  },
  dothraki: {
    title: "Make100",
    player: "Dothrak",
    gameMode: "Fich",
    car: "Hrakkar",
    ticket: "Tim",
    solved: "Azzis",
    skipped: "Dothras",
    operators: "Vezh",
    current: "Jin",
    total: "Eyel",
    theme: "Zhalia",
    language: "Lekh",
    auto: "Auto",
    light: "Shekh",
    dark: "Qoy",
    menu: "Vezh",
    play: "Dothras!",
    skipDemo: "Dothras demo",
    demoTitle: "Kifinosi dothras?",
    demo1: "Sen 6 tikh",
    demo2: "Tikh ezok",
    demo3: "Vezh ziger",
    demo4: "+, -, *, / ziger",
    demo5: "100 azzis!",
    soundAndVibration: "Qoy ar Shekh",
    sound: "Qoy",
    vibration: "Shekh",
    tapGaps: "Vezh ziger",
    skipTicket: "Dothras tim",
    skipCar: "Dothras hrakkar",
    hint: "Vezh",
    noSolution: "Vos azzis",
    introText: "100 azzis vezh.",
    start: "Dothras",
    perfect: "Zhey!",
    solvedIn: "Azzis:",
    operatorsUsed: "Vezh:",
    nextTicket: "Tim",
    nextCar: "Hrakkar",
    close: "Fich",
    leaderboard: "Khalasar",
    topPlayers: "Khal",
    loadingLeaderboard: "Khalasar...",
    noData: "Vos",
    time: "Atea",
    shareScore: "Share",
    tickets: {
      flight: { title: 'TIM', subtitle: 'KHAL', footerLeft: '14', footerRight: '2A' },
      concert: { title: 'KHALASAR', subtitle: 'VIP', footerLeft: 'RHAESH', footerRight: '1' },
      cinema: { title: 'TIM', subtitle: '1', footerLeft: 'F', footerRight: '12' },
      train: { title: 'HRAKKAR', subtitle: '1', footerLeft: '9', footerRight: '4' },
      'vintage-bus': { title: 'TIM', subtitle: 'AB', footerLeft: 'KHAL', footerRight: 'TIM' },
      'vintage-tram': { title: 'HRAKKAR', subtitle: '1', footerLeft: 'VOS', footerRight: 'VOS' },
      'soviet-trolleybus': { title: 'HRAKKAR', subtitle: 'RHAESH', footerLeft: 'KHAL', footerRight: 'KHAL' },
      'golden-ticket': { title: 'TIM', subtitle: 'KHAL', footerLeft: '1', footerRight: 'KHAL' },
      'metro-pass': { title: 'TIM', subtitle: 'KHAL', footerLeft: '1-3', footerRight: 'KHAL' },
      lottery: { title: 'TIM', subtitle: 'KHAL', footerLeft: 'ATEA', footerRight: 'JIN' }
    }
  },
  valyrian: {
    title: "Make100",
    player: "Tyalas",
    gameMode: "Kasta",
    car: "Zaldrīzes",
    ticket: "Tēmi",
    solved: "Keligon",
    skipped: "Sōvegon",
    operators: "Tegun",
    current: "Sīr",
    total: "Iōr",
    theme: "Bantis",
    language: "Tīkun",
    auto: "Auto",
    light: "Ānogar",
    dark: "Bantis",
    menu: "Tegun",
    play: "Sōvegon!",
    skipDemo: "Sōvegon demo",
    demoTitle: "Skoros sōvegon?",
    demo1: "6 tēmi",
    demo2: "Tēmi keligon",
    demo3: "Tegun sōvegon",
    demo4: "+, -, *, / sōvegon",
    demo5: "100 keligon!",
    soundAndVibration: "Ānogar ar Bantis",
    sound: "Ānogar",
    vibration: "Bantis",
    tapGaps: "Tegun sōvegon",
    skipTicket: "Sōvegon tēmi",
    skipCar: "Sōvegon zaldrīzes",
    hint: "Tegun",
    noSolution: "Daor keligon",
    introText: "100 keligon tegun.",
    start: "Sōvegon",
    perfect: "Keligon!",
    solvedIn: "Keligon:",
    operatorsUsed: "Tegun:",
    nextTicket: "Tēmi",
    nextCar: "Zaldrīzes",
    close: "Keligon",
    leaderboard: "Zaldrīzes",
    topPlayers: "Zaldrīzes",
    loadingLeaderboard: "Zaldrīzes...",
    noData: "Daor",
    time: "Sīr",
    shareScore: "Share",
    tickets: {
      flight: { title: 'TĒMI', subtitle: 'ZALDRĪZES', footerLeft: '14', footerRight: '2A' },
      concert: { title: 'ZALDRĪZES', subtitle: 'VIP', footerLeft: 'ZALDRĪZES', footerRight: '1' },
      cinema: { title: 'TĒMI', subtitle: '1', footerLeft: 'F', footerRight: '12' },
      train: { title: 'ZALDRĪZES', subtitle: '1', footerLeft: '9', footerRight: '4' },
      'vintage-bus': { title: 'TĒMI', subtitle: 'AB', footerLeft: 'ZALDRĪZES', footerRight: 'TĒMI' },
      'vintage-tram': { title: 'ZALDRĪZES', subtitle: '1', footerLeft: 'DAOR', footerRight: 'DAOR' },
      'soviet-trolleybus': { title: 'ZALDRĪZES', subtitle: 'ZALDRĪZES', footerLeft: 'ZALDRĪZES', footerRight: 'ZALDRĪZES' },
      'golden-ticket': { title: 'TĒMI', subtitle: 'ZALDRĪZES', footerLeft: '1', footerRight: 'ZALDRĪZES' },
      'metro-pass': { title: 'TĒMI', subtitle: 'ZALDRĪZES', footerLeft: '1-3', footerRight: 'ZALDRĪZES' },
      lottery: { title: 'TĒMI', subtitle: 'ZALDRĪZES', footerLeft: 'SĪR', footerRight: 'SĪR' }
    }
  }
};

type Language = keyof typeof TRANSLATIONS;

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ar', label: 'العربية' },
  { code: 'he', label: 'עברית' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'la', label: 'Latina' },
  { code: 'eo', label: 'Esperanto' },
  { code: 'elvish', label: 'Quenya' },
  { code: 'klingon', label: 'tlhIngan Hol' },
  { code: 'dothraki', label: 'Dothraki' },
  { code: 'valyrian', label: 'Valyrio' }
];

function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b > 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  class Frac {
    n: number;
    d: number;
    constructor(n: number, d: number) {
      const g = gcd(n, d);
      this.n = n / g;
      this.d = d / g;
      if (this.d < 0) {
        this.n = -this.n;
        this.d = -this.d;
      }
    }
    add(o: Frac) { return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o: Frac) { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o: Frac) { return new Frac(this.n * o.n, this.d * o.d); }
    div(o: Frac) { return new Frac(this.n * o.d, this.d * o.n); }
    isTerm() {
      let d = this.d;
      while (d % 2 === 0) d /= 2;
      while (d % 5 === 0) d /= 5;
      return d === 1;
    }
  }

  function parseFrac(str: string) {
    if (str.includes('.')) {
      const parts = str.split('.');
      if (parts.length > 2) throw new Error("Invalid number");
      const decLen = parts[1].length;
      const n = parseInt(parts[0] + parts[1], 10);
      const d = Math.pow(10, decLen);
      return new Frac(n, d);
    }
    return new Frac(parseInt(str, 10), 1);
  }

function calculateResult(digits: string[], gaps: string[]): number {
  let expr = gaps[0];
  for (let i = 0; i < digits.length; i++) {
    expr += digits[i];
    if (i < gaps.length - 1) {
      expr += gaps[i + 1];
    }
  }
  expr = expr.replace(/,/g, '.');
  
  try {
    const openParens = (expr.match(/\(/g) || []).length;
    const closeParens = (expr.match(/\)/g) || []).length;
    if (openParens !== closeParens) return NaN;
    
    // Prevent empty parentheses
    if (/\(\s*\)/.test(expr)) return NaN;

    // Prevent multi-digit numbers starting with 0 (e.g., 025)
    if (/\b0[0-9]/.test(expr)) return NaN;
    
    if (!expr.trim()) return NaN;
    if (/[^0-9+\-\*/().\s]/.test(expr)) return NaN;

    // Handle unary plus/minus
    expr = expr.replace(/(^|\()(\s*)([+-])/g, '$1$20$3');

    // Evaluate strict
    const tokens: (Frac | string)[] = [];
    let num = '';
    for (let i = 0; i < expr.length; i++) {
      const c = expr[i];
      if (/[0-9.]/.test(c)) {
        num += c;
      } else if (/[+\-*/()]/.test(c)) {
        if (num) {
          tokens.push(parseFrac(num));
          num = '';
        }
        tokens.push(c);
      }
    }
    if (num) tokens.push(parseFrac(num));

    const output: (Frac | string)[] = [];
    const ops: string[] = [];
    const prec: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
    for (const t of tokens) {
      if (t instanceof Frac) {
        output.push(t);
      } else if (t === '(') {
        ops.push(t as string);
      } else if (t === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') {
          output.push(ops.pop()!);
        }
        ops.pop();
      } else {
        while (ops.length && prec[ops[ops.length - 1]] >= prec[t as string]) {
          output.push(ops.pop()!);
        }
        ops.push(t as string);
      }
    }
    while (ops.length) output.push(ops.pop()!);

    const stack: Frac[] = [];
    for (const t of output) {
      if (t instanceof Frac) {
        stack.push(t);
      } else {
        const b = stack.pop()!;
        const a = stack.pop()!;
        if (t === '+') stack.push(a.add(b));
        if (t === '-') stack.push(a.sub(b));
        if (t === '*') stack.push(a.mul(b));
        if (t === '/') {
          if (b.n === 0) return NaN;
          const res = a.div(b);
          if (!res.isTerm()) return NaN;
          stack.push(res);
        }
      }
    }
    
    if (stack.length !== 1) return NaN;
    
    const finalRes = stack[0];
    if (finalRes.d === 1) return finalRes.n;
    return finalRes.n / finalRes.d;
  } catch (e) {
    return NaN;
  }
}

function findSolution(digits: string[]): string[] | null {
  function getNumbers(arr: string[]) {
    const str = arr.join('');
    const res = [];
    
    if (str.length === 1 || str[0] !== '0') {
      res.push({ val: parseFrac(str), expr: str });
    }
    
    for (let i = 1; i < str.length; i++) {
      const intPart = str.slice(0, i);
      if (intPart.length > 1 && intPart[0] === '0') continue;
      
      const decStr = str.slice(0, i) + '.' + str.slice(i);
      const exprStr = str.slice(0, i) + ',' + str.slice(i);
      res.push({ val: parseFrac(decStr), expr: exprStr });
    }
    return res;
  }

  function getPartitions(arr: string[]): any[] {
    if (arr.length === 0) return [[]];
    const result = [];
    for (let i = 1; i <= arr.length; i++) {
      const firsts = getNumbers(arr.slice(0, i));
      const rests = getPartitions(arr.slice(i));
      for (const f of firsts) {
        for (const r of rests) {
          result.push([f, ...r]);
        }
      }
    }
    return result;
  }

  const exprMemo = new Map<string, any[]>();
  function generateExpressions(nums: any[]): any[] {
    const key = nums.map(n => n.expr).join('|');
    if (exprMemo.has(key)) return exprMemo.get(key)!;

    if (nums.length === 1) return [{ val: nums[0].val, expr: nums[0].expr, prec: 3 }];
    const results = [];
    for (let i = 1; i < nums.length; i++) {
      const lefts = generateExpressions(nums.slice(0, i));
      const rights = generateExpressions(nums.slice(i));
      for (const l of lefts) {
        for (const r of rights) {
          // +
          const valAdd = l.val.add(r.val);
          const exprAdd = (l.prec < 1 ? '(' + l.expr + ')' : l.expr) + '+' + (r.prec < 1 ? '(' + r.expr + ')' : r.expr);
          results.push({ val: valAdd, expr: exprAdd, prec: 1 });
          
          // -
          const valSub = l.val.sub(r.val);
          const exprSub = (l.prec < 1 ? '(' + l.expr + ')' : l.expr) + '-' + (r.prec <= 1 ? '(' + r.expr + ')' : r.expr);
          results.push({ val: valSub, expr: exprSub, prec: 1 });
          
          // *
          const valMul = l.val.mul(r.val);
          const exprMul = (l.prec < 2 ? '(' + l.expr + ')' : l.expr) + '*' + (r.prec < 2 ? '(' + r.expr + ')' : r.expr);
          results.push({ val: valMul, expr: exprMul, prec: 2 });
          
          // /
          if (r.val.n !== 0) {
            const valDiv = l.val.div(r.val);
            if (valDiv.isTerm()) {
              const exprDiv = (l.prec < 2 ? '(' + l.expr + ')' : l.expr) + '/' + (r.prec <= 2 ? '(' + r.expr + ')' : r.expr);
              results.push({ val: valDiv, expr: exprDiv, prec: 2 });
            }
          }
        }
      }
    }
    exprMemo.set(key, results);
    return results;
  }

  function scoreExpression(expr: string): number {
    let score = 0;
    for (const char of expr) {
      if (char === '+' || char === '-') score += 10;
      if (char === '*' || char === '/') score += 12;
      if (char === '(') score += 5;
    }
    score += expr.length;
    return score;
  }

  const partitions = getPartitions(digits);
  const validExprs: string[] = [];

  for (const part of partitions) {
    const exprs = generateExpressions(part);
    for (const e of exprs) {
      if (e.val.n === 100 && e.val.d === 1) {
        validExprs.push(e.expr);
      }
    }
  }

  if (validExprs.length === 0) return null;

  validExprs.sort((a, b) => scoreExpression(a) - scoreExpression(b));
  const bestExpr = validExprs[0];

  // Map the expression back to the gaps array
  let gaps = Array(digits.length + 1).fill('');
  let exprIdx = 0;
  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i];
    const digitIdx = bestExpr.indexOf(digit, exprIdx);
    gaps[i] = bestExpr.slice(exprIdx, digitIdx);
    exprIdx = digitIdx + 1;
  }
  gaps[digits.length] = bestExpr.slice(exprIdx);

  // Clean up unnecessary outer parentheses if they exist
  while (gaps[0].startsWith('(') && gaps[digits.length].endsWith(')')) {
    // Check if removing them keeps the expression valid
    const tempGaps = [...gaps];
    tempGaps[0] = tempGaps[0].substring(1);
    tempGaps[digits.length] = tempGaps[digits.length].slice(0, -1);
    if (calculateResult(digits, tempGaps) === 100) {
      gaps = tempGaps;
    } else {
      break;
    }
  }

  return gaps;
}

const getTicketStyles = (t: any) => [
  {
    id: 'flight',
    containerClass: 'bg-white rounded-xl shadow-2xl border-l-[12px] border-blue-600 p-5 sm:p-6',
    icon: Plane,
    iconClass: 'text-blue-600',
    title: t.tickets.flight.title || 'BOARDING PASS',
    subtitle: t.tickets.flight.subtitle || 'FIRST CLASS',
    labelClass: 'text-slate-400 font-bold uppercase tracking-wider text-xs',
    numberContainerClass: 'border-y-2 border-dashed border-slate-200 my-2',
    numberClass: 'text-slate-800',
    footerLeft: t.tickets.flight.footerLeft || 'GATE 14',
    footerRight: t.tickets.flight.footerRight || 'SEAT 2A',
    footerClass: 'text-slate-800 font-black uppercase text-sm',
    hasBarcode: true,
    pattern: 'radial-gradient(#e2e8f0 1px, transparent 1px)'
  },
  {
    id: 'concert',
    containerClass: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] p-5 sm:p-6 border border-purple-500/30 text-white',
    icon: Music,
    iconClass: 'text-pink-400',
    title: t.tickets.concert.title || 'LIVE CONCERT',
    subtitle: t.tickets.concert.subtitle || 'VIP ACCESS',
    labelClass: 'text-purple-300/70 font-bold uppercase tracking-widest text-xs',
    numberContainerClass: 'bg-black/40 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner my-2',
    numberClass: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]',
    footerLeft: t.tickets.concert.footerLeft || 'WORLD TOUR',
    footerRight: t.tickets.concert.footerRight || 'ROW 1',
    footerClass: 'text-white font-bold uppercase tracking-widest text-xs opacity-80',
    hasBarcode: false,
    pattern: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)'
  },
  {
    id: 'cinema',
    containerClass: 'bg-[#fdf6e3] rounded-sm shadow-xl p-5 sm:p-6 border-4 border-double border-[#d4af37] relative overflow-hidden',
    icon: Film,
    iconClass: 'text-[#d4af37]',
    title: t.tickets.cinema.title || 'CINEMA TICKET',
    subtitle: t.tickets.cinema.subtitle || 'ADMIT ONE',
    labelClass: 'text-[#8b7322] font-bold uppercase tracking-widest text-xs',
    numberContainerClass: 'my-4',
    numberClass: 'text-[#2c3e50] drop-shadow-sm',
    footerLeft: t.tickets.cinema.footerLeft || 'ROW F',
    footerRight: t.tickets.cinema.footerRight || 'SEAT 12',
    footerClass: 'text-[#2c3e50] font-black uppercase text-sm',
    hasBarcode: true,
    pattern: 'radial-gradient(rgba(212,175,55,0.1) 1px, transparent 1px)'
  },
  {
    id: 'train',
    containerClass: 'bg-[#e8dcc5] rounded-sm shadow-md p-5 sm:p-6 border-x-[16px] border-dashed border-[#5c4033]',
    icon: Train,
    iconClass: 'text-[#5c4033]',
    title: t.tickets.train.title || 'EXPRESS TRAIN',
    subtitle: t.tickets.train.subtitle || 'ONE WAY',
    labelClass: 'text-[#8b6b53] font-bold uppercase tracking-widest text-xs',
    numberContainerClass: 'border-y border-[#5c4033]/30 my-2',
    numberClass: 'text-[#8b0000] opacity-90',
    footerLeft: t.tickets.train.footerLeft || 'PLATFORM 9',
    footerRight: t.tickets.train.footerRight || 'CARRIAGE 4',
    footerClass: 'text-[#5c4033] font-bold uppercase tracking-widest text-xs',
    hasBarcode: false,
    pattern: 'radial-gradient(rgba(92,64,51,0.1) 1px, transparent 1px)'
  },
  {
    id: 'vintage-bus',
    containerClass: 'bg-[#e4d5b7] rounded-sm shadow-xl p-5 sm:p-6 border-2 border-[#8b7355] relative overflow-hidden',
    icon: Bus,
    iconClass: 'text-[#5c4a3d]',
    title: t.tickets['vintage-bus'].title || 'АВТОБУСНЫЙ БИЛЕТ',
    subtitle: t.tickets['vintage-bus'].subtitle || 'СЕРИЯ АВ',
    labelClass: 'text-[#5c4a3d] font-serif font-bold uppercase tracking-widest text-xs',
    numberContainerClass: 'border-y-2 border-dashed border-[#8b7355] my-4 py-4',
    numberClass: 'text-[#8b0000] font-serif tracking-[0.2em]',
    footerLeft: t.tickets['vintage-bus'].footerLeft || 'КОНТРОЛЬНЫЙ',
    footerRight: t.tickets['vintage-bus'].footerRight || 'БИЛЕТ',
    footerClass: 'text-[#5c4a3d] font-serif font-bold uppercase text-[10px] tracking-widest',
    hasBarcode: false,
    pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139,115,85,0.05) 10px, rgba(139,115,85,0.05) 20px)'
  },
  {
    id: 'vintage-tram',
    containerClass: 'bg-[#d9cbb8] rounded-none shadow-md p-4 sm:p-6 border-x-[12px] border-dotted border-[#6b5b4e] relative',
    icon: TramFront,
    iconClass: 'text-[#3e322b]',
    title: t.tickets['vintage-tram'].title || 'ТРАМВАЙ',
    subtitle: t.tickets['vintage-tram'].subtitle || 'РАЗОВЫЙ',
    labelClass: 'text-[#3e322b] font-serif font-bold uppercase tracking-widest text-[10px] sm:text-xs',
    numberContainerClass: 'my-5 bg-[#cbbda8] p-3 rounded-sm shadow-inner border border-[#a89a85]',
    numberClass: 'text-[#2c241f] font-serif tracking-[0.25em]',
    footerLeft: t.tickets['vintage-tram'].footerLeft || 'БЕЗ КОМПОСТЕРА',
    footerRight: t.tickets['vintage-tram'].footerRight || 'НЕДЕЙСТВИТЕЛЕН',
    footerClass: 'text-[#3e322b] font-serif font-bold uppercase text-[9px] sm:text-[10px] tracking-wider',
    hasBarcode: false,
    pattern: 'radial-gradient(rgba(0,0,0,0.04) 2px, transparent 2px)'
  },
  {
    id: 'soviet-trolleybus',
    containerClass: 'bg-[#c2d1c0] rounded-sm shadow-lg p-5 sm:p-6 border border-[#4a5d4e] relative',
    icon: CableCar,
    iconClass: 'text-[#2f3e33]',
    title: t.tickets['soviet-trolleybus'].title || 'ТРОЛЛЕЙБУС',
    subtitle: t.tickets['soviet-trolleybus'].subtitle || 'ГОРТРАНС',
    labelClass: 'text-[#2f3e33] font-serif font-bold uppercase tracking-widest text-xs',
    numberContainerClass: 'border-4 border-double border-[#4a5d4e] my-4 py-4 bg-[#b3c2b1]',
    numberClass: 'text-[#8b0000] font-serif tracking-[0.15em]',
    footerLeft: t.tickets['soviet-trolleybus'].footerLeft || 'СОХРАНЯТЬ ДО',
    footerRight: t.tickets['soviet-trolleybus'].footerRight || 'КОНЦА ПОЕЗДКИ',
    footerClass: 'text-[#2f3e33] font-serif font-bold uppercase text-[9px] sm:text-[10px] tracking-widest',
    hasBarcode: false,
    pattern: 'none'
  },
  {
    id: 'golden-ticket',
    containerClass: 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 rounded-lg shadow-[0_0_40px_rgba(234,179,8,0.5)] p-5 sm:p-6 border-4 border-yellow-200 relative overflow-hidden',
    icon: Star,
    iconClass: 'text-yellow-100',
    title: t.tickets['golden-ticket'].title || 'GOLDEN TICKET',
    subtitle: t.tickets['golden-ticket'].subtitle || 'LUCKY WINNER',
    labelClass: 'text-yellow-900 font-serif font-black uppercase tracking-widest text-xs',
    numberContainerClass: 'border-y-4 border-double border-yellow-700/30 my-4 py-4 bg-yellow-400/20',
    numberClass: 'text-yellow-900 font-serif tracking-[0.2em] drop-shadow-md',
    footerLeft: t.tickets['golden-ticket'].footerLeft || 'ADMIT 1',
    footerRight: t.tickets['golden-ticket'].footerRight || 'FACTORY TOUR',
    footerClass: 'text-yellow-900 font-serif font-bold uppercase text-[10px] tracking-widest',
    hasBarcode: false,
    pattern: 'radial-gradient(rgba(255,255,255,0.2) 2px, transparent 2px)'
  },
  {
    id: 'metro-pass',
    containerClass: 'bg-blue-600 rounded-2xl shadow-lg p-5 sm:p-6 border-2 border-blue-400 relative overflow-hidden text-white',
    icon: CreditCard,
    iconClass: 'text-blue-200',
    title: t.tickets['metro-pass'].title || 'METRO PASS',
    subtitle: t.tickets['metro-pass'].subtitle || 'MONTHLY',
    labelClass: 'text-blue-100 font-sans font-bold uppercase tracking-widest text-xs',
    numberContainerClass: 'bg-white rounded-lg my-4 py-4 shadow-inner',
    numberClass: 'text-blue-900 font-mono tracking-[0.2em]',
    footerLeft: t.tickets['metro-pass'].footerLeft || 'ZONE 1-3',
    footerRight: t.tickets['metro-pass'].footerRight || 'UNLIMITED',
    footerClass: 'text-blue-200 font-sans font-bold uppercase text-[10px] tracking-widest',
    hasBarcode: true,
    pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
  },
  {
    id: 'lottery',
    containerClass: 'bg-emerald-50 rounded-lg shadow-xl p-5 sm:p-6 border-4 border-emerald-500 relative overflow-hidden',
    icon: Coins,
    iconClass: 'text-emerald-600',
    title: t.tickets.lottery.title || 'LOTTERY TICKET',
    subtitle: t.tickets.lottery.subtitle || 'JACKPOT',
    labelClass: 'text-emerald-800 font-bold uppercase tracking-widest text-xs',
    numberContainerClass: 'bg-emerald-100 rounded-full my-4 py-3 border-2 border-emerald-300 shadow-inner',
    numberClass: 'text-emerald-700 font-mono tracking-[0.3em]',
    footerLeft: t.tickets.lottery.footerLeft || 'DRAW 42',
    footerRight: t.tickets.lottery.footerRight || 'GOOD LUCK',
    footerClass: 'text-emerald-600 font-bold uppercase text-[10px] tracking-widest',
    hasBarcode: true,
    pattern: 'radial-gradient(rgba(16,185,129,0.1) 2px, transparent 2px)'
  }
];

function DemoOverlay({ onComplete, t }: { onComplete: () => void, t: typeof TRANSLATIONS['ru'] }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 2500));
      if (!isMounted) return; setStep(1); // 98 _ 7 _ 6 _ 5 _ 4
      await new Promise(r => setTimeout(r, 2500));
      if (!isMounted) return; setStep(2); // 98 + 7 - 6 + 5 - 4 = 100
      await new Promise(r => setTimeout(r, 3500));
      if (!isMounted) return; setStep(3); // Fade out
      await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return; setStep(4); // Fade in with 1 2 3 4 1 0
      await new Promise(r => setTimeout(r, 2500));
      if (!isMounted) return; setStep(5); // (1 + 2 + 3 + 4) * 10 = 100
      await new Promise(r => setTimeout(r, 3500));
      if (!isMounted) return; setStep(6); // Play button
    };
    sequence();
    return () => { isMounted = false; };
  }, []);

  const messages = [
    t.demo1,
    t.demo2,
    t.demo3,
    t.demo4,
    t.demo5
  ];

  const getMessageIndex = (s: number) => {
    if (s === 0) return 0;
    if (s === 1) return 1;
    if (s === 2) return 2;
    if (s >= 3 && s <= 5) return 3;
    return 4;
  };

  return (
    <motion.div 
      key="demo"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-2 sm:p-4"
      style={{
        paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 16px)) + 16px)',
        paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 16px)) + 16px)'
      }}
    >
      <div className="w-full max-w-lg flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-6 text-center">{t.demoTitle}</h2>
        
        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full flex flex-col items-center relative overflow-hidden">
          <p className="text-zinc-600 dark:text-zinc-400 text-center h-12 mb-4 font-medium text-sm sm:text-base px-4 transition-opacity duration-300">
            {messages[getMessageIndex(step)]}
          </p>

          <div className={`flex items-center justify-center gap-0.5 sm:gap-1.5 text-2xl sm:text-4xl font-mono font-black text-zinc-900 dark:text-white mb-6 h-16 w-full px-2 transition-opacity duration-500 ${step === 3 ? 'opacity-0' : 'opacity-100'}`}>
             {step >= 4 && <div className="text-orange-500 font-black text-3xl sm:text-4xl mr-1">(</div>}
             
             <span>{step >= 4 ? '1' : '9'}</span>
             
             {/* Gap 1 */}
             <div className={`h-8 sm:h-12 border-2 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 overflow-hidden ${
               step === 0 ? 'w-6 sm:w-10 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800' : 
               step === 4 ? 'w-6 sm:w-10 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800' :
               step >= 5 ? 'w-6 sm:w-10 border-orange-500 bg-orange-500/20 scale-110' :
               'w-0 border-0 opacity-0 mx-[-2px] sm:mx-[-4px]'
             }`}>
                {step >= 5 && <span className="text-orange-500">+</span>}
             </div>
             
             <span>{step >= 4 ? '2' : '8'}</span>
             
             {/* Gap 2 */}
             <div className={`h-8 sm:h-12 border-2 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 overflow-hidden ${
               step === 2 ? 'w-6 sm:w-10 border-orange-500 bg-orange-500/20 scale-110' : 
               step >= 5 ? 'w-6 sm:w-10 border-orange-500 bg-orange-500/20 scale-110' : 
               'w-6 sm:w-10 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
             }`}>
                {step === 2 && <span className="text-orange-500">+</span>}
                {step >= 5 && <span className="text-orange-500">+</span>}
             </div>
             
             <span>{step >= 4 ? '3' : '7'}</span>
             
             {/* Gap 3 */}
             <div className={`h-8 sm:h-12 border-2 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 overflow-hidden ${
               step === 2 ? 'w-6 sm:w-10 border-orange-500 bg-orange-500/20 scale-110' :
               step >= 5 ? 'w-6 sm:w-10 border-orange-500 bg-orange-500/20 scale-110' :
               'w-6 sm:w-10 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
             }`}>
                {step === 2 && <span className="text-orange-500">-</span>}
                {step >= 5 && <span className="text-orange-500">+</span>}
             </div>
             
             <span>{step >= 4 ? '4' : '6'}</span>
             
             {/* Gap 4 */}
             <div className={`h-8 sm:h-12 border-2 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 overflow-hidden ${
               step === 2 ? 'w-6 sm:w-10 border-orange-500 bg-orange-500/20 scale-110' :
               step >= 5 ? 'w-10 sm:w-14 border-orange-500 bg-orange-500/20 scale-110' :
               'w-6 sm:w-10 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
             }`}>
                {step === 2 && <span className="text-orange-500">+</span>}
                {step >= 5 && <span className="text-orange-500 tracking-tighter">)*</span>}
             </div>
             
             <span>{step >= 4 ? '1' : '5'}</span>
             
             {/* Gap 5 */}
             <div className={`h-8 sm:h-12 border-2 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 overflow-hidden ${
               step === 2 ? 'w-6 sm:w-10 border-orange-500 bg-orange-500/20 scale-110' :
               step >= 4 ? 'w-0 border-0 opacity-0 mx-[-2px] sm:mx-[-4px]' :
               'w-6 sm:w-10 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
             }`}>
                {step === 2 && <span className="text-orange-500">-</span>}
             </div>
             
             <span>{step >= 4 ? '0' : '4'}</span>
          </div>

          <div className={`text-4xl sm:text-6xl font-black font-mono transition-all duration-500 h-16 flex items-center justify-center ${step === 3 ? 'opacity-0' : 'opacity-100'}`}>
             {step === 2 || step >= 5 ? <span className="text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">= 100</span> : <span className="text-zinc-400 dark:text-zinc-700">= ?</span>}
          </div>

          <div className="h-16 mt-6 flex items-center justify-center w-full">
            {step >= 6 ? (
              <motion.div initial={{scale: 0}} animate={{scale: 1}} className="w-full">
                <button onClick={onComplete} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl transition-all shadow-[0_8px_20px_rgba(249,115,22,0.25)]">
                  {t.play}
                </button>
              </motion.div>
            ) : (
              <div className="flex gap-1.5 sm:gap-2 w-full justify-center opacity-60 pointer-events-none">
                 <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center"><Plus size={20} className="text-zinc-500 dark:text-zinc-400"/></div>
                 <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center"><Minus size={20} className="text-zinc-500 dark:text-zinc-400"/></div>
                 <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center"><X size={20} className="text-zinc-500 dark:text-zinc-400"/></div>
                 <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center"><Divide size={20} className="text-zinc-500 dark:text-zinc-400"/></div>
              </div>
            )}
          </div>
        </div>
        
        {step < 6 && (
          <button onClick={onComplete} className="mt-4 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-bold px-6 py-2 transition-colors text-sm sm:text-base">
            {t.skipDemo}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function App() {
  const [digits, setDigits] = useState<string[]>([]);
  const [letters, setLetters] = useState<string[]>(['A', 'B', 'C']);
  const [carImage, setCarImage] = useState<string>('');
  const carImagesListRef = useRef<string[]>(FALLBACK_IMAGES);
  const [gaps, setGaps] = useState<string[]>(['', '', '', '', '', '', '']);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(1);
  const [won, setWon] = useState(false);
  const [isHinting, setIsHinting] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [noSolutionMessage, setNoSolutionMessage] = useState(false);

  const [ticketStyleId, setTicketStyleId] = useState('flight');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [gameState, setGameState] = useState<'idle' | 'playing'>('idle');
  const [tgUser, setTgUser] = useState<TelegramUser | null>(() => {
    try {
      const cached = localStorage.getItem('make100_tgUser');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error("Failed to parse cached tgUser:", e);
    }
    return null;
  });
  const [isTgValidating, setIsTgValidating] = useState<boolean>(true);
  const [tgValidationError, setTgValidationError] = useState<string | null>(null);
  
  const [gameMode, setGameMode] = useState<'ticket' | 'car'>('ticket');
  const [themePreference, setThemePreference] = useState<'auto' | 'dark' | 'light'>('auto');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
    if (tg?.colorScheme) return tg.colorScheme;
    const systemPrefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });
  const [language, setLanguage] = useState<Language>(() => {
    const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
    const tgLang = tg?.initDataUnsafe?.user?.language_code;
    const browserLang = navigator.language.split('-')[0];
    const detectedLang = tgLang || browserLang;

    if (detectedLang && detectedLang in TRANSLATIONS) {
      return detectedLang as Language;
    }
    
    console.log(`[Language Detection] Detected language "${detectedLang}" is not supported. Falling back to "en".`);
    return 'en';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  
  useEffect(() => {
    if (tgUser && tgUser.id && tgUser.id !== 9999 && tgUser.id !== 1) {
      try {
        localStorage.setItem('make100_tgUser', JSON.stringify(tgUser));
      } catch (e) {
        console.error("Failed to save tgUser to localStorage:", e);
      }
    }
  }, [tgUser]);
  
  const t: any = TRANSLATIONS[language];

  useEffect(() => {
    if (!GITHUB_FOLDER_URL) return;

    const fetchImages = async () => {
      try {
        let apiUrl = '';
        try {
          const urlObj = new URL(GITHUB_FOLDER_URL);
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          
          if (pathParts.length >= 2) {
            const owner = pathParts[0];
            const repo = pathParts[1];
            let branch = 'main';
            let path = '';
            
            if (pathParts.length >= 4 && pathParts[2] === 'tree') {
              branch = pathParts[3];
              path = pathParts.slice(4).join('/');
            }
            
            apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
          } else {
            console.error('Неверный формат ссылки на GitHub.');
            return;
          }
        } catch (e) {
          console.error('Неверный URL:', e);
          return;
        }
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Ошибка при загрузке данных с GitHub API');
        
        const data = await response.json();
        if (Array.isArray(data)) {
          const images = data
            .filter((file: { name: string }) => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
            .map((file: { download_url: string }) => file.download_url);
            
          if (images.length > 0) {
            carImagesListRef.current = images;
            setCarImage(images[Math.floor(Math.random() * images.length)]);
          }
        }
      } catch (err) {
        console.error('Ошибка при получении картинок с GitHub:', err);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('background-color', '#09090b', 'important');
      body.style.setProperty('background-color', '#09090b', 'important');
      
      // Override Telegram theme variables with priority
      root.style.setProperty('--tg-theme-bg-color', '#09090b', 'important');
      root.style.setProperty('--tg-theme-secondary-bg-color', '#18181b', 'important');
      root.style.setProperty('--tg-theme-text-color', '#fafafa', 'important');
      root.style.setProperty('--tg-theme-hint-color', '#a1a1aa', 'important');
      
      root.style.setProperty('--app-bg', '#09090b', 'important');
      root.style.setProperty('--app-text', '#fafafa', 'important');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('background-color', '#fafafa', 'important');
      body.style.setProperty('background-color', '#fafafa', 'important');
      
      // Override Telegram theme variables with priority
      root.style.setProperty('--tg-theme-bg-color', '#fafafa', 'important');
      root.style.setProperty('--tg-theme-secondary-bg-color', '#f4f4f5', 'important');
      root.style.setProperty('--tg-theme-text-color', '#09090b', 'important');
      root.style.setProperty('--tg-theme-hint-color', '#71717a', 'important');
      
      root.style.setProperty('--app-bg', '#fafafa', 'important');
      root.style.setProperty('--app-text', '#09090b', 'important');
    }
  }, [theme]);
  
  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = useCallback((type: 'click' | 'success' | 'error' | 'skip') => {
    if (!soundEnabled) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.2);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'skip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }
  }, [soundEnabled]);

  const playVibration = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
    if (!vibrationEnabled) return;
    
    const tg = (window as unknown as { Telegram?: { WebApp: unknown } }).Telegram?.WebApp as {
      HapticFeedback?: {
        impactOccurred: (style: string) => void;
        notificationOccurred: (type: string) => void;
      }
    } | undefined;
    if (tg?.HapticFeedback) {
      if (type === 'light' || type === 'medium' || type === 'heavy') {
        tg.HapticFeedback.impactOccurred(type);
      } else if (type === 'success') {
        tg.HapticFeedback.notificationOccurred('success');
      } else if (type === 'error') {
        tg.HapticFeedback.notificationOccurred('error');
      }
    } else if (navigator.vibrate) {
      if (type === 'light') navigator.vibrate(10);
      else if (type === 'medium') navigator.vibrate(20);
      else if (type === 'heavy') navigator.vibrate(40);
      else if (type === 'success') navigator.vibrate([30, 50, 30]);
      else if (type === 'error') navigator.vibrate([50, 50, 50]);
    }
  }, [vibrationEnabled]);

  const completeDemo = () => {
    setShowDemo(false);
    setHasSeenOnboarding(true);
    setGameState('playing');
  };

  // Game Statistics
  const [solvedCount, setSolvedCount] = useState(0);
  const [unsolvedCount, setUnsolvedCount] = useState(0);
  const [totalSolveTime, setTotalSolveTime] = useState(0);
  const [totalOperatorsUsed, setTotalOperatorsUsed] = useState(0);
  const [statsLoaded, setStatsLoaded] = useState(false);

  // Demo State
  const [showDemo, setShowDemo] = useState(true);

  useEffect(() => {
    if (statsLoaded) {
      if (hasSeenOnboarding || solvedCount > 0) {
        setShowDemo(false);
      }
    }
  }, [statsLoaded, hasSeenOnboarding, solvedCount]);

  // Firebase Auth State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          setUser(userCredential.user);
        } catch (error: any) {
          // Silent fallback for preview/development environments where anonymous auth is disabled
          console.warn("Anonymous auth failed (using secure local storage as fallback):", error?.message || error);
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const fetchLeaderboard = async () => {
    if (!auth.currentUser) {
      console.warn("Leaderboard cannot be fetched: User is not authenticated.");
      setLeaderboardData([]);
      return;
    }
    setIsLoadingLeaderboard(true);
    try {
      const q = query(collection(db, 'public_stats'), orderBy('solvedCount', 'desc'), limit(150));
      const querySnapshot = await getDocs(q);
      const data: any[] = [];
      const seenTgUsers = new Set();
      
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        const tgId = docData.tgUserId;
        
        let isDuplicate = false;
        // Only filter duplicates if there is a real, valid Telegram ID.
        if (tgId && tgId !== 9999 && tgId !== 1) {
          if (seenTgUsers.has(tgId)) {
            isDuplicate = true;
          }
        }
        
        if (!isDuplicate) {
          if (tgId && tgId !== 9999 && tgId !== 1) {
            seenTgUsers.add(tgId);
          }
          data.push({ id: doc.id, ...docData });
        }
      });
      setLeaderboardData(data.slice(0, 50));
    } catch (error: any) {
      console.error("Error fetching leaderboard: ", error);
      if (error?.code === 'permission-denied' || error?.message?.includes('permission-denied')) {
        console.warn("Permission denied for leaderboard listing");
        setLeaderboardData([]);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'public_stats');
      }
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (!isAuthReady) return;

    const loadStats = async () => {
      const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
      
      const loadFromLocal = () => {
        const localStats = localStorage.getItem('make100_stats');
        if (localStats) {
          try {
            const parsed = JSON.parse(localStats);
            setSolvedCount(parsed.solvedCount || 0);
            setUnsolvedCount(parsed.unsolvedCount || 0);
            setTotalSolveTime(parsed.totalSolveTime || 0);
            setTotalOperatorsUsed(parsed.totalOperatorsUsed || 0);
            if (parsed.themePreference) setThemePreference(parsed.themePreference);
            if (parsed.language) setLanguage(parsed.language);
            if (parsed.gameMode) setGameMode(parsed.gameMode);
            if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
            if (parsed.vibrationEnabled !== undefined) setVibrationEnabled(parsed.vibrationEnabled);
            if (parsed.hasSeenOnboarding !== undefined) setHasSeenOnboarding(parsed.hasSeenOnboarding);
            return true;
          } catch (e) { console.error(e); }
        }
        return false;
      };

      if (user) {
        try {
          // Fetch from public_stats collection first to restore Telegram name/info
          const publicDocRef = doc(db, 'public_stats', user.uid);
          const publicDocSnap = await getDoc(publicDocRef);
          
          if (publicDocSnap.exists()) {
            const publicData = publicDocSnap.data();
            // If the user's saved public stats has a valid Telegram name/ID, restore tgUser
            if (publicData.tgUserId && publicData.tgUserId !== 9999 && publicData.tgUserId !== 1) {
              setTgUser(prev => {
                if (prev && prev.id && prev.id !== 9999 && prev.id !== 1 && prev.first_name && prev.first_name !== 'Player' && prev.first_name !== 'Guest') {
                  return prev;
                }
                const savedDisplayName = publicData.displayName || '';
                const parts = savedDisplayName.split(' ');
                const first_name = parts[0] || savedDisplayName;
                const last_name = parts.slice(1).join(' ') || undefined;
                
                const restoredUser: TelegramUser = {
                  id: publicData.tgUserId,
                  first_name: first_name,
                  last_name: last_name,
                  photo_url: publicData.photoURL || undefined
                };
                try {
                  localStorage.setItem('make100_tgUser', JSON.stringify(restoredUser));
                } catch (e) {
                  console.error("Failed to save restored tgUser to localStorage:", e);
                }
                return restoredUser;
              });
            }
          }

          // Fetch from users collection
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const parsed = docSnap.data();
            setSolvedCount(parsed.solvedCount || 0);
            setUnsolvedCount(parsed.unsolvedCount || 0);
            setTotalSolveTime(parsed.totalSolveTime || 0);
            setTotalOperatorsUsed(parsed.totalOperatorsUsed || 0);
            if (parsed.themePreference) setThemePreference(parsed.themePreference);
            if (parsed.language) setLanguage(parsed.language);
            if (parsed.gameMode) setGameMode(parsed.gameMode);
            if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
            if (parsed.vibrationEnabled !== undefined) setVibrationEnabled(parsed.vibrationEnabled);
            if (parsed.hasSeenOnboarding !== undefined) setHasSeenOnboarding(parsed.hasSeenOnboarding);
            setStatsLoaded(true);
            return;
          }
        } catch (e) {
          console.error("Firebase load error", e);
          handleFirestoreError(e, OperationType.GET, `users/${user.uid}`);
        }
      }

      if (tg?.initData && tg?.CloudStorage) {
        let callbackFired = false;
        try {
          tg.CloudStorage.getItem('make100_stats', (err: Error | null, value: string) => {
            callbackFired = true;
            if (!err && value) {
              try {
                const parsed = JSON.parse(value);
                setSolvedCount(parsed.solvedCount || 0);
                setUnsolvedCount(parsed.unsolvedCount || 0);
                setTotalSolveTime(parsed.totalSolveTime || 0);
                setTotalOperatorsUsed(parsed.totalOperatorsUsed || 0);
                if (parsed.themePreference) setThemePreference(parsed.themePreference);
                if (parsed.language) setLanguage(parsed.language);
                if (parsed.gameMode) setGameMode(parsed.gameMode);
                if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
                if (parsed.vibrationEnabled !== undefined) setVibrationEnabled(parsed.vibrationEnabled);
              } catch (e) { 
                console.error(e); 
                loadFromLocal();
              }
            } else {
              loadFromLocal();
            }
            setStatsLoaded(true);
          });
          // Fallback in case CloudStorage callback never fires
          setTimeout(() => {
            if (!callbackFired) {
              loadFromLocal();
              setStatsLoaded(true);
            }
          }, 1000);
        } catch (e) {
          console.error("CloudStorage error", e);
          loadFromLocal();
          setStatsLoaded(true);
        }
      } else {
        loadFromLocal();
        setStatsLoaded(true);
      }
    };
    loadStats();
  }, [isAuthReady, user]);

  useEffect(() => {
    if (!statsLoaded) return;
    
    const stats = { solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, themePreference, language, gameMode, soundEnabled, vibrationEnabled, hasSeenOnboarding };
    const statsStr = JSON.stringify(stats);
    
    // Always save to localStorage as a fallback
    localStorage.setItem('make100_stats', statsStr);

    if (user) {
      const isRealTelegramUser = !!(tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999 && tgUser.first_name && tgUser.first_name !== 'Player' && tgUser.first_name !== 'Guest');
      if (isRealTelegramUser && tgUser) {
        const saveStats = async () => {
          try {
            const displayName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ').trim() || 'Player';
            const photoURL = tgUser.photo_url || '';
            const tgUserId = tgUser.id;

            const publicStats = {
              solvedCount,
              unsolvedCount,
              totalSolveTime,
              totalOperatorsUsed,
              displayName: displayName.substring(0, 100),
              photoURL: photoURL.substring(0, 1000),
              tgUserId: tgUserId
            };
            await setDoc(doc(db, 'public_stats', user.uid), publicStats, { merge: true });

            // Then save to users
            await setDoc(doc(db, 'users', user.uid), stats, { merge: true });
          } catch (e) {
            console.error("Firebase save error", e);
            handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
          }
        };
        saveStats();
      }
    }

    const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
    if (tg?.initData && tg?.CloudStorage) {
      try {
        tg.CloudStorage.setItem('make100_stats', statsStr);
      } catch (e) {
        console.error("CloudStorage save error", e);
      }
    }
  }, [solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, theme, language, gameMode, soundEnabled, vibrationEnabled, statsLoaded, user, tgUser]);



  useEffect(() => {
    if (!isAuthReady || !user) return;
    const fetchRank = async () => {
      try {
        const q = query(collection(db, 'public_stats'), where('solvedCount', '>', solvedCount));
        const snapshot = await getCountFromServer(q);
        setPlayerRank(snapshot.data().count + 1);
      } catch (e) {
        console.error("Error fetching rank", e);
        handleFirestoreError(e, OperationType.GET, 'public_stats');
      }
    };
    fetchRank();
  }, [isAuthReady, user, solvedCount]);

  const showHint = async () => {
    if (isHinting || won) return;
    const solution = findSolution(digits);
    if (!solution) {
      setNoSolutionMessage(true);
      return;
    }

    setIsHinting(true);
    setHintUsed(true);
    setGaps(['', '', '', '', '', '', '']);
    setSelectedSlot(null);
    
    const newGaps = ['', '', '', '', '', '', ''];
    for (let i = 0; i <= 6; i++) {
      if (solution[i] !== '') {
        await new Promise(resolve => setTimeout(resolve, 600));
        newGaps[i] = solution[i];
        setGaps([...newGaps]);
        playSound('click');
        playVibration('light');
      }
    }
    
    // Ensure all gaps are set at the end, even empty ones
    setGaps([...solution]);
    setIsHinting(false);
  };

  const initGame = useCallback((startAsIdle = false, isSkip = false) => {
    setNoSolutionMessage(false);
    if (isSkip) {
      setUnsolvedCount(prev => prev + 1);
      playSound('skip');
      playVibration('medium');
    } else if (!startAsIdle) {
      playSound('click');
      playVibration('light');
    }
    
    setDigits(Math.floor(Math.random() * 1000000).toString().padStart(6, '0').split(''));

    // Generate random letters for the license plate
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetters = [
      alphabet[Math.floor(Math.random() * alphabet.length)],
      alphabet[Math.floor(Math.random() * alphabet.length)],
      alphabet[Math.floor(Math.random() * alphabet.length)]
    ];
    setLetters(randomLetters);

    // Set random car image
    setCarImage(carImagesListRef.current[Math.floor(Math.random() * carImagesListRef.current.length)]);

    setGaps(['', '', '', '', '', '', '']);
    setSelectedSlot(1);
    setWon(false);
    setHintUsed(false);
    
    const styles = getTicketStyles(TRANSLATIONS[language] || TRANSLATIONS['ru']);
    setTicketStyleId(styles[Math.floor(Math.random() * styles.length)].id);
    setElapsedTime(0);
    setGameState(startAsIdle === true ? 'idle' : 'playing');
  }, [playSound, playVibration, language]);

  useEffect(() => {
    let attempts = 0;
    let isMounted = true;
    let isInitializing = false;

    const checkAndInit = async () => {
      if (isInitializing) return false;
      isInitializing = true;

      try {
        // 1. Try Telegram Web App (Mini Apps) - High priority to capture actual Telegram user profiles
        const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
        if (tg && (tg.initData || tg.initDataUnsafe?.user)) {
          tg.ready();
          tg.expand();
          
          if (!tg.initData) {
            // Unsafe user fallback if initData is empty but user object is present
            if (isMounted) {
              const fallbackUser = tg.initDataUnsafe?.user || { id: 1, first_name: "Player" };
              setTgUser(fallbackUser);
              setIsTgValidating(false);
            }
            return true;
          }

          // Check session storage first
          try {
            const cachedInitData = sessionStorage.getItem('tgInitData');
            const cachedUser = sessionStorage.getItem('tgUser');
            if (cachedInitData === tg.initData && cachedUser) {
              if (isMounted) {
                setTgUser(JSON.parse(cachedUser));
                setIsTgValidating(false);
              }
              return true;
            }
          } catch (e) {
            console.error("Session storage error", e);
          }

          try {
            const response = await fetch('/api/auth/telegram', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData: tg.initData })
            });
            
            const data = await response.json();
            
            if (!isMounted) return true;

            if (!response.ok) {
              if (data.code === 'SESSION_EXPIRED') {
                setTgValidationError('SESSION_EXPIRED');
              } else {
                setTgValidationError(data.error || 'Validation failed');
              }
              const isPreviewEnv = window.location.hostname === 'localhost' || window.location.hostname.includes('ais-dev-') || (window.self !== window.top);
              if (isPreviewEnv) {
                const fallbackUser = tg.initDataUnsafe?.user || { id: 1, first_name: "Player" };
                setTgUser(fallbackUser);
              } else {
                setTgUser(null);
              }
              setIsTgValidating(false);
              return true;
            }
            
            let userToSet = null;
            if (data.user) {
              userToSet = data.user;
            } else if (tg.initDataUnsafe?.user) {
              userToSet = tg.initDataUnsafe.user;
            }

            if (userToSet) {
              setTgUser(userToSet);
              try {
                sessionStorage.setItem('tgInitData', tg.initData);
                sessionStorage.setItem('tgUser', JSON.stringify(userToSet));
              } catch (e) {
                console.error("Failed to save to session storage", e);
              }
            }
          } catch (err) {
            if (isMounted) {
              setTgValidationError('Network error during validation');
              const isPreviewEnv = window.location.hostname === 'localhost' || window.location.hostname.includes('ais-dev-') || (window.self !== window.top);
              if (isPreviewEnv) {
                const fallbackUser = tg.initDataUnsafe?.user || { id: 1, first_name: "Player" };
                setTgUser(fallbackUser);
              } else {
                setTgUser(null);
              }
            }
          }
          
          if (isMounted) {
            setIsTgValidating(false);
          }
          return true;
        }

        // 2. Try Telegram Game Proxy (HTML5 Games via Bot API)
        const gameProxy = (window as any).TelegramGameProxy;
        if (gameProxy && gameProxy.initParams && (gameProxy.initParams.user_id || gameProxy.initParams.chat_id)) {
          if (isMounted) {
            setTgUser({
              id: gameProxy.initParams.user_id || 1,
              first_name: "Player",
            });
            setIsTgValidating(false);
          }
          return true;
        }

        // 3. Try URL query and hash parameters direct fallback (super robust detecting game/bot launch params)
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const tgShareScoreUrl = urlParams.get('tgShareScoreUrl') || hashParams.get('tgShareScoreUrl');
        const tgUserId = urlParams.get('userId') || hashParams.get('userId') || 
                         urlParams.get('tg_user_id') || hashParams.get('tg_user_id') || 
                         urlParams.get('user_id') || hashParams.get('user_id');
        const tgInitData = urlParams.get('tgWebAppStartParam') || hashParams.get('tgWebAppStartParam') || urlParams.get('hash') || hashParams.get('hash');
        const tgGameId = urlParams.get('id') || hashParams.get('id');
        const tgChatId = urlParams.get('chatId') || hashParams.get('chatId') ||
                         urlParams.get('chat_id') || hashParams.get('chat_id');
        
        if (tgShareScoreUrl || tgUserId || tgInitData || tgGameId || tgChatId) {
          if (isMounted) {
            setTgUser({
              id: tgUserId ? Number(tgUserId) : 1,
              first_name: "Player",
            });
            setIsTgValidating(false);
          }
          return true;
        }

        return false;
      } finally {
        isInitializing = false;
      }
    };

    const poll = async () => {
      attempts++;
      const success = await checkAndInit();
      if (success) return;

      if (attempts < 15 && isMounted) { // Poll up to 1.5 seconds (15 * 100ms)
        setTimeout(poll, 100);
      } else if (isMounted) {
        // Fallback for standard Web App environments outside of Telegram
        const isPreviewEnv = window.location.hostname === 'localhost' || window.location.hostname.includes('ais-dev-') || (window.self !== window.top);
        if (isPreviewEnv) {
          setTgUser(prev => {
            if (prev && prev.id && prev.id !== 9999 && prev.id !== 1) {
              return prev;
            }
            try {
              const cached = localStorage.getItem('make100_tgUser');
              if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && parsed.id && parsed.id !== 9999 && parsed.id !== 1) {
                  return parsed;
                }
              }
            } catch (e) {
              console.error("Failed to parse cached tgUser in fallback:", e);
            }
            return {
              id: 9999,
              first_name: "Guest",
            };
          });
        } else {
          setTgUser(null);
        }
        setIsTgValidating(false);
      }
    };

    poll();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
    
    const updateTheme = () => {
      if (themePreference === 'auto') {
        const systemPrefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(tg?.colorScheme || (systemPrefersDark ? 'dark' : 'light'));
      } else {
        setTheme(themePreference);
      }
    };

    updateTheme();

    if (tg?.onEvent) {
      tg.onEvent('themeChanged', updateTheme);
      return () => {
        if (tg.offEvent) tg.offEvent('themeChanged', updateTheme);
      };
    }
  }, [themePreference]);

  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
    if (tg) {
      try {
        const targetColor = theme === 'dark' ? '#09090b' : '#fafafa';
        tg.setHeaderColor(targetColor);
        tg.setBackgroundColor(targetColor);
      } catch (e) {
        try {
          tg.setHeaderColor('bg_color');
          tg.setBackgroundColor('bg_color');
        } catch (e2) {
          console.error("Failed to set Telegram colors", e2);
        }
      }
    }
  }, [theme]);

  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
    if (tg && tg.initData && tg.BackButton) {
      const shouldShowBack = gameState === 'playing' || isMenuOpen || isLeaderboardOpen;
      
      if (shouldShowBack) {
        tg.BackButton.show();
      } else {
        tg.BackButton.hide();
      }

      const handleBack = () => {
        if (isMenuOpen) {
          setIsMenuOpen(false);
        } else if (isLeaderboardOpen) {
          setIsLeaderboardOpen(false);
        } else if (gameState === 'playing') {
          setGameState('idle');
        } else {
          tg.close();
        }
      };
      
      tg.BackButton.onClick(handleBack);
      return () => {
        tg.BackButton.offClick(handleBack);
      };
    }
  }, [gameState, isMenuOpen, isLeaderboardOpen, tgUser]);

  useEffect(() => {
    initGame(true);
  }, [initGame]);

  useEffect(() => {
    if (gameState !== 'playing' || won) return;
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, won]);

  const handleOp = useCallback((op: string) => {
    if (selectedSlot === null || won) return;
    
    const newGaps = [...gaps];
    if (op === 'Backspace') {
      newGaps[selectedSlot] = newGaps[selectedSlot].slice(0, -1);
      playSound('click');
      playVibration('light');
    } else {
      newGaps[selectedSlot] += op;
      playSound('click');
      playVibration('medium');
    }
    setGaps(newGaps);
  }, [selectedSlot, gaps, won, playSound, playVibration]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (won) {
         if (e.key === 'Enter' || e.key === ' ') {
            initGame(false);
         }
         return;
      }
      if (selectedSlot === null) return;
      
      if (['+', '-', '*', '/', '(', ')', ','].includes(e.key)) {
        handleOp(e.key);
      } else if (e.key === '.') {
        handleOp(',');
      } else if (e.key === 'Backspace') {
        handleOp('Backspace');
      } else if (e.key === 'ArrowLeft') {
        setSelectedSlot(Math.max(0, selectedSlot - 1));
        playSound('click');
        playVibration('light');
      } else if (e.key === 'ArrowRight') {
        setSelectedSlot(Math.min(6, selectedSlot + 1));
        playSound('click');
        playVibration('light');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSlot, handleOp, won, initGame, gameState, playSound, playVibration]);

  const currentResult = digits.length ? calculateResult(digits, gaps) : 0;
  const isWin = currentResult === 100;

  const sendScoreToCloudflare = useCallback(async (score: number) => {
    try {
      // REPLACE /api/score WITH YOUR CLOUDFLARE WORKER URL
      // Example: 'https://your-worker-name.your-subdomain.workers.dev/score'
      const CLOUDFLARE_API_URL = '/api/score'; 
      const tgParams = (window as any).TelegramGameProxy?.initParams || {};
      const payload = {
        score,
        userId: tgUser?.id || tgParams.user_id,
        initParams: tgParams
      };
      
      const response = await fetch(CLOUDFLARE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      console.log('Score sent to Cloudflare API:', await response.text());
    } catch (e) {
      console.error('Failed to send score via fetch', e);
    }
  }, [tgUser]);

  useEffect(() => {
    if (isWin && !won && !hintUsed) {
      setWon(true);
      setGameState('idle');
      playSound('success');
      playVibration('success');
      
      // Update statistics
      const newSolvedCount = solvedCount + 1;
      setSolvedCount(newSolvedCount);
      const newTotalTime = totalSolveTime + elapsedTime;
      setTotalSolveTime(newTotalTime);
      
      // Send score via fetch
      sendScoreToCloudflare(newSolvedCount);
      
      // Count operators used in the winning solution
      const operatorsUsed = gaps.join('').replace(/[0-9.]/g, '').length;
      const newTotalOperators = totalOperatorsUsed + operatorsUsed;
      setTotalOperatorsUsed(newTotalOperators);
      
      setSelectedSlot(null);
    }
  }, [isWin, won, hintUsed, elapsedTime, gaps, playSound, playVibration, solvedCount, totalSolveTime, totalOperatorsUsed, tgUser, gameMode, digits]);

  if (!digits.length) return null;

  const renderLicensePlate = () => {
    // A generic, clean CSS-based Russian-style license plate
    return (
      <div className="w-full h-full max-h-[650px] max-w-[1000px] mx-auto flex flex-col items-center justify-center gap-4">
        <div className="w-full h-full min-h-[150px] shrink rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-zinc-800 relative bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
          {!carImage && <span className="text-zinc-400">Loading...</span>}
          {carImage && (
            <>
              <img 
                src={carImage} 
                alt="Car Exterior" 
                className="w-full h-full object-cover absolute inset-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.opacity = '0';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const errorMsg = document.createElement('span');
                    errorMsg.className = 'text-red-500 font-bold absolute z-20';
                    errorMsg.innerText = 'Image load error';
                    parent.appendChild(errorMsg);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none"></div>
            </>
          )}

          {/* License Plate Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[60%] max-w-[196px] bg-white rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-[2px] border-zinc-900 overflow-hidden flex flex-col">
            <div className="flex items-stretch bg-gradient-to-b from-white to-zinc-100 h-10 sm:h-11">
              
              {/* Main number section */}
              <div className="w-2/3 flex items-center justify-center gap-0.5 px-1 border-r-[2px] border-zinc-900">
                <span className="font-sans text-xl sm:text-2xl font-black text-zinc-900 mt-0.5">{letters[0]}</span>
                <span className="font-mono text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">{digits.slice(0, 3).join('')}</span>
                <span className="font-sans text-xl sm:text-2xl font-black text-zinc-900 mt-0.5">{letters[1]}{letters[2]}</span>
              </div>

              {/* Region section */}
              <div className="w-1/3 flex flex-col items-center justify-center px-1">
                <span className="font-mono text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">{digits.slice(3).join('')}</span>
              </div>
            </div>
            
            {/* Screws for main plate (Left and Right edges) */}
            <div className="absolute top-1/2 -translate-y-1/2 left-1 w-1 h-1 rounded-full bg-zinc-300 border border-zinc-400 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-zinc-500 rotate-12"></div></div>
            <div className="absolute top-1/2 -translate-y-1/2 right-1 w-1 h-1 rounded-full bg-zinc-300 border border-zinc-400 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-zinc-500 -rotate-12"></div></div>
          </div>
        </div>
      </div>
    );
  };

  const renderTicket = () => {
    const styles = getTicketStyles(t);
    const ticketStyle = styles.find(s => s.id === ticketStyleId) || styles[0];
    const numStr = digits.join('');
    const Icon = ticketStyle.icon;
    const tTicket = t.tickets?.[ticketStyle.id as keyof typeof t.tickets] || ticketStyle;
    
    return (
      <div className={`relative w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto overflow-hidden ${ticketStyle.containerClass}`}>
        {/* Watermark / Pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: ticketStyle.pattern, backgroundSize: '10px 10px' }}></div>
        
        <div className="flex justify-between items-center mb-6 sm:mb-8 relative z-10">
          <div className="flex items-center gap-2">
            <Icon className={ticketStyle.iconClass} size={28} />
            <span className={`${ticketStyle.labelClass} text-base sm:text-lg`}>{tTicket.title}</span>
          </div>
          <span className={`${ticketStyle.labelClass} text-base sm:text-lg`}>{tTicket.subtitle}</span>
        </div>
        
        <div className={`py-10 sm:py-16 md:py-20 flex justify-center items-center relative z-10 ${ticketStyle.numberContainerClass}`}>
          <span className={`font-mono text-5xl sm:text-6xl md:text-8xl font-black tracking-[0.1em] sm:tracking-[0.2em] ml-1 sm:ml-3 ${ticketStyle.numberClass}`}>
            {numStr}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-6 sm:mt-8 relative z-10">
          <span className={`${ticketStyle.footerClass} text-lg sm:text-xl`}>{tTicket.footerLeft}</span>
          <span className={`${ticketStyle.footerClass} text-lg sm:text-xl`}>{tTicket.footerRight}</span>
        </div>
        
        {/* Barcode */}
        {ticketStyle.hasBarcode && (
          <div className="h-14 sm:h-16 w-full opacity-40 mt-8 sm:mt-10 relative z-10" style={{ backgroundImage: 'repeating-linear-gradient(to right, currentColor 0, currentColor 2px, transparent 2px, transparent 4px, currentColor 4px, currentColor 5px, transparent 5px, transparent 8px, currentColor 8px, currentColor 12px, transparent 12px, transparent 14px)' }}></div>
        )}
      </div>
    );
  };

  if (isTgValidating) {
    return (
      <div className={`h-[100dvh] w-full ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} flex flex-col items-center justify-center`}>
        <RefreshCw size={32} className="animate-spin text-amber-500 mb-4" />
        <p>Validating session...</p>
      </div>
    );
  }

  if (tgValidationError && !tgUser) {
    if (tgValidationError === 'SESSION_EXPIRED') {
      return (
        <div className={`h-[100dvh] w-full ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} flex flex-col items-center justify-center p-4 text-center`}>
          <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-500 p-4 rounded-full mb-4">
            <Clock size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">Session Expired</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs">
            For security reasons, your session has expired. Please restart the app to continue.
          </p>
          <button 
            onClick={() => {
              const tg = (window as unknown as { Telegram?: { WebApp: any } }).Telegram?.WebApp;
              if (tg?.close) {
                tg.close();
              } else {
                window.location.reload();
              }
            }}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors"
          >
            Restart App
          </button>
        </div>
      );
    }

    return (
      <div className={`h-[100dvh] w-full ${theme === 'dark' ? 'bg-zinc-950 text-red-500' : 'bg-zinc-50 text-red-600'} flex flex-col items-center justify-center p-4 text-center`}>
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
          <X size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">Authentication Failed</h2>
        <p className="text-sm text-red-400">{tgValidationError}</p>
      </div>
    );
  }

  const isPreviewEnv = window.location.hostname === 'localhost' || window.location.hostname.includes('ais-dev-') || (window.self !== window.top);
  const isRealTelegramUser = !!(tgUser && tgUser.id && tgUser.id !== 1 && tgUser.id !== 9999 && tgUser.first_name && tgUser.first_name !== 'Player' && tgUser.first_name !== 'Guest');

  if (!isRealTelegramUser && !isPreviewEnv) {
    return (
      <div className={`h-[100dvh] w-full ${theme === 'dark' ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-900'} flex flex-col items-center justify-center p-4 text-center`}>
        <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-full mb-4">
          <Smartphone size={32} className="text-blue-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Telegram Only</h2>
        <p className="text-sm opacity-70 mb-6 max-w-xs">
          Please play the game through our Telegram Bot.
        </p>
        <button 
          onClick={() => {
            window.location.href = "https://t.me/Game_Make100_bot";
          }}
          className="px-6 py-3 bg-blue-500 hover:opacity-90 text-white rounded-xl font-bold transition-colors"
        >
          Open in Telegram
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`h-[100dvh] w-full ${theme} ${theme === 'dark' ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-900'} transition-colors duration-300 font-sans overflow-y-auto overflow-x-hidden relative flex flex-col items-center px-1 sm:px-4 md:px-6`}
      style={{
        paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 16px)) + 8px)',
        paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 16px)) + 8px)'
      }}
    >
      <div className={`fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]`} />
      
      {statsLoaded && (
        <>
          {/* Header */}
          <header className="w-full max-w-4xl flex justify-between items-center mb-1 sm:mb-2 z-10 flex-shrink-0">
         <div className="flex items-center gap-3">
            {tgUser ? (
              <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 pr-3 pl-1 py-1 rounded-full shadow-sm">
                {tgUser.photo_url ? (
                  <img src={tgUser.photo_url} alt={tgUser.first_name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center">
                    <User size={16} />
                  </div>
                )}
                <span className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[100px] sm:max-w-[150px]">
                  {tgUser.first_name === 'Player' || tgUser.first_name === 'Guest' || tgUser.first_name === 'Test Player' 
                    ? t.player || tgUser.first_name 
                    : [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ')}
                </span>
                {playerRank !== null && (
                  <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded text-xs font-bold">
                    <Trophy size={10} />
                    <span>#{playerRank}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white drop-shadow-md">Make100</h1>
                {playerRank !== null && (
                  <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded text-xs font-bold">
                    <Trophy size={10} />
                    <span>#{playerRank}</span>
                  </div>
                )}
              </div>
            )}
         </div>

         <div className="flex items-center gap-2">
           <button 
             onClick={() => { setIsMenuOpen(true); playSound('click'); playVibration('light'); }}
             className="p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
           >
             <Menu size={24} />
           </button>
         </div>
      </header>

      {/* Stats Row */}
      <div className="w-full max-w-4xl flex overflow-x-auto justify-start sm:justify-center gap-2 sm:gap-3 mb-2 sm:mb-4 z-10 flex-shrink-0 px-1 pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
         <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 px-3 sm:px-4 py-2 rounded-2xl flex flex-col items-center justify-center shadow-sm min-w-[4rem] flex-shrink-0">
            <span className="text-zinc-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">{t.solved}</span>
            <span className="font-mono text-base sm:text-lg font-bold text-green-500 dark:text-green-400">{solvedCount}</span>
         </div>
         
         <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 px-3 sm:px-4 py-2 rounded-2xl flex flex-col items-center justify-center shadow-sm min-w-[4rem] flex-shrink-0">
            <span className="text-zinc-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">{t.skipped}</span>
            <span className="font-mono text-base sm:text-lg font-bold text-red-500 dark:text-red-400">{unsolvedCount}</span>
         </div>

         <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 px-3 sm:px-4 py-2 rounded-2xl flex flex-col items-center justify-center shadow-sm min-w-[4rem] flex-shrink-0">
            <span className="text-zinc-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">{t.operators}</span>
            <span className="font-mono text-base sm:text-lg font-bold text-blue-500 dark:text-blue-400">{totalOperatorsUsed}</span>
         </div>

         <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 px-3 sm:px-4 py-2 rounded-2xl flex flex-col items-center justify-center shadow-sm min-w-[4rem] flex-shrink-0">
            <span className="text-zinc-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">{t.current}</span>
            <span className="font-mono text-base sm:text-lg font-bold text-zinc-700 dark:text-zinc-200">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
         </div>

         <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 px-3 sm:px-4 py-2 rounded-2xl flex flex-col items-center justify-center shadow-sm min-w-[4rem] flex-shrink-0">
            <span className="text-zinc-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">{t.total}</span>
            <span className="font-mono text-base sm:text-lg font-bold text-zinc-700 dark:text-zinc-200">{Math.floor(totalSolveTime / 60)}:{(totalSolveTime % 60).toString().padStart(2, '0')}</span>
         </div>
      </div>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-zinc-950/80 backdrop-blur-sm flex justify-end"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-sm h-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
              style={{
                paddingTop: 'var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px))',
                paddingBottom: 'var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))'
              }}
            >
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold">{t.menu}</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-4 sm:p-6 flex flex-col gap-6 overflow-y-auto">
                {/* Progress */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Level {getLevelInfo(solvedCount).level}</span>
                    <span className="text-xs font-bold text-zinc-400">{solvedCount} / {getLevelInfo(solvedCount).nextMilestone}</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${getLevelInfo(solvedCount).progress}%` }}
                    />
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{t.leaderboard}</span>
                  <button 
                    onClick={() => { 
                      setIsMenuOpen(false); 
                      setIsLeaderboardOpen(true); 
                      fetchLeaderboard();
                      playSound('click'); 
                      playVibration('light'); 
                    }}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-md"
                  >
                    <Trophy size={18} /> {t.topPlayers}
                  </button>
                </div>

                {/* Game Mode */}
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{t.gameMode}</span>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <button 
                      onClick={() => { setGameMode('ticket'); playSound('click'); playVibration('light'); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${gameMode === 'ticket' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
                    >
                      {t.ticket}
                    </button>
                    <button 
                      onClick={() => { setGameMode('car'); playSound('click'); playVibration('light'); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${gameMode === 'car' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
                    >
                      {t.car}
                    </button>
                  </div>
                </div>

                {/* Theme */}
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{t.theme}</span>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <button 
                      onClick={() => { setThemePreference('auto'); playSound('click'); playVibration('light'); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${themePreference === 'auto' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
                    >
                      <Smartphone size={16} /> {t.auto}
                    </button>
                    <button 
                      onClick={() => { setThemePreference('light'); playSound('click'); playVibration('light'); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${themePreference === 'light' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
                    >
                      <Sun size={16} /> {t.light}
                    </button>
                    <button 
                      onClick={() => { setThemePreference('dark'); playSound('click'); playVibration('light'); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${themePreference === 'dark' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
                    >
                      <Moon size={16} /> {t.dark}
                    </button>
                  </div>
                </div>

                {/* Sound & Vibration */}
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{t.soundAndVibration}</span>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <button 
                      onClick={() => { 
                        setSoundEnabled(!soundEnabled); 
                        if (!soundEnabled) {
                          // Play sound immediately after enabling
                          setTimeout(() => playSound('click'), 50);
                        }
                        playVibration('light'); 
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${soundEnabled ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
                    >
                      {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />} {t.sound}
                    </button>
                    <button 
                      onClick={() => { 
                        setVibrationEnabled(!vibrationEnabled); 
                        playSound('click');
                        if (!vibrationEnabled) {
                          // Play vibration immediately after enabling
                          setTimeout(() => playVibration('light'), 50);
                        }
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${vibrationEnabled ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
                    >
                      {vibrationEnabled ? <Vibrate size={16} /> : <VibrateOff size={16} />} {t.vibration}
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{t.language}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map(({ code, label }) => (
                      <button
                        key={code}
                        onClick={() => { setLanguage(code); playSound('click'); playVibration('light'); }}
                        className={`py-2 px-3 rounded-lg text-sm font-bold transition-all text-left ${language === code ? 'bg-orange-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-600 font-mono">
                  v1.91
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {isLeaderboardOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-zinc-950/80 backdrop-blur-sm flex justify-center items-center p-4"
            onClick={() => setIsLeaderboardOpen(false)}
            style={{
              paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 16px)) + 16px)',
              paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 16px)) + 16px)'
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md max-h-[80vh] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-amber-50 dark:bg-amber-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-500">
                    <Trophy size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t.leaderboard}</h2>
                </div>
                <button onClick={() => setIsLeaderboardOpen(false)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors bg-white dark:bg-zinc-800 rounded-full shadow-sm">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-0 overflow-y-auto flex-1 bg-zinc-50 dark:bg-zinc-900/50">
                {isLoadingLeaderboard ? (
                  <div className="flex flex-col items-center justify-center p-12 gap-4 text-zinc-400">
                    <RefreshCw size={32} className="animate-spin text-amber-500" />
                    <span className="text-sm font-medium">{t.loadingLeaderboard}</span>
                  </div>
                ) : leaderboardData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 gap-4 text-zinc-400">
                    <Trophy size={48} className="opacity-20" />
                    <span className="text-sm font-medium">{t.noData}</span>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {leaderboardData.map((player, index) => (
                      <div key={player.id} className={`flex items-center gap-4 p-4 transition-colors hover:bg-white dark:hover:bg-zinc-800 ${index < 3 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          index === 0 ? 'bg-amber-400 text-white shadow-md shadow-amber-400/20' : 
                          index === 1 ? 'bg-zinc-300 text-zinc-700 shadow-md shadow-zinc-300/20' : 
                          index === 2 ? 'bg-orange-400 text-white shadow-md shadow-orange-400/20' : 
                          'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        }`}>
                          {index + 1}
                        </div>
                        
                        {player.photoURL ? (
                          <img src={player.photoURL} alt={player.displayName} className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white dark:ring-zinc-900 shadow-sm" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 ring-2 ring-white dark:ring-zinc-900 shadow-sm">
                            <User size={20} />
                          </div>
                        )}
                        
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-bold text-zinc-900 dark:text-white truncate text-sm sm:text-base">
                            {player.displayName === 'Player' || player.displayName === 'Test Player' ? t.player || player.displayName : (player.displayName || 'Anonymous')}
                          </span>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400" title={t.solved}>
                              <Star size={12} className="text-amber-500" />
                              <span className="font-medium">{player.solvedCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400" title={t.operators}>
                              <Hash size={12} className="text-blue-500" />
                              <span className="font-medium">{player.totalOperatorsUsed || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400" title={t.skipped}>
                              <Activity size={12} className="text-red-400" />
                              <span className="font-medium">{player.unsolvedCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400" title={t.time}>
                              <Clock size={12} className="text-emerald-500" />
                              <span className="font-medium">{Math.floor((player.totalSolveTime || 0) / 60)}m {(player.totalSolveTime || 0) % 60}s</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>


            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Block (Ticket or Car) */}
      <div className="flex-1 min-h-0 w-full max-w-4xl flex items-center justify-center my-1 sm:my-2 z-10 relative">
          <motion.div 
            key={digits.join('') + gameMode}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`relative w-full h-full flex items-center justify-center ${gameMode === 'ticket' ? 'max-w-md' : 'max-w-3xl'}`}
          >
            <div className={`origin-center w-full h-full flex items-center justify-center ${gameMode === 'ticket' ? 'scale-[0.8] sm:scale-100' : ''}`}>
              {gameMode === 'ticket' ? renderTicket() : renderLicensePlate()}
            </div>
            
            <AnimatePresence>
              {noSolutionMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                >
                  <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-bold text-center shadow-2xl border-2 border-red-400 max-w-[90%]">
                    <div className="text-lg sm:text-xl mb-2">{t.noSolution}</div>
                    <div className="text-sm sm:text-base opacity-90 flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin-slow" />
                      {gameMode === 'ticket' ? t.skipTicket : t.skipCar}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
      </div>

      <div className="w-full flex flex-col items-center z-10 mt-auto flex-shrink-0">
        {/* Expression Builder */}
        <div className="w-full max-w-5xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/30 dark:border-zinc-800/60 p-1 sm:p-4 md:p-6 rounded-xl sm:rounded-[2rem] shadow-2xl mb-1 sm:mb-2 transition-colors flex flex-col items-center overflow-hidden">
          <div className="flex flex-nowrap justify-center items-center gap-x-[clamp(0.1rem,0.5vw,0.5rem)] text-[clamp(1.5rem,7vw,4rem)] font-mono font-black text-zinc-900 dark:text-white py-1 sm:py-2 w-full">
            <Gap idx={0} value={gaps[0]} selected={selectedSlot === 0} onClick={setSelectedSlot} />
            
            {digits.map((digit, idx) => (
              <React.Fragment key={idx}>
                <span className="text-zinc-800 dark:text-zinc-200 drop-shadow-sm select-none flex-shrink-0 leading-none">{digit}</span>
                <Gap idx={idx + 1} value={gaps[idx + 1]} selected={selectedSlot === idx + 1} onClick={setSelectedSlot} />
              </React.Fragment>
            ))}
          </div>

          <div className="mt-2 sm:mt-3 md:mt-4 flex items-center justify-center text-2xl sm:text-4xl md:text-6xl font-mono font-black">
            <span className="text-zinc-300 dark:text-zinc-600 mr-3 sm:mr-6">=</span>
            <span className={`transition-colors duration-300 ${isWin ? 'text-green-500' : 'text-zinc-900 dark:text-white'}`}>
              {Number.isNaN(currentResult) ? '?' : Number.isInteger(currentResult) ? currentResult : Number(currentResult.toFixed(2))}
            </span>
          </div>
          
          <p className="text-center text-zinc-400 dark:text-zinc-500 text-xs sm:text-sm md:text-base mt-2 md:mt-3 font-bold">{t.tapGaps}</p>
        </div>

        {/* Keypad */}
        <div className="flex gap-1 sm:gap-2 flex-nowrap justify-between sm:justify-center w-full max-w-3xl px-1 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <OperatorButton op="+" icon={<Plus size={20} strokeWidth={3} />} onClick={() => handleOp('+')} />
          <OperatorButton op="-" icon={<Minus size={20} strokeWidth={3} />} onClick={() => handleOp('-')} />
          <OperatorButton op="*" icon={<X size={20} strokeWidth={3} />} onClick={() => handleOp('*')} />
          <OperatorButton op="/" icon={<Divide size={20} strokeWidth={3} />} onClick={() => handleOp('/')} />
          <OperatorButton op="(" icon={<span className="text-xl font-black">(</span>} onClick={() => handleOp('(')} />
          <OperatorButton op=")" icon={<span className="text-xl font-black">)</span>} onClick={() => handleOp(')')} />
          <OperatorButton op="," icon={<span className="text-xl font-black">,</span>} onClick={() => handleOp(',')} />
          <OperatorButton op="Backspace" icon={<Delete size={20} strokeWidth={2.5} />} onClick={() => handleOp('Backspace')} variant="danger" />
        </div>

        {/* Action Buttons */}
        <div className="mt-2 sm:mt-4 w-full max-w-lg grid grid-cols-2 gap-2 sm:gap-3 shrink-0 z-10 pb-12 sm:pb-6">
          <button 
            onClick={showHint}
            disabled={isHinting || won}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all font-bold tracking-wide backdrop-blur-md text-xs sm:text-base ${isHinting || won ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Lightbulb size={16} className={`shrink-0 ${isHinting ? "animate-pulse text-yellow-500" : ""}`} />
            <span className="truncate">{t.hint}</span>
          </button>

          <button 
            onClick={() => initGame(false, true)}
            disabled={isHinting}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 transition-all font-bold tracking-wide backdrop-blur-md text-xs sm:text-base ${isHinting ? 'opacity-50 cursor-not-allowed border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400' : noSolutionMessage ? 'animate-pulse ring-4 ring-red-500/30 border-red-500 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40' : 'border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
          >
            <RefreshCw size={16} className={`shrink-0 ${isHinting ? "animate-spin" : ""}`} />
            <span className="truncate">
              {hintUsed 
                ? (gameMode === 'ticket' ? t.nextTicket : t.nextCar)
                : (gameMode === 'ticket' ? t.skipTicket : t.skipCar)}
            </span>
          </button>
        </div>
      </div>
      </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showDemo && <DemoOverlay onComplete={completeDemo} t={t} />}

        {gameState === 'idle' && !won && !showDemo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            style={{
              paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 16px)) + 16px)',
              paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 16px)) + 16px)'
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl text-center max-w-md w-full border border-zinc-100 dark:border-zinc-800 relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
                <Play size={36} className="ml-2" fill="currentColor" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tighter">Make100</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-lg leading-relaxed">{t.introText}</p>
              <button 
                onClick={() => setGameState('playing')}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xl rounded-2xl transition-all shadow-[0_8px_20px_rgba(249,115,22,0.25)] hover:shadow-[0_12px_25px_rgba(249,115,22,0.35)] hover:-translate-y-1"
              >
                {t.start}
              </button>
            </motion.div>
          </motion.div>
        )}

        {won && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            style={{
              paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 16px)) + 16px)',
              paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 16px)) + 16px)'
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl text-center max-w-md w-full border border-zinc-100 dark:border-zinc-800 relative overflow-hidden"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <span className="text-5xl sm:text-6xl">🎉</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black mb-3 tracking-tighter">{t.perfect}</h2>
              <div className="flex flex-col items-center gap-1 mb-8">
                <p className="text-lg text-zinc-500 dark:text-zinc-400">{t.solvedIn} <span className="font-mono font-bold">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span></p>
                <p className="text-lg text-zinc-500 dark:text-zinc-400">{t.operatorsUsed} <span className="font-mono font-bold">{gaps.join('').replace(/[0-9.]/g, '').length}</span></p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => initGame(false)}
                  className="w-full py-4 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-black text-xl rounded-2xl transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_20px_rgba(255,255,255,0.15)] hover:-translate-y-1"
                >
                  {gameMode === 'ticket' ? t.nextTicket : t.nextCar}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Gap({ idx, value, selected, onClick }: { idx: number, value: string, selected: boolean, onClick: (idx: number) => void }) {
  const charCount = value.length;
  // Calculate dynamic width based on character count.
  // Base width is for 0-1 chars. Add extra width for each additional char.
  const baseWidthRem = 1.25;
  const baseWidthVw = 7;
  const baseWidthMaxRem = 3.5;
  
  const extraWidthPerCharRem = 0.8;
  const extraWidthPerCharVw = 2;
  const extraWidthPerCharMaxRem = 1.5;

  const extraChars = Math.max(0, charCount - 1);
  
  const dynamicWidth = `clamp(${baseWidthRem + (extraChars * extraWidthPerCharRem)}rem, ${baseWidthVw + (extraChars * extraWidthPerCharVw)}vw, ${baseWidthMaxRem + (extraChars * extraWidthPerCharMaxRem)}rem)`;

  return (
    <button
      onClick={() => onClick(idx)}
      style={{ width: dynamicWidth }}
      className={`h-[clamp(1.75rem,9vw,4.5rem)] rounded-lg sm:rounded-xl border-2 flex items-center justify-center transition-all duration-200 outline-none font-bold flex-shrink-0 ${
        selected
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-[0_0_0_4px_rgba(249,115,22,0.15)] scale-110 z-20'
          : value
            ? 'border-zinc-800 dark:border-zinc-200 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 shadow-sm z-10'
            : 'border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900 z-10'
      }`}
    >
      {value ? (
        <span className="text-[clamp(1rem,5vw,2.5rem)] whitespace-nowrap px-1">{value}</span>
      ) : (
        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
      )}
    </button>
  );
}

function OperatorButton({ icon, onClick, variant = 'default' }: { op: string, icon: React.ReactNode, onClick: () => void, variant?: 'default' | 'danger' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center flex-1 min-w-[2rem] sm:min-w-[2.5rem] max-w-[3rem] sm:max-w-[3.5rem] md:max-w-[4rem] h-10 sm:h-12 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl font-bold transition-all active:scale-95 border-2 flex-shrink-0 ${
        variant === 'danger'
          ? 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 hover:border-red-200 dark:hover:border-red-500/40 shadow-sm'
          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 shadow-sm'
      }`}
    >
      {icon}
    </button>
  );
}
