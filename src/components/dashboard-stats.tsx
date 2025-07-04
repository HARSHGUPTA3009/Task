import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Clock } from 'lucide-react';
import { getDashboardStats, formatCurrency, formatDate, getCurrentMonth, formatMonthYear } from '@/lib/finance-utils';
import { getCategoryInfo } from '@/lib/categories';

interface DashboardStatsProps {
  onRefresh?: () => void;
}

export function DashboardStats({ onRefresh }: DashboardStatsProps) {
  const stats = useMemo(() => getDashboardStats(), [onRefresh]);

  const {
    totalExpensesThisMonth,
    totalIncomeThisMonth,
    netTransactionThisMonth,
    categoriesBreakdown,
    recentTransactions,
    budgetStatuses
  } = stats;

  const overBudgetCount = budgetStatuses.filter(b => b.isOverBudget).length;
  const totalBudgeted = budgetStatuses.reduce((sum, b) => sum + b.budgeted, 0);

  return (
    <div className="grid gap-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="finance-card animate-bounce-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">
              {formatCurrency(totalExpensesThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatMonthYear(getCurrentMonth())} expenses
            </p>
          </CardContent>
        </Card>

        <Card className="finance-card animate-bounce-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncomeThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total income this month
            </p>
          </CardContent>
        </Card>

        <Card className="finance-card animate-bounce-in" style={{ animationDelay: '0.15s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            {netTransactionThisMonth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netTransactionThisMonth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netTransactionThisMonth >= 0 ? '+' : ''}{formatCurrency(netTransactionThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">
              {netTransactionThisMonth >= 0 ? 'Surplus' : 'Deficit'} this month
            </p>
          </CardContent>
        </Card>

        <Card className="finance-card animate-bounce-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoriesBreakdown.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active spending categories
            </p>
          </CardContent>
        </Card>

        <Card className="finance-card animate-bounce-in" style={{ animationDelay: '0.25s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            {overBudgetCount > 0 ? (
              <TrendingUp className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgetStatuses.length > 0 ? (
                <span className={overBudgetCount > 0 ? 'text-destructive' : 'text-green-500'}>
                  {overBudgetCount > 0 ? `${overBudgetCount} Over` : 'On Track'}
                </span>
              ) : (
                <span className="text-muted-foreground">No Budget</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {budgetStatuses.length} budget(s) set
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="finance-card animate-fade-in">
          <CardHeader>
            <CardTitle className="gradient-text">Top Categories</CardTitle>
            <CardDescription>Spending breakdown for this month</CardDescription>
          </CardHeader>
          <CardContent>
            {categoriesBreakdown.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-muted-foreground">No expenses yet this month</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoriesBreakdown.slice(0, 5).map((category, index) => {
                  const categoryInfo = getCategoryInfo(category.category);
                  return (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{categoryInfo.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{categoryInfo.name}</p>
                          <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(category.amount)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="finance-card animate-fade-in">
          <CardHeader>
            <CardTitle className="gradient-text">Recent Transactions</CardTitle>
            <CardDescription>Your latest spending activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💳</div>
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => {
                  const categoryInfo = getCategoryInfo(transaction.category);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{categoryInfo.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={`category-${transaction.category} text-xs`}>
                              {categoryInfo.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(transaction.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="font-semibold text-sm">{formatCurrency(transaction.amount)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      {budgetStatuses.length > 0 && (
        <Card className="finance-card animate-fade-in">
          <CardHeader>
            <CardTitle className="gradient-text">Budget Progress</CardTitle>
            <CardDescription>
              Track your spending against monthly budgets
              {overBudgetCount > 0 && (
                <span className="text-destructive ml-2">
                  • {overBudgetCount} category{overBudgetCount > 1 ? 's' : ''} over budget
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {budgetStatuses.map((budget, index) => {
                const categoryInfo = getCategoryInfo(budget.category);
                const progressValue = Math.min(budget.percentage, 100);
                
                return (
                  <div key={budget.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryInfo.icon}</span>
                        <span className="font-medium">{categoryInfo.name}</span>
                        {budget.isOverBudget && (
                          <Badge variant="destructive" className="text-xs">
                            Over Budget
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.budgeted)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {budget.percentage}% used
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={progressValue}
                      className={`h-2 ${budget.isOverBudget ? '[&>div]:bg-destructive' : ''}`}
                    />
                    {budget.remaining > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(budget.remaining)} remaining
                      </p>
                    ) : (
                      <p className="text-sm text-destructive">
                        {formatCurrency(Math.abs(budget.remaining))} over budget
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
