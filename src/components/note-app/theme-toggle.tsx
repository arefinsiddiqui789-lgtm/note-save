'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // resolvedTheme is undefined during SSR, use it for safe client detection
  if (!resolvedTheme) {
    return (
      <Button variant="ghost" size="icon" className="h-7 w-7">
        <span className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[11px] bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
          {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
