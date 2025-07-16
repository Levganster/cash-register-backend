import { PrismaClient } from '@prisma/client';
import { seedPermission } from './permission.seed';
import { seedRole } from './role.seed';
import { seedUser } from './user.seed';
import { seedCurrency } from './currency.seed';
import { seedBalance } from './balance.seed';

const prisma = new PrismaClient();

async function main() {
  await seedPermission(prisma);
  console.log('[+] Permissions created');

  await seedRole(prisma);
  console.log('[+] Roles created');

  await seedCurrency(prisma);
  console.log('[+] Currencies created');

  await seedBalance(prisma);
  console.log('[+] Balances created');

  await seedUser(prisma);
  console.log('[+] User created');

  console.log('[+] All set');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
