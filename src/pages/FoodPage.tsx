import { Calendar, Clock, Trash2, UtensilsCrossed } from 'lucide-react';
import { formatDisplayTime, useFood } from '../context/FoodContext';
import { MEAL_TYPE_LABELS, type MealType } from '../types/food';

const MEAL_FILTERS: Array<'All' | MealType> = ['All', 'breakfast', 'lunch', 'dinner', 'snack'];

function mealBadgeClass(mealType: MealType) {
  switch (mealType) {
    case 'breakfast':
      return 'bg-amber-500/20 text-amber-400';
    case 'lunch':
      return 'bg-orange-500/20 text-orange-400';
    case 'dinner':
      return 'bg-indigo-500/20 text-indigo-400';
    case 'snack':
      return 'bg-emerald-500/20 text-emerald-400';
  }
}

export default function FoodPage() {
  const {
    entries,
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
  } = useFood();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-amber-400" /> Food Intake Records
          </h2>
          <p className="text-slate-400 text-sm">Log what you eat and review your daily meal history.</p>
        </div>
        <div className="bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400">Today&apos;s calories logged</span>
          <p className="text-lg font-bold text-amber-300 mt-0.5">{todayCalories > 0 ? `${todayCalories} kcal` : '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/30 rounded-2xl p-6 border border-slate-800/80 space-y-4">
            <h3 className="font-bold text-white text-sm">Log Food</h3>
            <form onSubmit={handleAddFood} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Food / Meal</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oatmeal with banana, Grilled chicken salad"
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
                  placeholder="e.g. 450"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-amber-500"
                  value={newFoodCalories}
                  onChange={e => setNewFoodCalories(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Notes (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Homemade, restaurant, protein shake"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-amber-500"
                  value={newFoodNotes}
                  onChange={e => setNewFoodNotes(e.target.value)}
                />
              </div>

              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all">
                Add Food Entry
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8 bg-slate-900/30 rounded-2xl p-6 border border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-base">Intake History</h3>
              <p className="text-slate-400 text-xs">
                {entries.length} total entries · {filteredEntries.length} shown
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setDateFilter('today')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${dateFilter === 'today' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter('all')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${dateFilter === 'all' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  All
                </button>
              </div>

              <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs max-w-full overflow-x-auto">
                {MEAL_FILTERS.map(filter => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setMealFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      mealFilter === filter ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter === 'All' ? 'All Meals' : MEAL_TYPE_LABELS[filter]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {filteredEntries.map(entry => (
              <div
                key={entry.id}
                className="p-4 rounded-xl border bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/30 transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{entry.name}</p>
                  <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${mealBadgeClass(entry.mealType)}`}>
                      {MEAL_TYPE_LABELS[entry.mealType]}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDisplayTime(entry.time)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {entry.date}
                    </span>
                    {entry.calories != null && (
                      <span className="text-[10px] text-amber-400 font-medium">{entry.calories} kcal</span>
                    )}
                  </div>
                  {entry.notes && (
                    <p className="text-[10px] text-slate-500 mt-1">{entry.notes}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => deleteFoodEntry(entry.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 transition-all shrink-0"
                  title="Delete entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {filteredEntries.length === 0 && (
              <div className="text-center py-8 bg-slate-900/10 rounded-xl border border-dashed border-slate-800">
                <p className="text-sm text-slate-500">No food entries found for this selection.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
