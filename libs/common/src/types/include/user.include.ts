import { Prisma } from '@prisma/client';

export const USER_INCLUDE = {
  role: true,
} satisfies Prisma.UserInclude;
