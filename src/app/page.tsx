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
import { useVireonStore } from "@/store/vireon-store";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const { activeSection } = useVireonStore();

  const sectionComponents: Record<string, React.ReactNode> = {
    dashboard: <DashboardSection />,
    study: <StudyPlannerSection />,
    goals: <DailyGoalsSection />,
    gym: <GymRoutineSection />,
    compiler: <CodeCompilerSection />,
    helper: <SmartHelperSection />,
    overview: <OverviewSection />,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
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
