const fs = require('fs');

let content = fs.readFileSync('src/translations.ts', 'utf8');

const newKeys = {
  ticketTheatreTitle: { ru: 'ТЕАТРАЛЬНЫЙ БИЛЕТ', en: 'THEATRE TICKET', de: 'THEATERTICKET', fr: 'BILLET DE THÉÂTRE', pt: 'BILHETE DE TEATRO', es: 'BOLETO DE TEATRO', zh: '戏院门票', ja: '演劇チケット', it: 'BIGLIETTO TEATRALE', ko: '극장 티켓', tr: 'TİYATRO BİLETİ', he: 'כרטיס לתיאטרון', ar: 'تذكرة مسرح', hi: 'थिएटर टिकट', la: 'TESSERA THEATRALIS', eo: 'TEATRA BILETO' },
  ticketTheatreDesc: { ru: 'ПАРТЕР • РЯД 3 • ЛОЖА №5', en: 'STALLS • ROW 3 • BOX 5', de: 'PARKETT • REIHE 3 • LOGE 5', fr: 'ORCHESTRE • RANG 3 • LOGE 5', pt: 'PLATEIA • FILA 3 • CAMAROTE 5', es: 'PLATEA • FILA 3 • PALCO 5', zh: '正厅 • 第3排 • 5号包厢', ja: '1階席 • 3列 • ボックス5', it: 'PLATEA • FILA 3 • PALCO 5', ko: '1층석 • 3열 • 박스 5', tr: 'ZEMİN • SIRA 3 • LOCA 5', he: 'אולם • שורה 3 • תא 5', ar: 'الصالة • صف 3 • مقصورة 5', hi: 'स्टॉल्स • पंक्ति 3 • बॉक्स 5', la: 'PARADISUS • ORDO 3 • PODIUM 5', eo: 'PARTERO • VICO 3 • LOĜIO 5' },
  ticketBusTitle: { ru: 'БИЛЕТ НА АВТОБУС', en: 'BUS TICKET', de: 'BUSTICKET', fr: 'TICKET DE BUS', pt: 'BILHETE DE ÔNIBUS', es: 'BOLETO DE AUTOBÚS', zh: '公交车票', ja: 'バス乗車券', it: 'BIGLIETTO DEL AUTOBUS', ko: '버스 티켓', tr: 'OTOBÜS BİLETİ', he: 'כרטיס אוטובוס', ar: 'تذكرة حافلة', hi: 'बस टिकट', la: 'TESSERA LAOPHORII', eo: 'BUSA BILETO' },
  ticketBusDesc: { ru: 'ЦЕНА 6 КОП.', en: 'PRICE 6 ¢', de: 'PREIS 6 ¢', fr: 'PRIX 6 ¢', pt: 'PREÇO 6 ¢', es: 'PRECIO 6 ¢', zh: '票价 6 分', ja: '料金 6 ¢', it: 'PREZZO 6 ¢', ko: '가격 6 ¢', tr: 'FİYAT 6 ¢', he: 'מחיר 6 ¢', ar: 'السعر 6 ¢', hi: 'कीमत 6 ¢', la: 'PRETIUM VI AS.', eo: 'PREZO 6 ¢' },
  ticketFlightTitle: { ru: 'FLIGHT SU-100', en: 'FLIGHT SU-100', de: 'FLUG SU-100', fr: 'VOL SU-100', pt: 'VOO SU-100', es: 'VUELO SU-100', zh: '航班 SU-100', ja: 'フライト SU-100', it: 'VOLO SU-100', ko: '항공편 SU-100', tr: 'UÇUŞ SU-100', he: 'טיסה SU-100', ar: 'رحلة SU-100', hi: 'उड़ान SU-100', la: 'VOLATUS SU-100', eo: 'FLUGO SU-100' },
  ticketFlightDesc: { ru: 'SVO ✈ DXB • GATE B22', en: 'SVO ✈ DXB • GATE B22', de: 'SVO ✈ DXB • GATE B22', fr: 'SVO ✈ DXB • PORTE B22', pt: 'SVO ✈ DXB • PORTÃO B22', es: 'SVO ✈ DXB • PUERTA B22', zh: 'SVO ✈ DXB • B22 登机口', ja: 'SVO ✈ DXB • ゲート B22', it: 'SVO ✈ DXB • GATE B22', ko: 'SVO ✈ DXB • 게이트 B22', tr: 'SVO ✈ DXB • KAPI B22', he: 'SVO ✈ DXB • שער B22', ar: 'SVO ✈ DXB • بوابة B22', hi: 'SVO ✈ DXB • गेट B22', la: 'SVO ✈ DXB • PORTA B22', eo: 'SVO ✈ DXB • ELIREJO B22' },
  ticketTrainTitle: { ru: 'Ж/Д БИЛЕТ', en: 'TRAIN TICKET', de: 'ZUGTICKET', fr: 'BILLET DE TRAIN', pt: 'BILHETE DE TREM', es: 'BOLETO DE TREN', zh: '火车票', ja: '列車の切符', it: 'BIGLIETTO DEL TRENO', ko: '기차표', tr: 'TREN BİLETİ', he: 'כרטיס רכבת', ar: 'تذكرة قطار', hi: 'ट्रेन टिकट', la: 'TESSERA FERROVIARIA', eo: 'TRAJNA BILETO' },
  ticketTrainDesc: { ru: 'МЕЖДУГОРОДНИЙ КУПОН', en: 'INTERCITY COUPON', de: 'INTERCITY COUPON', fr: 'COUPON INTERVILLES', pt: 'CUPOM INTERMUNICIPAL', es: 'CUPÓN INTERURBANO', zh: '城际乘车券', ja: '都市間クーポン', it: 'COUPON INTERCITY', ko: '시외 쿠폰', tr: 'ŞEHİRLERARASI KUPON', he: 'קופון בין-עירוני', ar: 'قسيمة بين المدن', hi: 'इंटरसि‍टी कूपन', la: 'TESSERA INTERURBANA', eo: 'INTERURBA KUPONO' },
  ticketConcertTitle: { ru: 'CONCERT PASS', en: 'CONCERT PASS', de: 'KONZERTPASS', fr: 'PASS CONCERT', pt: 'PASSE DE CONCERTO', es: 'PASE DE CONCIERTO', zh: '演唱会通行证', ja: 'コンサートパス', it: 'PASS PER IL CONCERTO', ko: '콘서트 패스', tr: 'KONSER GEÇİŞİ', he: 'אישור הופעה', ar: 'تصريح حفلة', hi: 'संगीत कार्यक्रम पास', la: 'TESSERA CONCENTUS', eo: 'KONCERTA PASPERMESILO' },
  ticketConcertDesc: { ru: 'FAN ZONE • ACCESS ALL AREAS', en: 'FAN ZONE • ACCESS ALL AREAS', de: 'FANZONE • ALL AREAS ACCESS', fr: 'ZONE FAN • ACCÈS TOTAL', pt: 'ZONA DE FÃS • ACESSO TOTAL', es: 'ZONA FAN • ACCESO TOTAL', zh: '粉丝区 • 全区通行', ja: 'ファンゾーン • 全エリア入場可', it: 'FAN ZONE • ACCESSO TOTALE', ko: '팬 존 • 모든 구역 접근 가능', tr: 'TARAFTAR BÖLGESİ • TÜM ALANLARA ERİŞİM', he: 'אזור מעריצים • גישה לכל האזורים', ar: 'منطقة المشجعين • دخول لجميع المناطق', hi: 'फैन ज़ोन • सभी क्षेत्रों तक पहुंच', la: 'ZONA FAUTORUM • OMNIA ADITUS', eo: 'FAN-ZONO • ĈIUJ AREOJ' },
  ticketStadiumTitle: { ru: 'STADIUM TICKET', en: 'STADIUM TICKET', de: 'STADIONTICKET', fr: 'BILLET DE STADE', pt: 'BILHETE DE ESTÁDIO', es: 'BOLETO DE ESTADIO', zh: '体育场门票', ja: 'スタジアムチケット', it: 'BIGLIETTO DELLO STADIO', ko: '경기장 티켓', tr: 'STADYUM BİLETİ', he: 'כרטיס לאצטדיון', ar: 'تذكرة ملعب', hi: 'स्टेडियम टिकट', la: 'TESSERA STADII', eo: 'STADIONA BILETO' },
  ticketStadiumDesc: { ru: 'MATCH DAY • SECTOR C • ROW 12', en: 'MATCH DAY • SECTOR C • ROW 12', de: 'SPIELTAG • SEKTOR C • REIHE 12', fr: 'JOUR DE MATCH • SECTEUR C • RANG 12', pt: 'DIA DE JOGO • SETOR C • FILA 12', es: 'DÍA DE PARTIDO • SECTOR C • FILA 12', zh: '比赛日 • C区 • 第12排', ja: '試合当日 • セクターC • 12列', it: 'GIORNO DELLA PARTITA • SETTORE C • FILA 12', ko: '매치 데이 • C구역 • 12열', tr: 'MAÇ GÜNÜ • SEKTÖR C • SIRA 12', he: 'יום משחק • יציע C • שורה 12', ar: 'يوم المباراة • قطاع C • صف 12', hi: 'मैच का दिन • सेक्टर C • पंक्ति 12', la: 'DIES CERTAMINIS • SECTOR C • ORDO 12', eo: 'MATĈTAĜO • SEKTORO C • VICO 12' },
  ticketCinemaTitle: { ru: 'БИЛЕТ В КИНО', en: 'CINEMA TICKET', de: 'KINOTICKET', fr: 'BILLET DE CINÉMA', pt: 'BILHETE DE CINEMA', es: 'BOLETO DE CINE', zh: '电影票', ja: '映画のチケット', it: 'BIGLIETTO DEL CINEMA', ko: '영화 티켓', tr: 'SİNEMA BİLETİ', he: 'כרטיס קולנוע', ar: 'تذكرة سينما', hi: 'सिनेमा टिकट', la: 'TESSERA CINEMATECA', eo: 'KINEJA BILETO' },
  ticketCinemaDesc: { ru: 'ADMIT ONE • СЕАНС 20:00', en: 'ADMIT ONE • SHOW 20:00', de: 'EINLASS FÜR EINEN • VORSTELLUNG 20:00', fr: 'BON POUR UN • SÉANCE 20:00', pt: 'VÁLIDO PARA UM • SESSÃO 20:00', es: 'VÁLIDO PARA UNO • FUNCIÓN 20:00', zh: '单人票 • 场次 20:00', ja: '1名様 • 上映 20:00', it: 'INGRESSO PER UNO • SPETTACOLO 20:00', ko: '1인 입장 • 상영 20:00', tr: 'BİR KİŞİLİK • SEANS 20:00', he: 'כניסה ליחיד • הצגה 20:00', ar: 'دخول لفرد • عرض 20:00', hi: 'एक का प्रवेश • शो 20:00', la: 'ADMITTE UNUM • SPECTACULUM 20:00', eo: 'AKCEPTU UNU • EKRANADO 20:00' },
  ticketAmusementTitle: { ru: 'AMUSEMENT PARK', en: 'AMUSEMENT PARK', de: 'FREIZEITPARK', fr: 'PARC D\'ATTRACTIONS', pt: 'PARQUE DE DIVERSÕES', es: 'PARQUE DE ATRACCIONES', zh: '游乐园', ja: '遊園地', it: 'PARCO DIVERTIMENTI', ko: '놀이공원', tr: 'LUNAPARK', he: 'פארק שעשועים', ar: 'مدينة ملاهي', hi: 'मनोरंजन पार्क', la: 'HORTI OBLECTAMENTI', eo: 'AMUZPARKO' },
  ticketAmusementDesc: { ru: '★ UNLIMITED RIDES ★', en: '★ UNLIMITED RIDES ★', de: '★ UNBEGRENZTE FAHRTEN ★', fr: '★ MANÈGES ILLIMITÉS ★', pt: '★ PASSEIOS ILIMITADOS ★', es: '★ ATRACCIONES ILIMITADAS ★', zh: '★ 无限次乘坐 ★', ja: '★ 乗り放題 ★', it: '★ GIRI ILLIMITATI ★', ko: '★ 무제한 탑승 ★', tr: '★ SINIRSIZ BİNİŞ ★', he: '★ נסיעות ללא הגבלה ★', ar: '★ ركوب غير محدود ★', hi: '★ असीमित सवारी ★', la: '★ VEHICULA INFINITA ★', eo: '★ SENLIMAJ VETUROJ ★' },
  ticketMuseumTitle: { ru: 'EXHIBITION PASS', en: 'EXHIBITION PASS', de: 'AUSSTELLUNGSPASS', fr: 'PASS EXPOSITION', pt: 'PASSE DE EXPOSIÇÃO', es: 'PASE DE EXPOSICIÓN', zh: '展览通行证', ja: '展示会パス', it: 'PASS MOSTRA', ko: '전시회 패스', tr: 'SERGİ GEÇİŞİ', he: 'אישור תערוכה', ar: 'تصريح المعرض', hi: 'प्रदर्शनी पास', la: 'TESSERA EXHIBITIONIS', eo: 'EKSPOZICIA PASPERMESILO' },
  ticketMuseumDesc: { ru: 'GENERAL ADMISSION', en: 'GENERAL ADMISSION', de: 'ALLGEMEINER EINTRITT', fr: 'ADMISSION GÉNÉRALE', pt: 'ENTRADA GERAL', es: 'ADMISIÓN GENERAL', zh: '普通入场', ja: '一般入場', it: 'INGRESSO GENERALE', ko: '일반 입장', tr: 'GENEL GİRİŞ', he: 'כניסה רגילה', ar: 'دخول عام', hi: 'सामान्य प्रवेश', la: 'ADMISSIO GENERALIS', eo: 'ĜENERALA AKCEPTO' },
  ticketLotteryTitle: { ru: 'ЛОТЕРЕЯ', en: 'LOTTERY', de: 'LOTTERIE', fr: 'LOTERIE', pt: 'LOTERIA', es: 'LOTERÍA', zh: '彩票', ja: '宝くじ', it: 'LOTTERIA', ko: '복권', tr: 'PİYANGO', he: 'הגרלה', ar: 'يانصيب', hi: 'लॉटरी', la: 'SORS', eo: 'LOTERIO' },
  ticketLotteryDesc: { ru: 'СЧАСТЛИВЫЙ БИЛЕТ • JACKPOT', en: 'LUCKY TICKET • JACKPOT', de: 'GLÜCKSTICKET • JACKPOT', fr: 'BILLET CHANCEUX • JACKPOT', pt: 'BILHETE DA SORTE • JACKPOT', es: 'BOLETO DE LA SUERTE • JACKPOT', zh: '幸运彩票 • JACKPOT', ja: 'ラッキーチケット • JACKPOT', it: 'BIGLIETTO FORTUNATO • JACKPOT', ko: '행운의 티켓 • JACKPOT', tr: 'ŞANSLI BİLET • JACKPOT', he: 'כרטיס מזל • קופה', ar: 'تذكرة الحظ • الجائزة الكبرى', hi: 'लकी टिकट • जैकपॉट', la: 'TESSERA FORTUNATA • JACKPOT', eo: 'BONŜANCA BILETO • JACKPOT' },
  ticketControl: { ru: 'КОНТРОЛЬ', en: 'CONTROL', de: 'KONTROLLE', fr: 'CONTRÔLE', pt: 'CONTROLE', es: 'CONTROL', zh: '检票区', ja: '半券', it: 'CONTROLLO', ko: '확인란', tr: 'KONTROL', he: 'ביקורת', ar: 'مراقبة', hi: 'नियंत्रण', la: 'INSPECTIO', eo: 'KONTROLO' }
};

// Add to interface
let interfaceEnd = content.indexOf('}');
let interfaceContent = content.substring(0, interfaceEnd);
for (const key of Object.keys(newKeys)) {
  if (!interfaceContent.includes(`  ${key}: string;`)) {
    interfaceContent += `  ${key}: string;\n`;
  }
}
content = interfaceContent + content.substring(interfaceEnd);

// Add to TRANSLATIONS
for (const [key, langs] of Object.entries(newKeys)) {
  for (const [lang, val] of Object.entries(langs)) {
    const searchStr = `  ${lang}: {`;
    const replaceStr = `  ${lang}: { ${key}: ${JSON.stringify(val)},`;
    
    // Check if key already exists for this lang
    const langStart = content.indexOf(searchStr);
    if (langStart === -1) continue;
    
    const blockEnd = content.indexOf('},', langStart);
    if (blockEnd === -1) {
      const blockEnd2 = content.indexOf('}\n', langStart);
      if (blockEnd2 === -1) continue;
    }
    
    const blockText = content.substring(langStart, content.indexOf('}', langStart));
    if (!blockText.includes(key + ':')) {
       content = content.replace(searchStr, replaceStr);
    }
  }
}

fs.writeFileSync('src/translations.ts', content, 'utf8');
console.log('Translations updated.');
