"use client";

import { useState, useMemo } from "react";
import { useVireonStore, DAYS_OF_WEEK, type GymExercise } from "@/store/vireon-store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dumbbell,
  Plus,
  Trash2,
  Check,
  Circle,
  Flame,
  Activity,
  Heart,
  Timer,
  Trophy,
} from "lucide-react";

// Quick preset exercises
const EXERCISE_PRESETS = [
  { name: "Push-ups", sets: 3, reps: 15, icon: "💪" },
  { name: "Pull-ups", sets: 3, reps: 10, icon: "🏋️" },
  { name: "Squats", sets: 3, reps: 15, icon: "🦵" },
  { name: "Plank", sets: 3, reps: 60, icon: "🧘" },
  { name: "Running", sets: 1, reps: 30, icon: "🏃" },
  { name: "Crunches", sets: 3, reps: 20, icon: "🔥" },
  { name: "Deadlift", sets: 4, reps: 8, icon: "🏋️" },
  { name: "Bench Press", sets: 4, reps: 10, icon: "💪" },
];

function getTodayDayOfWeek(): number {
  return new Date().getDay();
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function getWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function GymRoutineSection() {
  const {
    gymExercises,
    gymLogs,
    addGymExercise,
    toggleGymExercise,
    deleteGymExercise,
    toggleGymLog,
  } = useVireonStore();

  const today = getTodayDayOfWeek();
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[today]);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseSets, setExerciseSets] = useState("3");
  const [exerciseReps, setExerciseReps] = useState("10");
  const [exerciseDay, setExerciseDay] = useState<string>(DAYS_OF_WEEK[today]);

  // Get exercises for the selected day
  const selectedDayIndex = DAYS_OF_WEEK.indexOf(selectedDay);
  const dayExercises = useMemo(
    () => gymExercises.filter((e) => e.dayOfWeek === selectedDayIndex),
    [gymExercises, selectedDayIndex]
  );

  // Weekly consistency data
  const weekDates = useMemo(() => getWeekDates(), []);
  const completedDaysCount = weekDates.filter(
    (date) => gymLogs[date]
  ).length;

  // Check if today is already logged
  const todayStr = getTodayDateString();
  const isTodayLogged = gymLogs[todayStr] || false;

  // Handle add exercise
  const handleAddExercise = () => {
    const name = exerciseName.trim();
    if (!name) return;
    const dayIndex = DAYS_OF_WEEK.indexOf(exerciseDay);
    addGymExercise({
      name,
      sets: parseInt(exerciseSets) || 3,
      reps: parseInt(exerciseReps) || 10,
      dayOfWeek: dayIndex,
      completed: false,
    });
    setExerciseName("");
    setExerciseSets("3");
    setExerciseReps("10");
  };

  // Handle quick preset add
  const handlePresetAdd = (preset: (typeof EXERCISE_PRESETS)[number]) => {
    const dayIndex = DAYS_OF_WEEK.indexOf(exerciseDay);
    addGymExercise({
      name: preset.name,
      sets: preset.sets,
      reps: preset.reps,
      dayOfWeek: dayIndex,
      completed: false,
    });
  };

  // Handle mark day complete
  const handleMarkDayComplete = () => {
    toggleGymLog(todayStr);
  };

  // Stats
  const totalExercisesToday = gymExercises.filter(
    (e) => e.dayOfWeek === today
  ).length;
  const completedExercisesToday = gymExercises.filter(
    (e) => e.dayOfWeek === today && e.completed
  ).length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start gap-4"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0"
        >
          <Dumbbell size={28} />
        </motion.div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Gym Routine
          </h2>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
            <Heart size={14} className="text-emerald-500" />
            Stay fit, code better
          </p>
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Activity size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today&apos;s Exercises</p>
              <p className="text-lg font-bold">{totalExercisesToday}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Check size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-lg font-bold">{completedExercisesToday}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Flame size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="text-lg font-bold">{completedDaysCount}/7</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Trophy size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-lg font-bold">
                {completedDaysCount > 0 ? `${completedDaysCount} day${completedDaysCount > 1 ? "s" : ""}` : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Consistency Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Timer size={16} className="text-emerald-500" />
              Weekly Consistency
            </CardTitle>
            <CardDescription>
              {completedDaysCount}/7 days this week •{" "}
              {Math.round((completedDaysCount / 7) * 100)}% consistency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, i) => {
                const isCompleted = gymLogs[date];
                const isCurrentDay = date === todayStr;
                const dayLabel = DAYS_OF_WEEK[i].slice(0, 3);
                const dateObj = new Date(date + "T00:00:00");
                const dateNum = dateObj.getDate();

                return (
                  <motion.div
                    key={date}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
                      isCompleted
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : isCurrentDay
                        ? "bg-primary/5 border border-primary/20 text-foreground"
                        : "bg-muted/50 text-muted-foreground border border-transparent"
                    )}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      {dayLabel}
                    </span>
                    <motion.div
                      initial={false}
                      animate={{ scale: isCompleted ? 1 : 0.85 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isCurrentDay
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check size={14} />
                      ) : (
                        dateNum
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedDaysCount / 7) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mark Day Complete */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleMarkDayComplete}
            variant={isTodayLogged ? "default" : "outline"}
            className={cn(
              "w-full h-12 text-base font-semibold transition-all duration-300 gap-2",
              isTodayLogged
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                : "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
            )}
          >
            <AnimatePresence mode="wait">
              {isTodayLogged ? (
                <motion.span
                  key="done"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center gap-2"
                >
                  <Check size={20} />
                  Workout Logged Today!
                </motion.span>
              ) : (
                <motion.span
                  key="mark"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Flame size={20} />
                  Mark Today&apos;s Workout Complete
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>

      {/* Day Tabs + Exercise List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell size={18} className="text-emerald-500" />
              Exercises by Day
            </CardTitle>
            <CardDescription>
              Plan your weekly workout schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={selectedDay}
              onValueChange={setSelectedDay}
              className="w-full"
            >
              <TabsList className="w-full flex overflow-x-auto mb-4 h-auto p-1 gap-0.5">
                {DAYS_OF_WEEK.map((day, i) => {
                  const exerciseCount = gymExercises.filter(
                    (e) => e.dayOfWeek === i
                  ).length;
                  const isToday = i === today;

                  return (
                    <TabsTrigger
                      key={day}
                      value={day}
                      className={cn(
                        "flex-1 min-w-[60px] px-1.5 py-2 text-xs md:text-sm flex-col gap-0.5 h-auto relative",
                        isToday && "ring-1 ring-emerald-500/50"
                      )}
                    >
                      <span className="font-medium">{day.slice(0, 3)}</span>
                      {exerciseCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="h-4 min-w-4 px-1 text-[10px]"
                        >
                          {exerciseCount}
                        </Badge>
                      )}
                      {isToday && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {DAYS_OF_WEEK.map((day) => (
                <TabsContent key={day} value={day}>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-2"
                  >
                    <AnimatePresence>
                      {gymExercises
                        .filter(
                          (e) => e.dayOfWeek === DAYS_OF_WEEK.indexOf(day)
                        )
                        .length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center py-8 text-muted-foreground"
                        >
                          <Circle size={32} className="mb-2 opacity-30" />
                          <p className="text-sm">No exercises planned</p>
                          <p className="text-xs mt-1">
                            Add exercises or use quick presets below
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {gymExercises
                        .filter(
                          (e) => e.dayOfWeek === DAYS_OF_WEEK.indexOf(day)
                        )
                        .map((exercise) => (
                          <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            onToggle={toggleGymExercise}
                            onDelete={deleteGymExercise}
                          />
                        ))}
                    </AnimatePresence>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Exercise Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus size={18} className="text-emerald-500" />
              Add Exercise
            </CardTitle>
            <CardDescription>
              Create a custom exercise for your routine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                  Exercise Name
                </label>
                <Input
                  placeholder="e.g. Push-ups"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddExercise()}
                  className="h-10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                  Sets
                </label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={exerciseSets}
                  onChange={(e) => setExerciseSets(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddExercise()}
                  className="h-10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                  Reps
                </label>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={exerciseReps}
                  onChange={(e) => setExerciseReps(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddExercise()}
                  className="h-10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                  Day
                </label>
                <select
                  value={exerciseDay}
                  onChange={(e) => setExerciseDay(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full"
                >
                  <Button
                    onClick={handleAddExercise}
                    disabled={!exerciseName.trim()}
                    className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Add
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Presets */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame size={18} className="text-emerald-500" />
              Quick Presets
            </CardTitle>
            <CardDescription>
              Tap to add common exercises to{" "}
              <span className="font-medium text-foreground">{exerciseDay}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EXERCISE_PRESETS.map((preset, i) => (
                <motion.button
                  key={preset.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.04 * i }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handlePresetAdd(preset)}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border text-left",
                    "bg-card hover:bg-emerald-500/5 border-border hover:border-emerald-500/30",
                    "transition-all duration-200 group"
                  )}
                >
                  <span className="text-lg shrink-0">{preset.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {preset.sets}×{preset.reps}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Individual exercise card component
function ExerciseCard({
  exercise,
  onToggle,
  onDelete,
}: {
  exercise: GymExercise;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      variants={itemVariants}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
          exercise.completed
            ? "bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/10"
            : "bg-card border-border hover:border-emerald-500/20"
        )}
      >
        <Checkbox
          checked={exercise.completed}
          onCheckedChange={() => onToggle(exercise.id)}
          className={cn(
            "shrink-0",
            exercise.completed &&
              "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          )}
        />
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium transition-all duration-300",
              exercise.completed
                ? "line-through text-emerald-600/60 dark:text-emerald-400/60"
                : "text-foreground"
            )}
          >
            {exercise.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="inline-flex items-center gap-1">
              <Timer size={10} />
              {exercise.sets} sets × {exercise.reps} reps
            </span>
          </p>
        </div>
        {exercise.completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
              <Check size={10} />
              Done
            </Badge>
          </motion.div>
        )}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(exercise.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            <Trash2 size={14} />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
