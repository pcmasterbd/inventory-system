-- Create Investments Table
create table if not exists investments (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    start_date date not null,
    capital_amount numeric not null,
    current_return numeric default 0,
    status text default 'active' check (status in ('active', 'closed')),
    user_id uuid references auth.users not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table investments enable row level security;

-- Policies
create policy "Users can view their own investments"
on investments for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own investments"
on investments for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own investments"
on investments for update
to authenticated
using (auth.uid() = user_id);

create policy "Users can delete their own investments"
on investments for delete
to authenticated
using (auth.uid() = user_id);
