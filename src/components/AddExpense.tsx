
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, ArrowLeft } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';

interface AddExpenseProps {
  onBack: () => void;
  onSave: (expense: {
    title: string;
    amount: number;
    category: string;
    date: Date;
    type: 'expense' | 'income';
  }) => void;
}

const AddExpense: React.FC<AddExpenseProps> = ({ onBack, onSave }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState<Date>();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const { toast } = useToast();

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
    { key: 'other', label: t('other') }
  ];

  const handleSave = () => {
    if (!title || !amount || !category || !date) {
      toast({
        title: t('missingInformation'),
        description: t('fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: t('invalidAmount'),
        description: t('enterValidAmount'),
        variant: "destructive",
      });
      return;
    }

    onSave({
      title,
      amount: Number(amount),
      category,
      date,
      type
    });

    toast({
      title: t('transactionSaved'),
      description: `${type === 'expense' ? t('expense') : t('income')} ₹${Number(amount).toLocaleString()} ${t('transactionSavedDesc')}`,
    });

    // Reset form
    setTitle('');
    setAmount('');
    setCategory('');
    setDate(undefined);
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 animated-bg">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 animate-slideInTop">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="p-2 h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent dark:from-green-400 dark:to-blue-400">
              {t('addTransaction')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">{t('recordIncomeOrExpense')}</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 card-shadow glass-card animate-scaleIn animate-delay-300 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle>{t('transactionDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="type">{t('transactionType')}</Label>
              <Select value={type} onValueChange={(value: 'expense' | 'income') => setType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">{t('expense')}</SelectItem>
                  <SelectItem value="income">{t('income')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">{t('title')}</Label>
              <Input
                id="title"
                placeholder={t('titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">{t('amount')} (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
                min="0"
                step="0.01"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">{t('category')}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.key} value={cat.key}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>{t('date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>{t('pickDate')}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSave}
              className="w-full financial-gradient text-white border-0 py-3 text-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Save className="mr-2 h-5 w-5" />
              {t('saveTransaction')}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Card */}
        {title && amount && category && (
          <Card className="border-0 card-shadow bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-lg">{t('preview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg dark:text-white">{title}</p>
                  <p className="text-gray-600 dark:text-gray-300">{category}</p>
                  {date && <p className="text-sm text-gray-500 dark:text-gray-400">{format(date, "PPP")}</p>}
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-2xl font-bold",
                    type === 'income' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {type === 'income' ? '+' : '-'}₹{amount ? Number(amount).toLocaleString() : '0'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{type}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AddExpense;
