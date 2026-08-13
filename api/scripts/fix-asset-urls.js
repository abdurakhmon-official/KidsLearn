require('dotenv').config();

const { PrismaClient } = require('../generated/prisma/client');

const prisma = new PrismaClient({ log: ['error'] });

// Yuklangan fayllarga havola bazaga to'liq manzil bilan yoziladi. `PUBLIC_API_URL`
// noto'g'ri bo'lgan paytda yozilgan qatorlar keyin ham eski manzilni qaytaraveradi
// (masalan `http://localhost:9100/...`), shuning uchun ularni bir marta yangilash kerak.
const MARKER = '/s3/file/';

const TARGETS = [
  { model: 'category', columns: ['audioUrl'] },
  { model: 'lesson', columns: ['videoUrl', 'audioUrl'] },
  { model: 'lessonMedia', columns: ['url'] },
  { model: 'mediaAsset', columns: ['url'] },
  { model: 'phraseAudio', columns: ['url'] },
  { model: 'ttsCache', columns: ['url'] },
];

function rebuild(url, base) {
  if (typeof url !== 'string') return null;

  const at = url.indexOf(MARKER);

  // Tashqi havolalar (admin qo'lda kiritgan YouTube va h.k.) tegilmaydi.
  if (at === -1) return null;

  const next = base + url.slice(at);

  return next === url ? null : next;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const base = (process.env.PUBLIC_API_URL || '').replace(/\/+$/, '');

  if (!base) {
    console.error('Xato: PUBLIC_API_URL o\'rnatilmagan — nimaga almashtirishni bilib bo\'lmaydi.');
    process.exit(1);
  }

  if (base.includes('localhost') || base.includes('127.0.0.1')) {
    console.error(`Xato: PUBLIC_API_URL = ${base}. Bu brauzerga beriladigan manzil, localhost bo'lmasligi kerak.`);
    process.exit(1);
  }

  console.log(`${apply ? 'YOZILADI' : 'SINOV (yozilmaydi)'} — yangi asos: ${base}\n`);

  let total = 0;

  for (const { model, columns } of TARGETS) {
    for (const column of columns) {
      const rows = await prisma[model].findMany({
        where: { [column]: { contains: MARKER } },
        select: { id: true, [column]: true },
      });

      let changed = 0;

      for (const row of rows) {
        const next = rebuild(row[column], base);

        if (!next) continue;

        changed += 1;

        if (apply) {
          await prisma[model].update({ where: { id: row.id }, data: { [column]: next } });
        } else {
          console.log(`  ${model}.${column}: ${row[column]}\n    → ${next}`);
        }
      }

      if (changed) console.log(`${model}.${column}: ${changed} ta qator`);

      total += changed;
    }
  }

  console.log(`\nJami: ${total} ta qator${apply || !total ? '' : ' — yozish uchun --apply qo\'shing'}`);
}

main()
  .catch(e => {
    console.error(e.message || e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
