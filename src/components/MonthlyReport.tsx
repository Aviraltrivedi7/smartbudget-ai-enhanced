import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Download, FileDown, FileUp, FileText, PieChart, ShieldCheck, Sparkles } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

interface Transaction { id: string; title: string; amount: number; category: string; date: string; type: 'income' | 'expense'; description?: string; }
interface MonthlyReportProps { onBack: () => void; transactions: Transaction[]; onImport?: (transactions: Omit<Transaction, 'id'>[]) => Promise<void> | void; }

const money = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
const escapeCsv = (value: string | number) => { const text = String(value ?? ''); return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; };
const parseCsv = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = []; let cell = ''; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]; const next = text[index + 1];
    if (character === '"' && quoted && next === '"') { cell += '"'; index += 1; continue; }
    if (character === '"') { quoted = !quoted; continue; }
    if (character === ',' && !quoted) { row.push(cell.trim()); cell = ''; continue; }
    if ((character === '\n' || character === '\r') && !quoted) { if (character === '\r' && next === '\n') index += 1; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ''; continue; }
    cell += character;
  }
  if (cell || row.length) { row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); }
  return rows;
};

const MonthlyReport: React.FC<MonthlyReportProps> = ({ onBack, transactions, onImport }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const report = useMemo(() => {
    const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expenses = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const byCategory = transactions.filter((item) => item.type === 'expense').reduce<Record<string, number>>((result, item) => { result[item.category] = (result[item.category] || 0) + Number(item.amount || 0); return result; }, {});
    const categories = Object.entries(byCategory).sort(([, a], [, b]) => b - a);
    return { income, expenses, savings: income - expenses, byCategory: categories, topCategory: categories[0]?.[0] || '—', savingsRate: income ? (Math.max(0, income - expenses) / income) * 100 : 0 };
  }, [transactions]);

  const downloadCsv = () => {
    const rows = [['Date', 'Title', 'Category', 'Type', 'Amount', 'Description'], ...transactions.map((item) => [item.date, item.title, item.category, item.type, item.amount, item.description || ''])];
    const blob = new Blob([rows.map((row) => row.map(escapeCsv).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `dhansetu-transactions-${new Date().toISOString().slice(0, 7)}.csv`; link.click(); URL.revokeObjectURL(url);
    toast.success(`${transactions.length} transactions exported as CSV`);
  };

  const downloadPdf = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.setFillColor(34, 45, 75); doc.rect(0, 0, 210, 44, 'F');
    doc.setTextColor(231, 220, 174); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('DHANSETU AI', 18, 17);
    doc.setTextColor(255, 255, 255); doc.setFontSize(23); doc.text('Monthly money report', 18, 31);
    doc.setTextColor(90, 105, 110); doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text(`Generated ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 18, 56);
    const cards = [{ label: 'TOTAL INCOME', value: money(report.income), color: [217, 248, 228] }, { label: 'TOTAL EXPENSES', value: money(report.expenses), color: [255, 240, 223] }, { label: 'NET SAVINGS', value: money(report.savings), color: [232, 229, 255] }];
    cards.forEach((card, index) => { const x = 18 + index * 58; doc.setFillColor(card.color[0], card.color[1], card.color[2]); doc.roundedRect(x, 68, 52, 27, 4, 4, 'F'); doc.setTextColor(90, 105, 110); doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.text(card.label, x + 5, 77); doc.setTextColor(34, 45, 75); doc.setFontSize(13); doc.text(card.value, x + 5, 88); });
    doc.setTextColor(34, 45, 75); doc.setFontSize(15); doc.text('Category breakdown', 18, 119); doc.setDrawColor(224, 232, 231); doc.line(18, 123, 192, 123);
    report.byCategory.slice(0, 8).forEach(([category, amount], index) => { const y = 135 + index * 11; doc.setTextColor(80, 95, 100); doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text(category, 18, y); doc.setTextColor(34, 45, 75); doc.setFont('helvetica', 'bold'); doc.text(money(amount), 157, y, { align: 'right' }); doc.setFillColor(88, 103, 187); doc.roundedRect(18, y + 3, Math.min(130, (amount / Math.max(report.expenses, 1)) * 130), 2.5, 1, 1, 'F'); });
    const insightY = 135 + Math.max(1, Math.min(report.byCategory.length, 8)) * 11 + 17; doc.setFillColor(239, 240, 250); doc.roundedRect(18, insightY, 174, 32, 4, 4, 'F'); doc.setTextColor(88, 103, 187); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('DHANSETU INSIGHT', 25, insightY + 11); doc.setTextColor(80, 95, 100); doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(`Top category: ${report.topCategory}  ·  Savings rate: ${report.savingsRate.toFixed(1)}%`, 25, insightY + 21); doc.text(`${transactions.length} transactions included in this report.`, 25, insightY + 27);
    doc.save(`dhansetu-monthly-report-${new Date().toISOString().slice(0, 7)}.pdf`); setIsGenerating(false); toast.success('Monthly PDF report downloaded');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    setIsImporting(true);
    try {
      const rows = parseCsv(await file.text()); const header = rows.shift()?.map((value) => value.toLowerCase()) || [];
      const indexOf = (names: string[]) => names.map((name) => header.indexOf(name)).find((index) => index >= 0) ?? -1;
      const dateIndex = indexOf(['date']); const titleIndex = indexOf(['title', 'name', 'description']); const categoryIndex = indexOf(['category']); const typeIndex = indexOf(['type', 'transaction type']); const amountIndex = indexOf(['amount', 'value']); const descriptionIndex = indexOf(['description', 'notes']);
      const imported = rows.map((row) => ({ title: row[titleIndex] || 'Imported transaction', amount: Math.abs(Number((row[amountIndex] || '0').replace(/[^0-9.-]/g, ''))), category: row[categoryIndex] || 'Other', date: row[dateIndex] || new Date().toISOString().slice(0, 10), type: row[typeIndex]?.toLowerCase() === 'income' ? 'income' as const : 'expense' as const, description: row[descriptionIndex] || undefined })).filter((item) => item.amount > 0);
      if (!imported.length) throw new Error('No valid transaction rows found');
      await onImport?.(imported); toast.success(`${imported.length} transactions imported successfully`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not import this CSV file'); }
    finally { setIsImporting(false); event.target.value = ''; }
  };

  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-9"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><button onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#5867bb]"><ArrowLeft className="h-4 w-4" /> Back to overview</button><p className="eyebrow">Reports & exports</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">Your money, in a file.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Download a clean report for your records, export raw transactions, or bring in a CSV from another tracker.</p></div><div className="inline-flex items-center gap-2 self-start rounded-xl border border-teal-100 bg-[#e9eefb] px-3.5 py-2.5 text-xs font-bold text-teal-800"><ShieldCheck className="h-4 w-4" /> Private export tools</div></div>
    <section className="grid gap-5 md:grid-cols-3"><ReportStat label="Total income" value={money(report.income)} tone="mint" /><ReportStat label="Total expenses" value={money(report.expenses)} tone="sand" /><ReportStat label="Net savings" value={money(report.savings)} tone="violet" /></section>
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]"><div className="premium-card p-6 sm:p-7"><div className="flex items-start justify-between"><div><p className="eyebrow">Monthly snapshot</p><h2 className="mt-2 text-xl font-semibold text-slate-950">A clear read on your month.</h2></div><div className="rounded-xl bg-[#e9eefb] p-2.5 text-[#5867bb]"><PieChart className="h-5 w-5" /></div></div><div className="mt-7 space-y-4">{report.byCategory.length ? report.byCategory.slice(0, 6).map(([category, amount]) => <div key={category}><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-slate-700">{category}</span><span className="font-bold text-slate-900">{money(amount)}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#5867bb]" style={{ width: `${Math.max(4, (amount / Math.max(report.expenses, 1)) * 100)}%` }} /></div></div>) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400">Add or import transactions to build your report.</div>}</div></div><div className="rounded-[1.75rem] bg-[#222d4b] p-6 text-white shadow-[0_18px_45px_rgba(34,45,75,0.18)] sm:p-7"><Sparkles className="h-5 w-5 text-[#dfe4ff]" /><p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#dfe4ff]/60">Smart readout</p><h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight">{report.topCategory === '—' ? 'Your story starts with one transaction.' : `${report.topCategory} is your biggest spending lever.`}</h2><p className="mt-4 text-sm leading-6 text-white/55">{report.topCategory === '—' ? 'Import a CSV or add a transaction to unlock category-level insights.' : `${money(report.expenses)} spent across ${report.byCategory.length} categories, with a ${report.savingsRate.toFixed(1)}% savings rate.`}</p><div className="mt-8 flex items-center gap-2 text-xs font-bold text-[#dfe4ff]"><CheckCircle2 className="h-4 w-4" /> {transactions.length} transactions included</div></div></section>
    <section className="grid gap-5 md:grid-cols-3"><ExportCard icon={FileText} title="PDF report" description="A polished monthly summary with category insights." action={downloadPdf} label={isGenerating ? 'Generating…' : 'Download PDF'} disabled={isGenerating} tone="dark" /><ExportCard icon={Download} title="CSV export" description="Raw transaction data for analysis and backups." action={downloadCsv} label="Export CSV" tone="mint" /><ExportCard icon={FileUp} title="Import CSV" description="Bring transactions from another spreadsheet or app." action={() => inputRef.current?.click()} label={isImporting ? 'Importing…' : 'Choose CSV file'} disabled={isImporting} tone="orange" /></section><input ref={inputRef} type="file" accept=".csv,text/csv" onChange={handleImport} className="hidden" />
  </div>;
};

const ReportStat = ({ label, value, tone }: { label: string; value: string; tone: string }) => <div className={`metric-card ${tone === 'mint' ? 'metric-card-mint' : tone === 'sand' ? 'metric-card-sand' : 'bg-[#e5e7f8] text-[#39406b]'}`}><p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-60">{label}</p><p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p></div>;
const ExportCard = ({ icon: Icon, title, description, action, label, disabled, tone }: { icon: React.ElementType; title: string; description: string; action: () => void; label: string; disabled?: boolean; tone: string }) => <div className="premium-card p-5"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone === 'dark' ? 'bg-[#222d4b] text-[#dfe4ff]' : tone === 'mint' ? 'bg-[#e9eefb] text-[#5867bb]' : 'bg-[#f7efe7] text-[#a65c4e]'}`}><Icon className="h-5 w-5" /></div><h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3><p className="mt-2 min-h-[42px] text-sm leading-5 text-slate-500">{description}</p><button onClick={action} disabled={disabled} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${tone === 'dark' ? 'bg-[#222d4b] text-white hover:bg-[#3e4c91]' : 'border border-slate-200 bg-white text-slate-700 hover:border-[#aeb8ed] hover:text-[#5867bb]'}`}><Download className="h-4 w-4" />{label}</button></div>;

export default MonthlyReport;
