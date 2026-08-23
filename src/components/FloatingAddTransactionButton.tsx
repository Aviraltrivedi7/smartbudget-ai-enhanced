import { Plus } from 'lucide-react';

interface FloatingAddTransactionButtonProps {
  onClick: () => void;
}

const FloatingAddTransactionButton = ({ onClick }: FloatingAddTransactionButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    title="Add transaction"
    aria-label="Add a new transaction"
    className="fixed bottom-[5.5rem] right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#5867bb] text-white shadow-[0_16px_34px_rgba(88,103,187,0.32)] transition hover:-translate-y-1 hover:bg-[#3e4c91] focus:outline-none focus:ring-2 focus:ring-[#aeb8ed] focus:ring-offset-2 focus:ring-offset-[#f8f7f4] active:scale-[0.97] sm:bottom-[5.75rem] sm:right-6 sm:h-auto sm:w-auto sm:gap-2 sm:rounded-full sm:px-4 sm:py-3"
  >
    <Plus className="h-5 w-5" />
    <span className="hidden text-xs font-bold sm:inline">Add transaction</span>
  </button>
);

export default FloatingAddTransactionButton;
