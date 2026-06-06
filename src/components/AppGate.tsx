import { useAuth } from '../context/AuthContext';
import AuthPage from '../pages/AuthPage';
import { TasksProvider } from '../context/TasksContext';
import { RemindersProvider } from '../context/RemindersContext';
import { FoodProvider } from '../context/FoodContext';
import { OfflineProvider } from '../context/OfflineContext';
import App from '../App';

export default function AppGate() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <OfflineProvider>
      <TasksProvider key={user.id}>
        <RemindersProvider key={user.id}>
          <FoodProvider key={user.id}>
            <App />
          </FoodProvider>
        </RemindersProvider>
      </TasksProvider>
    </OfflineProvider>
  );
}
