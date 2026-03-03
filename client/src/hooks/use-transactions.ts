import { useState, useEffect } from "react";
import { Transaction } from "./dsa";

const STORAGE_KEY = "finwise_transactions_mock";

const INITIAL_DATA: Transaction[] = [
  { id: 1, title: 'Salary', amount: 60000, type: 'income', category: 'Others', date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0] },
  { id: 2, title: 'Groceries', amount: 3200, type: 'expense', category: 'Food', date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0] },
  { id: 3, title: 'Rent', amount: 12000, type: 'expense', category: 'Rent', date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0] },
  { id: 4, title: 'New Shoes', amount: 2500, type: 'expense', category: 'Shopping', date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0] },
  { id: 5, title: 'Flight', amount: 4500, type: 'expense', category: 'Travel', date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] },
  { id: 6, title: 'Dinner out', amount: 1800, type: 'expense', category: 'Food', date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0] },
];

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTransactions(JSON.parse(stored));
    } else {
      setTransactions(INITIAL_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    }
  }, []);

  const saveToStorage = (data: Transaction[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setTransactions(data);
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newId = transactions.length ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
    const newTransactions = [...transactions, { ...t, id: newId }];
    saveToStorage(newTransactions);
  };

  const updateTransaction = (id: number, updated: Omit<Transaction, 'id'>) => {
    const newTransactions = transactions.map(t => t.id === id ? { ...updated, id } : t);
    saveToStorage(newTransactions);
  };

  const deleteTransaction = (id: number) => {
    const newTransactions = transactions.filter(t => t.id !== id);
    saveToStorage(newTransactions);
  };

  const clearAll = () => {
    saveToStorage([]);
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAll
  };
}
