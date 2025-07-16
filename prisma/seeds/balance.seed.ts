import { PrismaClient } from '@prisma/client';

export async function seedBalance(prisma: PrismaClient) {
  const balances = [
    {
      name: 'Отмыв рублей',
    },
    {
      name: 'Отмыв долларов',
    },
    {
      name: 'Отмыв евро',
    },
  ];

  for (const balance of balances) {
    await prisma.balance.upsert({
      where: { name: balance.name },
      update: balance,
      create: balance,
    });
  }

  const currencies = await prisma.currency.findMany();
  const createdBalances = await prisma.balance.findMany();

  for (const balance of createdBalances) {
    for (const currency of currencies) {
      await prisma.currencyBalance.upsert({
        where: {
          balanceId_currencyId: {
            balanceId: balance.id,
            currencyId: currency.id,
          },
        },
        update: {},
        create: {
          balanceId: balance.id,
          currencyId: currency.id,
          amount: 0,
        },
      });
    }
  }
}
