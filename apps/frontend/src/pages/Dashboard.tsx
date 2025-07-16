import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { apiClient } from '../lib/api';
import { useAuthStore } from '../store/authStore';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard = () => {
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState<
    'week' | 'month' | 'year'
  >('month');

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats(),
  });

  const { data: chartData } = useQuery({
    queryKey: ['transaction-chart', selectedPeriod],
    queryFn: () => apiClient.getTransactionChartData(selectedPeriod),
  });

  const { data: balances } = useQuery({
    queryKey: ['my-balances'],
    queryFn: () => apiClient.getMyBalances(),
  });

  const balanceChartData =
    balances?.map((balance) => ({
      name: balance.currency.code,
      value: balance.amount,
      symbol: balance.currency.symbol,
    })) || [];

  const transactionChartData =
    chartData?.map((item) => ({
      date: new Date(item.date).toLocaleDateString('ru-RU'),
      income: item.income || 0,
      expense: item.expense || 0,
      net: (item.income || 0) - (item.expense || 0),
    })) || [];

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Добро пожаловать, {user?.firstName || user?.username}!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Обзор ваших финансов и последних транзакций
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">💰</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Общий баланс
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats?.totalBalance?.toLocaleString('ru-RU') || 0} ₽
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                <span className="text-success-600 font-semibold">📈</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Доходы
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats?.totalIncome?.toLocaleString('ru-RU') || 0} ₽
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-danger-100 rounded-full flex items-center justify-center">
                <span className="text-danger-600 font-semibold">📉</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Расходы
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats?.totalExpenses?.toLocaleString('ru-RU') || 0} ₽
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-semibold">📊</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Транзакции
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats?.transactionCount || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Динамика транзакций
            </h3>
            <select
              value={selectedPeriod}
              onChange={(e) =>
                setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')
              }
              className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
              <option value="year">Год</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  `${value.toLocaleString('ru-RU')} ₽`
                }
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Доходы" />
              <Bar dataKey="expense" fill="#ef4444" name="Расходы" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Распределение по валютам
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={balanceChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, symbol }) =>
                  `${name}: ${value?.toLocaleString('ru-RU') || 0} ${symbol}`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {balanceChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  `${value.toLocaleString('ru-RU')}`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Чистый доход</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={transactionChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                `${value.toLocaleString('ru-RU')} ₽`
              }
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
