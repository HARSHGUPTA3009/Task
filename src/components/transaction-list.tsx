import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Download } from 'lucide-react';
import { Transaction, FilterPeriod } from '@/types/finance';
import { getCategoryInfo } from '@/lib/categories';
import { formatCurrency, formatDate, getDateRange, isDateInRange, exportToCSV, downloadCSV } from '@/lib/finance-utils';
import { transactionStorage } from '@/lib/storage';
import { TransactionForm } from './transaction-form';
import { useToast } from '@/hooks/use-toast';

interface TransactionListProps {
  transactions: Transaction[];
  onUpdate?: () => void;
}

export function TransactionList({ transactions, onUpdate }: TransactionListProps) {
  const [filter, setFilter] = useState<FilterPeriod>('all');
  const { toast } = useToast();

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    
    const range = getDateRange(filter);
    return transactions.filter(t => isDateInRange(t.date, range));
  }, [transactions, filter]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredTransactions]);

  const handleDelete = (transaction: Transaction) => {
    try {
      transactionStorage.delete(transaction.id);
      toast({
        title: 'Deleted!',
        description: 'Transaction deleted successfully.',
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete transaction.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    try {
      const csv = exportToCSV(sortedTransactions);
      const filename = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csv, filename);
      
      toast({
        title: 'Exported!',
        description: `${sortedTransactions.length} transactions exported to CSV.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export transactions.',
        variant: 'destructive',
      });
    }
  };

  const totalIncome = sortedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = sortedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpenses;

  return (
    <Card className="finance-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="gradient-text">
            Transactions ({sortedTransactions.length})
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={filter} onValueChange={(value: FilterPeriod) => setFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
              </SelectContent>
            </Select>
            
            {sortedTransactions.length > 0 && (
              <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
        
        {sortedTransactions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="text-green-600">
              Income: <span className="font-semibold">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="text-red-600">
              Expenses: <span className="font-semibold">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className={`font-semibold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Net: <span>{formatCurrency(netAmount)}</span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' 
                ? "Start by adding your first transaction!" 
                : "No transactions found for the selected period."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTransactions.map((transaction, index) => {
              const categoryInfo = getCategoryInfo(transaction.category);
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{categoryInfo.icon}</div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          className={`category-${transaction.category} text-xs`}
                        >
                          {categoryInfo.name}
                        </Badge>
                        <Badge 
                          variant={transaction.type === 'income' ? 'default' : 'secondary'}
                          className={`text-xs ${transaction.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                        >
                          {transaction.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    
                    <div className="flex gap-1">
                      <TransactionForm
                        transaction={transaction}
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
                            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this transaction? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(transaction)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
