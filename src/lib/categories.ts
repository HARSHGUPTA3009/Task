
import { Category, CategoryInfo } from '@/types/finance';

export const CATEGORIES: Record<Category, CategoryInfo> = {
  // Expense categories
  food: {
    id: 'food',
    name: 'Food',
    icon: '🍕',
    color: 'hsl(25 95% 53%)',
    type: 'expense',
  },
  transport: {
    id: 'transport',
    name: 'Transport',
    icon: '🚗',
    color: 'hsl(217 91% 60%)',
    type: 'expense',
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    color: 'hsl(316 73% 52%)',
    type: 'expense',
  },
  bills: {
    id: 'bills',
    name: 'Bills',
    icon: '💡',
    color: 'hsl(12 76% 61%)',
    type: 'expense',
  },
  health: {
    id: 'health',
    name: 'Health',
    icon: '🏥',
    color: 'hsl(142 71% 45%)',
    type: 'expense',
  },
  fees: {
    id: 'fees',
    name: 'Fees',
    icon: '💳',
    color: 'hsl(45 93% 47%)',
    type: 'expense',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: 'hsl(280 100% 70%)',
    type: 'expense',
  },
  // Income categories
  salary: {
    id: 'salary',
    name: 'Salary',
    icon: '💰',
    color: 'hsl(120 100% 35%)',
    type: 'income',
  },
  freelance: {
    id: 'freelance',
    name: 'Freelance',
    icon: '💻',
    color: 'hsl(180 100% 40%)',
    type: 'income',
  },
  investment: {
    id: 'investment',
    name: 'Investment',
    icon: '📈',
    color: 'hsl(60 100% 50%)',
    type: 'income',
  },
  others: {
    id: 'others',
    name: 'Others',
    icon: '📦',
    color: 'hsl(210 11% 71%)',
    type: 'both',
  },
};

export const CATEGORY_LIST: CategoryInfo[] = Object.values(CATEGORIES);

export const getIncomeCategories = (): CategoryInfo[] => {
  return CATEGORY_LIST.filter(cat => cat.type === 'income' || cat.type === 'both');
};

export const getExpenseCategories = (): CategoryInfo[] => {
  return CATEGORY_LIST.filter(cat => cat.type === 'expense' || cat.type === 'both');
};

export const getCategoryInfo = (category: Category): CategoryInfo => {
  return CATEGORIES[category];
};

export const getCategoryColor = (category: Category): string => {
  return CATEGORIES[category].color;
};
