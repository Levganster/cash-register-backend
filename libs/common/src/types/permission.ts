import { Prisma } from '@prisma/client';

export type Permission = Prisma.PermissionGetPayload<object>;
