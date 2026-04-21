"use client";

import { useVireonStore, type ActiveSection } from "@/store/vireon-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Dumbbell,
  Code2,
  Bot,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useSyncExternalStore } from "react";
import Image from "next/image";

const NAV_ITEMS: { id: ActiveSection; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "study", label: "Study Planner", icon: <BookOpen size={20} /> },
  { id: "goals", label: "Daily Goals", icon: <Target size={20} /> },
  { id: "gym", label: "Gym Routine", icon: <Dumbbell size={20} /> },
  { id: "compiler", label: "Code Compiler", icon: <Code2 size={20} /> },
  { id: "helper", label: "Vireon Bro", icon: <Bot size={20} /> },
  { id: "overview", label: "Overview", icon: <CalendarDays size={20} /> },
];

const emptySubscribe = () => () => {};

export function Sidebar() {
  const { activeSection, setActiveSection, sidebarOpen, setSidebarOpen } =
    useVireonStore();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl bg-card/90 backdrop-blur-sm border border-border shadow-lg hover:opacity-80 transition-opacity"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} className="text-foreground" /> : <Menu size={20} className="text-foreground" />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-[260px]",
          "bg-sidebar border-r border-sidebar-border",
          "flex flex-col py-6 px-3",
          "transition-all duration-300 ease-in-out",
          "dark:bg-gradient-to-b dark:from-[#060d1b] dark:via-[#081425] dark:to-[#0a1a30]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:z-auto"
        )}
      >
        {/* Subtle blue glow at top (dark mode only) */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 px-3 mb-8 relative z-10">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden vireon-glow flex items-center justify-center bg-primary">
            <Image
              src="/logo.png"
              alt="Vireon Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Vireon
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
              CSE Productivity Hub
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 relative z-10">
          {NAV_ITEMS.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                "transition-all duration-200 group relative overflow-hidden",
                activeSection === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
              {activeSection === item.id && (
                <Sparkles size={14} className="relative z-10 ml-auto opacity-70" />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="mt-auto px-3 relative z-10">
          <div className="h-px bg-sidebar-border mb-4" />
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
              "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              "transition-all duration-200"
            )}
          >
            {mounted && theme === "dark" ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
            <span>{mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
