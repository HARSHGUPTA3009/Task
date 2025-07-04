import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { getCategoryExpenses, formatCurrency } from '@/lib/finance-utils';
import { getCategoryInfo } from '@/lib/categories';

export function CategoryPieChart() {
  const data = useMemo(() => {
    const categoryData = getCategoryExpenses('this-month');
    return categoryData.map(item => {
      const categoryInfo = getCategoryInfo(item.category);
      return {
        ...item,
        name: categoryInfo.name,
        color: categoryInfo.color,
        icon: categoryInfo.icon,
      };
    });
  }, []);

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  const chartConfig = data.reduce((config, item) => {
    config[item.category] = {
      label: item.name,
      color: item.color,
    };
    return config;
  }, {} as Record<string, { label: string; color: string }>);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{data.icon}</span>
            <span className="font-medium">{data.name}</span>
          </div>
          <div className="text-sm">
            <div>Amount: {formatCurrency(data.amount)}</div>
            <div>Percentage: {data.percentage}%</div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.payload?.icon} {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="finance-card animate-fade-in">
      <CardHeader>
        <CardTitle className="gradient-text">Category Breakdown</CardTitle>
        <CardDescription>
          This month's spending by category • Total: {formatCurrency(totalAmount)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
            <p className="text-muted-foreground">
              Add some transactions to see your spending breakdown
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}