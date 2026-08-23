import React, { useState } from 'react';
import { CalendarIcon, ReceiptText, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (transaction: {
    title: string;
    amount: number;
    category: string;
    date: Date;
    type: 'expense' | 'income';
  }) => void;
}

const AddTransactionDialog: React.FC<AddTransactionDialogProps> = ({ open, onOpenChange, onSave }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState<Date>(() => new Date());
  const [type, setType] = useState<'expense' | 'income'>('expense');

  const categories = [
    { key: 'food', label: t('food') },
    { key: 'travel', label: t('travel') },
    { key: 'rent', label: t('rent') },
    { key: 'entertainment', label: t('entertainment') },
    { key: 'shopping', label: t('shopping') },
    { key: 'healthcare', label: t('healthcare') },
    { key: 'education', label: t('education') },
    { key: 'utilities', label: t('utilities') },
    { key: 'income', label: t('income') },
    { key: 'other', label: t('other') },
  ];

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('');
    setDate(new Date());
    setType('expense');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !amount || !category || !date) {
      toast({ title: t('missingInformation'), description: t('fillAllFields'), variant: 'destructive' });
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast({ title: t('invalidAmount'), description: t('enterValidAmount'), variant: 'destructive' });
      return;
    }

    onSave({ title: title.trim(), amount: numericAmount, category, date, type });
    toast({
      title: t('transactionSaved'),
      description: `${type === 'expense' ? t('expense') : t('income')} ₹${numericAmount.toLocaleString()} ${t('transactionSavedDesc')}`,
    });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-[#dfe4ff] bg-[#fbfaf8] p-0 text-[#222d4b] shadow-[0_24px_80px_rgba(34,45,75,0.28)] sm:max-w-[560px]">
        <DialogHeader className="border-b border-[#e7e8ee] bg-[#222d4b] px-6 py-5 text-left text-white sm:px-7">
          <div className="flex items-start gap-3 pr-7">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#aeb8ed]/20 text-[#dfe4ff]"><ReceiptText className="h-5 w-5" /></span>
            <div>
              <DialogTitle className="text-xl font-semibold tracking-[-0.03em] text-white">Add a transaction</DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-5 text-white/65">Capture the detail now. Your dashboard will update instantly.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="quick-transaction-type" className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Transaction type</Label>
              <Select value={type} onValueChange={(value: 'expense' | 'income') => setType(value)}>
                <SelectTrigger id="quick-transaction-type" className="h-11 border-[#e0e2eb] bg-white text-slate-800"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white text-slate-800">
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="quick-transaction-title" className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Title</Label>
              <Input id="quick-transaction-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Groceries, salary, rent" className="h-11 border-[#e0e2eb] bg-white text-slate-800 placeholder:text-slate-400" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-transaction-amount" className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Amount (₹)</Label>
              <Input id="quick-transaction-amount" type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" className="h-11 border-[#e0e2eb] bg-white text-slate-800 placeholder:text-slate-400" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-transaction-category" className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="quick-transaction-category" className="h-11 border-[#e0e2eb] bg-white text-slate-800"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="bg-white text-slate-800">
                  {categories.map((item) => <SelectItem key={item.key} value={item.key}>{item.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={cn('h-11 w-full justify-start border-[#e0e2eb] bg-white text-left font-medium text-slate-700 hover:bg-[#f4f5fc]', !date && 'text-slate-400')}>
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#5867bb]" />{date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-[#dfe4ff] bg-white p-0" align="start"><Calendar mode="single" selected={date} onSelect={(nextDate) => nextDate && setDate(nextDate)} initialFocus className="pointer-events-auto p-3" /></PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="gap-2 border-t border-[#e7e8ee] pt-5 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="border-[#dfe4ff] bg-white text-slate-600 hover:bg-[#f4f5fc]">Cancel</Button>
            <Button type="submit" className="bg-[#222d4b] text-white shadow-[0_8px_18px_rgba(34,45,75,0.16)] hover:bg-[#3e4c91]"><Save className="mr-2 h-4 w-4" />Save transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;
