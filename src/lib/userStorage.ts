import { supabase } from './supabase';

export type DataSection = 'app' | 'tasks' | 'reminders' | 'food';

const SECTION_COLUMN: Record<DataSection, string> = {
  app: 'app',
  tasks: 'tasks',
  reminders: 'reminders',
  food: 'food',
};

export async function loadUserSection<T>(userId: string, section: DataSection, fallback: T): Promise<T> {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select(SECTION_COLUMN[section])
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return fallback;

    const payload = data[SECTION_COLUMN[section] as keyof typeof data];
    if (!payload || typeof payload !== 'object') return fallback;
    return payload as T;
  } catch (err) {
    console.error(`Failed to load ${section} from Supabase`, err);
    return fallback;
  }
}

export async function saveUserSection<T>(userId: string, section: DataSection, data: T): Promise<void> {
  const column = SECTION_COLUMN[section];
  const { error } = await supabase.from('user_data').upsert(
    {
      user_id: userId,
      [column]: data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.error(`Failed to save ${section} to Supabase`, error);
    throw error;
  }

  window.dispatchEvent(new Event('lifeflow-data-updated'));
}
