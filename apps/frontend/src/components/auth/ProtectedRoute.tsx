import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

export const ProtectedRoute = ({
  children,
  requiredPermissions,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading, refreshUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log(
      'ProtectedRoute effect, token:',
      token ? 'exists' : 'not found',
      'user:',
      user ? 'exists' : 'not found',
      'isAuthenticated:',
      isAuthenticated,
    );

    // Только если есть токен, но нет пользователя и не идет загрузка
    if (token && !user && !isLoading && !isAuthenticated) {
      console.log('Calling refreshUser from ProtectedRoute');
      refreshUser();
    }
  }, []);

  console.log('ProtectedRoute render:', {
    isAuthenticated,
    user: !!user,
    isLoading,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log(
      'Redirecting to login, isAuthenticated:',
      isAuthenticated,
      'user:',
      !!user,
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    // Проверяем права доступа через роль пользователя
    const userPermissions =
      user.role?.rolePermissions?.map((rp) => rp.permission.name) || [];
    const hasRequiredPermissions = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasRequiredPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 mb-4">
              У вас нет необходимых прав для доступа к этой странице.
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn btn-primary"
            >
              Назад
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
