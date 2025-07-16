import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  PlusIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import type { Transaction, Currency } from '../types';

interface TransactionFormData {
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description: string;
  currencyId: string;
}

interface FilterState {
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  currencyId?: string;
  search?: string;
}

export const Transactions = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['my-transactions', filters],
    queryFn: () => apiClient.getMyTransactions(filters),
  });

  const { data: currencies } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => apiClient.getCurrencies(),
  });

  const createMutation = useMutation({
    mutationFn: (data: TransactionFormData) =>
      apiClient.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
      setIsCreateModalOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>();

  const onSubmit = (data: TransactionFormData) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      deleteMutation.mutate(id);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'INCOME':
        return <ArrowUpIcon className="h-5 w-5 text-success-600" />;
      case 'EXPENSE':
        return <ArrowDownIcon className="h-5 w-5 text-danger-600" />;
      case 'TRANSFER':
        return <ArrowRightIcon className="h-5 w-5 text-primary-600" />;
      default:
        return <ArrowRightIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'Доход';
      case 'EXPENSE':
        return 'Расход';
      case 'TRANSFER':
        return 'Перевод';
      default:
        return type;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'text-success-600';
      case 'EXPENSE':
        return 'text-danger-600';
      case 'TRANSFER':
        return 'text-primary-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мои транзакции</h1>
          <p className="mt-2 text-sm text-gray-600">
            История всех ваших доходов, расходов и переводов
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Фильтры
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Добавить транзакцию
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип транзакции
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value as any })
                }
                className="input"
              >
                <option value="">Все типы</option>
                <option value="INCOME">Доходы</option>
                <option value="EXPENSE">Расходы</option>
                <option value="TRANSFER">Переводы</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Валюта
              </label>
              <select
                value={filters.currencyId || ''}
                onChange={(e) =>
                  setFilters({ ...filters, currencyId: e.target.value })
                }
                className="input"
              >
                <option value="">Все валюты</option>
                {currencies?.data?.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Поиск
              </label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="input"
                placeholder="Поиск по описанию..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="card">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тип
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Описание
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Валюта
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions?.data?.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTransactionIcon(transaction.type)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {getTransactionTypeText(transaction.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {transaction.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${getAmountColor(transaction.type)}`}
                    >
                      {transaction.type === 'INCOME'
                        ? '+'
                        : transaction.type === 'EXPENSE'
                          ? '-'
                          : ''}
                      {transaction.amount.toLocaleString('ru-RU')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {transaction.currency.code}
                      </span>
                      <span className="text-sm text-gray-500">
                        {transaction.currency.symbol}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString(
                      'ru-RU',
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions?.data?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">💳</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Нет транзакций
            </h3>
            <p className="text-gray-500 mb-4">
              Добавьте свою первую транзакцию для начала работы
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
            >
              Добавить транзакцию
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Добавить транзакцию
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип транзакции
                  </label>
                  <select
                    {...register('type', {
                      required: 'Выберите тип транзакции',
                    })}
                    className="input"
                  >
                    <option value="">Выберите тип</option>
                    <option value="INCOME">Доход</option>
                    <option value="EXPENSE">Расход</option>
                    <option value="TRANSFER">Перевод</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Валюта
                  </label>
                  <select
                    {...register('currencyId', { required: 'Выберите валюту' })}
                    className="input"
                  >
                    <option value="">Выберите валюту</option>
                    {currencies?.data?.map((currency) => (
                      <option key={currency.id} value={currency.id}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                  {errors.currencyId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.currencyId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Сумма
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('amount', {
                      required: 'Введите сумму',
                      min: {
                        value: 0.01,
                        message: 'Сумма должна быть больше 0',
                      },
                    })}
                    className="input"
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    {...register('description', {
                      required: 'Введите описание',
                    })}
                    className="input"
                    rows={3}
                    placeholder="Описание транзакции..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      reset();
                    }}
                    className="btn btn-secondary"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="btn btn-primary"
                  >
                    {createMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Создание...
                      </div>
                    ) : (
                      'Создать'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
