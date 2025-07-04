import { Transaction, Budget, FilterPeriod } from '@/types/finance';

// Local storage keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'finance_transactions',
  BUDGETS: 'finance_budgets',
} as const;

// Transaction Storage
export const transactionStorage = {
  getAll: (): Transaction[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading transactions from storage:', error);
      return [];
    }
  },

  save: (transactions: Transaction[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions to storage:', error);
    }
  },

  add: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction => {
    const transactions = transactionStorage.getAll();
    const now = new Date().toISOString();
    
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    transactions.push(newTransaction);
    transactionStorage.save(transactions);
    return newTransaction;
  },

  update: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Transaction | null => {
    const transactions = transactionStorage.getAll();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) return null;

    const updatedTransaction = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    transactions[index] = updatedTransaction;
    transactionStorage.save(transactions);
    return updatedTransaction;
  },

  delete: (id: string): boolean => {
    const transactions = transactionStorage.getAll();
    const filteredTransactions = transactions.filter(t => t.id !== id);
    
    if (filteredTransactions.length === transactions.length) return false;
    
    transactionStorage.save(filteredTransactions);
    return true;
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  }
};

// Budget Storage
export const budgetStorage = {
  getAll: (): Budget[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading budgets from storage:', error);
      return [];
    }
  },

  save: (budgets: Budget[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (error) {
      console.error('Error saving budgets to storage:', error);
    }
  },

  add: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Budget => {
    const budgets = budgetStorage.getAll();
    const now = new Date().toISOString();
    
    // Remove existing budget for same category and month
    const filteredBudgets = budgets.filter(
      b => !(b.category === budget.category && b.month === budget.month)
    );

    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    filteredBudgets.push(newBudget);
    budgetStorage.save(filteredBudgets);
    return newBudget;
  },

  update: (id: string, updates: Partial<Omit<Budget, 'id' | 'createdAt'>>): Budget | null => {
    const budgets = budgetStorage.getAll();
    const index = budgets.findIndex(b => b.id === id);
    
    if (index === -1) return null;

    const updatedBudget = {
      ...budgets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    budgets[index] = updatedBudget;
    budgetStorage.save(budgets);
    return updatedBudget;
  },

  delete: (id: string): boolean => {
    const budgets = budgetStorage.getAll();
    const filteredBudgets = budgets.filter(b => b.id !== id);
    
    if (filteredBudgets.length === budgets.length) return false;
    
    budgetStorage.save(filteredBudgets);
    return true;
  },

  getByMonth: (month: string): Budget[] => {
    return budgetStorage.getAll().filter(b => b.month === month);
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
  }
};