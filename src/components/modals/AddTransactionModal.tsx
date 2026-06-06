import { useState, type FormEvent } from 'react';
import type { Account, Currency, TransactionCategory } from '../../types/finance';
import { CurrencyToggle } from '../CurrencyToggle';
import TransactionCategoryManager from '../TransactionCategoryManager';

type TxType = 'income' | 'expense';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  txType: TxType;
  setTxType: (type: TxType) => void;
  txTitle: string;
  setTxTitle: (value: string) => void;
  txAmount: string;
  setTxAmount: (value: string) => void;
  txCurrency: Currency;
  setTxCurrency: (value: Currency) => void;
  txAccount: string;
  onAccountChange: (accountId: string) => void;
  txCategory: string;
  setTxCategory: (value: string) => void;
  transactionCategories: TransactionCategory[];
  newTxCategoryName: string;
  setNewTxCategoryName: (value: string) => void;
  editingTxCategoryId: string | null;
  setEditingTxCategoryId: (value: string | null) => void;
  editTxCategoryName: string;
  setEditTxCategoryName: (value: string) => void;
  txCategoryError: string;
  setTxCategoryError: (value: string) => void;
  onCreateTxCategory: (e: FormEvent) => void;
  onStartEditingTxCategory: (cat: TransactionCategory) => void;
  onUpdateTxCategory: (id: string) => void;
  onDeleteTxCategory: (id: string, name: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function AddTransactionModal({
  open,
  onClose,
  accounts,
  txType,
  setTxType,
  txTitle,
  setTxTitle,
  txAmount,
  setTxAmount,
  txCurrency,
  setTxCurrency,
  txAccount,
  onAccountChange,
  txCategory,
  setTxCategory,
  transactionCategories,
  newTxCategoryName,
  setNewTxCategoryName,
  editingTxCategoryId,
  setEditingTxCategoryId,
  editTxCategoryName,
  setEditTxCategoryName,
  txCategoryError,
  setTxCategoryError,
  onCreateTxCategory,
  onStartEditingTxCategory,
  onUpdateTxCategory,
  onDeleteTxCategory,
  onSubmit,
}: AddTransactionModalProps) {
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-panel space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-white text-base">Log Income or Expense</h4>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setTxType('expense')}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${txType === 'expense' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-slate-950 border border-slate-800 text-slate-400'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setTxType('income')}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${txType === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-950 border border-slate-800 text-slate-400'}`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Title/Payee</label>
            <input
              type="text"
              required
              placeholder="e.g. Grocery Store, Coffee, Salary Pay"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
              value={txTitle}
              onChange={e => setTxTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-2 font-semibold">Currency</label>
            <CurrencyToggle value={txCurrency} onChange={setTxCurrency} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                Amount ({txCurrency === 'USD' ? '$' : '₱'})
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                value={txAmount}
                onChange={e => setTxAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Financial Account</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
                value={txAccount}
                onChange={e => onAccountChange(e.target.value)}
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency === 'USD' ? '$' : '₱'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-slate-400 font-semibold">Category</label>
              <button
                type="button"
                onClick={() => setShowCategoryManager(prev => !prev)}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                {showCategoryManager ? 'Hide manager' : 'Manage categories'}
              </button>
            </div>
            <select
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
              value={txCategory}
              onChange={e => setTxCategory(e.target.value)}
            >
              {transactionCategories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {showCategoryManager && (
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <TransactionCategoryManager
                compact
                categories={transactionCategories}
                newCategoryName={newTxCategoryName}
                setNewCategoryName={setNewTxCategoryName}
                editingCategoryId={editingTxCategoryId}
                setEditingCategoryId={setEditingTxCategoryId}
                editCategoryName={editTxCategoryName}
                setEditCategoryName={setEditTxCategoryName}
                categoryError={txCategoryError}
                setCategoryError={setTxCategoryError}
                onCreateCategory={onCreateTxCategory}
                onStartEditing={onStartEditingTxCategory}
                onUpdateCategory={onUpdateTxCategory}
                onDeleteCategory={onDeleteTxCategory}
              />
            </div>
          )}

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all">
            Log Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
