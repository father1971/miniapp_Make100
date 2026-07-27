const fs = require('fs');
const tsCode = fs.readFileSync('src/App.tsx', 'utf8');

const additions = {
  ru: `    imageLoadError: "Ошибка загрузки изображения",`,
  en: `    imageLoadError: "Image load error",`,
  de: `    imageLoadError: "Bildladefehler",`,
  fr: `    imageLoadError: "Erreur de chargement d'image",`,
  pt: `    imageLoadError: "Erro ao carregar imagem",`,
  es: `    imageLoadError: "Error al cargar la imagen",`,
  zh: `    imageLoadError: "图片加载错误",`,
  ja: `    imageLoadError: "画像の読み込みエラー",`,
  it: `    imageLoadError: "Errore di caricamento immagine",`,
  ko: `    imageLoadError: "이미지 로드 오류",`,
  tr: `    imageLoadError: "Görüntü yükleme hatası",`,
  he: `    imageLoadError: "שגיאת טעינת תמונה",`,
  ar: `    imageLoadError: "خطأ في تحميل الصورة",`,
  hi: `    imageLoadError: "छवि लोड करने में त्रुटि",`,
  la: `    imageLoadError: "Error loading imago",`,
  eo: `    imageLoadError: "Eraro dum ŝargado de bildo",`,
  elvish: `    imageLoadError: "Emiel cantë",`,
  klingon: `    imageLoadError: "nagh mI'",`,
  dothraki: `    imageLoadError: "Khaleesi",`,
  valyrian: `    imageLoadError: "Sīkudarys",`
};

let modifiedCode = tsCode;

for (const [lang, addition] of Object.entries(additions)) {
  const langRegex = new RegExp(`  ${lang}: {([\\s\\S]*?)(    tickets: {)`, 'm');
  const match = modifiedCode.match(langRegex);
  
  if (match) {
    const block = match[0];
    if (block.includes('imageLoadError:')) continue;
    
    // insert right before tickets
    const fallbackRegex = /([\s\S]*)(\n    tickets: {)/;
    const newBlock = block.replace(fallbackRegex, `$1\n${addition}$2`);
    modifiedCode = modifiedCode.replace(block, newBlock);
  } else {
    console.log("Could not find block for", lang);
  }
}

// Replace the hardcoded usage
modifiedCode = modifiedCode.replace(/errorMsg\.innerText = 'Image load error';/g, "errorMsg.innerText = t.imageLoadError;");

fs.writeFileSync('src/App.tsx', modifiedCode);
console.log("Patch 3 complete.");
