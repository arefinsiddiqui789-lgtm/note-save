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
  Clock,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useSyncExternalStore, useState, useEffect } from "react";
import Image from "next/image";

interface NavItem {
  id: ActiveSection;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={17} />, color: "bg-blue-500/15 text-blue-400 dark:text-blue-400" },
  { id: "study", label: "Study Planner", icon: <BookOpen size={17} />, color: "bg-emerald-500/15 text-emerald-400 dark:text-emerald-400" },
  { id: "goals", label: "Daily Goals", icon: <Target size={17} />, color: "bg-teal-500/15 text-teal-400 dark:text-teal-400" },
  { id: "gym", label: "Gym Routine", icon: <Dumbbell size={17} />, color: "bg-rose-500/15 text-rose-400 dark:text-rose-400" },
  { id: "compiler", label: "Code Compiler", icon: <Code2 size={17} />, color: "bg-violet-500/15 text-violet-400 dark:text-violet-400" },
  { id: "helper", label: "Vireon Bro", icon: <Bot size={17} />, color: "bg-amber-500/15 text-amber-400 dark:text-amber-400" },
  { id: "overview", label: "Overview", icon: <CalendarDays size={17} />, color: "bg-cyan-500/15 text-cyan-400 dark:text-cyan-400" },
];

const BD_MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const BD_DAYS_EN = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const BD_MONTHS_BN = [
  "বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন",
  "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র",
];

const BD_SEASONS = [
  "গ্রীষ্ম", "বর্ষা", "শরৎ", "হেমন্ত", "শীত", "বসন্ত",
];

// Bengali date approximation
function getSimpleBengaliDate(date: Date) {
  const gDay = date.getDate();
  const gMonth = date.getMonth(); // 0-indexed

  // Mapping: Bengali month starts approximately on these Gregorian dates
  // Boishakh: Apr 14, Joishtha: May 15, Ashar: Jun 15, Shravan: Jul 16
  // Bhadro: Aug 16, Ashwin: Sep 17, Kartik: Oct 17, Agrahayan: Nov 16
  // Poush: Dec 16, Magh: Jan 15, Falgun: Feb 13, Chaitra: Mar 15

  const starts = [
    { gMonth: 0, gDay: 15, bnMonth: 9, name: "মাঘ", daysFromStart: 0 },      // Jan 15 → Magh
    { gMonth: 1, gDay: 13, bnMonth: 10, name: "ফাল্গুন", daysFromStart: 0 },  // Feb 13 → Falgun
    { gMonth: 2, gDay: 15, bnMonth: 11, name: "চৈত্র", daysFromStart: 0 },    // Mar 15 → Chaitra
    { gMonth: 3, gDay: 14, bnMonth: 0, name: "বৈশাখ", daysFromStart: 0 },     // Apr 14 → Boishakh
    { gMonth: 4, gDay: 15, bnMonth: 1, name: "জ্যৈষ্ঠ", daysFromStart: 0 },   // May 15 → Joishtha
    { gMonth: 5, gDay: 15, bnMonth: 2, name: "আষাঢ়", daysFromStart: 0 },     // Jun 15 → Ashar
    { gMonth: 6, gDay: 16, bnMonth: 3, name: "শ্রাবণ", daysFromStart: 0 },    // Jul 16 → Shravan
    { gMonth: 7, gDay: 16, bnMonth: 4, name: "ভাদ্র", daysFromStart: 0 },     // Aug 16 → Bhadro
    { gMonth: 8, gDay: 17, bnMonth: 5, name: "আশ্বিন", daysFromStart: 0 },    // Sep 17 → Ashwin
    { gMonth: 9, gDay: 17, bnMonth: 6, name: "কার্তিক", daysFromStart: 0 },   // Oct 17 → Kartik
    { gMonth: 10, gDay: 16, bnMonth: 7, name: "অগ্রহায়ণ", daysFromStart: 0 }, // Nov 16 → Agrahayan
    { gMonth: 11, gDay: 16, bnMonth: 8, name: "পৌষ", daysFromStart: 0 },      // Dec 16 → Poush
  ];

  const bnYear = gMonth >= 3
    ? date.getFullYear() - 593
    : date.getFullYear() - 594;

  // Find current Bengali month
  const currentStart = starts[gMonth];
  const bnDay = gDay - currentStart.gDay + 1;
  const bnMonthName = currentStart.name;
  const season = BD_SEASONS[Math.floor(currentStart.bnMonth / 2)];

  return { bnDay: Math.max(1, bnDay), bnMonthName, bnYear, season };
}

// Convert number to Bengali digits
function toBengaliDigits(num: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
}

function useBdTime() {
  const [time, setTime] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

const emptySubscribe = () => () => {};

export function Sidebar() {
  const { activeSection, setActiveSection, sidebarOpen, setSidebarOpen } =
    useVireonStore();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const bdTime = useBdTime();

  const hours = bdTime.getHours();
  const minutes = bdTime.getMinutes();
  const seconds = bdTime.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  const dayName = BD_DAYS_EN[bdTime.getDay()];
  const monthName = BD_MONTHS_EN[bdTime.getMonth()];
  const dateNum = bdTime.getDate();
  const year = bdTime.getFullYear();

  const bengaliDate = getSimpleBengaliDate(bdTime);

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
          "fixed top-0 left-0 z-40 h-full w-[250px]",
          "bg-sidebar border-r border-sidebar-border",
          "flex flex-col",
          "transition-all duration-300 ease-in-out",
          "dark:bg-gradient-to-b dark:from-[#050b18] dark:via-[#071220] dark:to-[#091828]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:z-auto"
        )}
      >
        {/* Ambient glow at top */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none" />
        {/* Subtle corner glow */}
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-primary/[0.03] blur-3xl pointer-events-none" />

        {/* ===== LOGO AREA ===== */}
        <div className="relative z-10 px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20 shrink-0">
              <Image
                src="/logo.png"
                alt="Vireon Logo"
                width={30}
                height={30}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-foreground leading-tight">
                Vireon
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide">
                Productivity Hub
              </p>
            </div>
          </div>
        </div>

        {/* ===== BD TIME WIDGET ===== */}
        <div className="relative z-10 mx-3 mb-4">
          <div className="rounded-xl dark:bg-white/[0.03] bg-primary/[0.04] border border-primary/[0.08] p-3">
            {/* Live Clock */}
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-primary shrink-0" />
              <span className="text-[11px] font-semibold text-primary tracking-wide">
                🇧🇩 BANGLADESH TIME
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                {String(displayHours).padStart(2, '0')}
                <span className="text-primary animate-pulse">:</span>
                {String(minutes).padStart(2, '0')}
                <span className="text-primary animate-pulse">:</span>
                {String(seconds).padStart(2, '0')}
              </span>
              <span className="text-xs font-semibold text-muted-foreground ml-1">
                {ampm}
              </span>
            </div>
            {/* English Date */}
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              {dayName}, {monthName} {dateNum}, {year}
            </p>
            {/* Bengali Date */}
            <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-medium">
              {toBengaliDigits(bengaliDate.bnDay)} {bengaliDate.bnMonthName} {toBengaliDigits(bengaliDate.bnYear)} · {bengaliDate.season}
            </p>
          </div>
        </div>

        {/* ===== NAVIGATION ===== */}
        <nav className="flex-1 overflow-y-auto px-3 relative z-10">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl text-left relative",
                    "transition-all duration-200",
                    isActive
                      ? "py-2.5 px-3"
                      : "py-2 px-3 hover:py-2.5"
                  )}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 rounded-xl dark:bg-white/[0.06] bg-primary/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] shadow-[inset_0_1px_0_rgba(59,109,250,0.1)]"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}

                  {/* Icon bubble */}
                  <div
                    className={cn(
                      "relative z-10 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                      isActive
                        ? item.color
                        : "bg-transparent text-sidebar-foreground/35 group-hover:text-sidebar-foreground/60"
                    )}
                  >
                    {item.icon}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "relative z-10 text-[13px] font-medium truncate transition-colors duration-200",
                      isActive
                        ? "text-foreground"
                        : "text-sidebar-foreground/45 hover:text-sidebar-foreground/80"
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Active dot */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-dot"
                      className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* ===== BOTTOM SECTION ===== */}
        <div className="relative z-10 px-3 pb-5">
          {/* Theme toggle card */}
          <div className="rounded-xl dark:bg-white/[0.03] bg-muted/40 p-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium",
                "hover:bg-sidebar-accent/50 transition-all duration-200"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                "bg-amber-500/15 text-amber-400 dark:text-amber-400 dark:bg-amber-500/15",
                mounted && theme !== "dark" && "bg-indigo-500/15 text-indigo-500"
              )}>
                {mounted && theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              </div>
              <span className="text-sidebar-foreground/60">
                {mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </div>

          {/* User info & Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium mt-2",
              "text-sidebar-foreground/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
            )}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-rose-500/10 text-rose-400">
              <LogOut size={17} />
            </div>
            <span>Sign Out</span>
          </button>

          {/* Branding */}
          <p className="text-[10px] text-muted-foreground/25 text-center mt-3 font-medium">
            v1.0 · Built by Arefin
          </p>
        </div>
      </aside>
    </>
  );
}
