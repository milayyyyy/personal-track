import type { Account, Transaction, TransactionCategory } from '../types/finance';
import type { Category, Task } from '../types/tasks';
import type { Reminder, ReminderCategory } from '../types/reminders';
import type { FoodEntry } from '../types/food';

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: '1', name: 'Chase Checking', type: 'Bank', balance: 5420.50, color: 'from-blue-600 to-indigo-600', currency: 'PHP' },
  { id: '2', name: 'PayPal Wallet', type: 'E-Wallet', balance: 1250.75, color: 'from-cyan-500 to-blue-500', currency: 'PHP' },
  { id: '3', name: 'Cash Balance', type: 'Cash', balance: 420.00, color: 'from-emerald-500 to-teal-600', currency: 'PHP' },
];

export const DEFAULT_TRANSACTION_CATEGORIES: TransactionCategory[] = [
  { id: 'fc1', name: 'Food & Groceries' },
  { id: 'fc2', name: 'Restaurants & Coffee' },
  { id: 'fc3', name: 'Salary & Wages' },
  { id: 'fc4', name: 'Freelance Income' },
  { id: 'fc5', name: 'Rent & Living Costs' },
  { id: 'fc6', name: 'Entertainment & Hobby' },
  { id: 'fc7', name: 'Health & Fitness' },
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 't1', title: 'Monthly Salary', amount: 3500.00, type: 'income', category: 'Salary & Wages', accountId: '1', date: '2026-06-01', currency: 'PHP' },
  { id: 't2', title: 'Groceries Supermarket', amount: 120.50, type: 'expense', category: 'Food & Groceries', accountId: '1', date: '2026-06-03', currency: 'PHP' },
  { id: 't3', title: 'Coffee Shop', amount: 6.75, type: 'expense', category: 'Restaurants & Coffee', accountId: '3', date: '2026-06-05', currency: 'PHP' },
  { id: 't4', title: 'Freelance Design', amount: 450.00, type: 'income', category: 'Freelance Income', accountId: '2', date: '2026-06-06', currency: 'PHP' },
];

export const DEFAULT_TASK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Work' },
  { id: 'c2', name: 'Finance' },
  { id: 'c3', name: 'Personal' },
  { id: 'c4', name: 'Projects' },
];

export const DEFAULT_TASKS: Task[] = [
  { id: 'task1', text: 'Pay Rent & Utilities', category: 'Finance', completed: false, priority: 'high', dueDate: '2026-06-10' },
  { id: 'task2', text: 'Review savings budget goals', category: 'Finance', completed: false, priority: 'low', dueDate: '2026-06-07' },
  { id: 'task3', text: 'Prepare quarterly report', category: 'Work', completed: false, priority: 'medium', dueDate: '2026-06-12' },
  { id: 'task4', text: 'Organize home office', category: 'Personal', completed: true, priority: 'low', dueDate: '2026-06-05' },
];

export const DEFAULT_REMINDER_CATEGORIES: ReminderCategory[] = [
  { id: 'rc1', name: 'Health' },
  { id: 'rc2', name: 'Daily Habits' },
  { id: 'rc3', name: 'Finance' },
  { id: 'rc4', name: 'Personal' },
];

export const DEFAULT_REMINDERS: Reminder[] = [
  { id: 'r1', text: 'Drink 500ml water after meal', category: 'Health', completed: false, priority: 'medium', dueDate: '2026-06-06', remindAt: '14:00' },
  { id: 'r2', text: 'Take morning vitamins', category: 'Daily Habits', completed: false, priority: 'high', dueDate: '2026-06-06', remindAt: '08:00' },
  { id: 'r3', text: 'Log intermittent fasting window', category: 'Health', completed: true, priority: 'medium', dueDate: '2026-06-06', remindAt: '20:00' },
  { id: 'r4', text: 'Check credit card due date', category: 'Finance', completed: false, priority: 'high', dueDate: '2026-06-10', remindAt: '09:00' },
];

export const DEFAULT_FOOD_ENTRIES: FoodEntry[] = [
  { id: 'food1', name: 'Oatmeal with banana & honey', mealType: 'breakfast', date: '2026-06-06', time: '07:30', calories: 380, notes: 'Homemade' },
  { id: 'food2', name: 'Grilled chicken salad', mealType: 'lunch', date: '2026-06-06', time: '12:15', calories: 520 },
  { id: 'food3', name: 'Greek yogurt & almonds', mealType: 'snack', date: '2026-06-06', time: '15:45', calories: 210 },
  { id: 'food4', name: 'Salmon with steamed vegetables', mealType: 'dinner', date: '2026-06-05', time: '19:00', calories: 610, notes: 'Dinner at home' },
];
