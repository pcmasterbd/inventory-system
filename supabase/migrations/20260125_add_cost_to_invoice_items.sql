-- Add cost_price to invoice_items to track historical COGS
ALTER TABLE public.invoice_items 
ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;

-- Update existing items to use current product cost (backfill)
UPDATE public.invoice_items ii
SET cost_price = p.cost_price
FROM public.products p
WHERE ii.product_id = p.id
AND ii.cost_price = 0;
