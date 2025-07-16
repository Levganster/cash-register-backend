import { PrismaClient } from '@prisma/client';

export async function seedCurrency(prisma: PrismaClient) {
  const currencies = [
    {
      code: 'USD',
      name: 'Доллар США',
      symbol: '$',
    },
    {
      code: 'EUR',
      name: 'Евро',
      symbol: '€',
    },
    {
      code: 'RUB',
      name: 'Российский рубль',
      symbol: '₽',
    },
    {
      code: 'KZT',
      name: 'Казахстанский тенге',
      symbol: '₸',
    },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: currency,
      create: currency,
    });
  }
}
