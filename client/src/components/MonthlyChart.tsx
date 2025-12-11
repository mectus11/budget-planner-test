import { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetData } from "@/types/budget";
import { getDaysInMonth, getDate, parseISO, startOfMonth, endOfMonth, format } from "date-fns";

interface MonthlyChartProps {
    data: BudgetData;
    currency: string;
    t: any;
}

export function MonthlyChart({ data, currency, t }: MonthlyChartProps) {
    const chartData = useMemo(() => {
        if (!data.month) return [];

        const today = new Date();
        const [year, month] = data.month.split("-").map(Number);
        const dateObj = new Date(year, month - 1);
        const daysInMonth = getDaysInMonth(dateObj);

        // Create array of days 1..daysInMonth
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        let cumulativeExpense = 0;
        let cumulativeIncome = data.baseSalary; // Assuming base salary is available from day 1

        return days.map(day => {
            // Find items for this day
            // Note: We need to handle date string comparison carefully
            const currentDayExpenses = data.expenses.filter(e => {
                if (!e.date) return false;
                const d = new Date(e.date);
                return getDate(d) === day && d.getMonth() === month - 1 && d.getFullYear() === year;
            });

            const currentDayIncome = data.extraIncome.filter(i => {
                if (!i.date) return false;
                const d = new Date(i.date);
                return getDate(d) === day && d.getMonth() === month - 1 && d.getFullYear() === year;
            });

            // Update cumulatives
            const dayExpenseInfo = currentDayExpenses.reduce((sum, e) => sum + e.amount, 0);
            const dayIncomeInfo = currentDayIncome.reduce((sum, i) => sum + i.amount, 0);

            cumulativeExpense += dayExpenseInfo;
            cumulativeIncome += dayIncomeInfo;

            return {
                day,
                income: cumulativeIncome,
                expenses: cumulativeExpense,
                // Add detail for tooltip if needed
                dayExpense: dayExpenseInfo,
                dayIncome: dayIncomeInfo
            };
        });
    }, [data]);

    return (
        <Card className="border-border/50 shadow-sm col-span-1 md:col-span-3">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t.spendingHabits}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                            <XAxis
                                dataKey="day"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${t.day} ${value}`}
                                interval="preserveStartEnd"
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                formatter={(value: number) => [`${value.toFixed(2)} ${currency}`, ""]}
                                labelFormatter={(label) => `${t.day} ${label}`}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="income"
                                name={t.totalIncomeChart}
                                stroke="#22c55e" // success color
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                name={t.totalSpentChart}
                                stroke="#ef4444" // destructive color
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
