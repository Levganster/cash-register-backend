import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Маппинг роутов к ключам запросов, которые нужно инвалидировать
const ROUTE_QUERY_MAP: Record<string, string[]> = {
  '/dashboard': ['balances', 'transactions', 'currencies'],
  '/balances': ['balances', 'currencies'],
  '/transactions': ['transactions', 'balances', 'currencies'],
  '/currencies': ['currencies'],
  '/admin/users': ['users', 'roles'],
  '/admin/roles': ['roles', 'permissions'],
};

// Ключи запросов, которые нужно инвалидировать всегда при переходах
const ALWAYS_INVALIDATE = ['me'];

export const useRouteInvalidation = () => {
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Получаем ключи запросов для текущего роута
    const queryKeys = ROUTE_QUERY_MAP[location.pathname] || [];

    // Объединяем с ключами, которые инвалидируем всегда
    const allKeysToInvalidate = [...queryKeys, ...ALWAYS_INVALIDATE];

    // Инвалидируем каждый ключ с небольшой задержкой для лучшего UX
    const timeoutId = setTimeout(() => {
      allKeysToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({
          queryKey: [key],
          exact: false, // Инвалидируем все запросы, начинающиеся с этого ключа
        });
      });

      console.log(
        `🔄 Инвалидация данных для роута: ${location.pathname}`,
        allKeysToInvalidate,
      );
    }, 100); // 100ms задержка для плавности

    // Cleanup функция для отмены таймера при быстром переключении
    return () => clearTimeout(timeoutId);
  }, [location.pathname, queryClient]);
};
