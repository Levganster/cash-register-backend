import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import type { Currency } from '../types';

// Вспомогательная функция для безопасного форматирования дат
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Неизвестно';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Неизвестно';

  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
}

export const Currencies = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const queryClient = useQueryClient();

  const {
    data: currenciesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => apiClient.getCurrencies({}),
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: CurrencyFormData) => apiClient.createCurrency(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
      setIsCreateModalOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & CurrencyFormData) =>
      apiClient.updateCurrency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
      setIsEditModalOpen(false);
      setEditingCurrency(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteCurrency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CurrencyFormData>();

  const onSubmit = (data: CurrencyFormData) => {
    if (editingCurrency) {
      updateMutation.mutate({ id: editingCurrency.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setValue('code', currency.code);
    setValue('name', currency.name);
    setValue('symbol', currency.symbol);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту валюту?')) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditingCurrency(null);
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
          <p className="text-sm mt-2">Не удалось загрузить валюты</p>
        </div>
        <button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ['currencies'] })
          }
          className="btn btn-primary"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  const currencies = Array.isArray(currenciesResponse?.data?.data)
    ? currenciesResponse.data.data
    : [];

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Управление валютами
          </h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Добавить валюту
        </button>
      </div>

      {/* Список валют */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {currencies.map((currency) => (
          <div key={currency.id} className="card">
            <div className="card-header">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-lg">
                    {currency.symbol}
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {currency.code}
                  </h3>
                  <p className="text-sm text-gray-500">{currency.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(currency)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Редактировать"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(currency.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Удалить"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-2">
                Создана: {formatDate(currency.createdAt)}
                {currency.updatedAt &&
                  currency.updatedAt !== currency.createdAt &&
                  formatDate(currency.updatedAt) !== 'Неизвестно' && (
                    <span className="block">
                      Обновлена: {formatDate(currency.updatedAt)}
                    </span>
                  )}
              </div>

              <div className="text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Код:</span>
                  <span className="font-medium">{currency.code}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Символ:</span>
                  <span className="font-medium text-lg">{currency.symbol}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Пустое состояние */}
      {currencies.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">💱</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет валют</h3>
          <p className="text-gray-500 mb-4">
            Добавьте первую валюту для начала работы
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            Добавить валюту
          </button>
        </div>
      )}

      {/* Модальное окно */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isEditModalOpen ? 'Редактировать валюту' : 'Добавить валюту'}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Код валюты
                  </label>
                  <input
                    type="text"
                    {...register('code', {
                      required: 'Введите код валюты',
                      minLength: {
                        value: 3,
                        message: 'Код должен содержать минимум 3 символа',
                      },
                      maxLength: {
                        value: 3,
                        message: 'Код должен содержать максимум 3 символа',
                      },
                      pattern: {
                        value: /^[A-Z]+$/,
                        message: 'Код должен содержать только заглавные буквы',
                      },
                    })}
                    className="input"
                    placeholder="Например: USD, EUR, RUB"
                    autoFocus
                    style={{ textTransform: 'uppercase' }}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                    }}
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название валюты
                  </label>
                  <input
                    type="text"
                    {...register('name', {
                      required: 'Введите название валюты',
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
                    placeholder="Например: Доллар США, Евро, Российский рубль"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Символ валюты
                  </label>
                  <input
                    type="text"
                    {...register('symbol', {
                      required: 'Введите символ валюты',
                      maxLength: {
                        value: 10,
                        message: 'Символ не должен превышать 10 символов',
                      },
                    })}
                    className="input"
                    placeholder="Например: $, €, ₽"
                  />
                  {errors.symbol && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.symbol.message}
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
                    ) : isEditModalOpen ? (
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
