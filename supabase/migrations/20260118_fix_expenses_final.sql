-- 1. Create the table if it doesn't exist
create table if not exists public.roi_expenses (
  id uuid not null default gen_random_uuid (),
  description text not null,
  amount numeric not null default 0,
  expense_type text not null,
  date timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint roi_expenses_pkey primary key (id)
);

-- 2. Enable RLS
alter table public.roi_expenses enable row level security;

-- 3. Safely recreate policies (drop first to avoid errors)
drop policy if exists "Owner view expenses" on roi_expenses;
drop policy if exists "Owner insert expenses" on roi_expenses;
drop policy if exists "Owner update expenses" on roi_expenses;
drop policy if exists "Owner delete expenses" on roi_expenses;

create policy "Owner view expenses" on roi_expenses for select using (auth.uid() = user_id);
create policy "Owner insert expenses" on roi_expenses for insert with check (auth.uid() = user_id);
create policy "Owner update expenses" on roi_expenses for update using (auth.uid() = user_id);
create policy "Owner delete expenses" on roi_expenses for delete using (auth.uid() = user_id);

-- 4. CRITICAL: Refresh the Schema Cache so the API sees the new table
NOTIFY pgrst, 'reload config';
