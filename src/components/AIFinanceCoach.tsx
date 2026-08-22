import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bot, ChevronRight, Languages, MessageCircle, Send, ShieldCheck, Sparkles, TrendingUp, UserRound, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';

interface Transaction { id: string; title: string; amount: number; category: string; date: string; type: 'income' | 'expense'; }
interface AIFinanceCoachProps { onBack: () => void; transactions: Transaction[]; }
interface Message { id: string; type: 'user' | 'ai'; content: string; timestamp: Date; suggestions?: string[]; }

const money = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const AIFinanceCoach: React.FC<AIFinanceCoachProps> = ({ onBack, transactions }) => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [providerStatus, setProviderStatus] = useState<'external' | 'local'>('local');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const summary = useMemo(() => {
    const expenses = transactions.filter((item) => item.type === 'expense');
    const income = transactions.filter((item) => item.type === 'income');
    const byCategory = expenses.reduce<Record<string, number>>((result, item) => { result[item.category] = (result[item.category] || 0) + Number(item.amount || 0); return result; }, {});
    const topCategory = Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0];
    return { expenses: expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0), income: income.reduce((sum, item) => sum + Number(item.amount || 0), 0), byCategory, topCategory };
  }, [transactions]);

  const suggestions = useMemo(() => language === 'hi' ? ['Sabse zyada kharcha kahan ho raha hai?', 'Is mahine ka budget kaise plan karu?', 'Savings badhane ke tips chahiye?', 'Food expenses kaise kam karu?'] : ['Where am I spending the most?', 'How should I plan this month?', 'How can I grow my savings?', 'How can I reduce food expenses?'], [language]);

  useEffect(() => {
    setMessages([{ id: 'welcome', type: 'ai', content: language === 'hi' ? 'Namaste! Main aapka SmartBudget Copilot hoon. Aap apne expenses, spending patterns, budget ya savings goals ke baare mein seedha pooch sakte hain.' : 'Hey, I’m your SmartBudget Copilot. Ask me anything about your expenses, spending patterns, budget, or savings goals.', timestamp: new Date(), suggestions }]);
  }, [language, suggestions]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const getAIResponse = (question: string) => {
    const query = question.toLowerCase();
    const { expenses, income, byCategory, topCategory } = summary;
    const formatBreakdown = Object.entries(byCategory).sort(([, a], [, b]) => b - a).slice(0, 4).map(([category, amount]) => `${category}: ${money(amount)}`).join(' · ');

    if (query.includes('most') || query.includes('highest') || query.includes('sabse') || query.includes('zyada') || query.includes('category')) {
      return language === 'hi' ? `Aapka sabse bada spending lever ${topCategory?.[0] || 'Food'} hai — ${money(topCategory?.[1] || 0)}. Baaki breakdown: ${formatBreakdown || 'abhi data kam hai'}. Is category par 10% soft cap lagane se next month around ${money((topCategory?.[1] || 0) * 0.1)} ka room ban sakta hai.` : `Your biggest spending lever is ${topCategory?.[0] || 'Food'} at ${money(topCategory?.[1] || 0)}. The current breakdown is ${formatBreakdown || 'not available yet'}. A gentle 10% cap here could free up around ${money((topCategory?.[1] || 0) * 0.1)} next month.`;
    }
    if (query.includes('budget') || query.includes('plan') || query.includes('kaise') || query.includes('rule')) {
      const needs = Math.round(expenses * 0.6); const wants = Math.round(expenses * 0.25); const save = Math.round(expenses * 0.15);
      return language === 'hi' ? `Aapke current expenses ${money(expenses)} ke liye ek simple starter plan: Needs ${money(needs)}, lifestyle ${money(wants)}, aur savings buffer ${money(save)}. Pehle salary day par savings auto-transfer set karo, phir category limits ko weekly review karo.` : `For your current ${money(expenses)} in expenses, try a simple starter plan: needs ${money(needs)}, lifestyle ${money(wants)}, and a savings buffer of ${money(save)}. Automate the buffer on salary day, then review category limits every Sunday.`;
    }
    if (query.includes('save') || query.includes('saving') || query.includes('goal') || query.includes('bachat')) {
      const target = Math.max(500, Math.round(income * 0.25));
      return language === 'hi' ? `Aapki tracked income ${money(income)} hai. Ek realistic first target ${money(target)} per month rakho — around 25%. Isse weekly ${money(target / 4)} ke chhote transfers mein tod do, taaki goal automatic lage.` : `Your tracked income is ${money(income)}. A realistic first target is ${money(target)} per month — roughly 25%. Break it into weekly transfers of about ${money(target / 4)} so the goal feels automatic.`;
    }
    if (query.includes('food') || query.includes('khana') || query.includes('dining')) {
      const food = byCategory.Food || byCategory.food || 0;
      return language === 'hi' ? `Food par abhi ${money(food)} spend hua hai. Agle hafte 2 low-spend days try karo aur ek soft weekly cap set karo. Isse bina restriction ke roughly ${money(food * 0.15)} tak ka difference aa sakta hai.` : `You’ve spent ${money(food)} on food so far. Try two low-spend days next week and set a soft weekly cap. Without over-restricting, that could make roughly ${money(food * 0.15)} of difference.`;
    }
    if (query.includes('balance') || query.includes('left') || query.includes('kitna')) {
      const balance = Math.max(0, income - expenses);
      return language === 'hi' ? `Aapka current tracked balance ${money(balance)} hai — income ${money(income)} minus expenses ${money(expenses)}. Is balance ka ek chhota hissa savings goal mein move karna best next step ho sakta hai.` : `Your current tracked balance is ${money(balance)} — income of ${money(income)} minus expenses of ${money(expenses)}. Moving a small part of that balance to a savings goal could be your best next step.`;
    }
    return language === 'hi' ? `Main aapke ${transactions.length} transactions aur ${money(expenses)} ke expenses ko dekh raha hoon. Aap “sabse zyada kharcha”, “budget plan”, “savings goal”, ya “balance” ke baare mein pooch sakte hain.` : `I’m looking at ${transactions.length} transactions and ${money(expenses)} in expenses. Try asking about your biggest category, a budget plan, savings goals, or current balance.`;
  };

  const getExternalResponse = async (question: string) => {
    const response = await apiRequest<{ message: string; provider?: string; model?: string }>('/ai/chat', {
      method: 'POST',
      body: {
        message: question,
        language,
        transactions,
        history: messages.slice(-8).map((item) => ({ role: item.type === 'ai' ? 'assistant' : 'user', content: item.content })),
      },
      requireAuth: true,
    });
    if (!response.success || !response.data?.message) throw new Error(response.message);
    setProviderStatus('external');
    return response.data.message;
  };

  const sendMessage = (value = input) => {
    const trimmed = value.trim();
    if (!trimmed || isTyping) return;
    const userMessage: Message = { id: `${Date.now()}-user`, type: 'user', content: trimmed, timestamp: new Date() };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsTyping(true);
    window.setTimeout(async () => {
      let content: string;
      try {
        content = await getExternalResponse(trimmed);
      } catch {
        setProviderStatus('local');
        content = getAIResponse(trimmed);
      }
      setMessages((current) => [...current, { id: `${Date.now()}-ai`, type: 'ai', content, timestamp: new Date(), suggestions }]);
      setIsTyping(false);
    }, 450);
  };

  const toggleLanguage = () => { setLanguage((current) => current === 'hi' ? 'en' : 'hi'); toast.success(language === 'hi' ? 'Switched to English' : 'Hindi/Hinglish mode on'); };

  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><button onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-teal-700"><ArrowLeft className="h-4 w-4" /> Back to overview</button><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#193b35] text-teal-200 shadow-lg shadow-teal-950/10"><Bot className="h-5 w-5" /></span><div><p className="eyebrow">SmartBudget Copilot</p><h1 className="mt-1 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">Talk to your money.</h1></div></div><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">Ask clear questions, get answers grounded in your tracked transactions, and turn the next best move into an action.</p></div><div className="flex items-center gap-2"><button onClick={toggleLanguage} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:border-teal-200 hover:text-teal-700"><Languages className="h-4 w-4" /> {language === 'hi' ? 'English' : 'हिंदी / Hinglish'}</button><span className={cn('inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold', providerStatus === 'external' ? 'border border-teal-100 bg-teal-50 text-teal-800' : 'border border-orange-100 bg-orange-50 text-orange-700')}><span className={cn('h-2 w-2 rounded-full', providerStatus === 'external' ? 'animate-pulse bg-[#397568]' : 'bg-orange-400')} /> {providerStatus === 'external' ? 'External AI connected' : 'Local fallback ready'}</span></div></div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]"><section className="premium-card flex min-h-[620px] flex-col overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><MessageCircle className="h-4 w-4" /></div><div><p className="text-sm font-bold text-slate-900">Live expense chat</p><p className="text-xs text-slate-400">Answers from your current money context</p></div></div><span className="hidden items-center gap-1.5 text-xs font-semibold text-slate-400 sm:flex"><ShieldCheck className="h-4 w-4 text-teal-600" /> Private workspace</span></div><div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-7">{messages.map((message) => <div key={message.id} className={cn('flex gap-3', message.type === 'user' && 'justify-end')}><div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', message.type === 'ai' ? 'bg-[#193b35] text-teal-200' : 'bg-slate-100 text-slate-500 order-2')} >{message.type === 'ai' ? <Bot className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}</div><div className={cn('max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6', message.type === 'ai' ? 'rounded-tl-sm bg-slate-50 text-slate-700' : 'rounded-tr-sm bg-[#193b35] text-white')}><p className="whitespace-pre-line">{message.content}</p><p className={cn('mt-2 text-[10px] font-semibold', message.type === 'ai' ? 'text-slate-400' : 'text-white/45')}>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div></div>)}{isTyping && <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#193b35] text-teal-200"><Bot className="h-4 w-4" /></div><div className="flex gap-1 rounded-2xl rounded-tl-sm bg-slate-50 px-4 py-4"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#397568]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#397568] [animation-delay:120ms]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#397568] [animation-delay:240ms]" /></div></div>}<div ref={messagesEndRef} /></div><div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-7">{!isTyping && <div className="flex gap-2 overflow-x-auto pb-3">{(messages[messages.length - 1]?.suggestions || suggestions).slice(0, 3).map((suggestion) => <button key={suggestion} onClick={() => sendMessage(suggestion)} className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-teal-300 hover:text-teal-700">{suggestion}</button>)}</div>}<div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendMessage()} placeholder={language === 'hi' ? 'Apne expenses ke baare mein poochiye...' : 'Ask about your expenses...'} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400" /><button onClick={() => sendMessage()} disabled={!input.trim() || isTyping} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#193b35] text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" /></button></div></div></section><aside className="space-y-5"><div className="rounded-[1.75rem] bg-[#193b35] p-6 text-white shadow-[0_18px_45px_rgba(16,43,41,0.18)]"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-100/60">Live context</p><Sparkles className="h-5 w-5 text-teal-200" /></div><p className="mt-6 text-3xl font-semibold tracking-tight">{money(Math.max(0, summary.income - summary.expenses))}</p><p className="mt-1 text-sm text-white/55">available balance</p><div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-5"><div><p className="text-[10px] uppercase tracking-wider text-white/40">Income</p><p className="mt-1 font-bold">{money(summary.income)}</p></div><div><p className="text-[10px] uppercase tracking-wider text-white/40">Expenses</p><p className="mt-1 font-bold">{money(summary.expenses)}</p></div></div></div><div className="premium-card p-5"><div className="flex items-center justify-between"><div><p className="eyebrow">Copilot knows</p><h2 className="mt-2 text-lg font-semibold text-slate-950">Your money snapshot</h2></div><TrendingUp className="h-5 w-5 text-teal-600" /></div><div className="mt-5 space-y-4"><Snapshot icon={Wallet} label="Transactions tracked" value={transactions.length.toString()} /><Snapshot icon={TrendingUp} label="Top category" value={summary.topCategory?.[0] || 'Add more data'} detail={summary.topCategory ? money(summary.topCategory[1]) : undefined} /><Snapshot icon={ShieldCheck} label="Context status" value="Ready to answer" /></div><button onClick={() => sendMessage(language === 'hi' ? 'Mera balance kitna hai?' : 'What is my current balance?')} className="mt-5 flex w-full items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3 text-left text-xs font-bold text-slate-600 transition hover:bg-teal-50 hover:text-teal-700">Ask a quick question <ChevronRight className="h-4 w-4" /></button></div></aside></div>
  </div>;
};

const Snapshot = ({ icon: Icon, label, value, detail }: { icon: React.ElementType; label: string; value: string; detail?: string }) => <div className="flex items-center gap-3"><div className="rounded-xl bg-teal-50 p-2 text-teal-700"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-xs text-slate-400">{label}</p><p className="truncate text-sm font-bold text-slate-800">{value}{detail && <span className="ml-1 font-semibold text-slate-400">· {detail}</span>}</p></div></div>;

export default AIFinanceCoach;
