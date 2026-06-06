import type { FormEvent } from 'react';
import { MEAL_TYPE_LABELS, type MealType } from '../../types/food';

interface QuickFoodModalProps {
  open: boolean;
  onClose: () => void;
  newFoodName: string;
  setNewFoodName: (value: string) => void;
  newFoodMealType: MealType;
  setNewFoodMealType: (value: MealType) => void;
  newFoodTime: string;
  setNewFoodTime: (value: string) => void;
  newFoodCalories: string;
  setNewFoodCalories: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function QuickFoodModal({
  open,
  onClose,
  newFoodName,
  setNewFoodName,
  newFoodMealType,
  setNewFoodMealType,
  newFoodTime,
  setNewFoodTime,
  newFoodCalories,
  setNewFoodCalories,
  onSubmit,
}: QuickFoodModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-panel space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-white text-base">Log Food Intake</h4>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Food / Meal</label>
            <input
              type="text"
              required
              placeholder="e.g. Rice and chicken, Protein shake"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-amber-500"
              value={newFoodName}
              onChange={e => setNewFoodName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Meal Type</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
                value={newFoodMealType}
                onChange={e => setNewFoodMealType(e.target.value as MealType)}
              >
                {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map(type => (
                  <option key={type} value={type}>{MEAL_TYPE_LABELS[type]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Time</label>
              <input
                type="time"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                value={newFoodTime}
                onChange={e => setNewFoodTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Calories (optional)</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 350"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-amber-500"
              value={newFoodCalories}
              onChange={e => setNewFoodCalories(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all">
            Add Food Entry
          </button>
        </form>
      </div>
    </div>
  );
}
