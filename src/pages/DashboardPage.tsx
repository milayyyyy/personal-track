import { Link } from 'react-router-dom';
import {
  Bell,
  Calendar,
  ChevronRight,
  Circle,
  CreditCard,
  Droplets,
  ListTodo,
  Moon,
  Plus,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import { useTasks } from '../context/TasksContext';
import { useReminders } from '../context/RemindersContext';
import { formatDisplayTime, useFood } from '../context/FoodContext';
import { MEAL_TYPE_LABELS } from '../types/food';
import { CURRENCY_LIST, formatMoney } from '../components/CurrencyToggle';
import type { Account, Currency } from '../types/finance';

interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  category: string;
}

interface WaterEntry {
  time: string;
  amount: number;
}

interface DashboardPageProps {
  username: string;
  accounts: Account[];
  balanceByCurrency: Partial<Record<Currency, number>>;
  savingsGoals: SavingsGoal[];
  waterCurrent: number;
  waterTarget: number;
  waterHistory: WaterEntry[];
  addWater: (amount: number) => void;
  resetWater: () => void;
  isSleepRunning: boolean;
  sleepSeconds: number;
  formatTime: (seconds: number) => string;
  onAddTransaction: () => void;
  onCreateTask: () => void;
  onCreateReminder: () => void;
  onLogFood: () => void;
}

export default function DashboardPage({
  username,
  accounts,
  balanceByCurrency,
  savingsGoals,
  waterCurrent,
  waterTarget,
  waterHistory,
  addWater,
  resetWater,
  isSleepRunning,
  sleepSeconds,
  formatTime,
  onAddTransaction,
  onCreateTask,
  onCreateReminder,
  onLogFood,
}: DashboardPageProps) {
  const { tasks, pendingCount: taskPendingCount, toggleTask } = useTasks();
  const { reminders, pendingCount: reminderPendingCount, toggleReminder } = useReminders();
  const { todayEntries, todayCalories, entries } = useFood();
  const waterPercent = Math.min(Math.round((waterCurrent / waterTarget) * 100), 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Welcome Back, {username} <span className="text-xl">👋</span>
          </h2>
          <p className="text-slate-400 text-sm">Quick access to your finances, tasks, and wellness habits.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800 text-xs">
          <Calendar className="h-4 w-4 text-indigo-400" />
          <span className="text-slate-300 font-medium">{new Date().toDateString()}</span>
        </div>
      </div>

      {/* Quick shortcut buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={onAddTransaction}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-600/15 border border-emerald-500/30 hover:bg-emerald-600/25 transition-all active:scale-95"
        >
          <div className="p-2.5 rounded-xl bg-emerald-500/20">
            <Plus className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-xs font-bold text-emerald-300">Add Transaction</span>
        </button>

        <button
          type="button"
          onClick={onCreateTask}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 hover:bg-indigo-600/25 transition-all active:scale-95"
        >
          <div className="p-2.5 rounded-xl bg-indigo-500/20">
            <ListTodo className="h-5 w-5 text-indigo-400" />
          </div>
          <span className="text-xs font-bold text-indigo-300">Create Task</span>
        </button>

        <button
          type="button"
          onClick={onCreateReminder}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-rose-600/15 border border-rose-500/30 hover:bg-rose-600/25 transition-all active:scale-95"
        >
          <div className="p-2.5 rounded-xl bg-rose-500/20">
            <Bell className="h-5 w-5 text-rose-400" />
          </div>
          <span className="text-xs font-bold text-rose-300">New Reminder</span>
        </button>

        <button
          type="button"
          onClick={onLogFood}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-amber-600/15 border border-amber-500/30 hover:bg-amber-600/25 transition-all active:scale-95"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/20">
            <UtensilsCrossed className="h-5 w-5 text-amber-400" />
          </div>
          <span className="text-xs font-bold text-amber-300">Log Food</span>
        </button>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Net Worth</span>
            <h3 className="text-2xl font-bold text-white mt-1">
              {CURRENCY_LIST.filter(c => balanceByCurrency[c.value] != null).map((c, i) => (
                <span key={c.value} className={i > 0 ? 'block text-lg mt-0.5' : ''}>
                  {formatMoney(balanceByCurrency[c.value]!, c.value)}
                </span>
              ))}
            </h3>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> Healthy Account Balance
            </p>
          </div>
          <div className="bg-emerald-500/10 p-3.5 rounded-xl">
            <Wallet className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hydration State</span>
            <h3 className="text-2xl font-bold text-white mt-1">{waterCurrent} ml</h3>
            <p className="text-[10px] text-blue-400 mt-1">Goal: {waterTarget} ml</p>
          </div>
          <div className="bg-blue-500/10 p-3.5 rounded-xl">
            <Droplets className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sleep Session</span>
            <h3 className="text-2xl font-bold text-white mt-1">
              {isSleepRunning ? formatTime(sleepSeconds) : 'Idle'}
            </h3>
            <Link to="/wellness" className="text-[10px] text-indigo-400 hover:underline mt-1">
              Open wellness page →
            </Link>
          </div>
          <div className={`p-3.5 rounded-xl ${isSleepRunning ? 'bg-indigo-500/20 animate-pulse' : 'bg-indigo-500/10'}`}>
            <Moon className="h-6 w-6 text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Tasks</span>
            <h3 className="text-2xl font-bold text-white mt-1">{taskPendingCount}</h3>
            <Link to="/tasks" className="text-[10px] text-indigo-400 hover:underline mt-1">
              View all tasks →
            </Link>
          </div>
          <div className="bg-indigo-500/10 p-3.5 rounded-xl">
            <ListTodo className="h-6 w-6 text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Reminders</span>
            <h3 className="text-2xl font-bold text-white mt-1">{reminderPendingCount}</h3>
            <Link to="/reminders" className="text-[10px] text-rose-400 hover:underline mt-1">
              View all reminders →
            </Link>
          </div>
          <div className="bg-rose-500/10 p-3.5 rounded-xl">
            <Bell className="h-6 w-6 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900/30 rounded-2xl p-6 border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-white">My Accounts & Wealth</h4>
              <p className="text-slate-400 text-xs">Total assets and banks summary</p>
            </div>
            <Link to="/finance" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              Manage Accounts <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className={`bg-gradient-to-br ${acc.color} p-4 rounded-xl text-white shadow-lg`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full">{acc.type}</span>
                  <CreditCard className="h-4 w-4 opacity-75" />
                </div>
                <h5 className="text-xs font-semibold opacity-90 mt-4">{acc.name}</h5>
                <p className="text-lg font-bold mt-1">{formatMoney(acc.balance, acc.currency)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Savings Goal Progress</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savingsGoals.map(goal => {
                const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
                return (
                  <div key={goal.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-slate-200">{goal.name}</span>
                      <span className="text-indigo-400 font-bold">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                      <span>₱{goal.current} saved</span>
                      <span>Target: ₱{goal.target}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-900/30 rounded-2xl p-6 border border-slate-800/80 space-y-6">
          <div>
            <h4 className="text-lg font-bold text-white">Tasks & Reminders</h4>
            <p className="text-slate-400 text-xs">Your upcoming to-dos, alerts, and food at a glance</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Upcoming Tasks</h5>
              <Link to="/tasks" className="text-[10px] text-indigo-400 hover:underline">
                See All ({tasks.length})
              </Link>
            </div>
            <div className="space-y-2">
              {tasks.filter(t => !t.completed).slice(0, 2).map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800 cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <Circle className="h-4 w-4 text-slate-500" />
                    <span className="text-xs text-slate-200 font-medium">{task.text}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold ${
                    task.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                    task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Upcoming Reminders</h5>
              <Link to="/reminders" className="text-[10px] text-rose-400 hover:underline">
                See All ({reminders.length})
              </Link>
            </div>
            <div className="space-y-2">
              {reminders.filter(r => !r.completed).slice(0, 2).map(reminder => (
                <div
                  key={reminder.id}
                  onClick={() => toggleReminder(reminder.id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800 cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="h-4 w-4 text-rose-400" />
                    <span className="text-xs text-slate-200 font-medium">{reminder.text}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">{reminder.remindAt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Today&apos;s Food</h5>
              <Link to="/food" className="text-[10px] text-amber-400 hover:underline">
                See All ({entries.length})
              </Link>
            </div>
            {todayCalories > 0 && (
              <p className="text-[10px] text-amber-400/80">{todayCalories} kcal logged today</p>
            )}
            <div className="space-y-2">
              {todayEntries.slice(0, 3).map(entry => (
                <Link
                  key={entry.id}
                  to="/food"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800 transition-all"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <UtensilsCrossed className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-xs text-slate-200 font-medium truncate">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] text-slate-500">{MEAL_TYPE_LABELS[entry.mealType]}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{formatDisplayTime(entry.time)}</span>
                  </div>
                </Link>
              ))}
              {todayEntries.length === 0 && (
                <button
                  type="button"
                  onClick={onLogFood}
                  className="w-full p-3 rounded-lg border border-dashed border-slate-700 text-xs text-slate-500 hover:text-amber-400 hover:border-amber-500/30 transition-all"
                >
                  No food logged today — tap to add
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Water Logger */}
      <div className="bg-slate-900/30 rounded-2xl p-6 border border-slate-800/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-400" /> Daily Water Logger
            </h4>
            <p className="text-slate-400 text-xs">Track your hydration and hit your daily goal.</p>
          </div>
          <Link
            to="/wellness"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 self-start"
          >
            Full Wellness Page <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="relative w-full h-48 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-end justify-center">
              <div
                className="absolute left-0 right-0 bg-gradient-to-t from-blue-700 to-blue-500/80 transition-all duration-500"
                style={{ height: `${waterPercent}%` }}
              >
                <div className="absolute -top-3 w-full h-3 bg-blue-500/40 animate-pulse rounded-full opacity-60" />
              </div>
              <div className="z-10 text-center mb-6 text-white text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <span className="text-3xl font-bold tracking-tight">{waterCurrent} ml</span>
                <p className="text-[10px] uppercase font-bold text-blue-200 mt-1">
                  {waterPercent}% of {waterTarget} ml goal
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => addWater(250)}
                className="bg-blue-600/10 hover:bg-blue-600/25 text-blue-300 font-bold py-2.5 rounded-xl text-xs border border-blue-500/25 active:scale-95 transition-all"
              >
                +250ml
                <span className="block text-[9px] font-medium text-blue-300/70 mt-0.5">Cup</span>
              </button>
              <button
                type="button"
                onClick={() => addWater(500)}
                className="bg-blue-600/20 hover:bg-blue-600/35 text-blue-200 font-bold py-2.5 rounded-xl text-xs border border-blue-500/35 active:scale-95 transition-all"
              >
                +500ml
                <span className="block text-[9px] font-medium text-blue-200/70 mt-0.5">Bottle</span>
              </button>
              <button
                type="button"
                onClick={() => addWater(750)}
                className="bg-blue-600/30 hover:bg-blue-600/45 text-blue-100 font-bold py-2.5 rounded-xl text-xs border border-blue-500/45 active:scale-95 transition-all"
              >
                +750ml
                <span className="block text-[9px] font-medium text-blue-100/70 mt-0.5">Large</span>
              </button>
            </div>

            <button
              type="button"
              onClick={resetWater}
              className="w-full border border-slate-800 text-slate-400 hover:text-slate-200 text-xs py-2 rounded-xl transition-all"
            >
              Reset Daily Tracker
            </button>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Today&apos;s Intake Log</h5>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {waterHistory.map((entry, index) => (
                <div
                  key={`${entry.time}-${entry.amount}-${index}`}
                  className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs"
                >
                  <span className="text-slate-400">{entry.time}</span>
                  <span className="font-bold text-blue-400">+{entry.amount} ml</span>
                </div>
              ))}
              {waterHistory.length === 0 && (
                <div className="text-center py-8 bg-slate-900/10 rounded-xl border border-dashed border-slate-800">
                  <p className="text-sm text-slate-500">No water logged today — tap a button above to start.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
