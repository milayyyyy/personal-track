import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTasks } from './context/TasksContext';
import { useReminders } from './context/RemindersContext';
import { useFood } from './context/FoodContext';
import { getUserInitials } from './lib/auth';
import { loadUserSection, saveUserSection } from './lib/userStorage';
import { DEFAULT_ACCOUNTS, DEFAULT_TRANSACTIONS, DEFAULT_TRANSACTION_CATEGORIES } from './lib/defaults';
import TransactionCategoryManager from './components/TransactionCategoryManager';
import TasksPage from './pages/TasksPage';
import RemindersPage from './pages/RemindersPage';
import FoodPage from './pages/FoodPage';
import DashboardPage from './pages/DashboardPage';
import AddTransactionModal from './components/modals/AddTransactionModal';
import QuickTaskModal from './components/modals/QuickTaskModal';
import QuickReminderModal from './components/modals/QuickReminderModal';
import QuickFoodModal from './components/modals/QuickFoodModal';
import OfflineStatusBanner from './components/OfflineStatusBanner';
import { CURRENCY_LIST, CurrencyToggle, formatMoney } from './components/CurrencyToggle';
import type { Account, Currency, Transaction, TransactionCategory } from './types/finance';
import type { Priority } from './types/tasks';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Moon,
  Flame,
  Droplets,
  Bell,
  ListTodo,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  PlusCircle,
  AlertCircle,
  LogOut,
  UtensilsCrossed,
} from 'lucide-react';

type TxType = 'income' | 'expense';
type SleepMode = 'timer' | 'manual';
type FastingMode = 'fast' | 'eat';

interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  category: string;
}

interface SleepLog {
  id: string;
  date: string;
  duration: string;
  score: number;
  timeRange: string;
}

interface FastingLog {
  id: string;
  date: string;
  duration: string;
  type: 'Fast' | 'Eat';
  timeRange: string;
}

interface WaterEntry {
  time: string;
  amount: number;
}

interface PersistedAppData {
  accounts: Account[];
  transactions: Transaction[];
  transactionCategories: TransactionCategory[];
  savingsGoals: SavingsGoal[];
  sleepLogs: SleepLog[];
  waterCurrent: number;
  waterHistory: WaterEntry[];
  fastingLogs: FastingLog[];
  fastingDuration: number;
  eatingSeconds: number;
  fastingMode: FastingMode;
}

function getDefaultAppData(): PersistedAppData {
  return {
    accounts: DEFAULT_ACCOUNTS,
    transactions: DEFAULT_TRANSACTIONS,
    transactionCategories: DEFAULT_TRANSACTION_CATEGORIES,
    savingsGoals: [
      { id: 'g1', name: 'New MacBook Pro', target: 2000, current: 1250, category: 'Tech' },
      { id: 'g2', name: 'Europe Summer Trip', target: 5000, current: 2200, category: 'Travel' },
    ],
    sleepLogs: [
      { id: 's1', date: 'June 5', duration: '7h 45m', score: 85, timeRange: '11:00 PM - 06:45 AM' },
      { id: 's2', date: 'June 4', duration: '8h 12m', score: 92, timeRange: '10:30 PM - 06:42 AM' },
      { id: 's3', date: 'June 3', duration: '6h 30m', score: 70, timeRange: '12:00 AM - 06:30 AM' },
    ],
    waterCurrent: 1250,
    waterHistory: [
      { time: '09:00 AM', amount: 250 },
      { time: '11:30 AM', amount: 500 },
      { time: '02:15 PM', amount: 250 },
      { time: '05:00 PM', amount: 250 },
    ],
    fastingLogs: [
      { id: 'f1', date: 'June 5', duration: '16h 0m', type: 'Fast', timeRange: '08:00 PM - 12:00 PM' },
      { id: 'f2', date: 'June 4', duration: '8h 0m', type: 'Eat', timeRange: '12:00 PM - 08:00 PM' },
    ],
    fastingDuration: 16 * 3600,
    eatingSeconds: 16 * 3600,
    fastingMode: 'fast',
  };
}

function navLinkClass(isActive: boolean, activeClass: string) {
  return `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
    isActive ? activeClass : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
  }`;
}

export default function App() {
  const { user, signOut } = useAuth();
  const dataHydrated = useRef(false);

  const {
    pendingCount: taskPendingCount,
    categories: taskCategories,
    newTaskText,
    setNewTaskText,
    newTaskCategory,
    setNewTaskCategory,
    newTaskPriority,
    setNewTaskPriority,
    newTaskDueDate,
    setNewTaskDueDate,
    handleAddTask,
  } = useTasks();

  const {
    pendingCount: reminderPendingCount,
    categories: reminderCategories,
    newReminderText,
    setNewReminderText,
    newReminderCategory,
    setNewReminderCategory,
    newReminderPriority,
    setNewReminderPriority,
    newReminderDueDate,
    setNewReminderDueDate,
    newReminderTime,
    setNewReminderTime,
    handleAddReminder,
  } = useReminders();

  const {
    newFoodName,
    setNewFoodName,
    newFoodMealType,
    setNewFoodMealType,
    newFoodTime,
    setNewFoodTime,
    newFoodCalories,
    setNewFoodCalories,
    handleAddFood,
  } = useFood();

  const [showQuickTask, setShowQuickTask] = useState(false);
  const [showQuickReminder, setShowQuickReminder] = useState(false);
  const [showQuickFood, setShowQuickFood] = useState(false);

  const defaultAppData = getDefaultAppData();

  // --- FINANCE HUB STATE ---
  const [accounts, setAccounts] = useState<Account[]>(defaultAppData.accounts);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultAppData.transactions);
  const [transactionCategories, setTransactionCategories] = useState<TransactionCategory[]>(
    defaultAppData.transactionCategories,
  );
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(defaultAppData.savingsGoals);

  // Modals / Inputs for Finance
  const [showAddTx, setShowAddTx] = useState(false);
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<TxType>('expense');
  const [txCategory, setTxCategory] = useState(DEFAULT_TRANSACTION_CATEGORIES[0].name);
  const [newTxCategoryName, setNewTxCategoryName] = useState('');
  const [editingTxCategoryId, setEditingTxCategoryId] = useState<string | null>(null);
  const [editTxCategoryName, setEditTxCategoryName] = useState('');
  const [txCategoryError, setTxCategoryError] = useState('');
  const [txAccount, setTxAccount] = useState('1');
  const [txCurrency, setTxCurrency] = useState<Currency>('PHP');

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('Bank');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccColor, setNewAccColor] = useState('from-blue-600 to-indigo-600');
  const [newAccCurrency, setNewAccCurrency] = useState<Currency>('PHP');

  // --- SLEEP TRACKER STATE ---
  const [sleepMode, setSleepMode] = useState<SleepMode>('timer');
  const [isSleepRunning, setIsSleepRunning] = useState(false);
  const [sleepSeconds, setSleepSeconds] = useState(0);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(defaultAppData.sleepLogs);
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Manual sleep inputs
  const [manualSleepDate, setManualSleepDate] = useState('');
  const [manualSleepStart, setManualSleepStart] = useState('');
  const [manualSleepEnd, setManualSleepEnd] = useState('');
  const [sleepError, setSleepError] = useState('');

  // --- EATING TIMER STATE (Intermittent Fasting Timer) ---
  const [fastingDuration, setFastingDuration] = useState(defaultAppData.fastingDuration);
  const [eatingSeconds, setEatingSeconds] = useState(defaultAppData.eatingSeconds);
  const [isFastingRunning, setIsFastingRunning] = useState(false);
  const [fastingMode, setFastingMode] = useState<FastingMode>(defaultAppData.fastingMode);
  const fastingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [fastingLogs, setFastingLogs] = useState<FastingLog[]>(defaultAppData.fastingLogs);
  const [editingFastId, setEditingFastId] = useState<string | null>(null);
  const [editFastType, setEditFastType] = useState<'Fast' | 'Eat'>('Fast');
  const [editFastDurationStr, setEditFastDurationStr] = useState('');
  const [editFastTimeRange, setEditFastTimeRange] = useState('');
  const [editFastDate, setEditFastDate] = useState('');
  const [fastingError, setFastingError] = useState('');

  // --- WATER TRACKER STATE ---
  const [waterTarget] = useState(2500); // ml
  const [waterCurrent, setWaterCurrent] = useState(defaultAppData.waterCurrent);
  const [waterHistory, setWaterHistory] = useState<WaterEntry[]>(defaultAppData.waterHistory);

  useEffect(() => {
    if (!user) return;
    const saved = loadUserSection(user, 'app', getDefaultAppData());
    setAccounts(saved.accounts);
    setTransactions(saved.transactions);
    setTransactionCategories(saved.transactionCategories ?? DEFAULT_TRANSACTION_CATEGORIES);
    setSavingsGoals(saved.savingsGoals);
    setSleepLogs(saved.sleepLogs);
    setWaterCurrent(saved.waterCurrent);
    setWaterHistory(saved.waterHistory);
    setFastingLogs(saved.fastingLogs);
    setFastingDuration(saved.fastingDuration);
    setEatingSeconds(saved.eatingSeconds);
    setFastingMode(saved.fastingMode);
    dataHydrated.current = true;
  }, [user]);

  useEffect(() => {
    if (!user || !dataHydrated.current) return;
    saveUserSection(user, 'app', {
      accounts,
      transactions,
      transactionCategories,
      savingsGoals,
      sleepLogs,
      waterCurrent,
      waterHistory,
      fastingLogs,
      fastingDuration,
      eatingSeconds,
      fastingMode,
    });
  }, [
    user,
    accounts,
    transactions,
    transactionCategories,
    savingsGoals,
    sleepLogs,
    waterCurrent,
    waterHistory,
    fastingLogs,
    fastingDuration,
    eatingSeconds,
    fastingMode,
  ]);

  // --- EFFECT FOR SLEEP TIMER ---
  useEffect(() => {
    if (isSleepRunning) {
      sleepTimerRef.current = setInterval(() => {
        setSleepSeconds(prev => prev + 1);
      }, 1000);
    } else if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
    }
    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, [isSleepRunning]);

  // --- EFFECT FOR FASTING TIMER ---
  useEffect(() => {
    if (isFastingRunning) {
      fastingTimerRef.current = setInterval(() => {
        setEatingSeconds(prev => {
          if (prev <= 1) {
            if (fastingTimerRef.current) clearInterval(fastingTimerRef.current);
            setIsFastingRunning(false);
            const nextMode = fastingMode === 'fast' ? 'eat' : 'fast';
            setFastingMode(nextMode);
            return nextMode === 'fast' ? 16 * 3600 : 8 * 3600;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (fastingTimerRef.current) {
      clearInterval(fastingTimerRef.current);
    }
    return () => {
      if (fastingTimerRef.current) clearInterval(fastingTimerRef.current);
    };
  }, [isFastingRunning, fastingMode]);

  // Helper Formats
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatShortTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  // --- ACTIONS ---
  
  // Finance Actions
  const handleAddTransaction = (e: FormEvent) => {
    e.preventDefault();
    if (!txTitle || !txAmount) return;

    const amountNum = parseFloat(txAmount);
    const newTx: Transaction = {
      id: `t_${Date.now()}`,
      title: txTitle,
      amount: amountNum,
      type: txType,
      category: txCategory,
      accountId: txAccount,
      date: new Date().toISOString().split('T')[0],
      currency: txCurrency,
    };

    setAccounts(accounts.map(acc => {
      if (acc.id === txAccount) {
        return {
          ...acc,
          balance: txType === 'income' ? acc.balance + amountNum : acc.balance - amountNum
        };
      }
      return acc;
    }));

    setTransactions([newTx, ...transactions]);
    setTxTitle('');
    setTxAmount('');
    setShowAddTx(false);
  };

  const handleCreateTxCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!newTxCategoryName.trim()) return;

    if (transactionCategories.some(cat => cat.name.toLowerCase() === newTxCategoryName.trim().toLowerCase())) {
      setTxCategoryError('Category already exists.');
      return;
    }
    setTxCategoryError('');

    const newName = newTxCategoryName.trim();
    setTransactionCategories(prev => [...prev, { id: `fcat_${Date.now()}`, name: newName }]);
    setNewTxCategoryName('');
    setTxCategory(newName);
  };

  const startEditingTxCategory = (cat: TransactionCategory) => {
    setEditingTxCategoryId(cat.id);
    setEditTxCategoryName(cat.name);
  };

  const handleUpdateTxCategory = (id: string) => {
    if (!editTxCategoryName.trim()) return;

    if (transactionCategories.some(cat => cat.id !== id && cat.name.toLowerCase() === editTxCategoryName.trim().toLowerCase())) {
      setTxCategoryError('Another category has this name.');
      return;
    }
    setTxCategoryError('');

    const originalCat = transactionCategories.find(cat => cat.id === id);
    const oldName = originalCat ? originalCat.name : '';
    const newName = editTxCategoryName.trim();

    setTransactionCategories(prev => prev.map(cat => (cat.id === id ? { ...cat, name: newName } : cat)));
    setTransactions(prev => prev.map(tx => (tx.category === oldName ? { ...tx, category: newName } : tx)));

    if (txCategory === oldName) setTxCategory(newName);

    setEditingTxCategoryId(null);
  };

  const handleDeleteTxCategory = (id: string, name: string) => {
    if (transactionCategories.length <= 1) {
      setTxCategoryError('You must maintain at least one category.');
      return;
    }
    setTxCategoryError('');

    const remainingCats = transactionCategories.filter(cat => cat.id !== id);
    setTransactionCategories(remainingCats);

    const fallback = remainingCats[0].name;
    setTransactions(prev => prev.map(tx => (tx.category === name ? { ...tx, category: fallback } : tx)));

    if (txCategory === name) setTxCategory(fallback);

    setEditingTxCategoryId(null);
  };

  const handleAddAccount = (e: FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccBalance) return;

    const newAcc: Account = {
      id: `acc_${Date.now()}`,
      name: newAccName,
      type: newAccType,
      balance: parseFloat(newAccBalance),
      color: newAccColor,
      currency: newAccCurrency,
    };

    setAccounts([...accounts, newAcc]);
    setNewAccName('');
    setNewAccBalance('');
    setNewAccCurrency('PHP');
    setShowAddAccount(false);
  };

  const handleDeleteTransaction = (id: string, amount: number, type: TxType, accId: string) => {
    setAccounts(accounts.map(acc => {
      if (acc.id === accId) {
        return {
          ...acc,
          balance: type === 'income' ? acc.balance - amount : acc.balance + amount
        };
      }
      return acc;
    }));

    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Sleep Timer Log
  const saveSleepLog = () => {
    if (sleepSeconds < 60) {
      setSleepError("Fasting or sleeping cycles under 1 minute cannot be saved to maintain history integrity.");
      return;
    }
    setSleepError('');
    const durationStr = formatShortTime(sleepSeconds);
    const ratio = Math.min(sleepSeconds / 28800, 1.2);
    const score = Math.round(ratio > 1 ? (2 - ratio) * 100 : ratio * 100);

    const now = new Date();
    const endStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const startStr = new Date(now.getTime() - sleepSeconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog = {
      id: `s_${Date.now()}`,
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      duration: durationStr,
      score: score,
      timeRange: `${startStr} - ${endStr}`
    };

    setSleepLogs([newLog, ...sleepLogs]);
    setSleepSeconds(0);
    setIsSleepRunning(false);
  };

  // Sleep Manual Log
  const handleManualSleepSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!manualSleepDate || !manualSleepStart || !manualSleepEnd) {
      setSleepError("Please fill out all manual sleep input boxes.");
      return;
    }
    setSleepError('');

    // Parse values "HH:MM"
    const [startH, startM] = manualSleepStart.split(':').map(Number);
    const [endH, endM] = manualSleepEnd.split(':').map(Number);

    let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMins < 0) {
      diffMins += 24 * 60; // Slept past midnight
    }

    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const durationStr = `${hrs}h ${mins}m`;

    // Score based on ideal 8 hours (480 mins)
    const ratio = Math.min(diffMins / 480, 1.2);
    const score = Math.round(ratio > 1 ? (2 - ratio) * 100 : ratio * 100);

    // Format times with AM/PM for history view
    const formatTimeStr = (hmStr: string) => {
      const [h, m] = hmStr.split(':').map(Number);
      const suffix = h >= 12 ? 'PM' : 'AM';
      const formattedH = h % 12 || 12;
      return `${formattedH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${suffix}`;
    };

    const newLog = {
      id: `s_${Date.now()}`,
      date: manualSleepDate,
      duration: durationStr,
      score: score,
      timeRange: `${formatTimeStr(manualSleepStart)} - ${formatTimeStr(manualSleepEnd)}`
    };

    setSleepLogs([newLog, ...sleepLogs]);
    setManualSleepDate('');
    setManualSleepStart('');
    setManualSleepEnd('');
  };

  const deleteSleepLog = (id: string) => {
    setSleepLogs(sleepLogs.filter(log => log.id !== id));
  };

  // Eating / Fasting actions
  const changeFastingPlan = (plan: '16:8' | '18:6' | '12:12') => {
    setIsFastingRunning(false);
    if (plan === '16:8') {
      setFastingDuration(16 * 3600);
      setEatingSeconds(16 * 3600);
      setFastingMode('fast');
    } else if (plan === '18:6') {
      setFastingDuration(18 * 3600);
      setEatingSeconds(18 * 3600);
      setFastingMode('fast');
    } else {
      setFastingDuration(12 * 3600);
      setEatingSeconds(12 * 3600);
      setFastingMode('fast');
    }
  };

  const handleLogFastingSession = () => {
    const elapsed = fastingDuration - eatingSeconds;
    if (elapsed < 10) { 
      setFastingError("Fasting session too short to log! Let the clock run.");
      return;
    }
    setFastingError('');
    
    const durationStr = formatShortTime(elapsed);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const startTimeStr = new Date(now.getTime() - elapsed * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newLog: FastingLog = {
      id: `fast_${Date.now()}`,
      date: dateStr,
      duration: durationStr,
      type: fastingMode === 'fast' ? 'Fast' : 'Eat',
      timeRange: `${startTimeStr} - ${endTimeStr}`,
    };

    setFastingLogs([newLog, ...fastingLogs]);
    setEatingSeconds(fastingDuration);
    setIsFastingRunning(false);
  };

  const startEditingFastLog = (log: FastingLog) => {
    setEditingFastId(log.id);
    setEditFastType(log.type);
    setEditFastDurationStr(log.duration);
    setEditFastTimeRange(log.timeRange);
    setEditFastDate(log.date);
  };

  const saveEditingFastLog = () => {
    setFastingLogs(fastingLogs.map(log => {
      if (log.id === editingFastId) {
        return {
          ...log,
          type: editFastType,
          duration: editFastDurationStr,
          timeRange: editFastTimeRange,
          date: editFastDate
        };
      }
      return log;
    }));
    setEditingFastId(null);
  };

  const deleteFastLog = (id: string) => {
    setFastingLogs(fastingLogs.filter(log => log.id !== id));
  };

  // Water Actions
  const addWater = (amount: number) => {
    const updated = waterCurrent + amount;
    setWaterCurrent(updated > 4000 ? 4000 : updated);
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setWaterHistory([{ time: timeStr, amount }, ...waterHistory]);
  };

  const resetWater = () => {
    setWaterCurrent(0);
    setWaterHistory([]);
  };

  // Aggregated Stats
  const balanceByCurrency = accounts.reduce<Partial<Record<Currency, number>>>((totals, account) => {
    totals[account.currency] = (totals[account.currency] ?? 0) + account.balance;
    return totals;
  }, {});

  const handleTxAccountChange = (accountId: string) => {
    setTxAccount(accountId);
    const account = accounts.find(a => a.id === accountId);
    if (account) setTxCurrency(account.currency);
  };

  const handleQuickTaskSubmit = (e: FormEvent) => {
    handleAddTask(e);
    setShowQuickTask(false);
  };

  const handleQuickReminderSubmit = (e: FormEvent) => {
    handleAddReminder(e);
    setShowQuickReminder(false);
  };

  const handleQuickFoodSubmit = (e: FormEvent) => {
    handleAddFood(e);
    setShowQuickFood(false);
  };

  const openCreateTask = () => {
    setNewTaskCategory('Work');
    setNewTaskPriority('medium' as Priority);
    setShowQuickTask(true);
  };

  const openCreateReminder = () => {
    setNewReminderCategory('Health');
    setNewReminderPriority('high');
    setShowQuickReminder(true);
  };

  const openLogFood = () => {
    setNewFoodMealType('lunch');
    setShowQuickFood(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <OfflineStatusBanner />

      {/* Top Premium Navigation bar */}
      <header className="sticky top-0 z-40 bg-slate-900/85 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-emerald-400 p-2.5 rounded-xl shadow-lg shadow-indigo-500/10">
            <Activity className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              LifeFlow <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">v1.3</span>
            </h1>
            <p className="text-xs text-slate-400">Finance & Wellness Dashboard</p>
          </div>
        </div>

        {/* Global Stats Ribbon */}
        <div className="hidden md:flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2 bg-slate-950/60 py-1.5 px-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-xs">Net Worth:</span>
            <span className="font-bold text-emerald-400">
              {CURRENCY_LIST.filter(c => balanceByCurrency[c.value] != null).map((c, i) => (
                <span key={c.value}>
                  {i > 0 && <span className="text-slate-500 mx-1">·</span>}
                  {formatMoney(balanceByCurrency[c.value]!, c.value)}
                </span>
              ))}
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950/60 py-1.5 px-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-xs">Water Intake:</span>
            <span className="font-bold text-blue-400">{waterCurrent} / {waterTarget} ml</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950/60 py-1.5 px-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-xs">Tasks:</span>
            <span className="font-bold text-indigo-400">{taskPendingCount} pending</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950/60 py-1.5 px-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-xs">Reminders:</span>
            <span className="font-bold text-rose-400">{reminderPendingCount} active</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/reminders"
            className="relative p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
          >
            <Bell className="h-5 w-5" />
            {reminderPendingCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-bounce"></span>
            )}
          </Link>
          <div className="flex items-center space-x-2 bg-slate-800 py-1.5 px-3 rounded-xl border border-slate-700">
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
              {user ? getUserInitials(user) : '?'}
            </div>
            <span className="text-xs font-medium text-slate-200 hidden sm:inline">{user}</span>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Responsive Side Menu Bar */}
        <aside className="w-full lg:w-64 bg-slate-900/40 border-b lg:border-b-0 lg:border-r border-slate-800/80 p-4 flex lg:flex-col justify-between items-center lg:items-stretch space-y-0 lg:space-y-6">
          <div className="w-full flex lg:flex-col justify-around lg:justify-start lg:space-y-1.5">
            <NavLink
              to="/"
              end
              className={({ isActive }) => navLinkClass(isActive, 'bg-indigo-600/20 text-indigo-300 border-l-4 border-indigo-500')}
            >
              <Activity className="h-5 w-5" />
              <span className="hidden lg:inline">Unified Dashboard</span>
            </NavLink>

            <NavLink
              to="/finance"
              className={({ isActive }) => navLinkClass(isActive, 'bg-emerald-600/20 text-emerald-300 border-l-4 border-emerald-500')}
            >
              <Wallet className="h-5 w-5" />
              <span className="hidden lg:inline">Finance Tracker</span>
            </NavLink>

            <NavLink
              to="/wellness"
              className={({ isActive }) => navLinkClass(isActive, 'bg-blue-600/20 text-blue-300 border-l-4 border-blue-500')}
            >
              <Moon className="h-5 w-5" />
              <span className="hidden lg:inline">Health & Wellness</span>
            </NavLink>

            <NavLink
              to="/tasks"
              className={({ isActive }) => navLinkClass(isActive, 'bg-indigo-600/20 text-indigo-300 border-l-4 border-indigo-500')}
            >
              <ListTodo className="h-5 w-5" />
              <span className="hidden lg:inline">Tasks</span>
            </NavLink>

            <NavLink
              to="/reminders"
              className={({ isActive }) => navLinkClass(isActive, 'bg-rose-600/20 text-rose-300 border-l-4 border-rose-500')}
            >
              <Bell className="h-5 w-5" />
              <span className="hidden lg:inline">Reminders</span>
            </NavLink>

            <NavLink
              to="/food"
              className={({ isActive }) => navLinkClass(isActive, 'bg-amber-600/20 text-amber-300 border-l-4 border-amber-500')}
            >
              <UtensilsCrossed className="h-5 w-5" />
              <span className="hidden lg:inline">Food Intake</span>
            </NavLink>
          </div>

          <div className="hidden lg:block bg-gradient-to-br from-slate-900 to-indigo-950 p-4 rounded-xl border border-slate-800 text-center">
            <Sparkles className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-200">Consistency is Key!</p>
            <p className="text-[10px] text-slate-400 mt-1">Track daily to unlock insightful trends.</p>
          </div>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={
              <DashboardPage
                username={user ?? 'Friend'}
                accounts={accounts}
                balanceByCurrency={balanceByCurrency}
                savingsGoals={savingsGoals}
                waterCurrent={waterCurrent}
                waterTarget={waterTarget}
                waterHistory={waterHistory}
                addWater={addWater}
                resetWater={resetWater}
                isSleepRunning={isSleepRunning}
                sleepSeconds={sleepSeconds}
                formatTime={formatTime}
                onAddTransaction={() => setShowAddTx(true)}
                onCreateTask={openCreateTask}
                onCreateReminder={openCreateReminder}
                onLogFood={openLogFood}
              />
            } />
            <Route path="/finance" element={
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Wallet className="h-6 w-6 text-emerald-400" /> Financial Portfolio
                  </h2>
                  <p className="text-slate-400 text-sm">Monitor savings, manage multiple account types, and log transactions.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAddAccount(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4 text-indigo-400" /> Add Account
                  </button>
                  <button 
                    onClick={() => setShowAddTx(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 transition-all flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Transaction
                  </button>
                </div>
              </div>

              {/* Accounts Showcase Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {accounts.map(acc => {
                  const accTxs = transactions.filter(t => t.accountId === acc.id);
                  const incomingCount = accTxs.filter(t => t.type === 'income').length;
                  const outgoingCount = accTxs.filter(t => t.type === 'expense').length;

                  return (
                    <div key={acc.id} className="bg-slate-900/50 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl hover:border-slate-700/80 transition-all group">
                      <div className={`bg-gradient-to-r ${acc.color} p-5 text-white flex flex-col justify-between h-40`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold bg-black/25 px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                              {acc.type}
                            </span>
                            <span className="text-[10px] font-bold bg-black/25 px-2 py-0.5 rounded-full backdrop-blur-sm">
                              {acc.currency}
                            </span>
                          </div>
                          <CreditCard className="h-5 w-5 opacity-80" />
                        </div>
                        <div>
                          <p className="text-xs opacity-75 font-medium">{acc.name}</p>
                          <h4 className="text-2xl font-bold mt-1">{formatMoney(acc.balance, acc.currency)}</h4>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-900/80 border-t border-slate-800/50 flex justify-between items-center text-xs text-slate-400">
                        <span>{accTxs.length} Logs</span>
                        <div className="flex space-x-3">
                          <span className="text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> {incomingCount}
                          </span>
                          <span className="text-rose-400 flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" /> {outgoingCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mini Quick Add Forms (Modals) */}
              {showAddAccount && (
                <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-700 max-w-md mx-auto space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-white text-base">Add New Financial Account</h4>
                    <button onClick={() => setShowAddAccount(false)} className="text-slate-400 hover:text-slate-200">✕</button>
                  </div>
                  <form onSubmit={handleAddAccount} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Account Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. PayPal, Cash Wallet, Chase Savings"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                        value={newAccName} 
                        onChange={e => setNewAccName(e.target.value)} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Account Type</label>
                        <select 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
                          value={newAccType}
                          onChange={e => setNewAccType(e.target.value)}
                        >
                          <option value="Bank">Bank</option>
                          <option value="E-Wallet">E-Wallet</option>
                          <option value="Cash">Cash</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">
                          Starting Balance ({newAccCurrency === 'USD' ? '$' : '₱'})
                        </label>
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          placeholder="0.00"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                          value={newAccBalance} 
                          onChange={e => setNewAccBalance(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-2 font-semibold">Currency</label>
                      <CurrencyToggle value={newAccCurrency} onChange={setNewAccCurrency} />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-2 font-semibold">Accent Theme Color</label>
                      <div className="grid grid-cols-4 gap-2">
                        <button 
                          type="button" 
                          onClick={() => setNewAccColor('from-blue-600 to-indigo-600')}
                          className={`h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 border-2 ${newAccColor.includes('blue') ? 'border-white' : 'border-transparent'}`}
                        />
                        <button 
                          type="button" 
                          onClick={() => setNewAccColor('from-emerald-500 to-teal-600')}
                          className={`h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 border-2 ${newAccColor.includes('emerald') ? 'border-white' : 'border-transparent'}`}
                        />
                        <button 
                          type="button" 
                          onClick={() => setNewAccColor('from-purple-600 to-pink-600')}
                          className={`h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 border-2 ${newAccColor.includes('purple') ? 'border-white' : 'border-transparent'}`}
                        />
                        <button 
                          type="button" 
                          onClick={() => setNewAccColor('from-amber-500 to-orange-600')}
                          className={`h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 border-2 ${newAccColor.includes('amber') ? 'border-white' : 'border-transparent'}`}
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all">
                      Confirm Account Create
                    </button>
                  </form>
                </div>
              )}

              {/* Transactions History and Savings Goal Split Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side Table */}
                <div className="lg:col-span-8 bg-slate-900/30 rounded-2xl p-6 border border-slate-800/80 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-base">Recent Ledger Logs</h3>
                      <p className="text-slate-400 text-xs">A comprehensive view of active funds moving in & out</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                          <th className="py-3 px-2">Title</th>
                          <th className="py-3 px-2">Category</th>
                          <th className="py-3 px-2">Account</th>
                          <th className="py-3 px-2">Date</th>
                          <th className="py-3 px-2">Currency</th>
                          <th className="py-3 px-2 text-right">Amount</th>
                          <th className="py-3 px-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {transactions.map(tx => {
                          const associatedAccount = accounts.find(a => a.id === tx.accountId);
                          return (
                            <tr key={tx.id} className="hover:bg-slate-900/40 transition-all text-slate-200">
                              <td className="py-3 px-2 font-medium">{tx.title}</td>
                              <td className="py-3 px-2">
                                <span className="bg-slate-800 text-slate-300 py-0.5 px-2 rounded-full text-[10px]">
                                  {tx.category}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-slate-400">{associatedAccount ? associatedAccount.name : 'Unknown'}</td>
                              <td className="py-3 px-2 text-slate-400">{tx.date}</td>
                              <td className="py-3 px-2">
                                <span className="bg-slate-800 text-slate-300 py-0.5 px-2 rounded-full text-[10px]">
                                  {tx.currency}
                                </span>
                              </td>
                              <td className={`py-3 px-2 text-right font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount, tx.currency)}
                              </td>
                              <td className="py-3 px-2 text-center">
                                <button 
                                  onClick={() => handleDeleteTransaction(tx.id, tx.amount, tx.type, tx.accountId)}
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-all"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Side Categories & Savings */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900/30 rounded-2xl p-6 border border-slate-800/80">
                    <TransactionCategoryManager
                      categories={transactionCategories}
                      newCategoryName={newTxCategoryName}
                      setNewCategoryName={setNewTxCategoryName}
                      editingCategoryId={editingTxCategoryId}
                      setEditingCategoryId={setEditingTxCategoryId}
                      editCategoryName={editTxCategoryName}
                      setEditCategoryName={setEditTxCategoryName}
                      categoryError={txCategoryError}
                      setCategoryError={setTxCategoryError}
                      onCreateCategory={handleCreateTxCategory}
                      onStartEditing={startEditingTxCategory}
                      onUpdateCategory={handleUpdateTxCategory}
                      onDeleteCategory={handleDeleteTxCategory}
                    />
                  </div>

                  <div className="bg-slate-900/30 rounded-2xl p-6 border border-slate-800/80 space-y-6">
                  <div>
                    <h3 className="font-bold text-white text-base">Savings Target Board</h3>
                    <p className="text-slate-400 text-xs">Fund your upcoming milestones</p>
                  </div>

                  <div className="space-y-4">
                    {savingsGoals.map(goal => {
                      const percent = Math.round((goal.current / goal.target) * 100);
                      return (
                        <div key={goal.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-200">{goal.name}</span>
                            <span className="text-indigo-400 font-bold">{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>Saved: ${goal.current}</span>
                            <span>Target: ${goal.target}</span>
                          </div>
                          <div className="pt-2 flex justify-end space-x-1.5">
                            <button 
                              onClick={() => {
                                const addAmount = 100;
                                if (goal.current + addAmount <= goal.target) {
                                  setSavingsGoals(savingsGoals.map(g => g.id === goal.id ? { ...g, current: g.current + addAmount } : g));
                                }
                              }}
                              className="text-[10px] bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 px-2 py-1 rounded"
                            >
                              Add $100
                            </button>
                            <button 
                              onClick={() => {
                                setSavingsGoals(savingsGoals.map(g => g.id === goal.id ? { ...g, current: 0 } : g));
                              }}
                              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>
                </div>

              </div>

            </div>
            } />
            <Route path="/wellness" element={
            <div className="space-y-6">
              
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Moon className="h-6 w-6 text-indigo-400" /> Bio & Wellness Station
                </h2>
                <p className="text-slate-400 text-sm">Tune your biological rhythms with interactive trackers for your habits.</p>
              </div>

              {/* Grid with Sleep and Fasting and Water */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Block: SLEEP TIMER & MANUAL LOG UI */}
                <div className="lg:col-span-4 bg-slate-900/30 rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between space-y-6">
                  
                  {/* Title & Mode Switcher */}
                  <div className="w-full">
                    <div className="text-center w-full mb-4">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-center gap-1.5 mb-1">
                        <Moon className="h-3.5 w-3.5 text-indigo-400" /> Sleep Rhythm Circle
                      </span>
                      <h3 className="text-base font-bold text-slate-100 font-mono">Chronometer & Logger</h3>
                    </div>

                    <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
                      <button 
                        onClick={() => { setSleepMode('timer'); setSleepError(''); }}
                        className={`py-1.5 rounded-lg transition-all ${sleepMode === 'timer' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        Stopwatch Timer
                      </button>
                      <button 
                        onClick={() => { setSleepMode('manual'); setSleepError(''); }}
                        className={`py-1.5 rounded-lg transition-all ${sleepMode === 'manual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        Log Manually
                      </button>
                    </div>
                  </div>

                  {/* Errors in Sleep Component */}
                  {sleepError && (
                    <div className="w-full p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{sleepError}</span>
                    </div>
                  )}

                  {/* DISPLAY 1: TIMER MODE */}
                  {sleepMode === 'timer' && (
                    <div className="flex flex-col items-center space-y-6 w-full">
                      {/* Circle SVG Progress Timer */}
                      <div className="relative flex items-center justify-center">
                        <svg className="w-52 h-52">
                          <circle 
                            cx="104" 
                            cy="104" 
                            r="92" 
                            className="stroke-slate-800 fill-transparent" 
                            strokeWidth="8"
                          />
                          <circle 
                            cx="104" 
                            cy="104" 
                            r="92" 
                            className="stroke-indigo-500 fill-transparent transition-all duration-1000" 
                            strokeWidth="8"
                            strokeDasharray={578}
                            strokeDashoffset={isSleepRunning ? 578 - (578 * (sleepSeconds % 3600)) / 3600 : 578}
                            strokeLinecap="round"
                            transform="rotate(-90 104 104)"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <p className="text-3xl font-bold font-mono tracking-tight text-white">{formatTime(sleepSeconds)}</p>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 mt-1">
                            {isSleepRunning ? "Monitoring" : "Asleep State"}
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="w-full space-y-3">
                        <div className="flex space-x-2">
                          {!isSleepRunning ? (
                            <button 
                              onClick={() => setIsSleepRunning(true)}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                              <Play className="h-4 w-4" /> Start Sleep
                            </button>
                          ) : (
                            <button 
                              onClick={() => setIsSleepRunning(false)}
                              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                              <Pause className="h-4 w-4" /> Pause Sleep
                            </button>
                          )}
                          
                          <button 
                            onClick={saveSleepLog}
                            className="bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 font-semibold px-4 py-2.5 rounded-xl text-xs active:scale-95 transition-all"
                          >
                            Log Current
                          </button>
                        </div>
                        <button 
                          onClick={() => { setIsSleepRunning(false); setSleepSeconds(0); setSleepError(''); }}
                          className="w-full border border-slate-800 text-slate-400 text-xs py-2 rounded-xl hover:text-slate-200 transition-all text-center"
                        >
                          Reset Clock
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DISPLAY 2: MANUAL LOG MODE */}
                  {sleepMode === 'manual' && (
                    <form onSubmit={handleManualSleepSubmit} className="w-full space-y-3.5 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Date</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. June 6"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                          value={manualSleepDate}
                          onChange={e => setManualSleepDate(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1 font-semibold">Time Sleep</label>
                          <input 
                            type="time" 
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-center"
                            value={manualSleepStart}
                            onChange={e => setManualSleepStart(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 font-semibold">Time Wake Up</label>
                          <input 
                            type="time" 
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-center"
                            value={manualSleepEnd}
                            onChange={e => setManualSleepEnd(e.target.value)}
                          />
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition-all"
                      >
                        Add Manual Sleep Log
                      </button>
                    </form>
                  )}

                  {/* Sleep Logs */}
                  <div className="w-full space-y-3 pt-2">
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Past Nights Logs</h4>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {sleepLogs.map((log) => (
                        <div key={log.id} className="bg-slate-900/60 p-2.5 rounded-xl text-xs space-y-1.5 border border-slate-900/80">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-medium">{log.date}</span>
                            <span className="font-bold text-indigo-400">{log.duration}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span>{log.timeRange}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded text-[9px]">Score: {log.score}%</span>
                              <button 
                                onClick={() => deleteSleepLog(log.id)}
                                className="text-slate-500 hover:text-rose-400 transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {sleepLogs.length === 0 && (
                        <p className="text-center text-[10px] text-slate-500 py-4">No sleep logs registered.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Middle Block: FASTING & MEAL TIMERS */}
                <div className="lg:col-span-4 bg-slate-900/30 rounded-2xl p-6 border border-slate-800/80 flex flex-col items-center justify-between space-y-6">
                  <div className="text-center w-full">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center justify-center gap-1.5 mb-1">
                      <Flame className="h-3.5 w-3.5 text-orange-400" /> Fasting & Eating Windows
                    </span>
                    <h3 className="text-base font-bold text-slate-100">Intermittent Eating Timer</h3>
                    <p className="text-xs text-slate-400">Manage metabolic calorie-intake periods</p>
                  </div>

                  {/* Fasting warnings instead of system alerts */}
                  {fastingError && (
                    <div className="w-full p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{fastingError}</span>
                    </div>
                  )}

                  {/* Circular Timer representation */}
                  <div className="relative flex items-center justify-center">
                    <svg className="w-52 h-52">
                      <circle 
                        cx="104" 
                        cy="104" 
                        r="92" 
                        className="stroke-slate-800 fill-transparent" 
                        strokeWidth="8"
                      />
                      <circle 
                        cx="104" 
                        cy="104" 
                        r="92" 
                        className="stroke-orange-500 fill-transparent transition-all duration-1000" 
                        strokeWidth="8"
                        strokeDasharray={578}
                        strokeDashoffset={578 - (578 * eatingSeconds) / fastingDuration}
                        strokeLinecap="round"
                        transform="rotate(-90 104 104)"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-3xl font-bold font-mono tracking-tight text-white">{formatTime(eatingSeconds)}</p>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-orange-400 mt-1">
                        {fastingMode === 'fast' ? "Fasting Schedule" : "Eating Allowed"}
                      </p>
                    </div>
                  </div>

                  {/* Schedule selection tabs */}
                  <div className="w-full flex justify-between bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-[10px] font-semibold text-slate-300">
                    <button 
                      onClick={() => changeFastingPlan('16:8')}
                      className={`flex-1 py-1.5 rounded-lg transition-all ${fastingDuration === 16*3600 ? 'bg-orange-500 text-white' : ''}`}
                    >
                      16:8 Fast
                    </button>
                    <button 
                      onClick={() => changeFastingPlan('18:6')}
                      className={`flex-1 py-1.5 rounded-lg transition-all ${fastingDuration === 18*3600 ? 'bg-orange-500 text-white' : ''}`}
                    >
                      18:6 Fast
                    </button>
                    <button 
                      onClick={() => changeFastingPlan('12:12')}
                      className={`flex-1 py-1.5 rounded-lg transition-all ${fastingDuration === 12*3600 ? 'bg-orange-500 text-white' : ''}`}
                    >
                      Circadian
                    </button>
                  </div>

                  {/* Fast Controls */}
                  <div className="w-full flex space-x-2">
                    {!isFastingRunning ? (
                      <button 
                        onClick={() => setIsFastingRunning(true)}
                        className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <Play className="h-4 w-4" /> Start Cycle
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsFastingRunning(false)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <Pause className="h-4 w-4" /> Pause Cycle
                      </button>
                    )}
                    
                    <button 
                      onClick={handleLogFastingSession}
                      className="bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 font-semibold px-3 py-2.5 rounded-xl text-xs active:scale-95 transition-all"
                      title="Log Current Fasting Cycle"
                    >
                      Log Window
                    </button>
                    
                    <button 
                      onClick={() => { setIsFastingRunning(false); setEatingSeconds(fastingDuration); setFastingError(''); }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Fasting & Eating Cycle History */}
                  <div className="w-full space-y-3 pt-2">
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Past Cycles History</h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {fastingLogs.map((log) => (
                        <div key={log.id} className="bg-slate-900/60 p-2.5 rounded-xl text-xs space-y-2 border border-slate-900/80">
                          {editingFastId === log.id ? (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-1.5">
                                <input 
                                  type="text"
                                  className="bg-slate-950 border border-slate-800 rounded p-1 text-white text-[10px]"
                                  value={editFastDate}
                                  onChange={e => setEditFastDate(e.target.value)}
                                  placeholder="Date (e.g. June 5)"
                                />
                                <input 
                                  type="text"
                                  className="bg-slate-950 border border-slate-800 rounded p-1 text-white text-[10px]"
                                  value={editFastDurationStr}
                                  onChange={e => setEditFastDurationStr(e.target.value)}
                                  placeholder="Duration"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                <select
                                  className="bg-slate-950 border border-slate-800 rounded p-1 text-white text-[10px]"
                                  value={editFastType}
                                  onChange={e => setEditFastType(e.target.value as 'Fast' | 'Eat')}
                                >
                                  <option value="Fast">Fast</option>
                                  <option value="Eat">Eat</option>
                                </select>
                                <input 
                                  type="text"
                                  className="bg-slate-950 border border-slate-800 rounded p-1 text-white text-[10px]"
                                  value={editFastTimeRange}
                                  onChange={e => setEditFastTimeRange(e.target.value)}
                                  placeholder="Time frame"
                                />
                              </div>
                              <div className="flex space-x-1 justify-end pt-1">
                                <button 
                                  onClick={saveEditingFastLog}
                                  className="text-[9px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-2 py-1 rounded font-bold"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingFastId(null)}
                                  className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-2">
                                  <span className="text-slate-400 font-medium">{log.date}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${log.type === 'Fast' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {log.type}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-mono">{log.timeRange}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-200">{log.duration}</span>
                                <button 
                                  onClick={() => startEditingFastLog(log)}
                                  className="text-slate-400 hover:text-indigo-400 transition-all text-[10px]"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => deleteFastLog(log.id)}
                                  className="text-slate-500 hover:text-rose-400 transition-all text-[10px]"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {fastingLogs.length === 0 && (
                        <p className="text-center text-[10px] text-slate-500 py-4">No fasting cycles registered.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Block: WATER TRACKER */}
                <div className="lg:col-span-4 bg-slate-900/30 rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between space-y-6">
                  
                  <div className="text-center w-full">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center justify-center gap-1.5 mb-1">
                      <Droplets className="h-3.5 w-3.5 text-blue-400" /> Hydration Wave
                    </span>
                    <h3 className="text-base font-bold text-slate-100">Daily Water Logger</h3>
                    <p className="text-xs text-slate-400">Maintain biological hydration levels</p>
                  </div>

                  {/* Wave Visualizer Box */}
                  <div className="relative w-full h-48 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-end justify-center group">
                    
                    {/* Level Fill Mask */}
                    <div 
                      className="absolute left-0 right-0 bg-gradient-to-t from-blue-700 to-blue-500/80 transition-all duration-500"
                      style={{ height: `${Math.min((waterCurrent / waterTarget) * 100, 100)}%` }}
                    >
                      <div className="absolute -top-3 w-full h-3 bg-blue-500/40 animate-pulse rounded-full opacity-60"></div>
                    </div>

                    {/* Hydration Stats Panel overlay */}
                    <div className="z-10 text-center mb-6 text-white text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      <span className="text-2xl font-bold tracking-tight">{waterCurrent} ml</span>
                      <p className="text-[10px] uppercase font-bold text-blue-200 mt-1">Goal target: {waterTarget} ml</p>
                    </div>
                  </div>

                  {/* Water Action Triggers */}
                  <div className="w-full space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => addWater(250)}
                        className="bg-blue-600/10 hover:bg-blue-600/25 text-blue-300 font-bold py-2 rounded-xl text-[10px] border border-blue-500/25 active:scale-95 transition-all"
                      >
                        +250ml
                      </button>
                      <button 
                        onClick={() => addWater(500)}
                        className="bg-blue-600/20 hover:bg-blue-600/35 text-blue-200 font-bold py-2 rounded-xl text-[10px] border border-blue-500/35 active:scale-95 transition-all"
                      >
                        +500ml
                      </button>
                      <button 
                        onClick={() => addWater(750)}
                        className="bg-blue-600/30 hover:bg-blue-600/45 text-blue-100 font-bold py-2 rounded-xl text-[10px] border border-blue-500/45 active:scale-95 transition-all"
                      >
                        +750ml
                      </button>
                    </div>
                    <button 
                      onClick={resetWater}
                      className="w-full border border-slate-800 text-slate-400 hover:text-slate-200 text-xs py-2 rounded-xl transition-all"
                    >
                      Reset Daily Tracker
                    </button>
                  </div>

                  {/* Log Lists */}
                  <div className="w-full space-y-3 pt-2">
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Today's Intake Log</h4>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {waterHistory.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg text-xs">
                          <span className="text-slate-400">{item.time}</span>
                          <span className="font-bold text-blue-400">+{item.amount} ml</span>
                          <span className="text-[10px] text-slate-500 font-mono">Added</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
            } />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/food" element={<FoodPage />} />
          </Routes>

        </main>
      </div>

      <AddTransactionModal
        open={showAddTx}
        onClose={() => setShowAddTx(false)}
        accounts={accounts}
        txType={txType}
        setTxType={setTxType}
        txTitle={txTitle}
        setTxTitle={setTxTitle}
        txAmount={txAmount}
        setTxAmount={setTxAmount}
        txCurrency={txCurrency}
        setTxCurrency={setTxCurrency}
        txAccount={txAccount}
        onAccountChange={handleTxAccountChange}
        txCategory={txCategory}
        setTxCategory={setTxCategory}
        transactionCategories={transactionCategories}
        newTxCategoryName={newTxCategoryName}
        setNewTxCategoryName={setNewTxCategoryName}
        editingTxCategoryId={editingTxCategoryId}
        setEditingTxCategoryId={setEditingTxCategoryId}
        editTxCategoryName={editTxCategoryName}
        setEditTxCategoryName={setEditTxCategoryName}
        txCategoryError={txCategoryError}
        setTxCategoryError={setTxCategoryError}
        onCreateTxCategory={handleCreateTxCategory}
        onStartEditingTxCategory={startEditingTxCategory}
        onUpdateTxCategory={handleUpdateTxCategory}
        onDeleteTxCategory={handleDeleteTxCategory}
        onSubmit={handleAddTransaction}
      />

      <QuickTaskModal
        open={showQuickTask}
        onClose={() => setShowQuickTask(false)}
        title="Create New Task"
        submitLabel="Add Task"
        placeholder="e.g. Finish project report, Call client"
        categories={taskCategories}
        newTaskText={newTaskText}
        setNewTaskText={setNewTaskText}
        newTaskCategory={newTaskCategory}
        setNewTaskCategory={setNewTaskCategory}
        newTaskPriority={newTaskPriority}
        setNewTaskPriority={setNewTaskPriority}
        newTaskDueDate={newTaskDueDate}
        setNewTaskDueDate={setNewTaskDueDate}
        onSubmit={handleQuickTaskSubmit}
      />

      <QuickReminderModal
        open={showQuickReminder}
        onClose={() => setShowQuickReminder(false)}
        categories={reminderCategories}
        newReminderText={newReminderText}
        setNewReminderText={setNewReminderText}
        newReminderCategory={newReminderCategory}
        setNewReminderCategory={setNewReminderCategory}
        newReminderPriority={newReminderPriority}
        setNewReminderPriority={setNewReminderPriority}
        newReminderDueDate={newReminderDueDate}
        setNewReminderDueDate={setNewReminderDueDate}
        newReminderTime={newReminderTime}
        setNewReminderTime={setNewReminderTime}
        onSubmit={handleQuickReminderSubmit}
      />

      <QuickFoodModal
        open={showQuickFood}
        onClose={() => setShowQuickFood(false)}
        newFoodName={newFoodName}
        setNewFoodName={setNewFoodName}
        newFoodMealType={newFoodMealType}
        setNewFoodMealType={setNewFoodMealType}
        newFoodTime={newFoodTime}
        setNewFoodTime={setNewFoodTime}
        newFoodCalories={newFoodCalories}
        setNewFoodCalories={setNewFoodCalories}
        onSubmit={handleQuickFoodSubmit}
      />

      {/* Aesthetic Footer */}
      <footer className="bg-slate-950 py-4 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© 2026 LifeFlow Hub. All components and calculations calibrated securely in memory.</p>
      </footer>

    </div>
  );
}