import { BaseRoleEnum } from '../../libs/common/src/constants/base-roles.enum';
import { PrismaClient } from '@prisma/client';

export const seedUser = async (prisma: PrismaClient) => {
  await prisma.user.create({
    data: {
      tgId: '1234567890',
      role: {
        connect: {
          name: BaseRoleEnum.Admin,
        },
      },
    },
  });
};
