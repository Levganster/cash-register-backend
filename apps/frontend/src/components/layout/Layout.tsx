import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { useRouteInvalidation } from '../../hooks/useRouteInvalidation';
import { useWindowFocusInvalidation } from '../../hooks/useWindowFocusInvalidation';

export const Layout = () => {
  // Инвалидируем данные при переходе между вкладками
  useRouteInvalidation();

  // Инвалидируем данные при фокусе окна (возврат к вкладке)
  useWindowFocusInvalidation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
