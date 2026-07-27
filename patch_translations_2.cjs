const fs = require('fs');
const tsCode = fs.readFileSync('src/App.tsx', 'utf8');

const additions = {
  ru: `    authorizing: "Авторизация...",\n    authorizingTg: "Авторизация в Telegram...",\n    loading: "Загрузка...",\n    level: "Уровень",`,
  en: `    authorizing: "Authorizing...",\n    authorizingTg: "Authorizing with Telegram...",\n    loading: "Loading...",\n    level: "Level",`,
  de: `    authorizing: "Autorisierung...",\n    authorizingTg: "Autorisierung mit Telegram...",\n    loading: "Wird geladen...",\n    level: "Level",`,
  fr: `    authorizing: "Autorisation...",\n    authorizingTg: "Autorisation avec Telegram...",\n    loading: "Chargement...",\n    level: "Niveau",`,
  pt: `    authorizing: "Autorizando...",\n    authorizingTg: "Autorizando com Telegram...",\n    loading: "Carregando...",\n    level: "Nível",`,
  es: `    authorizing: "Autorizando...",\n    authorizingTg: "Autorizando con Telegram...",\n    loading: "Cargando...",\n    level: "Nivel",`,
  zh: `    authorizing: "授权中...",\n    authorizingTg: "正在通过 Telegram 授权...",\n    loading: "加载中...",\n    level: "等级",`,
  ja: `    authorizing: "認証中...",\n    authorizingTg: "Telegramで認証中...",\n    loading: "読み込み中...",\n    level: "レベル",`,
  it: `    authorizing: "Autorizzazione...",\n    authorizingTg: "Autorizzazione con Telegram...",\n    loading: "Caricamento...",\n    level: "Livello",`,
  ko: `    authorizing: "인증 중...",\n    authorizingTg: "Telegram으로 인증 중...",\n    loading: "로딩 중...",\n    level: "레벨",`,
  tr: `    authorizing: "Yetkilendiriliyor...",\n    authorizingTg: "Telegram ile yetkilendiriliyor...",\n    loading: "Yükleniyor...",\n    level: "Seviye",`,
  he: `    authorizing: "מאשר...",\n    authorizingTg: "מאשר מול טלגרם...",\n    loading: "טוען...",\n    level: "רמה",`,
  ar: `    authorizing: "جاري التفويض...",\n    authorizingTg: "جاري التفويض عبر تيليجرام...",\n    loading: "جاري التحميل...",\n    level: "مستوى",`,
  hi: `    authorizing: "प्राधिकृत कर रहा है...",\n    authorizingTg: "टेलीग्राम के साथ प्राधिकृत कर रहा है...",\n    loading: "लोड हो रहा है...",\n    level: "स्तर",`,
  la: `    authorizing: "Auctorizans...",\n    authorizingTg: "Auctorizans cum Telegram...",\n    loading: "Onerans...",\n    level: "Gradus",`,
  eo: `    authorizing: "Aŭtorizante...",\n    authorizingTg: "Aŭtorizante kun Telegram...",\n    loading: "Ŝargante...",\n    level: "Nivelo",`,
  elvish: `    authorizing: "Lestan...",\n    authorizingTg: "Lestan as Telegram...",\n    loading: "Tultan...",\n    level: "Tyellë",`,
  klingon: `    authorizing: "chaw' jaw...",\n    authorizingTg: "Telegram tlhej chaw' jaw...",\n    loading: "lIgh...",\n    level: "patlh",`,
  dothraki: `    authorizing: "Ase...",\n    authorizingTg: "Ase mra Telegram...",\n    loading: "Nakhaan...",\n    level: "Zheana",`,
  valyrian: `    authorizing: "Mīso...",\n    authorizingTg: "Mīso isse Telegram...",\n    loading: "Zaldrīzes...",\n    level: "Tēmi",`
};

let modifiedCode = tsCode;

for (const [lang, addition] of Object.entries(additions)) {
  const langRegex = new RegExp(`  ${lang}: {([\\s\\S]*?)(    tickets: {)`, 'm');
  const match = modifiedCode.match(langRegex);
  
  if (match) {
    const block = match[0];
    if (block.includes('authorizing:')) continue;
    
    // We want to insert our text right before 'tickets: {'
    const shareRegex = /(    playAsGuest: ".*",\n)(    tickets: {)/;
    const blockMatch = block.match(shareRegex);
    if (blockMatch) {
        const newBlock = block.replace(shareRegex, `$1${addition}\n$2`);
        modifiedCode = modifiedCode.replace(block, newBlock);
    } else {
        // Fallback for RU/EN which might not have playAsGuest at the end? Let's check what's before tickets
        const fallbackRegex = /([\s\S]*)(\n    tickets: {)/;
        const newBlock = block.replace(fallbackRegex, `$1\n${addition}$2`);
        modifiedCode = modifiedCode.replace(block, newBlock);
    }
  } else {
    console.log("Could not find block for", lang);
  }
}

// Replace the hardcoded usages
modifiedCode = modifiedCode.replace(/<span>Авторизация\.\.\.<\/span>/g, '<span>{t.authorizing}</span>');
modifiedCode = modifiedCode.replace(/<span>Авторизация в Telegram\.\.\.<\/span>/g, '<span>{t.authorizingTg}</span>');
modifiedCode = modifiedCode.replace(/{!carImage && <span className="text-zinc-400">Loading\.\.\.<\/span>}/g, '{!carImage && <span className="text-zinc-400">{t.loading}</span>}');
modifiedCode = modifiedCode.replace(/<span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Level {getLevelInfo\(solvedCount\)\.level}<\/span>/g, '<span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{t.level} {getLevelInfo(solvedCount).level}</span>');

fs.writeFileSync('src/App.tsx', modifiedCode);
console.log("Patch 2 complete.");
