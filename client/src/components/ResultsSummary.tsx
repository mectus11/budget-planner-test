import { ArrowDownToLine, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BudgetData } from "@/types/budget";
import { generatePDF } from "@/lib/pdfGenerator";
import { cn, formatAmount } from "@/lib/utils";
import html2canvas from "html2canvas";

interface ResultsSummaryProps {
  data: BudgetData;
  chartRef: React.RefObject<HTMLDivElement | null>;
  t: any;
  currency: string;
}

export function ResultsSummary({ data, chartRef, t, currency }: ResultsSummaryProps) {
  const { totalIncome, totalExpenses, remainingBudget, percentageSpent } = data;

  const isHealthy = percentageSpent <= 75;
  const isWarning = percentageSpent > 75 && percentageSpent <= 90;
  const isDanger = percentageSpent > 90;

  let advice = "";
  let statusColor = "text-foreground";
  let progressColor = "bg-primary";

  if (totalIncome === 0) {
    advice = t.advice.start;
  } else if (remainingBudget < 0) {
    advice = t.advice.overBudget;
    statusColor = "text-destructive";
    progressColor = "bg-destructive";
  } else if (isDanger) {
    advice = t.advice.danger;
    statusColor = "text-warning";
    progressColor = "bg-warning";
  } else {
    advice = t.advice.good;
    statusColor = "text-success";
    progressColor = "bg-success";
  }

  const handleDownload = async () => {
    let chartImage = undefined;
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, { backgroundColor: null });
        chartImage = canvas.toDataURL("image/png");
      } catch (e) {
        console.error("Failed to capture chart", e);
      }
    }
    generatePDF(data, advice, chartImage);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-sm h-full flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t.totalExpenses}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{formatAmount(totalExpenses)} {currency}</div>
          </CardContent>
        </Card>

        <Card className={cn("border-border/50 shadow-sm h-full flex flex-col justify-between", remainingBudget < 0 && "border-destructive/50 bg-destructive/5")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t.remaining}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold font-display", statusColor)}>
              {formatAmount(remainingBudget)} {currency}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm h-full flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t.percentSpent}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold font-display", statusColor)}>
              {percentageSpent.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm bg-muted/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {isHealthy ? (
              <TrendingUp className="h-8 w-8 text-success shrink-0" />
            ) : remainingBudget < 0 ? (
              <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
            ) : (
              <TrendingDown className="h-8 w-8 text-warning shrink-0" />
            )}
            <div className="space-y-2 w-full">
              <h3 className="font-display font-semibold text-lg">{t.financialAdvice}</h3>
              <p className="text-muted-foreground">{advice}</p>

              {totalIncome > 0 && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                  <Progress value={Math.min(percentageSpent, 100)} className="h-2" indicatorClassName={progressColor} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleDownload}
        className="w-full h-12 text-lg font-medium shadow-md hover:shadow-lg transition-all"
        disabled={totalIncome === 0}
      >
        <ArrowDownToLine className="mr-2 h-5 w-5" />
        {t.downloadReport}
      </Button>
    </div>
  );
}
