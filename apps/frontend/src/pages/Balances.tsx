import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import type { Balance, Currency } from '../types';

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

interface CurrencyBalanceInput {
  currencyId: string;
  amount: number;
}

interface BalanceFormData {
  name: string;
  currencyBalances?: CurrencyBalanceInput[];
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

  // Получаем валюты
  const { data: currenciesResponse } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => apiClient.getCurrencies({}),
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: async (data: BalanceFormData) => {
      try {
        // Создаем баланс
        const balanceResponse = await apiClient.createBalance({
          name: data.name,
        });

        // Пробуем разные варианты структуры ответа
        const balance = balanceResponse.data?.data || balanceResponse.data;

        if (!balance || !balance.id) {
          throw new Error('Balance ID is undefined in response');
        }

        // Создаем записи для валют, если они указаны
        if (data.currencyBalances && data.currencyBalances.length > 0) {
          const currencyBalancePromises = data.currencyBalances.map((cb) =>
            apiClient.createCurrencyBalance({
              balanceId: balance.id,
              currencyId: cb.currencyId,
              amount: Math.round(cb.amount * 100), // Конвертируем в копейки
            }),
          );
          await Promise.all(currencyBalancePromises);
        }

        return balanceResponse;
      } catch (error) {
        console.error('Error in createMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
      setIsCreateModalOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      name,
      currencyBalances,
    }: {
      id: string;
      name: string;
      currencyBalances?: CurrencyBalanceInput[];
    }) => {
      try {
        // Обновляем название баланса
        await apiClient.updateBalance(id, { name });

        // Получаем текущие валютные балансы из исходных данных баланса
        const currentBalance = balances.find((b) => b.id === id);
        const existingCurrencyBalances = currentBalance?.currencyBalances || [];
        const newCurrencyBalances = currencyBalances || [];

        // Создаем карты для быстрого поиска
        const existingMap = new Map(
          existingCurrencyBalances.map((cb: any) => [cb.currencyId, cb]),
        );
        const newMap = new Map(
          newCurrencyBalances.map((cb: any) => [cb.currencyId, cb]),
        );

        // 1. Удаляем валютные балансы, которые больше не нужны
        for (const existing of existingCurrencyBalances) {
          if (!newMap.has(existing.currencyId)) {
            try {
              await apiClient.deleteCurrencyBalance(existing.id);
            } catch (error) {
              console.error(
                'Error deleting currency balance:',
                existing.id,
                error,
              );
            }
          }
        }

        // 2. Создаем или обновляем валютные балансы
        for (const newCB of newCurrencyBalances) {
          const existing: any = existingMap.get(newCB.currencyId);
          const newAmount = Math.round(newCB.amount * 100); // Конвертируем в копейки

          if (existing) {
            // Обновляем существующий, если сумма изменилась
            if (existing.amount !== newAmount) {
              try {
                await apiClient.updateCurrencyBalance(existing.id, {
                  amount: newAmount,
                });
              } catch (error) {
                console.error(
                  'Error updating currency balance:',
                  existing.id,
                  error,
                );
              }
            }
          } else {
            // Создаем новый
            try {
              await apiClient.createCurrencyBalance({
                balanceId: id,
                currencyId: newCB.currencyId,
                amount: newAmount,
              });
            } catch (error) {
              console.error('Error creating currency balance:', newCB, error);
            }
          }
        }

        return { id, name };
      } catch (error) {
        console.error('Error in updateMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
      setEditingBalance(null);
      setIsCreateModalOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteBalance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => apiClient.resetBalance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      alert('Баланс успешно сброшен! Все транзакции удалены, сумма обнулена.');
    },
    onError: (error: any) => {
      alert(`Ошибка при сбросе баланса: ${error.response?.data?.message || error.message}`);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<BalanceFormData>({
    defaultValues: {
      name: '',
      currencyBalances: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'currencyBalances',
  });

  const addCurrency = () => {
    append({ currencyId: '', amount: 0 });
  };

  const getAvailableCurrencies = (currentIndex: number) => {
    const selectedCurrencyIds = fields
      .map((field, index) => (index !== currentIndex ? field.currencyId : null))
      .filter(Boolean);

    return currencies.filter(
      (currency) => !selectedCurrencyIds.includes(currency.id),
    );
  };

  const onSubmit = (data: BalanceFormData) => {
    // Проверяем, что валюты не повторяются
    if (data.currencyBalances && data.currencyBalances.length > 0) {
      const currencyIds = data.currencyBalances.map((cb) => cb.currencyId);
      const uniqueCurrencyIds = new Set(currencyIds);
      if (currencyIds.length !== uniqueCurrencyIds.size) {
        alert('Нельзя выбрать одну валюту несколько раз');
        return;
      }
    }

    if (editingBalance) {
      updateMutation.mutate({
        id: editingBalance.id,
        name: data.name,
        currencyBalances: data.currencyBalances,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (balance: Balance) => {
    setEditingBalance(balance);
    setValue('name', balance.name);

    // Заполняем форму текущими валютными балансами
    if (balance.currencyBalances && balance.currencyBalances.length > 0) {
      const currencyBalancesData = balance.currencyBalances.map((cb) => ({
        currencyId: cb.currencyId,
        amount: (cb.amount || 0) / 100, // Конвертируем из копеек
      }));
      setValue('currencyBalances', currencyBalancesData);
    } else {
      setValue('currencyBalances', []);
    }

    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот баланс?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleReset = (id: string, name: string) => {
    if (confirm(`Вы уверены, что хотите сбросить баланс "${name}"? Это удалит все транзакции и обнулит сумму!`)) {
      resetMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingBalance(null);
    reset({
      name: '',
      currencyBalances: [],
    });
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

  const currencies = Array.isArray(currenciesResponse?.data?.data)
    ? currenciesResponse.data.data
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
          <h1 className="text-2xl font-bold text-gray-900">
            Управление балансами
          </h1>
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
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {balance.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {balance.currencyBalances?.length || 0}{' '}
                    {(() => {
                      const count = balance.currencyBalances?.length || 0;
                      if (count === 1) return 'валюта';
                      if (count >= 2 && count <= 4) return 'валюты';
                      return 'валют';
                    })()}
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
                  onClick={() => handleReset(balance.id, balance.name)}
                  className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                  title="Сбросить баланс (удалить все транзакции и обнулить сумму)"
                  disabled={resetMutation.isPending}
                >
                  <ArrowPathIcon className={`h-4 w-4 ${resetMutation.isPending ? 'animate-spin' : ''}`} />
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
                Создан: {formatDate(balance.createdAt)}
                {balance.updatedAt &&
                  balance.updatedAt !== balance.createdAt &&
                  formatDate(balance.updatedAt) !== 'Неизвестно' && (
                    <span className="block">
                      Обновлён: {formatDate(balance.updatedAt)}
                    </span>
                  )}
              </div>

              {balance.currencyBalances &&
              balance.currencyBalances.length > 0 ? (
                <div className="space-y-1">
                  {balance.currencyBalances.slice(0, 4).map((cb: any) => (
                    <div
                      key={cb.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="font-medium text-gray-700 flex items-center">
                        <span className="mr-1">
                          {cb.currency?.symbol || '💱'}
                        </span>
                        {cb.currency?.code || 'N/A'}:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {((cb.amount || 0) / 100).toLocaleString('ru-RU', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
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
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
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

                {/* Секция валют */}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      {editingBalance
                        ? 'Валютные балансы'
                        : 'Начальные валютные балансы'}
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={addCurrency}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Добавить валюту
                      </button>
                      {fields.length < currencies.length && (
                        <button
                          type="button"
                          onClick={() => {
                            const selectedCurrencyIds = fields.map(
                              (field) => field.currencyId,
                            );
                            const availableCurrencies = currencies.filter(
                              (currency) =>
                                !selectedCurrencyIds.includes(currency.id),
                            );
                            availableCurrencies.forEach((currency) => {
                              append({ currencyId: currency.id, amount: 0 });
                            });
                          }}
                          className="text-sm text-green-600 hover:text-green-800 flex items-center"
                        >
                          Добавить все валюты
                        </button>
                      )}
                    </div>
                  </div>

                  {fields.length === 0 && (
                    <p className="text-sm text-gray-500 mb-3">
                      {editingBalance
                        ? 'Добавьте валюты к балансу или оставьте пустым для удаления всех валют.'
                        : 'Добавьте валюты для установки начальных балансов. Это можно сделать и позже.'}
                    </p>
                  )}

                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {fields.map((field, index) => (
                      <div key={field.id}>
                        <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <select
                              {...register(
                                `currencyBalances.${index}.currencyId`,
                                {
                                  required: 'Выберите валюту',
                                },
                              )}
                              className="input text-sm"
                            >
                              <option value="">Выберите валюту</option>
                              {getAvailableCurrencies(index).map((currency) => (
                                <option key={currency.id} value={currency.id}>
                                  {currency.code} - {currency.name}
                                </option>
                              ))}
                              {/* Показываем уже выбранную валюту, если она есть */}
                              {field.currencyId &&
                                !getAvailableCurrencies(index).find(
                                  (c) => c.id === field.currencyId,
                                ) &&
                                (() => {
                                  const selectedCurrency = currencies.find(
                                    (c) => c.id === field.currencyId,
                                  );
                                  return selectedCurrency ? (
                                    <option
                                      key={selectedCurrency.id}
                                      value={selectedCurrency.id}
                                    >
                                      {selectedCurrency.code} -{' '}
                                      {selectedCurrency.name}
                                    </option>
                                  ) : null;
                                })()}
                            </select>
                          </div>
                          <div className="flex-1 relative">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              {...register(`currencyBalances.${index}.amount`, {
                                required: 'Введите сумму',
                                min: {
                                  value: 0,
                                  message: 'Сумма не может быть отрицательной',
                                },
                                valueAsNumber: true,
                              })}
                              className="input text-sm"
                              placeholder="0.00"
                            />
                            {field.currencyId && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                                {
                                  currencies.find(
                                    (c) => c.id === field.currencyId,
                                  )?.symbol
                                }
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                        {/* Отображение ошибок валидации для валют */}
                        {(errors.currencyBalances?.[index]?.currencyId ||
                          errors.currencyBalances?.[index]?.amount) && (
                          <div className="text-sm text-red-600 mt-1 px-3">
                            {errors.currencyBalances?.[index]?.currencyId
                              ?.message ||
                              errors.currencyBalances?.[index]?.amount?.message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {fields.length > 0 && (
                    <div className="mt-2 text-sm text-gray-500">
                      💡{' '}
                      {editingBalance
                        ? 'Изменения валютных балансов будут сохранены при обновлении баланса'
                        : 'Валюты без начального баланса будут созданы с нулевой суммой'}
                    </div>
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
