import type { FormEvent } from 'react';
import type { Category, Priority } from '../../types/tasks';

interface QuickTaskModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  placeholder: string;
  categories: Category[];
  newTaskText: string;
  setNewTaskText: (value: string) => void;
  newTaskCategory: string;
  setNewTaskCategory: (value: string) => void;
  newTaskPriority: Priority;
  setNewTaskPriority: (value: Priority) => void;
  newTaskDueDate: string;
  setNewTaskDueDate: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function QuickTaskModal({
  open,
  onClose,
  title,
  submitLabel,
  placeholder,
  categories,
  newTaskText,
  setNewTaskText,
  newTaskCategory,
  setNewTaskCategory,
  newTaskPriority,
  setNewTaskPriority,
  newTaskDueDate,
  setNewTaskDueDate,
  onSubmit,
}: QuickTaskModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-panel space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-white text-base">{title}</h4>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Name</label>
            <input
              type="text"
              required
              placeholder={placeholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Category</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
                value={newTaskCategory}
                onChange={e => setNewTaskCategory(e.target.value)}
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
                value={newTaskPriority}
                onChange={e => setNewTaskPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Due Date (Optional)</label>
            <input
              type="date"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
              value={newTaskDueDate}
              onChange={e => setNewTaskDueDate(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all">
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
