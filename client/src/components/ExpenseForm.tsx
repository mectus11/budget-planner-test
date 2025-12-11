import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Plus, Trash2, Coins, Calendar as CalendarIcon, Save, Edit2, Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Expense, IncomeItem } from "@/types/budget";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { cn, formatAmount } from "@/lib/utils";

interface ExpenseFormProps {
  month: Date;
  setMonth: (date: Date) => void;
  baseSalary: number;
  setBaseSalary: (value: number) => void;
  extraIncome: IncomeItem[];
  setExtraIncome: (incomes: IncomeItem[]) => void;
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  onSave: () => void;
  onClear: () => void;
  t: any;
  currency: string;
}

export function ExpenseForm({
  month,
  setMonth,
  baseSalary,
  setBaseSalary,
  extraIncome,
  setExtraIncome,
  expenses,
  setExpenses,
  onSave,
  onClear,
  t,
  currency
}: ExpenseFormProps) {
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseColor, setNewExpenseColor] = useState<string>("#" + Math.floor(Math.random() * 16777215).toString(16));
  const [newExpenseDate, setNewExpenseDate] = useState<Date | undefined>(new Date());

  const [newIncomeName, setNewIncomeName] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");
  const [newIncomeColor, setNewIncomeColor] = useState<string>("#" + Math.floor(Math.random() * 16777215).toString(16));
  const [newIncomeDate, setNewIncomeDate] = useState<Date | undefined>(new Date());

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName || !newExpenseAmount) return;
    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (editingExpenseId) {
      setExpenses(expenses.map(ex =>
        ex.id === editingExpenseId
          ? { ...ex, name: newExpenseName, amount, color: newExpenseColor, date: newExpenseDate?.toISOString() }
          : ex
      ));
      setEditingExpenseId(null);
    } else {
      setExpenses([...expenses, {
        id: uuidv4(),
        name: newExpenseName,
        amount,
        color: newExpenseColor,
        date: newExpenseDate?.toISOString()
      }]);
    }

    setNewExpenseName("");
    setNewExpenseAmount("");
    setNewExpenseColor("#" + Math.floor(Math.random() * 16777215).toString(16));
    setNewExpenseDate(new Date());
  };

  const startEditExpense = (expense: Expense) => {
    setNewExpenseName(expense.name);
    setNewExpenseAmount(expense.amount.toString());
    setNewExpenseColor(expense.color || "#" + Math.floor(Math.random() * 16777215).toString(16));
    setNewExpenseDate(expense.date ? new Date(expense.date) : new Date());
    setEditingExpenseId(expense.id);
  };

  const cancelEditExpense = () => {
    setNewExpenseName("");
    setNewExpenseAmount("");
    setEditingExpenseId(null);
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncomeName || !newIncomeAmount) return;
    const amount = parseFloat(newIncomeAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (editingIncomeId) {
      setExtraIncome(extraIncome.map(inc =>
        inc.id === editingIncomeId
          ? { ...inc, name: newIncomeName, amount, color: newIncomeColor, date: newIncomeDate?.toISOString() }
          : inc
      ));
      setEditingIncomeId(null);
    } else {
      setExtraIncome([...extraIncome, {
        id: uuidv4(),
        name: newIncomeName,
        amount,
        color: newIncomeColor,
        date: newIncomeDate?.toISOString()
      }]);
    }

    setNewIncomeName("");
    setNewIncomeAmount("");
    setNewIncomeColor("#" + Math.floor(Math.random() * 16777215).toString(16));
    setNewIncomeDate(new Date());
  };

  const startEditIncome = (income: IncomeItem) => {
    setNewIncomeName(income.name);
    setNewIncomeAmount(income.amount.toString());
    setNewIncomeColor(income.color || "#" + Math.floor(Math.random() * 16777215).toString(16));
    setNewIncomeDate(income.date ? new Date(income.date) : new Date());
    setEditingIncomeId(income.id);
  };

  const cancelEditIncome = () => {
    setNewIncomeName("");
    setNewIncomeAmount("");
    setEditingIncomeId(null);
  };

  const removeExpense = (id: string) => setExpenses(expenses.filter((e) => e.id !== id));
  const removeIncome = (id: string) => setExtraIncome(extraIncome.filter((i) => i.id !== id));

  return (
    <div className="space-y-6">
      {/* Month Selection & Save */}
      <Card className="border-border/50 shadow-sm bg-muted/20">
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <Label>{t.budgetMonth}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !month && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {month ? format(month, "MMMM yyyy") : <span>{t.pickMonth}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 min-w-[450px]" align="start">
                <Calendar
                  mode="single"
                  selected={month}
                  onSelect={(date) => date && setMonth(date)}
                  initialFocus
                  defaultMonth={month}
                  style={{ '--cell-size': '4rem' } as React.CSSProperties}
                  modifiers={{
                    hasIncome: extraIncome
                      .filter(i => i.date)
                      .map(i => new Date(i.date!)),
                    hasExpense: expenses
                      .filter(e => e.date)
                      .map(e => new Date(e.date!)),
                  }}
                  components={{
                    DayButton: (props: any) => {
                      const dateStr = props.day.date.toDateString()

                      // Get colors for this specific date
                      const incomeColors = extraIncome
                        .filter(i => i.date && new Date(i.date).toDateString() === dateStr)
                        .map(i => i.color)
                        .filter(Boolean) as string[]

                      const expenseColors = expenses
                        .filter(e => e.date && new Date(e.date).toDateString() === dateStr)
                        .map(e => e.color)
                        .filter(Boolean) as string[]

                      return (
                        <CalendarDayButton
                          {...props}
                          modifiers={{
                            ...props.modifiers,
                            incomeColors,
                            expenseColors,
                          }}
                        />
                      )
                    },
                  } as any}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-2 w-full sm:w-auto mt-auto">
            <Button onClick={onClear} variant="outline" className="flex-1 sm:flex-none">
              <RotateCcw className="mr-2 h-4 w-4" /> {t.clear}
            </Button>
            <Button onClick={onSave} className="flex-1 sm:flex-none" variant="secondary">
              <Save className="mr-2 h-4 w-4" /> {t.saveBudget}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Income Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-display text-primary flex items-center gap-2">
            <Coins className="h-5 w-5" /> {t.income}
          </CardTitle>
          <CardDescription>{t.incomeDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="salary" className="text-muted-foreground font-medium">{t.baseSalary}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">{currency}</span>
              <Input
                id="salary"
                type="number"
                value={baseSalary || ""}
                onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
                placeholder="0.000"
                className="pl-12 text-lg font-medium"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-muted-foreground font-medium">{t.extraIncome}</Label>
            <form onSubmit={handleAddIncome} className="space-y-3 p-4 border border-border/50 rounded-lg bg-card/50">
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 flex flex-col gap-2 min-w-[200px]">
                  <Label className="text-xs text-muted-foreground">{editingIncomeId ? 'Edit Name' : 'Name'}</Label>
                  <Input
                    value={newIncomeName}
                    onChange={(e) => setNewIncomeName(e.target.value)}
                    placeholder={t.sourcePlaceholder}
                  />
                </div>
                <div className="w-32 flex flex-col gap-2">
                  <Label className="text-xs text-muted-foreground">{editingIncomeId ? 'Edit Amount' : 'Amount'}</Label>
                  <Input
                    type="number"
                    value={newIncomeAmount}
                    onChange={(e) => setNewIncomeAmount(e.target.value)}
                    placeholder={t.amountPlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[140px] justify-start text-left font-normal",
                          !newIncomeDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newIncomeDate ? format(newIncomeDate, "PP") : <span>Pick date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 min-w-[350px]">
                      <Calendar
                        mode="single"
                        selected={newIncomeDate}
                        onSelect={setNewIncomeDate}
                        initialFocus
                        style={{ '--cell-size': '3.5rem' } as React.CSSProperties}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-muted-foreground">Color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-5 w-5 rounded-full border-2 p-0.5 transition-all hover:scale-110"
                        style={{ borderColor: newIncomeColor }}
                      >
                        <div
                          className="w-full h-full rounded-full"
                          style={{ backgroundColor: newIncomeColor }}
                        />
                        <span className="sr-only">Select Color</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit p-4">
                      <div className="space-y-4">
                        <HexColorPicker color={newIncomeColor} onChange={setNewIncomeColor} />
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-muted-foreground">#</span>
                          <Input
                            value={newIncomeColor.replace("#", "")}
                            onChange={(e) => setNewIncomeColor(`#${e.target.value}`)}
                            className="h-8 font-mono uppercase"
                            maxLength={6}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {editingIncomeId && (
                  <Button type="button" variant="ghost" size="sm" onClick={cancelEditIncome}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                )}
                <Button type="submit" size="sm" variant={editingIncomeId ? "default" : "outline"} className="w-full sm:w-auto">
                  {editingIncomeId ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  {editingIncomeId ? 'Update Income' : 'Add Income'}
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              {extraIncome.map((income) => (
                <div key={income.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm group">
                  <div className="flex items-center gap-2">
                    {income.color && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: income.color }} />
                    )}
                    <span className="flex flex-col">
                      <span>{income.name}</span>
                      {income.date && <span className="text-[10px] text-muted-foreground">{format(new Date(income.date), "PPP")}</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-success">+{formatAmount(income.amount)} {currency}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => startEditIncome(income)}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeIncome(income.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-display text-primary">{t.expenses}</CardTitle>
            <CardDescription>{t.expensesDesc}</CardDescription>
          </div>
          <div className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            {expenses.length} {t.items}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAddExpense} className="space-y-3 p-4 border border-border/50 rounded-lg bg-card/50">
            <div className="flex gap-3 items-end flex-wrap">
              <div className="flex-1 flex flex-col gap-2 min-w-[200px]">
                <Label className="text-xs text-muted-foreground">{editingExpenseId ? 'Edit Name' : 'Name'}</Label>
                <Input
                  value={newExpenseName}
                  onChange={(e) => setNewExpenseName(e.target.value)}
                  placeholder={t.expenseNamePlaceholder}
                />
              </div>
              <div className="w-32 flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">{editingExpenseId ? 'Edit Amount' : 'Amount'}</Label>
                <Input
                  type="number"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  placeholder={t.amountPlaceholder}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !newExpenseDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newExpenseDate ? format(newExpenseDate, "PP") : <span>Pick date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 min-w-[350px]" align="end">
                    <Calendar
                      mode="single"
                      selected={newExpenseDate}
                      onSelect={setNewExpenseDate}
                      initialFocus
                      style={{ '--cell-size': '3.5rem' } as React.CSSProperties}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground">Color</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-5 w-5 rounded-full border-2 p-0.5 transition-all hover:scale-110"
                      style={{ borderColor: newExpenseColor }}
                    >
                      <div
                        className="w-full h-full rounded-full"
                        style={{ backgroundColor: newExpenseColor }}
                      />
                      <span className="sr-only">Select Color</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-fit p-4">
                    <div className="space-y-4">
                      <HexColorPicker color={newExpenseColor} onChange={setNewExpenseColor} />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-muted-foreground">#</span>
                        <Input
                          value={newExpenseColor.replace("#", "")}
                          onChange={(e) => setNewExpenseColor(`#${e.target.value}`)}
                          className="h-8 font-mono uppercase"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {editingExpenseId && (
                <Button type="button" variant="ghost" size="sm" onClick={cancelEditExpense}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              )}
              <Button type="submit" size="sm" variant={editingExpenseId ? "default" : "secondary"} className="w-full sm:w-auto">
                {editingExpenseId ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                {editingExpenseId ? 'Update Expense' : 'Add Expense'}
              </Button>
            </div>
          </form>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {expenses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground italic border-2 border-dashed rounded-lg">
                {t.noExpenses}
              </div>
            )}
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {expense.color && (
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: expense.color }} />
                  )}
                  <span className="flex flex-col">
                    <span className="font-medium text-foreground">{expense.name}</span>
                    {expense.date && <span className="text-[10px] text-muted-foreground">{format(new Date(expense.date), "PPP")}</span>}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-medium">{formatAmount(expense.amount)} {currency}</span>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => startEditExpense(expense)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div >
  );
}
