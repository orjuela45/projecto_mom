-- ============================================
-- CREATE MANUAL USER FOR MomCitas
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create auth user
-- Replace with your desired email and password
SELECT auth.admin_create_user(
  'admin@momcitas.com',           -- email
  'Admin123!',                     -- password (min 6 chars)
  'Admin',                         -- email_confirm (set to true)
  'Admin User'                     -- user metadata (full_name)
);

-- Step 2: If the above doesn't work, use this alternative:
-- First, get the user ID after creating via Auth UI or use:

-- Alternative: Create user directly in auth schema
-- DO THIS ONLY IF admin_create_user doesn't work

-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   recovery_sent_at,
--   last_sign_in_at,
--   raw_app_meta_data,
--   raw_user_meta_data,
--   created_at,
--   updated_at,
--   confirmation_token,
--   email_change,
--   email_change_token_new,
--   recovery_token
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'admin@momcitas.com',
--   crypt('Admin123!', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW(),
--   '{"provider": "email", "providers": ["email"]}',
--   '{"full_name": "Admin User"}',
--   NOW(),
--   NOW(),
--   '',
--   '',
--   '',
--   ''
-- );

-- Step 3: After creating user, verify in Auth → Users panel
-- The profile should be auto-created by the trigger
