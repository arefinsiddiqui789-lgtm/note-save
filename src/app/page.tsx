"use client";

import { Sidebar } from "@/components/vireon/sidebar";
import { DashboardSection } from "@/components/vireon/dashboard";
import { StudyPlannerSection } from "@/components/vireon/study-planner";
import { DailyGoalsSection } from "@/components/vireon/daily-goals";
import { GymRoutineSection } from "@/components/vireon/gym-routine";
import { CodeCompilerSection } from "@/components/vireon/code-compiler";
import { SmartHelperSection } from "@/components/vireon/smart-helper";
import { OverviewSection } from "@/components/vireon/overview";
import { Footer } from "@/components/vireon/footer";
import { AuthPage } from "@/components/vireon/auth-page";
import { useVireonStore } from "@/store/vireon-store";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";

export default function Home() {
  const { activeSection } = useVireonStore();
  const { data: session, status } = useSession();

  const sectionComponents: Record<string, React.ReactNode> = {
    dashboard: <DashboardSection />,
    study: <StudyPlannerSection />,
    goals: <DailyGoalsSection />,
    gym: <GymRoutineSection />,
    compiler: <CodeCompilerSection />,
    helper: <SmartHelperSection />,
    overview: <OverviewSection />,
  };

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 shadow-xl shadow-primary/30">
            <img src="/logo.png" alt="Vireon" className="w-8 h-8 object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
          </div>
        </motion.div>
      </div>
    );
  }

  // Not authenticated — show auth page
  if (status === "unauthenticated" || !session) {
    return <AuthPage />;
  }

  // Authenticated — show main app
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="min-h-[calc(100vh-60px)]"
            >
              {sectionComponents[activeSection]}
            </motion.div>
          </AnimatePresence>
          <Footer />
        </main>
      </div>
    </div>
  );
}
