import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  PlusIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import type { Transaction, Currency, Balance } from '../types';

interface TransactionFormData {
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'SETTLEMENT';
  amount: number;
  balanceId: string;
  currencyId: string;
}

interface FilterState {
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'SETTLEMENT';
  balanceId?: string;
  currencyId?: string;
}

export const Transactions = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  const { data: transactionsResponse, isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () =>
      apiClient.getTransactions({
        filters,
        pagination: { page: 1, count: 50 },
      }),
  });

  const { data: currenciesResponse } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => apiClient.getCurrencies(),
  });

  const { data: balancesResponse } = useQuery({
    queryKey: ['balances'],
    queryFn: () => apiClient.getBalances(),
  });

  const createMutation = useMutation({
    mutationFn: (data: TransactionFormData) =>
      apiClient.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
      setIsCreateModalOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TransactionFormData>;
    }) => apiClient.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
      setEditingTransaction(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>();

  const onSubmit = (data: TransactionFormData) => {
    const transactionData = {
      ...data,
      amount: Math.round(data.amount * 100), // Конвертируем в копейки
    };

    if (editingTransaction) {
      updateMutation.mutate({
        id: editingTransaction.id,
        data: transactionData,
      });
    } else {
      createMutation.mutate(transactionData);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setValue('type', transaction.type);
    setValue('amount', transaction.amount / 100); // Конвертируем из копеек
    setValue('balanceId', transaction.balanceId);
    setValue('currencyId', transaction.currencyId);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingTransaction(null);
    reset();
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'INCOME':
        return <ArrowDownIcon className="h-5 w-5 text-green-600" />;
      case 'EXPENSE':
        return <ArrowUpIcon className="h-5 w-5 text-red-600" />;
      case 'TRANSFER':
        return <ArrowRightIcon className="h-5 w-5 text-blue-600" />;
      case 'SETTLEMENT':
        return <ArrowRightIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <ArrowRightIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'text-green-600';
      case 'EXPENSE':
        return 'text-red-600';
      case 'TRANSFER':
        return 'text-blue-600';
      case 'SETTLEMENT':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'Доход';
      case 'EXPENSE':
        return 'Расход';
      case 'TRANSFER':
        return 'Перевод';
      case 'SETTLEMENT':
        return 'Расчет';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const transactions = (transactionsResponse?.data?.data ||
    []) as Transaction[];
  const currencies = (currenciesResponse?.data?.data || []) as Currency[];
  const balances = (balancesResponse?.data?.data || []) as Balance[];

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Управление транзакциями
          </h1>
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

      {/* Фильтры */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value as any })
                }
                className="input"
              >
                <option value="">Все типы</option>
                <option value="INCOME">Доход</option>
                <option value="EXPENSE">Расход</option>
                <option value="TRANSFER">Перевод</option>
                <option value="SETTLEMENT">Расчет</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Баланс
              </label>
              <select
                value={filters.balanceId || ''}
                onChange={(e) =>
                  setFilters({ ...filters, balanceId: e.target.value })
                }
                className="input"
              >
                <option value="">Все балансы</option>
                {balances.map((balance) => (
                  <option key={balance.id} value={balance.id}>
                    {balance.name}
                  </option>
                ))}
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
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Список транзакций */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">💳</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Нет транзакций
            </h3>
            <p className="text-gray-500 mb-4">
              Добавьте первую транзакцию для начала работы
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
            >
              Добавить транзакцию
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {getTransactionLabel(transaction.type)}
                        </p>
                        <span className="ml-2 text-xs text-gray-500">
                          {transaction.balance?.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString(
                          'ru-RU',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${getTransactionColor(transaction.type)}`}
                      >
                        {transaction.type === 'EXPENSE' ? '-' : '+'}
                        {(transaction.amount / 100).toLocaleString('ru-RU', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {transaction.currency?.symbol}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.currency?.code}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTransaction
                  ? 'Редактировать транзакцию'
                  : 'Добавить транзакцию'}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип транзакции
                  </label>
                  <select
                    {...register('type', { required: 'Выберите тип' })}
                    className="input"
                  >
                    <option value="">Выберите тип</option>
                    <option value="INCOME">Доход</option>
                    <option value="EXPENSE">Расход</option>
                    <option value="TRANSFER">Перевод</option>
                    <option value="SETTLEMENT">Расчет</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Баланс
                  </label>
                  <select
                    {...register('balanceId', { required: 'Выберите баланс' })}
                    className="input"
                  >
                    <option value="">Выберите баланс</option>
                    {balances.map((balance) => (
                      <option key={balance.id} value={balance.id}>
                        {balance.name}
                      </option>
                    ))}
                  </select>
                  {errors.balanceId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.balanceId.message}
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
                    {currencies.map((currency) => (
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

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn btn-secondary"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="btn btn-primary"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Сохранение...
                      </div>
                    ) : editingTransaction ? (
                      'Обновить'
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
