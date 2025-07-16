import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { apiClient } from '../lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  signIn: (tgId: string) => Promise<void>;
  signUp: (tgId: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      signIn: async (tgId: string) => {
        console.log('signIn called with tgId:', tgId);
        set({ isLoading: true, error: null });

        try {
          console.log('Attempting to sign in...');
          const response = await apiClient.signIn({ tgId });
          console.log('Sign in response:', response.data);

          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);

          // Получаем информацию о пользователе
          console.log('Fetching user info after sign in...');
          const userResponse = await apiClient.getMe();
          console.log('User info after sign in:', userResponse.data);

          const userData = userResponse.data.data || userResponse.data;
          console.log('Extracted user data:', userData);

          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          console.log('Sign in completed successfully, user set:', userData);
        } catch (error: any) {
          console.log('Sign in error:', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Ошибка авторизации',
          });
          throw error;
        }
      },

      signUp: async (tgId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.signUp({ tgId });

          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);

          // Получаем информацию о пользователе
          const userResponse = await apiClient.getMe();

          const userData = userResponse.data.data || userResponse.data;
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Ошибка регистрации',
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiClient.logout();
        } catch (error) {
          console.error('Ошибка при выходе:', error);
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshUser: async () => {
        const token = localStorage.getItem('accessToken');
        console.log(
          'refreshUser called, token:',
          token ? 'exists' : 'not found',
        );

        if (!token) {
          console.log('No token found, setting unauthenticated');
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        // Если пользователь уже авторизован, не делаем лишних запросов
        const currentState = get();
        if (currentState.isAuthenticated && currentState.user) {
          console.log('User already authenticated, skipping refresh');
          return;
        }

        // Защита от одновременных вызовов
        if (currentState.isLoading) {
          console.log('Already loading, skipping refresh');
          return;
        }

        set({ isLoading: true });

        try {
          console.log('Fetching user data...');
          const userResponse = await apiClient.getMe();
          console.log('User data received:', userResponse.data);
          console.log('Full response structure:', userResponse);

          // Пробуем разные варианты структуры ответа
          const userData = userResponse.data.data || userResponse.data;
          console.log('Extracted user data:', userData);

          if (!userData || !userData.id) {
            throw new Error('Invalid user data received');
          }

          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          console.log(
            'User authenticated successfully via refresh, user set:',
            userData,
          );
        } catch (error: any) {
          console.log('Error fetching user data:', error);

          // Если ошибка 401, не удаляем токены сразу - пусть интерцептор попробует обновить
          if (error.response?.status !== 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error:
              error.response?.data?.message ||
              'Ошибка получения данных пользователя',
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      // Сохраняем и восстанавливаем полное состояние
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Добавляем обработчик восстановления состояния
      onRehydrateStorage: () => (state) => {
        console.log('Rehydrating auth state:', state);
        if (state) {
          console.log(
            'Rehydrated user:',
            state.user,
            'isAuthenticated:',
            state.isAuthenticated,
          );
        }
      },
    },
  ),
);
