import axios from 'axios';
import type {
  User,
  Balance,
  Transaction,
  Currency,
  CurrencyBalance,
  Role,
  Permission,
  ApiResponse,
  UserCreateDto,
  UserUpdateDto,
  UserSearchDto,
  BalanceCreateDto,
  BalanceUpdateDto,
  BalanceSearchDto,
  CurrencyBalanceCreateDto,
  CurrencyBalanceUpdateDto,
  CurrencyBalanceSearchDto,
  TransactionCreateDto,
  TransactionUpdateDto,
  TransactionSearchDto,
  CurrencyCreateDto,
  CurrencyUpdateDto,
  CurrencySearchDto,
  RoleCreateDto,
  RoleUpdateDto,
  RoleSearchDto,
  PermissionSearchDto,
  SignInDto,
  SignUpDto,
  RefreshDto,
} from '../types';

// Основной API клиент (порт 3000)
const mainApiClient = axios.create({
  baseURL: import.meta.env.VITE_MAIN_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// Админский API клиент (порт 3001)
const adminApiClient = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Функция для получения токена
const getToken = () => localStorage.getItem('accessToken');

// Настройка интерцепторов для основного API
mainApiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

mainApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return mainApiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await mainApiClient.post('/auth/refresh', {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return mainApiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Настройка интерцепторов для админского API
adminApiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return adminApiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Используем основной API для обновления токена
        const response = await mainApiClient.post('/auth/refresh', {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return adminApiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const apiClient = {
  // Аутентификация (основной API)
  signIn: (data: SignInDto) =>
    mainApiClient.post<{ accessToken: string; refreshToken: string }>(
      '/auth/sign-in',
      data,
    ),
  signUp: (data: SignUpDto) =>
    mainApiClient.post<{ accessToken: string; refreshToken: string }>(
      '/auth/sign-up',
      data,
    ),
  refresh: (data: RefreshDto) =>
    mainApiClient.post<{ accessToken: string }>('/auth/refresh', data),
  logout: () => mainApiClient.delete('/auth/logout'),

  // Пользователи (основной API)
  getMe: () => mainApiClient.get<ApiResponse<User>>('/users/me'),

  // Балансы (основной API)
  getBalances: (data?: BalanceSearchDto) =>
    mainApiClient.post<ApiResponse<{ data: Balance[]; count: number }>>(
      '/balance/search',
      data || {},
    ),
  getBalance: (id: string) =>
    mainApiClient.get<ApiResponse<Balance>>(`/balance/${id}`),
  createBalance: (data: BalanceCreateDto) =>
    mainApiClient.post<ApiResponse<Balance>>('/balance', data),
  updateBalance: (id: string, data: BalanceUpdateDto) =>
    mainApiClient.put<ApiResponse<Balance>>(`/balance/${id}`, data),
  deleteBalance: (id: string) =>
    mainApiClient.delete<ApiResponse<void>>(`/balance/${id}`),
  resetBalance: (id: string) =>
    mainApiClient.post<ApiResponse<Balance>>(`/balance/${id}/reset`),

  // Балансы валют (основной API)
  getMyBalances: (data?: CurrencyBalanceSearchDto) =>
    mainApiClient.post<ApiResponse<{ data: CurrencyBalance[]; count: number }>>(
      '/currency-balance/search',
      data || {},
    ),
  getCurrencyBalance: (id: string) =>
    mainApiClient.get<ApiResponse<CurrencyBalance>>(`/currency-balance/${id}`),
  createCurrencyBalance: (data: CurrencyBalanceCreateDto) =>
    mainApiClient.post<ApiResponse<CurrencyBalance>>('/currency-balance', data),
  updateCurrencyBalance: (id: string, data: CurrencyBalanceUpdateDto) =>
    mainApiClient.put<ApiResponse<CurrencyBalance>>(
      `/currency-balance/${id}`,
      data,
    ),
  deleteCurrencyBalance: (id: string) =>
    mainApiClient.delete<ApiResponse<void>>(`/currency-balance/${id}`),

  // Транзакции (основной API)
  getTransactions: (data?: TransactionSearchDto) =>
    mainApiClient.post<ApiResponse<{ data: Transaction[]; count: number }>>(
      '/transaction/search',
      data || {},
    ),
  getTransaction: (id: string) =>
    mainApiClient.get<ApiResponse<Transaction>>(`/transaction/${id}`),
  createTransaction: (data: TransactionCreateDto) =>
    mainApiClient.post<ApiResponse<Transaction>>('/transaction', data),
  updateTransaction: (id: string, data: TransactionUpdateDto) =>
    mainApiClient.put<ApiResponse<Transaction>>(`/transaction/${id}`, data),
  deleteTransaction: (id: string) =>
    mainApiClient.delete<ApiResponse<void>>(`/transaction/${id}`),
  getTransactionStatistics: (balanceId: string) =>
    mainApiClient.get<ApiResponse<any>>(
      `/transaction/statistics/balance/${balanceId}`,
    ),

  // Валюты (основной API)
  getCurrencies: (data?: CurrencySearchDto) =>
    mainApiClient.post<ApiResponse<{ data: Currency[]; count: number }>>(
      '/currency/search',
      data || {},
    ),
  getCurrency: (id: string) =>
    mainApiClient.get<ApiResponse<Currency>>(`/currency/${id}`),
  createCurrency: (data: CurrencyCreateDto) =>
    mainApiClient.post<ApiResponse<Currency>>('/currency', data),
  updateCurrency: (id: string, data: CurrencyUpdateDto) =>
    mainApiClient.put<ApiResponse<Currency>>(`/currency/${id}`, data),
  deleteCurrency: (id: string) =>
    mainApiClient.delete<ApiResponse<void>>(`/currency/${id}`),

  // Админские методы (админский API)
  // Пользователи
  getUsers: (data?: UserSearchDto) =>
    adminApiClient.post<ApiResponse<User[]>>('/users/search', data || {}),
  getUser: (id: string) =>
    adminApiClient.get<ApiResponse<User>>(`/users/${id}`),
  createUser: (data: UserCreateDto) =>
    adminApiClient.post<ApiResponse<User>>('/users', data),
  updateUser: (id: string, data: UserUpdateDto) =>
    adminApiClient.patch<ApiResponse<User>>(`/users/${id}`, data),
  deleteUser: (id: string) =>
    adminApiClient.delete<ApiResponse<void>>(`/users/${id}`),

  // Роли
  getRoles: (data?: RoleSearchDto) =>
    adminApiClient.post<ApiResponse<Role[]>>('/roles/search', data || {}),
  getRole: (id: string) =>
    adminApiClient.get<ApiResponse<Role>>(`/roles/${id}`),
  createRole: (data: RoleCreateDto) =>
    adminApiClient.post<ApiResponse<Role>>('/roles', data),
  updateRole: (id: string, data: RoleUpdateDto) =>
    adminApiClient.patch<ApiResponse<Role>>(`/roles/${id}`, data),
  deleteRole: (id: string) =>
    adminApiClient.delete<ApiResponse<void>>(`/roles/${id}`),

  // Права доступа
  getPermissions: (data?: PermissionSearchDto) =>
    adminApiClient.post<ApiResponse<Permission[]>>(
      '/permissions/search',
      data || {},
    ),
  getPermission: (id: string) =>
    adminApiClient.get<ApiResponse<Permission>>(`/permissions/${id}`),
};
