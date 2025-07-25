export interface User {
  id: string;
  tgId: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  role: Role;
  sessions?: Session[];
}

export interface Role {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rolePermissions: RolePermission[];
  users?: User[];
}

export interface Permission {
  id: string;
  name: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  rolePermissions?: RolePermission[];
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  permission: Permission;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  refreshToken: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface Balance {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  currencyBalances: CurrencyBalance[];
  transactions?: Transaction[];
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  createdAt: string;
  updatedAt: string;
  currencyBalances?: CurrencyBalance[];
  transactions?: Transaction[];
}

export interface CurrencyBalance {
  id: string;
  balanceId: string;
  currencyId: string;
  amount: number;
  balance: Balance;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'SETTLEMENT';
  amount: number;
  balanceId: string;
  currencyId: string;
  balance: Balance;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
}

// Auth DTOs
export interface SignInDto {
  tgId: string;
}

export interface SignUpDto {
  tgId: string;
}

export interface RefreshDto {
  refreshToken: string;
}

// User DTOs
export interface UserCreateDto {
  tgId: string;
  roleId: string;
}

export interface UserUpdateDto {
  tgId?: string;
  roleId?: string;
}

export interface UserSearchDto {
  filters?: {
    tgId?: string;
    roleId?: string;
  };
  sorts?: {
    createdAt?: 'asc' | 'desc';
    tgId?: 'asc' | 'desc';
  };
  pagination?: {
    page?: number;
    count?: number;
  };
}

// Balance DTOs
export interface BalanceCreateDto {
  name: string;
}

export interface BalanceUpdateDto {
  name?: string;
}

export interface BalanceSearchDto {
  filters?: {
    name?: string;
  };
  sorts?: {
    createdAt?: 'asc' | 'desc';
    name?: 'asc' | 'desc';
  };
  pagination?: {
    page?: number;
    count?: number;
  };
}

// CurrencyBalance DTOs
export interface CurrencyBalanceCreateDto {
  balanceId: string;
  currencyId: string;
  amount: number;
}

export interface CurrencyBalanceUpdateDto {
  amount?: number;
}

export interface CurrencyBalanceSearchDto {
  filters?: {
    balanceId?: string;
    currencyId?: string;
  };
  sorts?: {
    createdAt?: 'asc' | 'desc';
    amount?: 'asc' | 'desc';
  };
  pagination?: {
    page?: number;
    count?: number;
  };
}

// Transaction DTOs
export interface TransactionCreateDto {
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'SETTLEMENT';
  amount: number;
  balanceId: string;
  currencyId: string;
}

export interface TransactionUpdateDto {
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'SETTLEMENT';
  amount?: number;
  balanceId?: string;
  currencyId?: string;
}

export interface TransactionSearchDto {
  filters?: {
    type?: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'SETTLEMENT';
    balanceId?: string;
    currencyId?: string;
  };
  sorts?: {
    createdAt?: 'asc' | 'desc';
    amount?: 'asc' | 'desc';
  };
  pagination?: {
    page?: number;
    count?: number;
  };
}

// Currency DTOs
export interface CurrencyCreateDto {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export interface CurrencyUpdateDto {
  code?: string;
  name?: string;
  symbol?: string;
  rate?: number;
}

export interface CurrencySearchDto {
  filters?: {
    code?: string;
    name?: string;
  };
  sorts?: {
    createdAt?: 'asc' | 'desc';
    code?: 'asc' | 'desc';
  };
  pagination?: {
    page?: number;
    count?: number;
  };
}

// Role DTOs
export interface RoleCreateDto {
  name: string;
}

export interface RoleUpdateDto {
  name?: string;
}

export interface RoleSearchDto {
  filters?: {
    name?: string;
  };
  sorts?: {
    createdAt?: 'asc' | 'desc';
    name?: 'asc' | 'desc';
  };
  pagination?: {
    page?: number;
    count?: number;
  };
}

// Permission DTOs
export interface PermissionSearchDto {
  filters?: {
    name?: string;
    title?: string;
  };
  sorts?: {
    createdAt?: 'asc' | 'desc';
    name?: 'asc' | 'desc';
  };
  pagination?: {
    page?: number;
    count?: number;
  };
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ChartData {
  date: string;
  amount: number;
  currency: string;
}

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  currencyBalances: {
    currency: Currency;
    balance: number;
  }[];
}
