import { ArrowRight, BarChart3, Check, ChevronRight, Command, IndianRupee, ShieldCheck, Sparkles, Target, TrendingUp, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const featureCards = [
  {
    icon: BarChart3,
    eyebrow: 'See the signal',
    title: 'A clearer view of every rupee.',
    description: 'Turn scattered transactions into calm, readable patterns across cash flow, categories, and weekly rhythm.',
    tone: 'cobalt',
  },
  {
    icon: Sparkles,
    eyebrow: 'Think with AI',
    title: 'Your next best move, not more noise.',
    description: 'DhanSetu AI Coach grounds its suggestions in your tracked money so every prompt leads to an actionable step.',
    tone: 'lavender',
  },
  {
    icon: Target,
    eyebrow: 'Build momentum',
    title: 'Small habits become future goals.',
    description: 'Plan a realistic budget, create savings milestones, and keep progress visible without feeling restricted.',
    tone: 'coral',
  },
];

const workflow = [
  ['01', 'Capture', 'Log income and expenses in seconds.'],
  ['02', 'Understand', 'Let your money patterns become visible.'],
  ['03', 'Move forward', 'Choose one smart next step and repeat.'],
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f7f4] text-[#222d4b]">
      <section className="relative isolate bg-[#222d4b] text-white">
        <div className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full border-[42px] border-[#aeb8ed]/10" />
        <div className="pointer-events-none absolute -bottom-52 left-1/3 h-[30rem] w-[30rem] rounded-full border-[54px] border-[#5867bb]/20" />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-5 sm:px-8 lg:px-10 lg:pb-28">
          <nav className="flex items-center justify-between border-b border-white/10 pb-5" aria-label="DhanSetu AI landing page navigation">
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 p-1.5 ring-1 ring-white/15"><img src="/dhansetu-logo.png" alt="DhanSetu AI logo" className="h-full w-full object-contain" /></span>
              <span><span className="block text-base font-semibold tracking-[-0.03em]">DhanSetu <span className="text-[#dfe4ff]">AI</span></span><span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">Aapke paiso ka smart saathi</span></span>
            </button>
            <div className="hidden items-center gap-7 text-sm font-semibold text-white/65 md:flex">
              <a href="#why-dhansetu" className="transition hover:text-white">Why DhanSetu</a>
              <a href="#how-it-works" className="transition hover:text-white">How it works</a>
              <a href="#features" className="transition hover:text-white">Features</a>
            </div>
            <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/15"><span className="hidden sm:inline">Open workspace</span><ArrowRight className="h-4 w-4" /></button>
          </nav>

          <div className="grid items-center gap-14 pt-16 lg:grid-cols-[minmax(0,1.02fr)_minmax(440px,0.98fr)] lg:gap-16 lg:pt-24">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dfe4ff]/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#dfe4ff]"><span className="h-1.5 w-1.5 rounded-full bg-[#e7dcae] shadow-[0_0_12px_#e7dcae]" /> Built for calmer money decisions</div>
              <h1 className="max-w-xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-[5.3rem]">Make every rupee feel <span className="text-[#aeb8ed]">intentional.</span></h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/68 sm:text-lg">DhanSetu AI is the bridge between today’s spending and tomorrow’s goals — a premium finance workspace that helps you see clearly, plan calmly, and move forward.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => navigate('/')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#dfe4ff] px-5 py-3.5 text-sm font-bold text-[#222d4b] shadow-[0_12px_28px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:bg-white">Start your money workspace <ArrowRight className="h-4 w-4" /></button>
                <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white">See how it works <ChevronRight className="h-4 w-4" /></a>
              </div>
              <div className="mt-6 flex items-start gap-2 pl-1 text-[#e7dcae] sm:ml-2">
                <span className="mt-1 text-lg leading-none">↗</span>
                <p className="handwritten-note max-w-[230px] -rotate-2 text-sm leading-5">No perfect budgets here — just better next steps.</p>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-white/50"><span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#aeb8ed]" /> Private by design</span><span className="inline-flex items-center gap-2"><IndianRupee className="h-4 w-4 text-[#e7dcae]" /> India-ready money context</span><span className="inline-flex items-center gap-2"><Command className="h-4 w-4 text-[#aeb8ed]" /> Command Center</span></div>
            </div>

            <div className="relative mx-auto w-full max-w-[540px] lg:mr-0">
              <div className="absolute -inset-5 rounded-[2.25rem] bg-[#5867bb]/20 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/15 bg-white/[0.08] p-3 shadow-[0_28px_90px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                <div className="rounded-[1.5rem] bg-[#f8f7f4] p-5 text-[#222d4b] sm:p-6">
                  <div className="flex items-center justify-between border-b border-[#e7e8ee] pb-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a91a0]">August 2026</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Your money, in motion.</h2></div><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9eefb] text-[#5867bb]"><WalletCards className="h-5 w-5" /></span></div>
                  <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#222d4b] p-4 text-white"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">Available balance</p><p className="mt-3 text-2xl font-semibold tabular-nums">₹48,260</p><p className="mt-2 text-[10px] font-semibold text-[#aeb8ed]">Live money snapshot</p></div><div className="rounded-2xl border border-[#e7e8ee] bg-white p-4"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8a91a0]">Saved this month</p><p className="mt-3 text-2xl font-semibold tabular-nums">₹12,400</p><p className="mt-2 text-[10px] font-semibold text-[#bf7864]">Goal momentum</p></div></div>
                  <div className="mt-5 rounded-2xl border border-[#e7e8ee] bg-white p-4"><div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8a91a0]">Cash-flow pulse</p><p className="mt-1 text-sm font-bold">A little more room to breathe</p></div><TrendingUp className="h-5 w-5 text-[#5867bb]" /></div><div className="mt-5 flex h-20 items-end gap-2">{[34, 50, 40, 62, 54, 78, 68, 88, 74, 95].map((height, index) => <span key={index} className={`flex-1 rounded-t-md ${index > 6 ? 'bg-[#5867bb]' : 'bg-[#c7cdef]'}`} style={{ height: `${height}%` }} />)}</div></div>
                  <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#eef0fb] p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5867bb] text-[#dfe4ff]"><Sparkles className="h-4 w-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#5867bb]">DhanSetu insight</p><p className="mt-1 text-xs font-bold leading-5 text-[#222d4b]">Your next best move is consistency, not restriction.</p><p className="mt-1 text-[11px] leading-5 text-slate-500">Once your pattern is clear, review your top category every Sunday.</p></div></div>
                </div>
              </div>
              <div className="absolute -bottom-7 -left-5 hidden items-center gap-3 rounded-2xl border border-white/15 bg-[#2d3a60] px-4 py-3 text-white shadow-xl sm:flex"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7dcae] text-[#222d4b]"><Target className="h-4 w-4" /></span><span><span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">Goal accelerator</span><span className="mt-1 block text-xs font-bold">₹2,500 closer to your next milestone</span></span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="why-dhansetu" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5867bb]">Why DhanSetu</p><h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-[-0.055em] text-[#222d4b] sm:text-5xl">Money clarity should feel like a relief.</h2></div><div className="max-w-2xl"><p className="text-lg leading-8 text-slate-500">Most finance tools show you what happened. DhanSetu AI helps you understand what it means and decide what to do next — with thoughtful defaults, Indian rupee context, and a workspace that keeps your attention on progress.</p><div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-[#e7e8ee] bg-white p-5"><p className="text-3xl font-semibold tracking-tight text-[#222d4b]">01</p><p className="mt-3 text-sm font-bold text-slate-800">See clearly</p><p className="mt-1 text-xs leading-5 text-slate-500">One calm view of the money that matters.</p></div><div className="rounded-2xl border border-[#e7e8ee] bg-white p-5"><p className="text-3xl font-semibold tracking-tight text-[#5867bb]">02</p><p className="mt-3 text-sm font-bold text-slate-800">Ask better</p><p className="mt-1 text-xs leading-5 text-slate-500">Prompts grounded in your real context.</p></div><div className="rounded-2xl border border-[#e7e8ee] bg-white p-5"><p className="text-3xl font-semibold tracking-tight text-[#bf7864]">03</p><p className="mt-3 text-sm font-bold text-slate-800">Move forward</p><p className="mt-1 text-xs leading-5 text-slate-500">Small actions that keep goals alive.</p></div></div></div></div>
      </section>

      <section id="features" className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5867bb]">The DhanSetu advantage</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-[#222d4b] sm:text-5xl">A finance system with a human pulse.</h2></div><p className="max-w-sm text-sm leading-6 text-slate-500">Purposeful tools, connected by one calm visual language and one clear idea: progress is built one decision at a time.</p></div><div className="mt-12 grid gap-4 lg:grid-cols-3">{featureCards.map(({ icon: Icon, eyebrow, title, description, tone }) => <article key={title} className="group rounded-[1.5rem] border border-[#e7e8ee] bg-[#f8f7f4] p-6 transition hover:-translate-y-1 hover:border-[#cbd2f0] hover:shadow-[0_18px_38px_rgba(34,45,75,0.08)] sm:p-7"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone === 'cobalt' ? 'bg-[#e9eefb] text-[#5867bb]' : tone === 'lavender' ? 'bg-[#eef0fb] text-[#6c76b4]' : 'bg-[#f7efe7] text-[#bf7864]'}`}><Icon className="h-5 w-5" /></div><p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{eyebrow}</p><h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-[#222d4b]">{title}</h3><p className="mt-4 text-sm leading-6 text-slate-500">{description}</p><span className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-[#5867bb]">Explore the idea <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></article>)}</div></div></section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="rounded-[2rem] bg-[#eef0fb] p-7 sm:p-10 lg:p-14"><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5867bb]">How it works</p><h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-[-0.055em] text-[#222d4b]">A lighter way to stay in control.</h2><p className="mt-5 max-w-md text-sm leading-6 text-slate-600">Start with what you already know. DhanSetu makes the next layer of clarity feel natural.</p><button type="button" onClick={() => navigate('/')} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#222d4b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#3e4c91]">Open your workspace <ArrowRight className="h-4 w-4" /></button></div><div className="space-y-4">{workflow.map(([number, title, description]) => <div key={number} className="flex items-start gap-5 rounded-2xl border border-white/70 bg-white/70 p-5"><span className="text-sm font-bold tabular-nums text-[#5867bb]">{number}</span><div><h3 className="text-base font-bold text-[#222d4b]">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div><Check className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-[#5867bb]" /></div>)}</div></div></div></section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28"><div className="relative overflow-hidden rounded-[2rem] bg-[#222d4b] px-7 py-12 text-center text-white sm:px-12 sm:py-16"><div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full border-[28px] border-[#dfe4ff]/10" /><div className="pointer-events-none absolute -bottom-24 -right-14 h-64 w-64 rounded-full border-[28px] border-[#5867bb]/25" /><div className="relative mx-auto max-w-2xl"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 p-2 ring-1 ring-white/15"><img src="/dhansetu-logo.png" alt="DhanSetu AI logo" className="h-full w-full object-contain" /></span><p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#dfe4ff]/70">Your money has a direction.</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Build a calmer financial future.</h2><p className="mt-5 text-sm leading-6 text-white/65">Bring your transactions, questions, and goals into one workspace designed to help you keep going.</p><button type="button" onClick={() => navigate('/')} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#dfe4ff] px-5 py-3.5 text-sm font-bold text-[#222d4b] transition hover:bg-white">Start with DhanSetu AI <ArrowRight className="h-4 w-4" /></button></div></div></section>

      <footer className="border-t border-[#e7e8ee] px-5 py-8 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2.5"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#222d4b] p-1"><img src="/dhansetu-logo.png" alt="" className="h-full w-full object-contain" /></span><span className="font-bold text-[#222d4b]">DhanSetu AI</span><span>· Aapke Paiso Ka Smart Saathi</span></div><p>© 2026 DhanSetu AI. Built for calmer money decisions.</p></div></footer>
    </main>
  );
}
