import { 
  Transaction, 
  Budget, 
  Category, 
  MonthlyExpense, 
  CategoryExpense, 
  BudgetStatus, 
  DashboardStats,
  FilterPeriod,
  DateRange 
} from '@/types/finance';
import { transactionStorage, budgetStorage } from './storage';
import { CATEGORIES } from './categories';

// Date utilities
export const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
};

export const getDateRange = (period: FilterPeriod): DateRange => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case 'this-week':
      const dayOfWeek = now.getDay();
      start.setDate(now.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    
    case 'this-month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'last-month':
      start.setMonth(now.getMonth() - 1, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'all':
    default:
      start.setFullYear(2000);
      end.setFullYear(2100);
      break;
  }

  return { start, end };
};

export const isDateInRange = (date: string, range: DateRange): boolean => {
  const transactionDate = new Date(date);
  return transactionDate >= range.start && transactionDate <= range.end;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(amount));
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatMonthYear = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
};

// Analytics utilities
export const getMonthlyExpenses = (months: number = 12): MonthlyExpense[] => {
  const transactions = transactionStorage.getAll();
  const now = new Date();
  const monthsData: Record<string, number> = {};

  // Initialize months
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toISOString().slice(0, 7);
    monthsData[monthKey] = 0;
  }

  // Aggregate transactions
  transactions.forEach(transaction => {
    const transactionMonth = transaction.date.slice(0, 7);
    if (monthsData.hasOwnProperty(transactionMonth)) {
      monthsData[transactionMonth] += transaction.amount;
    }
  });

  return Object.entries(monthsData).map(([month, amount]) => ({
    month,
    amount,
  }));
};

export const getCategoryExpenses = (period: FilterPeriod = 'this-month'): CategoryExpense[] => {
  const transactions = transactionStorage.getAll();
  const range = getDateRange(period);
  
  const categoryTotals: Record<Category, number> = {
    food: 0,
    transport: 0,
    shopping: 0,
    bills: 0,
    health: 0,
    fees: 0,
    entertainment: 0,
    salary: 0,
    freelance: 0,
    investment: 0,
    others: 0,
  };

  // Calculate totals
  const filteredTransactions = transactions.filter(t => isDateInRange(t.date, range));
  filteredTransactions.forEach(transaction => {
    categoryTotals[transaction.category] += transaction.amount;
  });

  const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

  return Object.entries(categoryTotals).map(([category, amount]) => ({
    category: category as Category,
    amount,
    percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
  })).filter(item => item.amount > 0);
};

export const getBudgetStatuses = (month: string = getCurrentMonth()): BudgetStatus[] => {
  const budgets = budgetStorage.getByMonth(month);
  const transactions = transactionStorage.getAll();
  
  // Get transactions for the specified month
  const monthTransactions = transactions.filter(t => t.date.startsWith(month));
  
  return budgets.map(budget => {
    const spent = monthTransactions
      .filter(t => t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
    
    return {
      category: budget.category,
      budgeted: budget.amount,
      spent,
      remaining,
      percentage,
      isOverBudget: spent > budget.amount,
    };
  });
};

export const getDashboardStats = (): DashboardStats => {
  const currentMonth = getCurrentMonth();
  const transactions = transactionStorage.getAll();
  
  // Get transactions for this month
  const thisMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  
  // Calculate income and expenses separately
  const totalIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Net transaction is income minus expenses
  const netTransaction = totalIncome - totalExpenses;
  
  // Categories breakdown
  const categoriesBreakdown = getCategoryExpenses('this-month');
  
  // Recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Budget statuses
  const budgetStatuses = getBudgetStatuses();
  
  return {
    totalExpensesThisMonth: totalExpenses,
    totalIncomeThisMonth: totalIncome,
    netTransactionThisMonth: netTransaction,
    categoriesBreakdown,
    recentTransactions,
    budgetStatuses,
  };
};

export const exportToCSV = (transactions: Transaction[]): string => {
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  const rows = transactions.map(t => [
    formatDate(t.date),
    t.description,
    CATEGORIES[t.category].name,
    formatCurrency(t.amount),
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
};

export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
