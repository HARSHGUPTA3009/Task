export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO date string
  category: Category;
  type: 'income' | 'expense';
  createdAt: string;
  updatedAt: string;
}

export type Category = 
  | 'food'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'health'
  | 'fees'
  | 'entertainment'
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'others';

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export interface Budget {
  id: string;
  category: Category;
  amount: number;
  month: string; // YYYY-MM format
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyExpense {
  month: string;
  amount: number;
}

export interface CategoryExpense {
  category: Category;
  amount: number;
  percentage: number;
}

export interface BudgetStatus {
  category: Category;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

export interface DashboardStats {
  totalExpensesThisMonth: number;
  totalIncomeThisMonth: number;
  netTransactionThisMonth: number;
  categoriesBreakdown: CategoryExpense[];
  recentTransactions: Transaction[];
  budgetStatuses: BudgetStatus[];
}

export type FilterPeriod = 'this-week' | 'this-month' | 'last-month' | 'all';

export interface DateRange {
  start: Date;
  end: Date;
}
