import { MessageCircle, Sparkles } from 'lucide-react';

interface FloatingCoachButtonProps {
  onClick: () => void;
}

const FloatingCoachButton = ({ onClick }: FloatingCoachButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    title="Ask DhanSetu AI Coach"
    aria-label="Ask DhanSetu AI Coach about your expenses"
    className="fixed bottom-5 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#222d4b] px-3.5 py-3 text-white shadow-[0_16px_34px_rgba(34,45,75,0.28)] transition hover:-translate-y-1 hover:bg-[#3e4c91] focus:outline-none focus:ring-2 focus:ring-[#aeb8ed] focus:ring-offset-2 focus:ring-offset-[#f8f7f4] active:scale-[0.97] sm:bottom-6 sm:right-6"
  >
    <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#dfe4ff] text-[#222d4b]">
      <MessageCircle className="h-4 w-4" />
      <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-[#e7dcae]" />
    </span>
    <span className="hidden text-xs font-bold sm:inline">Ask AI Coach</span>
  </button>
);

export default FloatingCoachButton;
