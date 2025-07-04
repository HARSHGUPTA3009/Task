
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Transaction, Category } from '@/types/finance';
import { getIncomeCategories, getExpenseCategories, getCategoryInfo } from '@/lib/categories';
import { transactionStorage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const transactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  category: z.enum(['food', 'transport', 'shopping', 'bills', 'health', 'fees', 'entertainment', 'salary', 'freelance', 'investment', 'others']),
  date: z.date({ required_error: 'Date is required' }),
  type: z.enum(['income', 'expense']),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess?: (transaction: Transaction) => void;
  trigger?: React.ReactNode;
}

export function TransactionForm({ transaction, onSuccess, trigger }: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: transaction?.amount || 0,
      description: transaction?.description || '',
      category: transaction?.category || 'others',
      date: transaction ? new Date(transaction.date) : new Date(),
      type: transaction?.type || 'expense',
    },
  });

  const transactionType = form.watch('type');
  const availableCategories = transactionType === 'income' ? getIncomeCategories() : getExpenseCategories();

  const onSubmit = (data: TransactionFormData) => {
    try {
      let result: Transaction;
      
      if (transaction) {
        // Update existing transaction
        const updated = transactionStorage.update(transaction.id, {
          amount: data.amount,
          description: data.description,
          category: data.category,
          date: data.date.toISOString().split('T')[0],
          type: data.type,
        });
        
        if (!updated) {
          throw new Error('Failed to update transaction');
        }
        
        result = updated;
        toast({
          title: 'Success!',
          description: 'Transaction updated successfully.',
        });
      } else {
        // Create new transaction
        result = transactionStorage.add({
          amount: data.amount,
          description: data.description,
          category: data.category,
          date: data.date.toISOString().split('T')[0],
          type: data.type,
        });
        
        toast({
          title: 'Success!',
          description: `${data.type === 'income' ? 'Income' : 'Expense'} added successfully.`,
        });
      }

      setOpen(false);
      form.reset();
      onSuccess?.(result);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save transaction. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const defaultTrigger = (
    <Button className="animate-bounce-in">
      <Plus className="mr-2 h-4 w-4" />
      Add Transaction
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] finance-card">
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl">
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span>Expense</span>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 'income'}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? 'income' : 'expense');
                          // Reset category when switching type
                          form.setValue('category', 'others');
                        }}
                      />
                    </FormControl>
                    <div className="flex items-center gap-2">
                      <span>Income</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`What did you ${transactionType === 'income' ? 'earn from' : 'spend on'}?`}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCategories.map((category) => (
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
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
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
                {transaction ? 'Update' : 'Add'} {transactionType === 'income' ? 'Income' : 'Expense'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
