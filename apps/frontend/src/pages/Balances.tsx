import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import type { Balance, Currency } from '../types';

interface BalanceFormData {
  currencyId: string;
  amount: number;
}

export const Balances = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBalance, setEditingBalance] = useState<Balance | null>(null);
  const queryClient = useQueryClient();

  const { data: balances, isLoading } = useQuery({
    queryKey: ['my-balances'],
    queryFn: () => apiClient.getMyBalances(),
  });

  const { data: currencies } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => apiClient.getCurrencies(),
  });

  const createMutation = useMutation({
    mutationFn: (data: BalanceFormData) => apiClient.createBalance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
      setIsCreateModalOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      apiClient.updateBalance(id, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
      setEditingBalance(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteBalance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BalanceFormData>();

  const onSubmit = (data: BalanceFormData) => {
    if (editingBalance) {
      updateMutation.mutate({ id: editingBalance.id, amount: data.amount });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (balance: Balance) => {
    setEditingBalance(balance);
    setValue('currencyId', balance.currency.id);
    setValue('amount', balance.amount);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот баланс?')) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingBalance(null);
    reset();
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
          <h1 className="text-2xl font-bold text-gray-900">Мои балансы</h1>
          <p className="mt-2 text-sm text-gray-600">
            Управляйте своими балансами в различных валютах
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Добавить баланс
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {balances?.map((balance) => (
          <div key={balance.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-lg">
                    {balance.currency.symbol}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {balance.currency.code}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {balance.currency.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(balance)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(balance.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">
                {balance.amount.toLocaleString('ru-RU')}{' '}
                {balance.currency.symbol}
              </div>
              <div className="text-sm text-gray-500">
                Обновлено:{' '}
                {new Date(balance.updatedAt).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {balances?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">💰</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Нет балансов
          </h3>
          <p className="text-gray-500 mb-4">
            Добавьте свой первый баланс для начала работы
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            Добавить баланс
          </button>
        </div>
      )}

      {/* Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBalance ? 'Редактировать баланс' : 'Добавить баланс'}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Валюта
                  </label>
                  <select
                    {...register('currencyId', { required: 'Выберите валюту' })}
                    className="input"
                    disabled={!!editingBalance}
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
                        value: 0,
                        message: 'Сумма не может быть отрицательной',
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
                    ) : editingBalance ? (
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
