import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getEmptyRemindersData } from '../lib/defaults';
import { loadUserSection, saveUserSection } from '../lib/userStorage';
import type { Priority } from '../types/tasks';
import type { Reminder, ReminderCategory } from '../types/reminders';

interface RemindersData {
  categories: ReminderCategory[];
  reminders: Reminder[];
}

interface RemindersContextValue {
  categories: ReminderCategory[];
  reminders: Reminder[];
  pendingCount: number;
  newReminderText: string;
  setNewReminderText: (value: string) => void;
  newReminderCategory: string;
  setNewReminderCategory: (value: string) => void;
  newReminderPriority: Priority;
  setNewReminderPriority: (value: Priority) => void;
  newReminderDueDate: string;
  setNewReminderDueDate: (value: string) => void;
  newReminderTime: string;
  setNewReminderTime: (value: string) => void;
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
  filteredReminders: Reminder[];
  handleAddReminder: (e: FormEvent) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  handleCreateCategory: (e: FormEvent) => void;
  startEditingCategory: (cat: ReminderCategory) => void;
  handleUpdateCategory: (id: string) => void;
  handleDeleteCategory: (id: string, name: string) => void;
}

const RemindersContext = createContext<RemindersContextValue | null>(null);

export function RemindersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const hydrated = useRef(false);
  const userId = user?.id;

  const [categories, setCategories] = useState<ReminderCategory[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (!userId) {
      setCategories([]);
      setReminders([]);
      hydrated.current = false;
      return;
    }

    let cancelled = false;
    hydrated.current = false;

    void loadUserSection<RemindersData>(userId, 'reminders', getEmptyRemindersData()).then(saved => {
      if (cancelled) return;
      setCategories(saved.categories);
      setReminders(saved.reminders);
      hydrated.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !hydrated.current) return;
    void saveUserSection(userId, 'reminders', { categories, reminders });
  }, [userId, categories, reminders]);

  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderCategory, setNewReminderCategory] = useState('Health');
  const [newReminderPriority, setNewReminderPriority] = useState<Priority>('medium');
  const [newReminderDueDate, setNewReminderDueDate] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categoryError, setCategoryError] = useState('');

  const handleAddReminder = (e: FormEvent) => {
    e.preventDefault();
    if (!newReminderText) return;

    const newReminder: Reminder = {
      id: `reminder_${Date.now()}`,
      text: newReminderText,
      category: newReminderCategory,
      completed: false,
      priority: newReminderPriority,
      dueDate: newReminderDueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      remindAt: newReminderTime || '09:00',
    };

    setReminders(prev => [newReminder, ...prev]);
    setNewReminderText('');
    setNewReminderDueDate('');
    setNewReminderTime('');
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => (r.id === id ? { ...r, completed: !r.completed } : r)));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleCreateCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      setCategoryError('Category already exists.');
      return;
    }
    setCategoryError('');

    setCategories(prev => [...prev, { id: `rcat_${Date.now()}`, name: newCategoryName.trim() }]);
    setNewCategoryName('');
  };

  const startEditingCategory = (cat: ReminderCategory) => {
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
    setReminders(prev => prev.map(r => (r.category === oldName ? { ...r, category: newName } : r)));

    if (newReminderCategory === oldName) setNewReminderCategory(newName);
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

    const fallback = remainingCats[0].name;
    setReminders(prev => prev.map(r => (r.category === name ? { ...r, category: fallback } : r)));

    if (categoryFilter === name) setCategoryFilter('All');
  };

  const filteredReminders = reminders.filter(reminder => {
    if (categoryFilter === 'All') return true;
    return reminder.category === categoryFilter;
  });

  const pendingCount = reminders.filter(r => !r.completed).length;

  return (
    <RemindersContext.Provider
      value={{
        categories,
        reminders,
        pendingCount,
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
        filteredReminders,
        handleAddReminder,
        toggleReminder,
        deleteReminder,
        handleCreateCategory,
        startEditingCategory,
        handleUpdateCategory,
        handleDeleteCategory,
      }}
    >
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(RemindersContext);
  if (!context) {
    throw new Error('useReminders must be used within a RemindersProvider');
  }
  return context;
}
