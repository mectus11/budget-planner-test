import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { BudgetData } from "@/types/budget";

export const generatePDF = (data: BudgetData, advice: string, chartImage?: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(41, 128, 185); // Blue color
  doc.text("Monthly Budget Report", pageWidth / 2, 20, { align: "center" });
  
  // Date & Month
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Budget Month: ${data.month}`, pageWidth / 2, 30, { align: "center" });
  doc.text(`Generated on: ${format(new Date(), "MMMM do, yyyy")}`, pageWidth / 2, 36, { align: "center" });

  // Chart
  let currentY = 45;
  if (chartImage) {
    const imgProps = doc.getImageProperties(chartImage);
    const imgWidth = 100;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    doc.addImage(chartImage, 'PNG', (pageWidth - imgWidth) / 2, currentY, imgWidth, imgHeight);
    currentY += imgHeight + 10;
  }

  // Summary Section
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("Summary", 14, currentY);
  
  const summaryData = [
    ["Total Income", `${data.totalIncome.toFixed(3)} TND`],
    ["Total Expenses", `${data.totalExpenses.toFixed(3)} TND`],
    ["Remaining Budget", `${data.remainingBudget.toFixed(3)} TND`],
    ["Percentage Spent", `${data.percentageSpent.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: currentY + 5,
    head: [["Category", "Amount"]],
    body: summaryData,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Advice Section
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.text("Financial Advice", 14, finalY);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(80);
  
  const splitAdvice = doc.splitTextToSize(advice, pageWidth - 28);
  doc.text(splitAdvice, 14, finalY + 10);

  // Income Detail
  let detailY = finalY + 20 + (splitAdvice.length * 5);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Income Breakdown", 14, detailY);

  const incomeRows = [
    ["Base Salary", `${data.baseSalary.toFixed(3)} TND`],
    ...data.extraIncome.map(inc => [inc.name, `${inc.amount.toFixed(3)} TND`])
  ];

  autoTable(doc, {
    startY: detailY + 5,
    head: [["Source", "Amount"]],
    body: incomeRows,
    theme: "grid",
    headStyles: { fillColor: [46, 204, 113] }, // Green
  });

  // Expenses Detail
  detailY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Expense Breakdown", 14, detailY);

  const expenseRows = data.expenses.map(exp => [exp.name, `${exp.amount.toFixed(3)} TND`]);

  autoTable(doc, {
    startY: detailY + 5,
    head: [["Expense Name", "Amount"]],
    body: expenseRows,
    theme: "grid",
    headStyles: { fillColor: [231, 76, 60] }, // Redish
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: "center" });
  }

  // Save
  doc.save(`budget-report-${data.month}.pdf`);
};
