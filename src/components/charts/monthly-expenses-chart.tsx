import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { getMonthlyExpenses, formatCurrency } from '@/lib/finance-utils';

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--primary))",
  },
} 

export function MonthlyExpensesChart() {
  const data = useMemo(() => {
    const monthlyData = getMonthlyExpenses(6);
    return monthlyData.map(item => ({
      ...item,
      monthName: new Date(item.month + '-01').toLocaleDateString('en-US', { 
        month: 'short' 
      }),
    }));
  }, []);

  const totalExpenses = data.reduce((sum, item) => sum + item.amount, 0);
  const averageExpenses = totalExpenses / data.length;

  return (
    <Card className="finance-card animate-fade-in">
      <CardHeader>
        <CardTitle className="gradient-text">Monthly Expenses</CardTitle>
        <CardDescription>
          Last 6 months spending overview • Average: {formatCurrency(averageExpenses)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="monthName" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent 
                    formatter={(value) => [formatCurrency(value as number), 'Amount']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                }
              />
              <Bar 
                dataKey="amount" 
                fill="var(--color-amount)"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}