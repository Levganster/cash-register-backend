import { Prisma } from '@prisma/client';
import { ROLE_INCLUDE } from './include/role.include';

export type Role = Prisma.RoleGetPayload<{
  include: typeof ROLE_INCLUDE;
}>;
