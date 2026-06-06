import {
  Activity,
  Bell,
  ListTodo,
  Moon,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  activeClass: string;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Unified Dashboard',
    shortLabel: 'Home',
    icon: Activity,
    activeClass: 'text-indigo-300',
    end: true,
  },
  {
    to: '/finance',
    label: 'Finance Tracker',
    shortLabel: 'Finance',
    icon: Wallet,
    activeClass: 'text-emerald-300',
  },
  {
    to: '/wellness',
    label: 'Health & Wellness',
    shortLabel: 'Wellness',
    icon: Moon,
    activeClass: 'text-blue-300',
  },
  {
    to: '/tasks',
    label: 'Tasks',
    shortLabel: 'Tasks',
    icon: ListTodo,
    activeClass: 'text-indigo-300',
  },
  {
    to: '/reminders',
    label: 'Reminders',
    shortLabel: 'Alerts',
    icon: Bell,
    activeClass: 'text-rose-300',
  },
  {
    to: '/food',
    label: 'Food Intake',
    shortLabel: 'Food',
    icon: UtensilsCrossed,
    activeClass: 'text-amber-300',
  },
];
