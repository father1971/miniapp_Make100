with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_str = r"<span>⚡️ {t.newRecordBanner ? t.newRecordBanner.replace('{time}', (lastRoundTimeMs / 1000).toFixed(2)) : `НОВЫЙ РЕКОРД: ${(lastRoundTimeMs / 1000).toFixed(2)} сек!`}</span>"
new_str = r"<span>{t.newRecordBanner ? (t.newRecordBanner.includes('{time}') ? t.newRecordBanner.replace('{time}', (lastRoundTimeMs / 1000).toFixed(2)) : `${t.newRecordBanner} ${(lastRoundTimeMs / 1000).toFixed(2)} ${t.secondsShort || 'sec.'}`) : `⚡️ НОВЫЙ РЕКОРД: ${(lastRoundTimeMs / 1000).toFixed(2)} сек!`}</span>"

content = content.replace(old_str, new_str)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
