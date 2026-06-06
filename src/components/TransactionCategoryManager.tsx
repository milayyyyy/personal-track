import type { FormEvent } from 'react';
import { Check, Edit2, Sparkles, Trash2, X } from 'lucide-react';
import type { TransactionCategory } from '../types/finance';

interface TransactionCategoryManagerProps {
  categories: TransactionCategory[];
  newCategoryName: string;
  setNewCategoryName: (value: string) => void;
  editingCategoryId: string | null;
  setEditingCategoryId: (value: string | null) => void;
  editCategoryName: string;
  setEditCategoryName: (value: string) => void;
  categoryError: string;
  setCategoryError: (value: string) => void;
  onCreateCategory: (e: FormEvent) => void;
  onStartEditing: (cat: TransactionCategory) => void;
  onUpdateCategory: (id: string) => void;
  onDeleteCategory: (id: string, name: string) => void;
  compact?: boolean;
}

export default function TransactionCategoryManager({
  categories,
  newCategoryName,
  setNewCategoryName,
  editingCategoryId,
  setEditingCategoryId,
  editCategoryName,
  setEditCategoryName,
  categoryError,
  setCategoryError,
  onCreateCategory,
  onStartEditing,
  onUpdateCategory,
  onDeleteCategory,
  compact = false,
}: TransactionCategoryManagerProps) {
  return (
    <div className={`space-y-3 ${compact ? 'text-xs' : ''}`}>
      <h5 className={`font-bold text-slate-200 flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
        <Sparkles className={`text-emerald-400 ${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
        Manage Categories
      </h5>

      {categoryError && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] rounded-xl flex items-center justify-between">
          <span>{categoryError}</span>
          <button type="button" onClick={() => setCategoryError('')} className="text-slate-400 hover:text-slate-200 font-bold">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={onCreateCategory} className="flex space-x-2">
        <input
          type="text"
          required
          placeholder="Add category..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
          value={newCategoryName}
          onChange={e => setNewCategoryName(e.target.value)}
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0"
        >
          Add
        </button>
      </form>

      <div className={`space-y-1.5 overflow-y-auto pr-1 ${compact ? 'max-h-32' : 'max-h-48'}`}>
        {categories.map(cat => (
          <div
            key={cat.id}
            className="flex items-center justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-900 text-xs"
          >
            {editingCategoryId === cat.id ? (
              <div className="flex items-center space-x-1.5 w-full">
                <input
                  type="text"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded p-1 text-white text-[11px]"
                  value={editCategoryName}
                  onChange={e => setEditCategoryName(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => onUpdateCategory(cat.id)}
                  className="text-emerald-400 hover:text-emerald-300 p-1"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCategoryId(null)}
                  className="text-slate-400 hover:text-slate-300 p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <span className="text-slate-300 truncate">{cat.name}</span>
                <div className="flex space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onStartEditing(cat)}
                    className="text-slate-400 hover:text-emerald-400 p-1 transition-all"
                    title="Edit category"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat.id, cat.name)}
                    className={`p-1 transition-all ${categories.length <= 1 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:text-rose-400'}`}
                    title="Delete category"
                    disabled={categories.length <= 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
