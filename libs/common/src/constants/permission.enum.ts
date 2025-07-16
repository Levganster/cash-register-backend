export enum PermissionEnum {
  PermissionSearch = 'permission:search',
  PermissionGet = 'permission:get',

  RoleCreate = 'role:create',
  RoleGet = 'role:get',
  RoleUpdate = 'role:update',
  RoleSearch = 'role:search',
  RoleDelete = 'role:delete',

  UserCreate = 'user:create',
  UserGet = 'user:get',
  UserUpdate = 'user:update',
  UserDelete = 'user:delete',
  UserBan = 'user:ban',
  UserSearch = 'user:search',

  BalanceCreate = 'balance:create',
  BalanceGet = 'balance:get',
  BalanceUpdate = 'balance:update',
  BalanceDelete = 'balance:delete',
  BalanceSearch = 'balance:search',

  CurrencyCreate = 'currency:create',
  CurrencyGet = 'currency:get',
  CurrencyUpdate = 'currency:update',
  CurrencyDelete = 'currency:delete',
  CurrencySearch = 'currency:search',

  CurrencyBalanceCreate = 'currency-balance:create',
  CurrencyBalanceGet = 'currency-balance:get',
  CurrencyBalanceUpdate = 'currency-balance:update',
  CurrencyBalanceDelete = 'currency-balance:delete',
  CurrencyBalanceSearch = 'currency-balance:search',

  TransactionCreate = 'transaction:create',
  TransactionGet = 'transaction:get',
  TransactionUpdate = 'transaction:update',
  TransactionDelete = 'transaction:delete',
  TransactionSearch = 'transaction:search',
  TransactionStatistics = 'transaction:statistics',
}

export const PermissionTitles: Record<PermissionEnum, string> = {
  [PermissionEnum.PermissionSearch]: 'Поиск разрешений',
  [PermissionEnum.PermissionGet]: 'Получение разрешений',

  [PermissionEnum.RoleCreate]: 'Создание ролей',
  [PermissionEnum.RoleGet]: 'Получение ролей',
  [PermissionEnum.RoleUpdate]: 'Обновление ролей',
  [PermissionEnum.RoleSearch]: 'Поиск ролей',
  [PermissionEnum.RoleDelete]: 'Удаление ролей',

  [PermissionEnum.UserCreate]: 'Создание пользователя',
  [PermissionEnum.UserGet]: 'Получение пользователя',
  [PermissionEnum.UserUpdate]: 'Обновление пользователя',
  [PermissionEnum.UserDelete]: 'Удаление пользователя',
  [PermissionEnum.UserBan]: 'Бан пользователя',
  [PermissionEnum.UserSearch]: 'Поиск пользователей',

  [PermissionEnum.BalanceCreate]: 'Создание балансов',
  [PermissionEnum.BalanceGet]: 'Получение балансов',
  [PermissionEnum.BalanceUpdate]: 'Обновление балансов',
  [PermissionEnum.BalanceDelete]: 'Удаление балансов',
  [PermissionEnum.BalanceSearch]: 'Поиск балансов',

  [PermissionEnum.CurrencyCreate]: 'Создание валют',
  [PermissionEnum.CurrencyGet]: 'Получение валют',
  [PermissionEnum.CurrencyUpdate]: 'Обновление валют',
  [PermissionEnum.CurrencyDelete]: 'Удаление валют',
  [PermissionEnum.CurrencySearch]: 'Поиск валют',

  [PermissionEnum.CurrencyBalanceCreate]: 'Создание балансов валют',
  [PermissionEnum.CurrencyBalanceGet]: 'Получение балансов валют',
  [PermissionEnum.CurrencyBalanceUpdate]: 'Обновление балансов валют',
  [PermissionEnum.CurrencyBalanceDelete]: 'Удаление балансов валют',
  [PermissionEnum.CurrencyBalanceSearch]: 'Поиск балансов валют',

  [PermissionEnum.TransactionCreate]: 'Создание транзакций',
  [PermissionEnum.TransactionGet]: 'Получение транзакций',
  [PermissionEnum.TransactionUpdate]: 'Обновление транзакций',
  [PermissionEnum.TransactionDelete]: 'Удаление транзакций',
  [PermissionEnum.TransactionSearch]: 'Поиск транзакций',
  [PermissionEnum.TransactionStatistics]: 'Статистика транзакций',
};
