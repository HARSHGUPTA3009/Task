
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, PieChart, Target, List, TrendingUp } from 'lucide-react';
import { TransactionForm } from '@/components/transaction-form';
import { TransactionList } from '@/components/transaction-list';
import { MonthlyExpensesChart } from '@/components/charts/monthly-expenses-chart';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { DashboardStats } from '@/components/dashboard-stats';
import { BudgetManager } from '@/components/budget-manager';
import { ThemeToggle } from '@/components/theme-toggle';
import { transactionStorage } from '@/lib/storage';
import { Transaction } from '@/types/finance';

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadTransactions = () => {
    setTransactions(transactionStorage.getAll());
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4 animate-fade-in">
            💰 Finance Tracker
          </h1>
          <p className="text-lg text-muted-foreground mb-6 animate-slide-up">
            Your personal finance companion - Track income, expenses, set budgets, and reach your goals
          </p>
          <div className="animate-bounce-in">
            <TransactionForm onSuccess={loadTransactions} />
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 finance-card">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Charts</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Budgets</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats key={refreshKey} onRefresh={loadTransactions} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionList transactions={transactions} onUpdate={loadTransactions} />
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-1">
              <MonthlyExpensesChart key={refreshKey} />
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <CategoryPieChart key={refreshKey} />
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <BudgetManager key={refreshKey} onUpdate={loadTransactions} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 text-center text-muted-foreground animate-fade-in">
          <p>Built with ❤️ using React, TypeScript, and shadcn/ui</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
