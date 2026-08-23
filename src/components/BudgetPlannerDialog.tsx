import React, { useMemo, useState } from 'react';
import { ArrowRight, Brain, CheckCircle2, PieChart, Sparkles, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface BudgetPlannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions?: Array<{ type?: string; amount?: number | string }>;
  onOpenFullPlanner: () => void;
  onConfirmIncome?: (income: number) => void;
}

const presets = [30000, 50000, 75000];

const BudgetPlannerDialog: React.FC<BudgetPlannerDialogProps> = ({ open, onOpenChange,   transactions = [], onOpenFullPlanner, onConfirmIncome }) => {
  const transactionSpend = useMemo(
    () => transactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
    [transactions],
  );
  const [monthlyIncome, setMonthlyIncome] = useState('50000');
  const [calculatedIncome, setCalculatedIncome] = useState(50000);

  const plan = useMemo(() => ({
    needs: Math.round(calculatedIncome * 0.5),
    wants: Math.round(calculatedIncome * 0.3),
    savings: Math.round(calculatedIncome * 0.2),
  }), [calculatedIncome]);

  const calculatePlan = (event?: React.FormEvent) => {
    event?.preventDefault();
    const nextIncome = Number(monthlyIncome);
    if (Number.isFinite(nextIncome) && nextIncome > 0) setCalculatedIncome(Math.round(nextIncome));
  };

  const handlePreset = (value: number) => {
    setMonthlyIncome(String(value));
    setCalculatedIncome(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#dfe4ff] bg-[#f8f7f4] p-0 text-slate-900 shadow-[0_24px_80px_rgba(24,33,58,0.25)] sm:max-w-xl">
        <DialogHeader className="bg-[#222d4b] px-6 py-6 text-left text-white sm:px-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dfe4ff]/15 text-[#dfe4ff]"><PieChart className="h-5 w-5" /></span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#dfe4ff]/80">Smart planning</span>
          </div>
          <DialogTitle className="text-2xl tracking-tight">Build a calmer monthly plan.</DialogTitle>
          <DialogDescription className="mt-2 max-w-md text-sm leading-6 text-white/65">Set your take-home income and DhanSetu will map a simple starting split for needs, wants, and future-you.</DialogDescription>
        </DialogHeader>

        <form onSubmit={calculatePlan} className="space-y-6 px-6 py-6 sm:px-7">
          <div className="space-y-2">
            <Label htmlFor="budget-income" className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Monthly take-home income</Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5867bb]" />
                <Input id="budget-income" type="number" min="1" inputMode="decimal" value={monthlyIncome} onChange={(event) => setMonthlyIncome(event.target.value)} className="h-12 border-[#dfe4ff] bg-white pl-10 text-lg font-semibold tabular-nums" />
              </div>
              <Button type="submit" className="h-12 rounded-xl bg-[#5867bb] px-5 font-bold text-white hover:bg-[#4d5baa]">Calculate</Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {presets.map((preset) => <button key={preset} type="button" onClick={() => handlePreset(preset)} className={cn('rounded-full border px-3 py-1.5 text-xs font-bold transition', Number(monthlyIncome) === preset ? 'border-[#5867bb] bg-[#e9eefb] text-[#5867bb]' : 'border-slate-200 bg-white text-slate-500 hover:border-[#aeb8ed] hover:text-[#5867bb]')}>₹{preset.toLocaleString('en-IN')}</button>)}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Allocation label="Needs" value={plan.needs} detail="50%" tone="navy" />
            <Allocation label="Wants" value={plan.wants} detail="30%" tone="lavender" />
            <Allocation label="Savings" value={plan.savings} detail="20%" tone="coral" />
          </div>

          <div className="rounded-2xl border border-[#dfe4ff] bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef0fb] text-[#5867bb]"><Brain className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">Your starting signal</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">{transactionSpend > 0 ? `You have logged ₹${Math.round(transactionSpend).toLocaleString('en-IN')} in spending so far. Keep your needs bucket close to ₹${plan.needs.toLocaleString('en-IN')} as you refine the plan.` : 'Log a few transactions after setting this plan and DhanSetu will surface more personal guardrails.'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="ghost" onClick={onOpenFullPlanner} className="justify-start px-0 font-bold text-[#5867bb] hover:bg-transparent hover:text-[#222d4b]">Open full planner <ArrowRight className="ml-1 h-4 w-4" /></Button>
            <Button type="button" onClick={() => { onConfirmIncome?.(calculatedIncome); onOpenChange(false); }} className="rounded-xl bg-[#222d4b] px-5 font-bold text-white hover:bg-[#3e4c91]"><CheckCircle2 className="mr-2 h-4 w-4" /> Use this plan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Allocation = ({ label, value, detail, tone }: { label: string; value: number; detail: string; tone: 'navy' | 'lavender' | 'coral' }) => (
  <div className={cn('rounded-2xl p-4', tone === 'navy' && 'bg-[#222d4b] text-white', tone === 'lavender' && 'bg-[#e9eefb] text-[#222d4b]', tone === 'coral' && 'bg-[#f7efe7] text-[#583b31]')}>
    <div className="flex items-center justify-between gap-2"><p className="text-xs font-bold uppercase tracking-[0.14em] opacity-65">{label}</p><Sparkles className="h-3.5 w-3.5 opacity-60" /></div>
    <p className="mt-3 text-xl font-semibold tracking-tight tabular-nums">₹{value.toLocaleString('en-IN')}</p>
    <p className="mt-1 text-xs font-semibold opacity-60">{detail} of income</p>
  </div>
);

export default BudgetPlannerDialog;
