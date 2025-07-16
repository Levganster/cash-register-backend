import { Prisma } from '@prisma/client';

export const USER_INCLUDE = {
  role: true,
  avatar: {
    select: {
      id: true,
      url: true,
    },
  },
} satisfies Prisma.UserInclude;
