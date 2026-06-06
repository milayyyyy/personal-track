import { createContext, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { DEFAULT_FOOD_ENTRIES } from '../lib/defaults';
import { loadUserSection, saveUserSection } from '../lib/userStorage';
import type { FoodEntry, MealType } from '../types/food';

interface FoodData {
  entries: FoodEntry[];
}

interface FoodContextValue {
  entries: FoodEntry[];
  todayEntries: FoodEntry[];
  todayCalories: number;
  newFoodName: string;
  setNewFoodName: (value: string) => void;
  newFoodMealType: MealType;
  setNewFoodMealType: (value: MealType) => void;
  newFoodTime: string;
  setNewFoodTime: (value: string) => void;
  newFoodCalories: string;
  setNewFoodCalories: (value: string) => void;
  newFoodNotes: string;
  setNewFoodNotes: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  mealFilter: string;
  setMealFilter: (value: string) => void;
  filteredEntries: FoodEntry[];
  handleAddFood: (e: FormEvent) => void;
  deleteFoodEntry: (id: string) => void;
}

const FoodContext = createContext<FoodContextValue | null>(null);

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

function formatDisplayTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
}

export { formatDisplayTime, todayIso };

export function FoodProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const hydrated = useRef(false);

  const initialData = user
    ? loadUserSection<FoodData>(user, 'food', { entries: DEFAULT_FOOD_ENTRIES })
    : { entries: DEFAULT_FOOD_ENTRIES };

  const [entries, setEntries] = useState<FoodEntry[]>(initialData.entries);

  useEffect(() => {
    if (!user) return;
    const saved = loadUserSection<FoodData>(user, 'food', { entries: DEFAULT_FOOD_ENTRIES });
    setEntries(saved.entries);
    hydrated.current = true;
  }, [user]);

  useEffect(() => {
    if (!user || !hydrated.current) return;
    saveUserSection(user, 'food', { entries });
  }, [user, entries]);

  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodMealType, setNewFoodMealType] = useState<MealType>('lunch');
  const [newFoodTime, setNewFoodTime] = useState('');
  const [newFoodCalories, setNewFoodCalories] = useState('');
  const [newFoodNotes, setNewFoodNotes] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [mealFilter, setMealFilter] = useState('All');

  const handleAddFood = (e: FormEvent) => {
    e.preventDefault();
    if (!newFoodName.trim()) return;

    const now = new Date();
    const defaultTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const calories = newFoodCalories ? Number.parseInt(newFoodCalories, 10) : undefined;

    const entry: FoodEntry = {
      id: `food_${Date.now()}`,
      name: newFoodName.trim(),
      mealType: newFoodMealType,
      date: todayIso(),
      time: newFoodTime || defaultTime,
      calories: Number.isFinite(calories) ? calories : undefined,
      notes: newFoodNotes.trim() || undefined,
    };

    setEntries(prev => [entry, ...prev]);
    setNewFoodName('');
    setNewFoodTime('');
    setNewFoodCalories('');
    setNewFoodNotes('');
  };

  const deleteFoodEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const today = todayIso();

  const todayEntries = useMemo(
    () => entries.filter(entry => entry.date === today).sort((a, b) => b.time.localeCompare(a.time)),
    [entries, today],
  );

  const todayCalories = useMemo(
    () => todayEntries.reduce((sum, entry) => sum + (entry.calories ?? 0), 0),
    [todayEntries],
  );

  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => {
        if (dateFilter === 'today') return entry.date === today;
        if (dateFilter === 'all') return true;
        return entry.date === dateFilter;
      })
      .filter(entry => {
        if (mealFilter === 'All') return true;
        return entry.mealType === mealFilter;
      })
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.time.localeCompare(a.time);
      });
  }, [entries, dateFilter, mealFilter, today]);

  return (
    <FoodContext.Provider
      value={{
        entries,
        todayEntries,
        todayCalories,
        newFoodName,
        setNewFoodName,
        newFoodMealType,
        setNewFoodMealType,
        newFoodTime,
        setNewFoodTime,
        newFoodCalories,
        setNewFoodCalories,
        newFoodNotes,
        setNewFoodNotes,
        dateFilter,
        setDateFilter,
        mealFilter,
        setMealFilter,
        filteredEntries,
        handleAddFood,
        deleteFoodEntry,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
}

export function useFood() {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error('useFood must be used within a FoodProvider');
  }
  return context;
}
