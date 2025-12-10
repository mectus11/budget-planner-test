import React, { useState } from "react";
import { Plus, Trash2, Coins, Calendar as CalendarIcon, Save, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Expense, IncomeItem } from "@/types/budget";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  t: any;
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
  t
}: ExpenseFormProps) {
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseHue, setNewExpenseHue] = useState<number>(Math.floor(Math.random() * 360));
  
  const [newIncomeName, setNewIncomeName] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");
  const [newIncomeHue, setNewIncomeHue] = useState<number>(Math.floor(Math.random() * 360));

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName || !newExpenseAmount) return;
    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) return;

    const color = `hsl(${newExpenseHue}, 70%, 50%)`;

    if (editingExpenseId) {
      setExpenses(expenses.map(ex => 
        ex.id === editingExpenseId 
          ? { ...ex, name: newExpenseName, amount, color } 
          : ex
      ));
      setEditingExpenseId(null);
    } else {
      setExpenses([...expenses, { id: uuidv4(), name: newExpenseName, amount, color }]);
    }
    
    setNewExpenseName("");
    setNewExpenseAmount("");
    setNewExpenseHue(Math.floor(Math.random() * 360));
  };

  const startEditExpense = (expense: Expense) => {
    setNewExpenseName(expense.name);
    setNewExpenseAmount(expense.amount.toString());
    
    // Extract hue from hsl string if possible, else random
    const hueMatch = expense.color?.match(/hsl\((\d+)/);
    setNewExpenseHue(hueMatch ? parseInt(hueMatch[1]) : Math.floor(Math.random() * 360));
    
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

    const color = `hsl(${newIncomeHue}, 70%, 50%)`;

    if (editingIncomeId) {
      setExtraIncome(extraIncome.map(inc => 
        inc.id === editingIncomeId 
          ? { ...inc, name: newIncomeName, amount, color } 
          : inc
      ));
      setEditingIncomeId(null);
    } else {
      setExtraIncome([...extraIncome, { id: uuidv4(), name: newIncomeName, amount, color }]);
    }

    setNewIncomeName("");
    setNewIncomeAmount("");
    setNewIncomeHue(Math.floor(Math.random() * 360));
  };

  const startEditIncome = (income: IncomeItem) => {
    setNewIncomeName(income.name);
    setNewIncomeAmount(income.amount.toString());
    
    const hueMatch = income.color?.match(/hsl\((\d+)/);
    setNewIncomeHue(hueMatch ? parseInt(hueMatch[1]) : Math.floor(Math.random() * 360));
    
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={month}
                      onSelect={(date) => date && setMonth(date)}
                      initialFocus
                      defaultMonth={month}
                    />
                  </PopoverContent>
                </Popover>
            </div>
            <Button onClick={onSave} className="w-full sm:w-auto mt-auto" variant="secondary">
                <Save className="mr-2 h-4 w-4" /> {t.saveBudget}
            </Button>
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">TND</span>
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
                <div className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs text-muted-foreground">{editingIncomeId ? 'Edit Name' : 'Name'}</Label>
                    <Input
                      value={newIncomeName}
                      onChange={(e) => setNewIncomeName(e.target.value)}
                      placeholder={t.sourcePlaceholder}
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label className="text-xs text-muted-foreground">{editingIncomeId ? 'Edit Amount' : 'Amount'}</Label>
                    <Input
                      type="number"
                      value={newIncomeAmount}
                      onChange={(e) => setNewIncomeAmount(e.target.value)}
                      placeholder={t.amountPlaceholder}
                    />
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
                                    style={{ borderColor: `hsl(${newIncomeHue}, 70%, 50%)` }}
                                >
                                    <div 
                                        className="w-full h-full rounded-full" 
                                        style={{ backgroundColor: `hsl(${newIncomeHue}, 70%, 50%)` }} 
                                    />
                                    <span className="sr-only">Select Color</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium leading-none">Pick a color</h4>
                                        <div 
                                            className="w-4 h-4 rounded-full border border-border" 
                                            style={{ backgroundColor: `hsl(${newIncomeHue}, 70%, 50%)` }} 
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <label className="text-xs text-muted-foreground mb-1 block">Hue</label>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="360" 
                                            value={newIncomeHue} 
                                            onChange={(e) => setNewIncomeHue(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-lg appearance-none cursor-pointer"
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
                        <span>{income.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-success">+{income.amount.toFixed(3)} TND</span>
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
            <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs text-muted-foreground">{editingExpenseId ? 'Edit Name' : 'Name'}</Label>
                  <Input
                    value={newExpenseName}
                    onChange={(e) => setNewExpenseName(e.target.value)}
                    placeholder={t.expenseNamePlaceholder}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label className="text-xs text-muted-foreground">{editingExpenseId ? 'Edit Amount' : 'Amount'}</Label>
                  <Input
                    type="number"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    placeholder={t.amountPlaceholder}
                  />
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
                                style={{ borderColor: `hsl(${newExpenseHue}, 70%, 50%)` }}
                            >
                                <div 
                                    className="w-full h-full rounded-full" 
                                    style={{ backgroundColor: `hsl(${newExpenseHue}, 70%, 50%)` }} 
                                />
                                <span className="sr-only">Select Color</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium leading-none">Pick a color</h4>
                                    <div 
                                        className="w-4 h-4 rounded-full border border-border" 
                                        style={{ backgroundColor: `hsl(${newExpenseHue}, 70%, 50%)` }} 
                                    />
                                </div>
                                <div className="pt-2">
                                    <label className="text-xs text-muted-foreground mb-1 block">Hue</label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="360" 
                                        value={newExpenseHue} 
                                        onChange={(e) => setNewExpenseHue(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-lg appearance-none cursor-pointer"
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
                    <span className="font-medium text-foreground">{expense.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-medium">{expense.amount.toFixed(3)} TND</span>
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
    </div>
  );
}
