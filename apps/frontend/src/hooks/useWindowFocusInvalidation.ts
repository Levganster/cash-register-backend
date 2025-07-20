import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Ключи запросов, которые нужно инвалидировать при фокусе окна
const FOCUS_INVALIDATE_KEYS = [
  'balances',
  'transactions',
  'currencies',
  'users',
  'roles',
  'me',
];

export const useWindowFocusInvalidation = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let lastFocusTime = Date.now();

    const handleWindowFocus = () => {
      const now = Date.now();
      // Инвалидируем только если прошло больше 30 секунд с последнего фокуса
      if (now - lastFocusTime > 30000) {
        FOCUS_INVALIDATE_KEYS.forEach((key) => {
          queryClient.invalidateQueries({
            queryKey: [key],
            exact: false,
          });
        });

        console.log(
          '🔄 Инвалидация данных при фокусе окна',
          FOCUS_INVALIDATE_KEYS,
        );
      }
      lastFocusTime = now;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleWindowFocus();
      }
    };

    // Слушаем события фокуса окна
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);
};
