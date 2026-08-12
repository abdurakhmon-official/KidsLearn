const readline = require('readline');
const bcrypt = require('bcrypt');

require('dotenv').config();

const { PrismaClient } = require('../generated/prisma/client');

const BCRYPT_SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

const prisma = new PrismaClient({ log: ['error'] });

function askHidden(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });

    rl._writeToOutput = str => {
      if (str === question) rl.output.write(str);
    };

    rl.question(question, answer => {
      rl.output.write('\n');
      rl.close();
      resolve(answer);
    });
  });
}

function parseArgs(argv) {
  const flags = {};
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const match = /^--([\w-]+)(?:=(.*))?$/.exec(argv[i]);

    if (!match) {
      positional.push(argv[i]);
      continue;
    }

    flags[match[1]] = match[2] !== undefined ? match[2] : argv[++i];
  }

  return { flags, positional };
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));

  const email = (positional[0] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const fullName = flags.name || process.env.ADMIN_NAME || 'Administrator';
  const passwordArg = flags.password;

  if (!email) {
    console.error('Xato: email majburiy.\n');
    console.error('  node scripts/create-admin.js admin@example.com --name "Ism Familiya"');
    process.exit(1);
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error(`Xato: "${email}" yaroqli email emas.`);
    process.exit(1);
  }

  let password = passwordArg || process.env.ADMIN_PASSWORD || '';

  if (!password) {
    if (!process.stdin.isTTY) {
      console.error('Xato: parol berilmadi. Argument sifatida bering yoki TTY bilan ishga tushiring');
      console.error("(Docker'da: docker compose exec api node scripts/create-admin.js <email>).");
      process.exit(1);
    }

    password = await askHidden('Parol: ');
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`Xato: parol kamida ${MIN_PASSWORD_LENGTH} belgidan iborat bo'lsin.`);
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const existing = await prisma.user.findUnique({ where: { email } });

  const user = await prisma.user.upsert({
    where: { email },
    // Mavjud hisob bo'lsa — parolni tiklaydi va rolni ADMIN qiladi.
    update: { password: hash, role: 'ADMIN', active: true },
    create: { fullName, email, password: hash, role: 'ADMIN' },
  });

  console.log(`${existing ? 'Yangilandi' : 'Yaratildi'}: ${user.email} (${user.role}) — id: ${user.id}`);
}

main()
  .catch(e => {
    console.error(e.message || e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
