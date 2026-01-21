-- Manually confirm the admin user's email
-- Run this in Supabase SQL Editor

UPDATE auth.users
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'admin@pcmasterbd.com';

-- Verify the change
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'admin@pcmasterbd.com';
