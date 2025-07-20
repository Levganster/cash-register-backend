import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import type { Balance } from '../types';

interface BalanceFormData {
  name: string;
}

export const Balances = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBalance, setEditingBalance] = useState<Balance | null>(null);
  const queryClient = useQueryClient();

  // Получаем балансы
  const {
    data: balancesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['balances'],
    queryFn: () => apiClient.getBalances({}),
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: BalanceFormData) => apiClient.createBalance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      setIsCreateModalOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiClient.updateBalance(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      setEditingBalance(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteBalance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
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
      updateMutation.mutate({ id: editingBalance.id, name: data.name });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (balance: Balance) => {
    setEditingBalance(balance);
    setValue('name', balance.name);
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

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-medium">Ошибка загрузки</h3>
          <p className="text-sm mt-2">Не удалось загрузить балансы</p>
        </div>
        <button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ['balances'] })
          }
          className="btn btn-primary"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  // Извлекаем данные из ответа
  const balances = Array.isArray(balancesResponse?.data?.data)
    ? balancesResponse.data.data
    : [];

  // Фильтруем только валидные балансы с именами
  const validBalances = balances.filter(
    (balance): balance is Balance =>
      balance &&
      typeof balance === 'object' &&
      'id' in balance &&
      'name' in balance &&
      balance.name &&
      balance.name.trim() !== '',
  );

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Балансы</h1>
          <p className="mt-2 text-sm text-gray-600">
            Управляйте балансами системы
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

      {/* Список балансов */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {validBalances.map((balance) => (
          <div key={balance.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-lg">
                    💰
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {balance.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {balance.currencyBalances?.length || 0} валют
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(balance)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Редактировать"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(balance.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Удалить"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-2">
                Обновлено:{' '}
                {new Date(balance.updatedAt).toLocaleDateString('ru-RU')}
              </div>

              {balance.currencyBalances &&
              balance.currencyBalances.length > 0 ? (
                <div className="space-y-1">
                  {balance.currencyBalances.slice(0, 4).map((cb: any) => (
                    <div
                      key={cb.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="font-medium text-gray-700">
                        {cb.currency?.code || 'N/A'}:
                      </span>
                      <span className="text-gray-900">
                        {((cb.amount || 0) / 100).toLocaleString('ru-RU', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        <span className="text-gray-500">
                          {cb.currency?.symbol || ''}
                        </span>
                      </span>
                    </div>
                  ))}
                  {balance.currencyBalances.length > 4 && (
                    <div className="text-xs text-gray-400 text-center pt-1">
                      +{balance.currencyBalances.length - 4} ещё
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic">
                  Нет валютных балансов
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Пустое состояние */}
      {validBalances.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">💰</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Нет балансов
          </h3>
          <p className="text-gray-500 mb-4">
            Добавьте первый баланс для начала работы
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            Добавить баланс
          </button>
        </div>
      )}

      {/* Модальное окно */}
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
                    Название баланса
                  </label>
                  <input
                    type="text"
                    {...register('name', {
                      required: 'Введите название баланса',
                      minLength: {
                        value: 2,
                        message: 'Название должно содержать минимум 2 символа',
                      },
                      maxLength: {
                        value: 100,
                        message: 'Название не должно превышать 100 символов',
                      },
                    })}
                    className="input"
                    placeholder="Например: Касса 1, Банковский счет"
                    autoFocus
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn btn-secondary"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
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
