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
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useSyncExternalStore } from "react";
import Image from "next/image";

interface NavItem {
  id: ActiveSection;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "General",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
      { id: "overview", label: "Overview", icon: <CalendarDays size={18} /> },
    ],
  },
  {
    title: "Productivity",
    items: [
      { id: "study", label: "Study Planner", icon: <BookOpen size={18} /> },
      { id: "goals", label: "Daily Goals", icon: <Target size={18} /> },
      { id: "gym", label: "Gym Routine", icon: <Dumbbell size={18} /> },
    ],
  },
  {
    title: "Tools",
    items: [
      { id: "compiler", label: "Code Compiler", icon: <Code2 size={18} /> },
      { id: "helper", label: "Vireon Bro", icon: <Bot size={18} /> },
    ],
  },
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
          "flex flex-col py-5 px-3",
          "transition-all duration-300 ease-in-out",
          "dark:bg-gradient-to-b dark:from-[#060d1b] dark:via-[#081425] dark:to-[#0a1a30]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:z-auto"
        )}
      >
        {/* Subtle glow at top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />

        {/* Logo Section */}
        <div className="flex items-center gap-3 px-3 mb-6 relative z-10">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden vireon-glow flex items-center justify-center bg-primary shrink-0">
            <Image
              src="/logo.png"
              alt="Vireon Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
              Vireon
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
              CSE Productivity Hub
            </p>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto space-y-5 relative z-10 scrollbar-none">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {/* Group Label */}
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {group.title}
              </p>

              {/* Group Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium",
                        "transition-all duration-200 relative group",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}

                      {/* Icon */}
                      <span className={cn(
                        "shrink-0 transition-colors duration-200",
                        isActive ? "text-primary" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
                      )}>
                        {item.icon}
                      </span>

                      {/* Label */}
                      <span className="truncate">{item.label}</span>

                      {/* Active chevron */}
                      {isActive && (
                        <ChevronRight size={14} className="ml-auto opacity-40 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto relative z-10">
          {/* Divider */}
          <div className="h-px bg-sidebar-border/60 mx-3 mb-3" />

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium",
              "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
              "transition-all duration-200"
            )}
          >
            <span className="shrink-0 text-sidebar-foreground/40">
              {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </span>
            <span>{mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>

          {/* Version badge */}
          <div className="px-3 mt-2">
            <p className="text-[10px] text-muted-foreground/30 text-center">
              v1.0.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
