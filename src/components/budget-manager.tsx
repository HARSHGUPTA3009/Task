import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, Trash2, Target } from 'lucide-react';
import { Budget, Category } from '@/types/finance';
import { CATEGORY_LIST, getCategoryInfo } from '@/lib/categories';
import { budgetStorage } from '@/lib/storage';
import { formatCurrency, getCurrentMonth, formatMonthYear, getBudgetStatuses } from '@/lib/finance-utils';
import { useToast } from '@/hooks/use-toast';

const budgetSchema = z.object({
  category: z.enum(['food', 'transport', 'shopping', 'bills', 'health', 'fees', 'entertainment', 'salary', 'freelance', 'investment', 'others']),
  amount: z.number().min(1, 'Budget must be at least $1'),
  month: z.string().min(1, 'Month is required'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  budget?: Budget;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

function BudgetForm({ budget, onSuccess, trigger }: BudgetFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: budget?.category || 'others',
      amount: budget?.amount || 0,
      month: budget?.month || getCurrentMonth(),
    },
  });

  const onSubmit = (data: BudgetFormData) => {
    try {
      if (budget) {
        budgetStorage.update(budget.id, {
          category: data.category,
          amount: data.amount,
          month: data.month,
        });
        toast({
          title: 'Updated!',
          description: 'Budget updated successfully.',
        });
      } else {
        budgetStorage.add({
          category: data.category,
          amount: data.amount,
          month: data.month,
        });
        toast({
          title: 'Created!',
          description: 'Budget created successfully.',
        });
      }

      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save budget. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const defaultTrigger = (
    <Button className="animate-bounce-in">
      <Plus className="mr-2 h-4 w-4" />
      Set Budget
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] finance-card">
        <DialogHeader>
          <DialogTitle className="gradient-text">
            {budget ? 'Edit Budget' : 'Set New Budget'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORY_LIST.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Budget</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="text-lg font-semibold"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <FormControl>
                    <Input
                      type="month"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-primary">
                {budget ? 'Update' : 'Set'} Budget
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface BudgetManagerProps {
  onUpdate?: () => void;
}

export function BudgetManager({ onUpdate }: BudgetManagerProps) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const { toast } = useToast();

  const budgets = useMemo(() => {
    return budgetStorage.getByMonth(selectedMonth);
  }, [selectedMonth, onUpdate]);

  const budgetStatuses = useMemo(() => {
    return getBudgetStatuses(selectedMonth);
  }, [selectedMonth, onUpdate]);

  const handleDelete = (budget: Budget) => {
    try {
      budgetStorage.delete(budget.id);
      toast({
        title: 'Deleted!',
        description: 'Budget deleted successfully.',
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete budget.',
        variant: 'destructive',
      });
    }
  };

  const overBudgetCount = budgetStatuses.filter(b => b.isOverBudget).length;
  const totalBudgeted = budgetStatuses.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = budgetStatuses.reduce((sum, b) => sum + b.spent, 0);

  return (
    <div className="space-y-6">
      <Card className="finance-card animate-fade-in">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="gradient-text">Budget Manager</CardTitle>
              <CardDescription>
                Set and track monthly spending limits by category
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40"
              />
              <BudgetForm onSuccess={onUpdate} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Budget Overview */}
      {budgetStatuses.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="finance-card animate-bounce-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">
                {formatCurrency(totalBudgeted)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatMonthYear(selectedMonth)}
              </p>
            </CardContent>
          </Card>

          <Card className="finance-card animate-bounce-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalBudgeted > 0 ? `${Math.round((totalSpent / totalBudgeted) * 100)}% of budget` : 'No budget set'}
              </p>
            </CardContent>
          </Card>

          <Card className="finance-card animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overBudgetCount === 0 ? (
                  <span className="text-green-500">✅ On Track</span>
                ) : (
                  <span className="text-destructive">{overBudgetCount} Over</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {budgetStatuses.length} budget{budgetStatuses.length !== 1 ? 's' : ''} set
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget List */}
      <Card className="finance-card animate-fade-in">
        <CardHeader>
          <CardTitle>
            Budgets for {formatMonthYear(selectedMonth)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budgetStatuses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">No budgets set</h3>
              <p className="text-muted-foreground mb-4">
                Set your first budget to start tracking your spending goals!
              </p>
              <BudgetForm onSuccess={onUpdate} />
            </div>
          ) : (
            <div className="space-y-6">
              {budgetStatuses.map((budgetStatus, index) => {
                const categoryInfo = getCategoryInfo(budgetStatus.category);
                const budget = budgets.find(b => b.category === budgetStatus.category);
                const progressValue = Math.min(budgetStatus.percentage, 100);
                
                return (
                  <div
                    key={budgetStatus.category}
                    className="space-y-3 p-4 rounded-lg border bg-card/50 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{categoryInfo.icon}</span>
                        <div>
                          <h4 className="font-semibold">{categoryInfo.name}</h4>
                          <div className="flex items-center gap-2">
                            {budgetStatus.isOverBudget && (
                              <Badge variant="destructive" className="text-xs">
                                Over Budget
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {budgetStatus.percentage}% used
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(budgetStatus.spent)} / {formatCurrency(budgetStatus.budgeted)}
                          </p>
                          {budgetStatus.remaining > 0 ? (
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(budgetStatus.remaining)} remaining
                            </p>
                          ) : (
                            <p className="text-sm text-destructive">
                              {formatCurrency(Math.abs(budgetStatus.remaining))} over
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          {budget && (
                            <>
                              <BudgetForm
                                budget={budget}
                                onSuccess={onUpdate}
                                trigger={
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                }
                              />
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the budget for {categoryInfo.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(budget)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Progress
                      value={progressValue}
                      className={`h-3 ${budgetStatus.isOverBudget ? '[&>div]:bg-destructive' : ''}`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
