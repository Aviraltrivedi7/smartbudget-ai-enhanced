import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Bot, MessageCircle, Send, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CoachPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitPrompt: (prompt: string) => void;
}

const CoachPromptDialog: React.FC<CoachPromptDialogProps> = ({ open, onOpenChange, onSubmitPrompt }) => {
  const { currentLanguage } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const isHindi = currentLanguage === 'hi';
  const suggestions = isHindi
    ? ['Sabse zyada kharcha kahan ho raha hai?', 'Savings badhane ke tips chahiye?', 'Mera balance kitna hai?']
    : ['Where am I spending the most?', 'How can I grow my savings?', 'What is my current balance?'];

  useEffect(() => {
    if (!open) setPrompt('');
  }, [open]);

  const submit = (value = prompt) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmitPrompt(trimmed);
    setPrompt('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-[#dfe4ff] bg-[#fbfaf8] p-0 text-[#222d4b] shadow-[0_24px_80px_rgba(34,45,75,0.28)] sm:max-w-[520px]">
        <DialogHeader className="bg-[#222d4b] px-6 py-6 text-left text-white sm:px-7">
          <div className="flex items-start gap-3 pr-7">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#aeb8ed]/20 text-[#dfe4ff]"><Bot className="h-5 w-5" /></span>
            <div>
              <DialogTitle className="text-xl font-semibold tracking-[-0.03em] text-white">Ask your AI Coach</DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-5 text-white/65">Start with one question. Answers are grounded in the transactions you track.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6 px-6 py-6 sm:px-7">
          <div className="rounded-2xl border border-[#dfe4ff] bg-[#eef0fb] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#5867bb]"><Sparkles className="h-4 w-4" /> Context-aware guidance</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">Ask about spending patterns, budget planning, savings goals, or the balance left this month.</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Try a prompt</p>
            <div className="flex flex-wrap gap-2">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => setPrompt(suggestion)} className="rounded-full border border-[#e0e2eb] bg-white px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:border-[#aeb8ed] hover:bg-[#f4f5fc] hover:text-[#5867bb]">{suggestion}</button>)}</div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-[#d9dce7] bg-white p-1.5 shadow-sm focus-within:border-[#aeb8ed] focus-within:ring-2 focus-within:ring-[#aeb8ed]/20">
            <MessageCircle className="ml-3 h-4 w-4 shrink-0 text-[#5867bb]" />
            <Input value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); submit(); } }} placeholder={isHindi ? 'Apne expenses ke baare mein poochiye...' : 'Ask about your expenses...'} aria-label="AI Coach prompt" className="h-10 border-0 bg-transparent px-2 text-sm text-slate-800 shadow-none focus-visible:ring-0" />
            <Button type="button" onClick={() => submit()} disabled={!prompt.trim()} aria-label="Send AI Coach prompt" className="h-10 shrink-0 rounded-xl bg-[#222d4b] px-3 text-white hover:bg-[#3e4c91] disabled:opacity-40"><Send className="h-4 w-4" /></Button>
          </div>
          <button onClick={() => onSubmitPrompt('')} className="group inline-flex items-center gap-2 text-xs font-bold text-[#5867bb] transition hover:text-[#3e4c91]">Open full coach without a prompt <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoachPromptDialog;
