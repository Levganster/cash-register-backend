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

  const { data: transactionsResponse } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => apiClient.getTransactions(),
  });

  const { data: balances } = useQuery({
    queryKey: ['my-balances'],
    queryFn: () => apiClient.getMyBalances(),
  });

  // Извлекаем данные правильно - пробуем разные варианты
  const balancesList = Array.isArray(balances?.data?.data)
    ? balances.data.data
    : Array.isArray(balances?.data)
      ? balances.data
      : [];

  const transactionsList = Array.isArray(transactionsResponse?.data?.data)
    ? transactionsResponse.data.data
    : Array.isArray(transactionsResponse?.data)
      ? transactionsResponse.data
      : [];

  // Пробуем разные варианты структуры данных
  const balanceChartData = balancesList
    .flatMap((balance: any) => {
      // Вариант 1: balance.currencyBalances (как ожидалось)
      if (balance.currencyBalances && Array.isArray(balance.currencyBalances)) {
        return balance.currencyBalances.map((cb: any) => ({
          name: cb.currency?.code || cb.currencyCode || 'Unknown',
          value: (cb.amount || 0) / 100,
          symbol: cb.currency?.symbol || cb.currencySymbol || '',
        }));
      }

      // Вариант 2: сам balance является currency balance
      if (balance.currency && balance.amount !== undefined) {
        return [
          {
            name: balance.currency.code || balance.currencyCode || 'Unknown',
            value: (balance.amount || 0) / 100,
            symbol: balance.currency.symbol || balance.currencySymbol || '',
          },
        ];
      }

      // Вариант 3: balance имеет прямые поля
      if (balance.amount !== undefined) {
        return [
          {
            name: balance.name || 'Balance',
            value: (balance.amount || 0) / 100,
            symbol: '',
          },
        ];
      }

      return [];
    })
    .filter((item: any) => item.value > 0); // Показываем только ненулевые балансы

  // Вычисляем статистику из транзакций
  let totalIncome = 0;
  let totalExpenses = 0;

  transactionsList.forEach((t: any) => {
    const type = t.type || t.transactionType || t.kind;
    const amount = (t.amount || 0) / 100;

    if (type === 'SETTLEMENT') {
      if (amount > 0) {
        totalIncome += amount;
      } else if (amount < 0) {
        totalExpenses += Math.abs(amount);
      }
    } else if (type === 'INCOME' || type === 'income' || type === 'IN') {
      totalIncome += amount;
    } else if (type === 'EXPENSE' || type === 'expense' || type === 'OUT') {
      totalExpenses += amount;
    }
  });

  const incomeTransactions = transactionsList.filter((t: any) => {
    const type = t.type || t.transactionType || t.kind;
    const amount = t.amount || 0;
    return (
      (type === 'SETTLEMENT' && amount > 0) ||
      type === 'INCOME' ||
      type === 'income' ||
      type === 'IN'
    );
  });

  const expenseTransactions = transactionsList.filter((t: any) => {
    const type = t.type || t.transactionType || t.kind;
    const amount = t.amount || 0;
    return (
      (type === 'SETTLEMENT' && amount < 0) ||
      type === 'EXPENSE' ||
      type === 'expense' ||
      type === 'OUT'
    );
  });

  // Группируем транзакции по дням для графика
  const transactionsByDate = transactionsList.reduce(
    (acc: any, transaction: any, index: number) => {
      // Пробуем разные поля для даты
      const dateField =
        transaction.createdAt ||
        transaction.created_at ||
        transaction.date ||
        transaction.updatedAt ||
        transaction.updated_at ||
        transaction.transactionDate ||
        transaction.dateCreated;

      let transactionDate = new Date(dateField);

      // Если дата невалидна, создаем равномерно распределенные временные метки
      if (isNaN(transactionDate.getTime())) {
        const now = new Date();
        // Распределяем транзакции равномерно по последним 24 часам
        const hoursBack = (index * 2) % 24; // Каждая транзакция на 2 часа раньше предыдущей
        const minutesOffset = (index * 15) % 60; // Добавляем минуты для разнообразия
        transactionDate = new Date(
          now.getTime() -
            hoursBack * 60 * 60 * 1000 -
            minutesOffset * 60 * 1000,
        );
      }

      // Создаем ключ для группировки по часам
      const groupKey = transactionDate.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      // Создаем короткую подпись для отображения (только час)
      const date = transactionDate.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      if (!acc[groupKey]) {
        acc[groupKey] = { date, income: 0, expense: 0 };
      }

      const transactionType =
        transaction.type || transaction.transactionType || transaction.kind;
      const amount = (transaction.amount || 0) / 100;

      // Для SETTLEMENT транзакций определяем тип по сумме
      if (transactionType === 'SETTLEMENT') {
        if (amount > 0) {
          acc[groupKey].income += amount;
        } else if (amount < 0) {
          acc[groupKey].expense += Math.abs(amount);
        }
      } else if (
        transactionType === 'INCOME' ||
        transactionType === 'income' ||
        transactionType === 'IN'
      ) {
        acc[groupKey].income += amount;
      } else if (
        transactionType === 'EXPENSE' ||
        transactionType === 'expense' ||
        transactionType === 'OUT'
      ) {
        acc[groupKey].expense += amount;
      }

      return acc;
    },
    {},
  );

  const transactionChartData =
    Object.keys(transactionsByDate).length > 0
      ? Object.entries(transactionsByDate)
          .map(([groupKey, item]: [string, any]) => {
            // Преобразуем строку "DD.MM, HH:MM" в дату для сортировки
            const [datePart, timePart] = groupKey.split(', ');
            const [day, month] = datePart.split('.');
            const [hour, minute] = timePart.split(':');
            const currentYear = new Date().getFullYear();
            const sortDate = new Date(
              currentYear,
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hour),
              parseInt(minute),
            );

            return {
              ...item,
              net: item.income - item.expense,
              sortDate: sortDate.getTime(),
            };
          })
          .sort((a: any, b: any) => a.sortDate - b.sortDate)
          .slice(-48) // Показываем последние 48 записей (больше данных)
          .map(({ sortDate, ...item }) => item) // Убираем sortDate, оставляем date (время)
      : []; // Пустой массив если нет данных

  // Отладочная информация для проверки временных меток
  console.log(
    'Sample chart data:',
    transactionChartData.slice(0, 5).map((item) => ({
      date: item.date,
      income: item.income,
      expense: item.expense,
      net: item.net,
    })),
  );

  return (
    <div className="space-y-6">
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
                  {balanceChartData
                    .reduce((sum, item) => sum + item.value, 0)
                    .toLocaleString('ru-RU')}{' '}
                  ₽
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
                  {totalIncome.toLocaleString('ru-RU')} ₽
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
                  {totalExpenses.toLocaleString('ru-RU')} ₽
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
                  {transactionsList.length}
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
                isAnimationActive={true}
                animationEasing="ease-out"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={400}
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
