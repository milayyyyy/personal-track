import type { FormEvent } from 'react';
import type { Priority } from '../../types/tasks';
import type { ReminderCategory } from '../../types/reminders';

interface QuickReminderModalProps {
  open: boolean;
  onClose: () => void;
  categories: ReminderCategory[];
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
  onSubmit: (e: FormEvent) => void;
}

export default function QuickReminderModal({
  open,
  onClose,
  categories,
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
  onSubmit,
}: QuickReminderModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900/95 rounded-2xl p-6 border border-slate-700 w-full max-w-md space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-white text-base">Create New Reminder</h4>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Reminder</label>
            <input
              type="text"
              required
              placeholder="e.g. Take vitamins, Drink water, Stand up"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-rose-500"
              value={newReminderText}
              onChange={e => setNewReminderText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Category</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
                value={newReminderCategory}
                onChange={e => setNewReminderCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Priority</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
                value={newReminderPriority}
                onChange={e => setNewReminderPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Due Date</label>
              <input
                type="date"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-rose-500"
                value={newReminderDueDate}
                onChange={e => setNewReminderDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Remind At</label>
              <input
                type="time"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-rose-500 font-mono"
                value={newReminderTime}
                onChange={e => setNewReminderTime(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-all">
            Add Reminder
          </button>
        </form>
      </div>
    </div>
  );
}
