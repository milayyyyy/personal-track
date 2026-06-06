import type { Currency } from '../types/finance';

const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string }[] = [
  { value: 'PHP', label: 'PHP', symbol: '₱' },
  { value: 'USD', label: 'USD', symbol: '$' },
];

export function formatMoney(amount: number, currency: Currency): string {
  const config = CURRENCY_OPTIONS.find(c => c.value === currency) ?? CURRENCY_OPTIONS[0];
  const locale = currency === 'PHP' ? 'en-PH' : 'en-US';
  return `${config.symbol}${amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const CURRENCY_LIST = CURRENCY_OPTIONS;

export function CurrencyToggle({ value, onChange }: { value: Currency; onChange: (currency: Currency) => void }) {
  return (
    <div className="flex space-x-2">
      {CURRENCY_OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
            value === option.value
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {option.label} ({option.symbol})
        </button>
      ))}
    </div>
  );
}
