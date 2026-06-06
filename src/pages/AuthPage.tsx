import { useState, type FormEvent } from 'react';
import { Activity, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const { login, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = mode === 'login' ? await login(username) : await signUp(username);

    if (!result.ok) {
      setError(result.error);
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex bg-gradient-to-tr from-indigo-500 to-emerald-400 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">LifeFlow</h1>
            <p className="text-sm text-slate-400 mt-1">Personal finance & wellness tracker</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-sm font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="h-4 w-4" /> Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === 'signup' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="h-4 w-4" /> Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-semibold">Username</label>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="e.g. alex, maria.c, john_d"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full font-bold py-3 rounded-xl transition-all disabled:opacity-60 ${
                mode === 'login'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {submitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          {mode === 'signup'
            ? 'Pick a unique username. No password needed.'
            : 'Enter your username to continue.'}
        </p>
      </div>
    </div>
  );
}
