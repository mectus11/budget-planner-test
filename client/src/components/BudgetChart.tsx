import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Label } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BudgetData } from "@/types/budget";
import { cn, formatAmount } from "@/lib/utils";

interface BudgetChartProps {
  data: BudgetData;
  t: any;
  currency: string;
}

export function BudgetChart({ data, t, currency }: BudgetChartProps) {
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const [remainingHue, setRemainingHue] = useState<number>(215); // Default dark gray/blue hue

  const chartData = viewMode === 'summary'
    ? [
      { name: t.expenses, value: data.totalExpenses },
      { name: t.remaining, value: Math.max(0, data.remainingBudget) },
    ]
    : [
      ...data.expenses.map(e => ({ name: e.name, value: e.amount })),
      { name: t.remaining, value: Math.max(0, data.remainingBudget) }
    ].filter(item => item.value > 0);

  // Base palette for detailed view
  const DETAILED_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--primary))",
    "hsl(var(--destructive))",
    "hsl(var(--warning))",
  ];

  const getColors = () => {
    if (viewMode === 'summary') {
      const colors = ["hsl(var(--chart-1))", `hsl(${remainingHue}, 15%, 25%)`];
      // In light mode we might want lighter, but user wants to control hue.
      // Let's use CSS variable for lightness to adapt to theme, but control hue.
      // Or just let user control hue and keep lightness fixed for now or use a smart HSL.
      // The previous implementation used CSS var. 
      // Let's construct the color dynamically based on hue.
      colors[1] = `hsl(${remainingHue}, 15%, 50%)`; // Neutral lightness

      if (data.remainingBudget < 0) {
        colors[0] = "hsl(var(--destructive))";
      }
      return colors;
    }

    // For detailed view
    return chartData.map((entry, index) => {
      if (entry.name === t.remaining) return `hsl(${remainingHue}, 15%, 50%)`;

      // Find if this entry corresponds to an expense with a custom color
      const expense = data.expenses.find(e => e.name === entry.name);
      if (expense?.color) {
        return expense.color;
      }

      return DETAILED_COLORS[index % DETAILED_COLORS.length];
    });
  };

  const currentColors = getColors();

  const renderLegend = (props: any) => {
    const { payload } = props;

    return (
      <div className="flex flex-wrap justify-center gap-4 text-sm mt-4">
        {payload.map((entry: any, index: number) => {
          const isRemaining = entry.value === t.remaining;

          if (isRemaining) {
            return (
              <Popover key={`item-${index}`}>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-muted-foreground font-medium">{entry.value}</span>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium leading-none">Remaining Color</h4>
                      <div
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: `hsl(${remainingHue}, 15%, 50%)` }}
                      />
                    </div>
                    <div className="pt-2">
                      <label className="text-xs text-muted-foreground mb-1 block">Hue</label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={remainingHue}
                        onChange={(e) => setRemainingHue(parseInt(e.target.value))}
                        className="w-full h-2 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            );
          }

          return (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground font-medium">{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="h-full border-border/50 shadow-sm flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-display text-primary">{t.expenseBreakdown}</CardTitle>
        <div className="flex bg-muted/50 rounded-lg p-1">
          <Button
            variant={viewMode === 'summary' ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setViewMode('summary')}
          >
            {t.summary}
          </Button>
          <Button
            variant={viewMode === 'detailed' ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setViewMode('detailed')}
          >
            {t.detailed}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] flex flex-col items-center justify-center relative">
        {data.totalIncome > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={currentColors[index % currentColors.length]} />
                ))}
                {viewMode === 'summary' && (
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        const { cx, cy } = viewBox;
                        return (
                          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan
                              x={cx}
                              y={cy}
                              dy="-10"
                              fontSize="24"
                              fontWeight="bold"
                              fill="hsl(var(--foreground))"
                              style={{ fontFamily: 'var(--font-display)' }}
                            >
                              {data.percentageSpent.toFixed(1)}%
                            </tspan>
                            <tspan
                              x={cx}
                              y={cy}
                              dy="15"
                              fontSize="10"
                              fontWeight="500"
                              fill="hsl(var(--muted-foreground))"
                              style={{ fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                            >
                              {t.ofIncomeSpent}
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                    position="center"
                  />
                )}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${formatAmount(value)} ${currency}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend
                content={renderLegend}
                verticalAlign="bottom"
                height={80}
                wrapperStyle={{ overflowY: 'auto', bottom: 0, left: 0, right: 0, paddingBottom: 10 }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-muted-foreground text-center">
            {t.addIncomeToSee}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
