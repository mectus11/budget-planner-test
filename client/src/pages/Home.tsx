import { useState, useMemo, useRef, useEffect } from "react";
import { History, ChevronRight, Languages, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ResultsSummary } from "@/components/ResultsSummary";
import { BudgetChart } from "@/components/BudgetChart";
import { Expense, BudgetData, IncomeItem } from "@/types/budget";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { ModeToggle } from "@/components/mode-toggle";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { useLanguage } from "@/hooks/use-language";
import { CurrencySwitcher, Currency, getCurrencySymbol } from "@/components/CurrencySwitcher";
import { useTheme } from "@/components/theme-provider";

// Persistent storage keys
const PROFILES_KEY = "budget_planner_profiles";
const ACTIVE_PROFILE_KEY = "budget_planner_active_profile";
const CURRENCY_KEY = "budget_planner_currency";

// Helpers to get storage keys for a profile
const getStorageKey = (profile: string) => `budget_planner_data_${profile}`;
const getInputsKey = (profile: string) => `budget_planner_inputs_${profile}`;

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Profile State
  const [profiles, setProfiles] = useState<string[]>(() => {
    const saved = localStorage.getItem(PROFILES_KEY);
    return saved ? JSON.parse(saved) : ["Default"];
  });

  const [activeProfile, setActiveProfile] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_PROFILE_KEY) || "Default";
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem(CURRENCY_KEY);
    return (saved as Currency) || "TND";
  });

  // App State
  const [month, setMonth] = useState<Date>(new Date());
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [extraIncome, setExtraIncome] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savedBudgets, setSavedBudgets] = useState<Record<string, BudgetData>>({});

  const chartRef = useRef<HTMLDivElement>(null);

  // Persist Profile List
  useEffect(() => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }, [profiles]);

  // Persist Active Profile
  useEffect(() => {
    localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfile);
  }, [activeProfile]);

  // Persist Currency
  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency);
  }, [currency]);

  // Load Data for Active Profile
  useEffect(() => {
    // 1. Load History (Saved Budgets)
    const savedKey = getStorageKey(activeProfile);
    const saved = localStorage.getItem(savedKey);
    if (saved) {
      try {
        setSavedBudgets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved budgets", e);
        setSavedBudgets({});
      }
    } else {
      setSavedBudgets({});
    }

    // 2. Load Current Inputs (Draft)
    const inputsKey = getInputsKey(activeProfile);
    const inputsSaved = localStorage.getItem(inputsKey);
    if (inputsSaved) {
      try {
        const data = JSON.parse(inputsSaved);
        setMonth(new Date(data.month));
        setBaseSalary(data.baseSalary);
        setExtraIncome(data.extraIncome);
        setExpenses(data.expenses);

        toast({
          title: `${t.switchedTo} ${activeProfile}`,
          description: t.budgetLoaded,
        });
      } catch (e) {
        console.error("Failed to parse draft inputs", e);
        resetInputs();
      }
    } else {
      // If no draft exists for this profile, reset inputs
      resetInputs();
      if (activeProfile !== "Default") {
        toast({
          title: `${t.switchedTo} ${activeProfile}`,
          description: t.createProfileDesc,
        });
      }
    }
  }, [activeProfile, t]); // Added t dependency

  const resetInputs = () => {
    setMonth(new Date());
    setBaseSalary(0);
    setExtraIncome([]);
    setExpenses([]);
  };

  // Auto-save Inputs (Draft)
  useEffect(() => {
    const inputsKey = getInputsKey(activeProfile);
    const data = {
      month: month,
      baseSalary,
      extraIncome,
      expenses
    };
    localStorage.setItem(inputsKey, JSON.stringify(data));
  }, [month, baseSalary, extraIncome, expenses, activeProfile]);


  const handleCreateProfile = (name: string) => {
    if (profiles.includes(name)) {
      toast({
        title: "Error",
        description: t.profileExists,
        variant: "destructive"
      });
      return;
    }
    setProfiles([...profiles, name]);
    setActiveProfile(name);
  };

  const handleRenameProfile = (oldName: string, newName: string) => {
    if (profiles.includes(newName)) {
      toast({
        title: "Error",
        description: t.profileExists,
        variant: "destructive"
      });
      return;
    }

    // 1. Update Profiles List
    const newProfiles = profiles.map(p => p === oldName ? newName : p);
    setProfiles(newProfiles);

    // 2. Migrate Data
    const oldStorageKey = getStorageKey(oldName);
    const newStorageKey = getStorageKey(newName);
    const oldInputsKey = getInputsKey(oldName);
    const newInputsKey = getInputsKey(newName);

    const savedData = localStorage.getItem(oldStorageKey);
    if (savedData) {
      localStorage.setItem(newStorageKey, savedData);
      localStorage.removeItem(oldStorageKey);
    }

    const savedInputs = localStorage.getItem(oldInputsKey);
    if (savedInputs) {
      localStorage.setItem(newInputsKey, savedInputs);
      localStorage.removeItem(oldInputsKey);
    }

    // 3. Update Active Profile if needed
    if (activeProfile === oldName) {
      setActiveProfile(newName);
    }

    toast({
      title: t.profileRenamed,
      description: `Renamed ${oldName} to ${newName}.`,
    });
  };

  const handleDeleteProfile = (profileName: string) => {
    // Prevent deleting the active profile
    if (profileName === activeProfile) {
      return;
    }

    // 1. Remove from profiles list
    const newProfiles = profiles.filter(p => p !== profileName);
    setProfiles(newProfiles);

    // 2. Delete profile data from localStorage
    const storageKey = getStorageKey(profileName);
    const inputsKey = getInputsKey(profileName);
    localStorage.removeItem(storageKey);
    localStorage.removeItem(inputsKey);

    toast({
      title: "Profile Deleted",
      description: `${profileName} has been deleted.`,
    });
  };


  const budgetData: BudgetData = useMemo(() => {
    const totalExtra = extraIncome.reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = baseSalary + totalExtra;
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const remainingBudget = totalIncome - totalExpenses;
    const percentageSpent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    return {
      month: format(month, "yyyy-MM"),
      baseSalary,
      extraIncome,
      totalIncome,
      expenses,
      totalExpenses,
      remainingBudget,
      percentageSpent,
    };
  }, [month, baseSalary, extraIncome, expenses]);

  const saveBudget = () => {
    const key = format(month, "yyyy-MM");
    const newSaved = { ...savedBudgets, [key]: budgetData };
    setSavedBudgets(newSaved);
    localStorage.setItem(getStorageKey(activeProfile), JSON.stringify(newSaved));

    toast({
      title: t.budgetSaved,
      description: `Budget for ${format(month, "MMMM yyyy")} has been saved to ${activeProfile} profile.`,
    });
  };

  const loadBudget = (key: string) => {
    const data = savedBudgets[key];
    if (data) {
      const [y, m] = data.month.split('-');
      setMonth(new Date(parseInt(y), parseInt(m) - 1, 1));
      setBaseSalary(data.baseSalary);
      setExtraIncome(data.extraIncome);
      setExpenses(data.expenses);

      toast({
        title: t.budgetLoaded,
        description: `Loaded budget for ${data.month}`,
      });
    }
  };

  const deleteBudget = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSaved = { ...savedBudgets };
    delete newSaved[key];
    setSavedBudgets(newSaved);
    localStorage.setItem(getStorageKey(activeProfile), JSON.stringify(newSaved));

    toast({
      title: t.budgetDeleted,
      description: `${key} has been removed.`,
    });
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fr" : "en");
  };

  const clearBudget = () => {
    setBaseSalary(0);
    setExtraIncome([]);
    setExpenses([]);
    toast({
      title: t.clear,
      description: "Budget inputs have been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="bg-background border-b border-border/50 sticky top-0 z-10 backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-transparent rounded flex items-center justify-center">
              <Wallet className="w-full h-full text-primary" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-2">
              <span className="font-display font-bold text-xl tracking-tight">
                <span className="text-primary">{t.appTitle.charAt(0)}</span>
                {t.appTitle.slice(1)}
              </span>
              <span className="text-xs text-muted-foreground font-medium">{t.headerCredit}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CurrencySwitcher currency={currency} onCurrencyChange={setCurrency} />
            <ModeToggle />

            <ProfileSwitcher
              profiles={profiles}
              activeProfile={activeProfile}
              onSwitchProfile={setActiveProfile}
              onCreateProfile={handleCreateProfile}
              onRenameProfile={handleRenameProfile}
              onDeleteProfile={handleDeleteProfile}
              t={t}
            />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <History className="mr-2 h-4 w-4" /> {t.history}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{t.savedBudgets} ({activeProfile})</SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-2">
                  {Object.keys(savedBudgets).length === 0 && (
                    <p className="text-muted-foreground text-sm">{t.noSavedBudgets}</p>
                  )}
                  {Object.keys(savedBudgets).sort().reverse().map((key) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer transition-colors group" onClick={() => loadBudget(key)}>
                      <span className="font-medium">{key}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => deleteBudget(key, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" onClick={toggleLanguage} className="w-10 px-0">
              {language === "en" ? "FR" : "EN"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 space-y-8">
            <section>
              <h2 className="text-2xl font-display font-bold mb-4 text-foreground">{t.budgetInputs}</h2>
              <ExpenseForm
                month={month}
                setMonth={setMonth}
                baseSalary={baseSalary}
                setBaseSalary={setBaseSalary}
                extraIncome={extraIncome}
                setExtraIncome={setExtraIncome}
                expenses={expenses}
                setExpenses={setExpenses}
                onSave={saveBudget}
                onClear={clearBudget}
                t={t}
                currency={getCurrencySymbol(currency)}
              />
            </section>
          </div>

          {/* Right Column: Results & Viz */}
          <div className="lg:col-span-5 space-y-8">
            <section>
              <h2 className="text-2xl font-display font-bold mb-4 text-foreground">{t.monthlyAnalysis}</h2>
              <div className="space-y-6">
                <div className="h-[400px]" ref={chartRef}>
                  <BudgetChart data={budgetData} t={t} currency={getCurrencySymbol(currency)} />
                </div>
                <ResultsSummary data={budgetData} chartRef={chartRef} t={t} currency={getCurrencySymbol(currency)} />
              </div>
            </section>
          </div>
        </div>
      </main>
      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground space-y-1">
          <p>
            {t.createdBy}{" "}
            <a
              href="https://www.linkedin.com/in/fadi-albouchi-183b817b/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline transition-colors"
            >
              Fadi Albouchi
            </a>
          </p>
          <p className="text-xs opacity-70">
            &copy; {new Date().getFullYear()} Budget Planner. {t.personalProject}. {t.rightsReserved}.
          </p>
        </div>
      </footer>
    </div>
  );
}
