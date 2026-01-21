-- Safely add missing columns if they don't exist
DO $$
BEGIN
    -- selling_price
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'selling_price') THEN
        ALTER TABLE public.products ADD COLUMN selling_price numeric not null default 0;
    END IF;
    
    -- cost_price
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cost_price') THEN
        ALTER TABLE public.products ADD COLUMN cost_price numeric not null default 0;
    END IF;

    -- stock_quantity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_quantity') THEN
        ALTER TABLE public.products ADD COLUMN stock_quantity integer not null default 0;
    END IF;

    -- name (just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'name') THEN
        ALTER TABLE public.products ADD COLUMN name text;
    END IF;

    -- user_id (critical for RLS)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'user_id') THEN
        ALTER TABLE public.products ADD COLUMN user_id uuid references auth.users;
    END IF;
END $$;

-- Reload Supabase Schema Cache
NOTIFY pgrst, 'reload config';
