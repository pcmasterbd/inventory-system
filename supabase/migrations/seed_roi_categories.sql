-- Insert Products from Google Sheet into roi_categories
-- Note: UUIDs are auto-generated. user_id assumes the currently logged in user runs this script via SQL Editor

INSERT INTO public.roi_categories (name, unit_price, cogs_per_unit, user_id)
VALUES 
  ('Basic', 1490, 650, auth.uid()),
  ('Standard', 1990, 755, auth.uid()),
  ('Premium', 2990, 1005, auth.uid()),
  ('Corporate', 3490, 1680, auth.uid()),
  ('Re-Program 1', 1000, 300, auth.uid()),
  ('Re-Program 2', 500, 300, auth.uid()),
  ('Foam Cleaner', 690, 300, auth.uid()),
  ('7 in 1 Cleaner', 350, 200, auth.uid()),
  ('Router Stand', 350, 150, auth.uid()),
  ('Back Pillow', 750, 550, auth.uid()),
  ('Win+Office', 650, 250, auth.uid()),
  ('Installer', 500, 50, auth.uid()),
  ('200GB Soft', 500, 50, auth.uid()),
  ('Only Soft 1', 350, 50, auth.uid()),
  ('Only Soft 2', 450, 50, auth.uid()),
  ('Laptop Sale', 450, 50, auth.uid());
