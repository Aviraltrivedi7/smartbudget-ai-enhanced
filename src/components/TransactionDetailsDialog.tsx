import React, { useEffect, useState } from 'react';
import { CalendarDays, CreditCard, FileText, Pencil, ReceiptText, Save, Trash2, WalletCards, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocalTransaction } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';

interface TransactionDetailsDialogProps {
  open: boolean;
  transaction: LocalTransaction | null;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<LocalTransaction>) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

const money = (value: number) => `${value < 0 ? '-' : ''}₹${Math.abs(Math.round(value)).toLocaleString('en-IN')}`;
const paymentMethods = ['UPI', 'Cash', 'Card', 'Bank transfer', 'Not captured yet'];
const categories = ['Food', 'Travel', 'Rent', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Utilities', 'Other'];

const TransactionDetailsDialog: React.FC<TransactionDetailsDialogProps> = ({ open, transaction, onOpenChange, onUpdate, onDelete }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Not captured yet');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!transaction) return;
    setTitle(transaction.title);
    setAmount(String(transaction.amount));
    setCategory(transaction.category);
    setDate(transaction.date);
    setPaymentMethod(transaction.paymentMethod || 'Not captured yet');
    setDescription(transaction.description || '');
    setIsEditing(false);
  }, [transaction]);

  const handleSave = async () => {
    if (!transaction || !title.trim() || !Number(amount) || Number(amount) <= 0 || !category || !date) {
      toast({ title: 'Missing details', description: 'Add a valid title, amount, category, and date.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      await onUpdate(transaction.id, { title: title.trim(), amount: Number(amount), category, date, paymentMethod, description: description.trim() || undefined });
      setIsEditing(false);
      toast({ title: 'Transaction updated', description: 'Your DhanSetu workspace has been updated.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    if (!window.confirm('Delete this transaction from your DhanSetu workspace?')) return;
    setIsDeleting(true);
    try {
      await onDelete(transaction.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-[#dfe4ff] bg-[#fbfaf8] p-0 text-[#222d4b] shadow-[0_24px_80px_rgba(34,45,75,0.28)] sm:max-w-[520px]">
        <DialogHeader className="border-b border-white/10 bg-[#222d4b] px-6 py-5 text-left text-white sm:px-7">
          <div className="flex items-start gap-3 pr-7">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#aeb8ed]/20 text-[#dfe4ff]"><ReceiptText className="h-5 w-5" /></span>
            <div className="min-w-0"><DialogTitle className="truncate text-xl font-semibold tracking-[-0.03em] text-white">{isEditing ? 'Edit transaction' : transaction?.title || 'Transaction details'}</DialogTitle><DialogDescription className="mt-1 text-sm leading-5 text-white/65">{isEditing ? 'Keep the details precise so your money patterns stay useful.' : 'A complete view of this money movement.'}</DialogDescription></div>
          </div>
        </DialogHeader>
        {transaction && (isEditing ? (
          <div className="space-y-5 px-6 py-6 sm:px-7">
            <div className="space-y-2"><Label htmlFor="detail-title" className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Title</Label><Input id="detail-title" value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 border-[#e0e2eb] bg-white text-slate-800" /></div>
            <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="detail-amount" className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Amount (₹)</Label><Input id="detail-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="h-11 border-[#e0e2eb] bg-white text-slate-800" /></div><div className="space-y-2"><Label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger className="h-11 border-[#e0e2eb] bg-white text-slate-800"><SelectValue /></SelectTrigger><SelectContent className="bg-white text-slate-800">{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div></div>
            <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="detail-date" className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Date</Label><Input id="detail-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-11 border-[#e0e2eb] bg-white text-slate-800" /></div><div className="space-y-2"><Label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Payment method</Label><Select value={paymentMethod} onValueChange={setPaymentMethod}><SelectTrigger className="h-11 border-[#e0e2eb] bg-white text-slate-800"><SelectValue /></SelectTrigger><SelectContent className="bg-white text-slate-800">{paymentMethods.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div></div>
            <div className="space-y-2"><Label htmlFor="detail-notes" className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Notes</Label><textarea id="detail-notes" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-[#e0e2eb] bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#aeb8ed]" placeholder="Add a note for future-you" /></div>
            <DialogFooter className="gap-2 border-t border-[#e7e8ee] pt-5 sm:justify-end"><button type="button" onClick={() => setIsEditing(false)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe4ff] bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-[#f4f5fc]"><X className="h-4 w-4" />Cancel</button><button type="button" onClick={handleSave} disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#222d4b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#3e4c91] disabled:opacity-50"><Save className="h-4 w-4" />{isSaving ? 'Saving…' : 'Save changes'}</button></DialogFooter>
          </div>
        ) : (
          <div className="px-6 py-6 sm:px-7">
            <div className="flex items-center gap-3 rounded-2xl bg-[#eef0fb] p-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dfe4ff] text-[#5867bb]"><CreditCard className="h-5 w-5" /></div><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5867bb]">{transaction.type === 'income' ? 'Income received' : 'Expense recorded'}</p><p className="mt-1 truncate text-xl font-semibold text-[#222d4b]">{money(transaction.amount)}</p></div></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2"><DetailItem icon={WalletCards} label="Category" value={transaction.category} /><DetailItem icon={CalendarDays} label="Date & time" value={`${new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · ${transaction.createdAt ? new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time not captured'}`} /><DetailItem icon={CreditCard} label="Payment method" value={transaction.paymentMethod || 'Not captured yet'} /><DetailItem icon={FileText} label="Notes" value={transaction.description || 'No notes added'} /></div>
            <DialogFooter className="mt-7 gap-2 border-t border-[#e7e8ee] pt-5 sm:justify-between"><button type="button" onClick={handleDelete} disabled={isDeleting} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f0d2c9] bg-[#fff7f4] px-4 py-2.5 text-sm font-bold text-[#a65c4e] hover:bg-[#fcede8] disabled:opacity-50"><Trash2 className="h-4 w-4" />{isDeleting ? 'Deleting…' : 'Delete'}</button><button type="button" onClick={() => setIsEditing(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#222d4b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#3e4c91]"><Pencil className="h-4 w-4" />Edit transaction</button></DialogFooter>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
};

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => <div className="rounded-2xl border border-[#e7e8ee] bg-white p-4"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"><Icon className="h-3.5 w-3.5 text-[#5867bb]" />{label}</div><p className="mt-2 break-words text-sm font-bold text-slate-800">{value}</p></div>;

export default TransactionDetailsDialog;
