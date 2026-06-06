import type { Account, Transaction, TransactionCategory } from '../types/finance';
import type { Category, Task } from '../types/tasks';
import type { Reminder, ReminderCategory } from '../types/reminders';
import type { FoodEntry } from '../types/food';
import { supabase } from './supabase';

export const STARTER_TRANSACTION_CATEGORIES: TransactionCategory[] = [
  { id: 'fc1', name: 'Food & Groceries' },
  { id: 'fc2', name: 'Restaurants & Coffee' },
  { id: 'fc3', name: 'Salary & Wages' },
  { id: 'fc4', name: 'Freelance Income' },
  { id: 'fc5', name: 'Rent & Living Costs' },
  { id: 'fc6', name: 'Entertainment & Hobby' },
  { id: 'fc7', name: 'Health & Fitness' },
];

export const STARTER_TASK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Work' },
  { id: 'c2', name: 'Finance' },
  { id: 'c3', name: 'Personal' },
  { id: 'c4', name: 'Projects' },
];

export const STARTER_REMINDER_CATEGORIES: ReminderCategory[] = [
  { id: 'rc1', name: 'Health' },
  { id: 'rc2', name: 'Daily Habits' },
  { id: 'rc3', name: 'Finance' },
  { id: 'rc4', name: 'Personal' },
];

export interface AppDataDefaults {
  accounts: Account[];
  transactions: Transaction[];
  transactionCategories: TransactionCategory[];
  savingsGoals: Array<{ id: string; name: string; target: number; current: number; category: string }>;
  sleepLogs: Array<{ id: string; date: string; duration: string; score: number; timeRange: string }>;
  waterCurrent: number;
  waterHistory: Array<{ time: string; amount: number }>;
  fastingLogs: Array<{ id: string; date: string; duration: string; type: 'Fast' | 'Eat'; timeRange: string }>;
  fastingDuration: number;
  eatingSeconds: number;
  fastingMode: 'fast' | 'eat';
}

export function getEmptyAppData(): AppDataDefaults {
  return {
    accounts: [],
    transactions: [],
    transactionCategories: STARTER_TRANSACTION_CATEGORIES,
    savingsGoals: [],
    sleepLogs: [],
    waterCurrent: 0,
    waterHistory: [],
    fastingLogs: [],
    fastingDuration: 16 * 3600,
    eatingSeconds: 16 * 3600,
    fastingMode: 'fast',
  };
}

export function getEmptyTasksData(): { categories: Category[]; tasks: Task[] } {
  return { categories: STARTER_TASK_CATEGORIES, tasks: [] };
}

export function getEmptyRemindersData(): { categories: ReminderCategory[]; reminders: Reminder[] } {
  return { categories: STARTER_REMINDER_CATEGORIES, reminders: [] };
}

export function getEmptyFoodData(): { entries: FoodEntry[] } {
  return { entries: [] };
}

export async function seedNewUserData(userId: string): Promise<void> {
  const { error } = await supabase.from('user_data').upsert({
    user_id: userId,
    app: getEmptyAppData(),
    tasks: getEmptyTasksData(),
    reminders: getEmptyRemindersData(),
    food: getEmptyFoodData(),
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}
