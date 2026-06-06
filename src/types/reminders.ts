import type { Priority } from './tasks';

export interface ReminderCategory {
  id: string;
  name: string;
}

export interface Reminder {
  id: string;
  text: string;
  category: string;
  completed: boolean;
  priority: Priority;
  dueDate: string;
  remindAt: string;
}
