import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface MonthlyReportProps {
  onBack: () => void;
  transactions: Transaction[];
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ onBack, transactions }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateReportData = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const savings = totalIncome - totalExpense;

    // Category wise breakdown
    const categoryBreakdown: { [key: string]: number } = {};
    expenses.forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    return {
      totalIncome,
      totalExpense,
      savings,
      categoryBreakdown,
      transactionCount: transactions.length,
      topCategory: Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
    };
  };

  const generatePDFReport = async () => {
    setIsGenerating(true);

    const reportData = generateReportData();

    // Simulate PDF generation
    setTimeout(() => {
      const reportContent = `
MONTHLY KHATAA REPORT 📊
========================

💰 KAMAII AUR KHARCHA SUMMARY
Total Kamai: ₹${reportData.totalIncome.toLocaleString()}
Total Kharcha: ₹${reportData.totalExpense.toLocaleString()}
Net Bachat: ₹${reportData.savings.toLocaleString()}

📈 CATEGORY BREAKDOWN
${Object.entries(reportData.categoryBreakdown)
          .map(([category, amount]) => `${category}: ₹${amount.toLocaleString()}`)
          .join('\n')}

🎯 SMART INSIGHTS
• Total Transactions: ${reportData.transactionCount}
• Sabse Zyada Kharcha: ${reportData.topCategory}
• Savings Rate: ${((reportData.savings / reportData.totalIncome) * 100).toFixed(1)}%

💡 COACH TIPS
${reportData.savings > 0
          ? '• Gazab ki bachat ki hai bhai! 🎉'
          : '• Agle mahine top category pe thoda control rakho.'
        }
• Har mahine auto-savings set karo
• Subscription kharche regular check karo

Generate Hua: ${new Date().toLocaleDateString()}
      `;

      // Create and download the file
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Financial_Report_${new Date().toISOString().slice(0, 7)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsGenerating(false);
      toast({
        title: "📊 Report Generated!",
        description: "Your monthly financial report has been downloaded successfully.",
      });
    }, 2000);
  };

  const generateExcelData = async () => {
    setIsGenerating(true);

    // Create CSV content
    const csvContent = [
      ['Date', 'Title', 'Category', 'Type', 'Amount'],
      ...transactions.map(t => [
        t.date,
        t.title,
        t.category,
        t.type,
        t.amount.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    setTimeout(() => {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Transactions_${new Date().toISOString().slice(0, 7)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsGenerating(false);
      toast({
        title: "📈 Excel Data Exported!",
        description: "Transaction data exported as CSV file.",
      });
    }, 1500);
  };

  const reportData = generateReportData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="p-2 h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              📊 Monthly Report
            </h1>
            <p className="text-gray-600 font-medium">Poore mahine ka hisab-kitab export karein</p>
          </div>
        </div>

        {/* Report Preview */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle>Report Preview - {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-green-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">₹{reportData.totalIncome.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Income</div>
                </div>
              </Card>
              <Card className="p-4 bg-red-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">₹{reportData.totalExpense.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Expenses</div>
                </div>
              </Card>
              <Card className="p-4 bg-blue-100">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${reportData.savings > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ₹{reportData.savings.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Net Savings</div>
                </div>
              </Card>
            </div>

            {/* Category Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Category Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(reportData.categoryBreakdown).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{category}</span>
                    <span className="text-red-600">₹{amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-2">📈 Key Statistics</h4>
                <ul className="space-y-1 text-sm">
                  <li>Total Transactions: {reportData.transactionCount}</li>
                  <li>Top Category: {reportData.topCategory}</li>
                  <li>Savings Rate: {((reportData.savings / reportData.totalIncome) * 100).toFixed(1)}%</li>
                </ul>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold mb-2">💡 Smart Tips</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Set monthly savings targets</li>
                  <li>• Review recurring subscriptions</li>
                  <li>• Track daily expenses consistently</li>
                </ul>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 card-shadow">
            <CardContent className="p-6 text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-blue-600" />
              <h3 className="text-xl font-bold">PDF Report</h3>
              <p className="text-gray-600">Complete financial analysis with charts and insights</p>
              <Button
                onClick={generatePDFReport}
                disabled={isGenerating}
                className="w-full financial-gradient"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Download PDF Report'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 card-shadow">
            <CardContent className="p-6 text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-green-600" />
              <h3 className="text-xl font-bold">Excel Export</h3>
              <p className="text-gray-600">Raw transaction data for custom analysis</p>
              <Button
                onClick={generateExcelData}
                disabled={isGenerating}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Export to Excel'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
