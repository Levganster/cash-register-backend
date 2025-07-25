import { PrismaClient } from '@prisma/client';

export async function seedCurrency(prisma: PrismaClient) {
  const currencies = [
    {
      code: 'USD',
      name: 'Доллар США',
      rate: 85.5,
      symbol: '$',
    },
    {
      code: 'EUR',
      name: 'Евро',
      rate: 95.5,
      symbol: '€',
    },
    {
      code: 'RUB',
      name: 'Российский рубль',
      rate: 1,
      symbol: '₽',
    },
    {
      code: 'KZT',
      name: 'Казахстанский тенге',
      rate: 0.18,
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
