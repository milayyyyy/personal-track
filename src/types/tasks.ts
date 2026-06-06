export type Priority = 'high' | 'medium' | 'low';

export interface Category {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  text: string;
  category: string;
  completed: boolean;
  priority: Priority;
  dueDate: string;
}
