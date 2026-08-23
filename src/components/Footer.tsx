import { IndianRupee, ShieldCheck, WifiOff } from 'lucide-react';

const Footer = () => {
  return (
    <div className="fixed bottom-4 left-4 z-30 max-w-[calc(100vw-5.5rem)] sm:bottom-5 sm:left-5">
      <div className="rounded-2xl border border-[#e7e8ee] bg-white/90 px-3.5 py-2.5 shadow-[0_10px_28px_rgba(31,43,72,0.08)] backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#222d4b] sm:text-xs">
          <span>Made by Aviral Trivedi</span>
          <span className="text-slate-300">·</span>
          <span className="hidden items-center gap-1 text-[#5867bb] sm:inline-flex"><ShieldCheck className="h-3.5 w-3.5" /> Private by design</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-semibold text-slate-400 sm:text-[10px]">
          <span className="inline-flex items-center gap-1"><IndianRupee className="h-3 w-3 text-[#bf7864]" /> India-ready</span>
          <span className="inline-flex items-center gap-1"><WifiOff className="h-3 w-3 text-[#5867bb]" /> Guest data stays local</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
