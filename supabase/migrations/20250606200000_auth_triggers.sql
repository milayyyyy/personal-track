-- Auto-create profile and user_data when a new auth user is created.
-- This avoids RLS failures when sign-up has no active session yet.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_username text;
begin
  chosen_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, username, email)
  values (new.id, chosen_username, new.email)
  on conflict (id) do nothing;

  insert into public.user_data (user_id, app, tasks, reminders, food)
  values (
    new.id,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
