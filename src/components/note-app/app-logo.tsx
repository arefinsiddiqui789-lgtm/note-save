'use client';

export default function AppLogo({ collapsed = false }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      <div className="flex items-center justify-center py-3">
        <div className="relative h-9 w-9 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl rotate-6 opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl -rotate-6 opacity-60" />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl h-9 w-9 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M12 18v-6" />
              <path d="M9 15h6" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="relative h-10 w-10 flex items-center justify-center flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl rotate-6 opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl -rotate-6 opacity-60" />
        <div className="relative bg-white dark:bg-slate-900 rounded-xl h-10 w-10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-5.5 w-5.5 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M12 18v-6" />
            <path d="M9 15h6" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-base font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent leading-tight">
          Save Note
        </h1>
        <span className="text-[10px] text-slate-400 dark:text-slate-600 font-medium tracking-wide">NOTES MANAGER</span>
      </div>
    </div>
  );
}
