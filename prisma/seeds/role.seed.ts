import { Prisma, PrismaClient } from '@prisma/client';
import { PermissionEnum } from '../../libs/common/src/constants/permission.enum';
import { BaseRoleEnum } from '../../libs/common/src/constants/base-roles.enum';

export async function seedRole(prisma: PrismaClient) {
  await createRole(prisma, BaseRoleEnum.Admin, null);
  await createRole(prisma, BaseRoleEnum.User, [
    PermissionEnum.UserGet,
    PermissionEnum.BalanceGet,
    PermissionEnum.CurrencyGet,
    PermissionEnum.CurrencyBalanceGet,
    PermissionEnum.TransactionGet,
  ]);
  await createRole(prisma, BaseRoleEnum.Manager, [
    PermissionEnum.BalanceGet,
    PermissionEnum.BalanceCreate,
    PermissionEnum.BalanceUpdate,
    PermissionEnum.BalanceDelete,
    PermissionEnum.BalanceSearch,

    PermissionEnum.CurrencyGet,
    PermissionEnum.CurrencyCreate,
    PermissionEnum.CurrencyUpdate,
    PermissionEnum.CurrencyDelete,
    PermissionEnum.CurrencySearch,

    PermissionEnum.CurrencyBalanceGet,
    PermissionEnum.CurrencyBalanceCreate,
    PermissionEnum.CurrencyBalanceUpdate,
    PermissionEnum.CurrencyBalanceDelete,
    PermissionEnum.CurrencyBalanceSearch,

    PermissionEnum.TransactionGet,
    PermissionEnum.TransactionCreate,
    PermissionEnum.TransactionUpdate,
    PermissionEnum.TransactionDelete,
    PermissionEnum.TransactionSearch,
  ]);
}

async function createRole(
  prisma: PrismaClient,
  roleName: string,
  permissionNames: PermissionEnum[] | null,
) {
  await prisma.$transaction(async (prisma) => {
    const createdRole = await prisma.role.create({
      data: { name: roleName },
    });

    const permissionsQuery: Prisma.PermissionWhereInput = permissionNames
      ? { name: { in: permissionNames } }
      : {};

    const permissions = await prisma.permission.findMany({
      where: permissionsQuery,
    });

    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: createdRole.id,
        permissionId: permission.id,
      })),
    });
  });
}
