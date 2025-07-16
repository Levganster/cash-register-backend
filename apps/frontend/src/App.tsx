import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';

import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Balances } from './pages/Balances';
import { Transactions } from './pages/Transactions';
import { AdminUsers } from './pages/admin/Users';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { refreshUser, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    console.log(
      'App initialized, isAuthenticated:',
      isAuthenticated,
      'user:',
      !!user,
    );

    // Только если не авторизован или нет пользователя, но есть токен
    const token = localStorage.getItem('accessToken');
    if (token && (!isAuthenticated || !user)) {
      console.log('App calling refreshUser...');
      refreshUser();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="balances" element={<Balances />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="admin">
                <Route path="users" element={<AdminUsers />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
