import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { DEFAULT_TASK_CATEGORIES, DEFAULT_TASKS } from '../lib/defaults';
import { loadUserSection, saveUserSection } from '../lib/userStorage';
import type { Category, Priority, Task } from '../types/tasks';

interface TasksData {
  categories: Category[];
  tasks: Task[];
}

interface TasksContextValue {
  categories: Category[];
  tasks: Task[];
  pendingCount: number;
  newTaskText: string;
  setNewTaskText: (value: string) => void;
  newTaskCategory: string;
  setNewTaskCategory: (value: string) => void;
  newTaskPriority: Priority;
  setNewTaskPriority: (value: Priority) => void;
  newTaskDueDate: string;
  setNewTaskDueDate: (value: string) => void;
  newCategoryName: string;
  setNewCategoryName: (value: string) => void;
  editingCategoryId: string | null;
  setEditingCategoryId: (value: string | null) => void;
  editCategoryName: string;
  setEditCategoryName: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categoryError: string;
  setCategoryError: (value: string) => void;
  filteredTasks: Task[];
  handleAddTask: (e: FormEvent) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  handleCreateCategory: (e: FormEvent) => void;
  startEditingCategory: (cat: Category) => void;
  handleUpdateCategory: (id: string) => void;
  handleDeleteCategory: (id: string, name: string) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const hydrated = useRef(false);

  const initialData = user
    ? loadUserSection<TasksData>(user, 'tasks', { categories: DEFAULT_TASK_CATEGORIES, tasks: DEFAULT_TASKS })
    : { categories: DEFAULT_TASK_CATEGORIES, tasks: DEFAULT_TASKS };

  const [categories, setCategories] = useState<Category[]>(initialData.categories);
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks);

  useEffect(() => {
    if (!user) return;
    const saved = loadUserSection<TasksData>(user, 'tasks', { categories: DEFAULT_TASK_CATEGORIES, tasks: DEFAULT_TASKS });
    setCategories(saved.categories);
    setTasks(saved.tasks);
    hydrated.current = true;
  }, [user]);

  useEffect(() => {
    if (!user || !hydrated.current) return;
    saveUserSection(user, 'tasks', { categories, tasks });
  }, [user, categories, tasks]);

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Work');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categoryError, setCategoryError] = useState('');

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskText) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      text: newTaskText,
      category: newTaskCategory,
      completed: false,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskText('');
    setNewTaskDueDate('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleCreateCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      setCategoryError('Category already exists.');
      return;
    }
    setCategoryError('');

    setCategories(prev => [...prev, { id: `cat_${Date.now()}`, name: newCategoryName.trim() }]);
    setNewCategoryName('');
  };

  const startEditingCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setEditCategoryName(cat.name);
  };

  const handleUpdateCategory = (id: string) => {
    if (!editCategoryName.trim()) return;

    if (categories.some(cat => cat.id !== id && cat.name.toLowerCase() === editCategoryName.trim().toLowerCase())) {
      setCategoryError('Another category has this name.');
      return;
    }
    setCategoryError('');

    const originalCat = categories.find(cat => cat.id === id);
    const oldName = originalCat ? originalCat.name : '';
    const newName = editCategoryName.trim();

    setCategories(prev => prev.map(cat => (cat.id === id ? { ...cat, name: newName } : cat)));
    setTasks(prev => prev.map(task => (task.category === oldName ? { ...task, category: newName } : task)));

    if (newTaskCategory === oldName) setNewTaskCategory(newName);
    if (categoryFilter === oldName) setCategoryFilter(newName);

    setEditingCategoryId(null);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (categories.length <= 1) {
      setCategoryError('You must maintain at least one category.');
      return;
    }
    setCategoryError('');

    const remainingCats = categories.filter(cat => cat.id !== id);
    setCategories(remainingCats);

    const fallbackCategoryName = remainingCats[0].name;
    setTasks(prev => prev.map(task => (task.category === name ? { ...task, category: fallbackCategoryName } : task)));

    if (categoryFilter === name) setCategoryFilter('All');
  };

  const filteredTasks = tasks.filter(task => {
    if (categoryFilter === 'All') return true;
    return task.category === categoryFilter;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <TasksContext.Provider
      value={{
        categories,
        tasks,
        pendingCount,
        newTaskText,
        setNewTaskText,
        newTaskCategory,
        setNewTaskCategory,
        newTaskPriority,
        setNewTaskPriority,
        newTaskDueDate,
        setNewTaskDueDate,
        newCategoryName,
        setNewCategoryName,
        editingCategoryId,
        setEditingCategoryId,
        editCategoryName,
        setEditCategoryName,
        categoryFilter,
        setCategoryFilter,
        categoryError,
        setCategoryError,
        filteredTasks,
        handleAddTask,
        toggleTask,
        deleteTask,
        handleCreateCategory,
        startEditingCategory,
        handleUpdateCategory,
        handleDeleteCategory,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
