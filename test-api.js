const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const tables = await p.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
    console.log('Tables:', JSON.stringify(tables.map(t => t.tablename)));
  } catch(e) { console.error('Tables err:', e.message); }
  await p.$disconnect();
})();
