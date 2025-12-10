export interface IncomeItem {
  id: string;
  name: string;
  amount: number;
  color?: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  color?: string;
}

export interface BudgetData {
  month: string; // Format: "YYYY-MM"
  baseSalary: number;
  extraIncome: IncomeItem[];
  totalIncome: number;
  expenses: Expense[];
  totalExpenses: number;
  remainingBudget: number;
  percentageSpent: number;
}
