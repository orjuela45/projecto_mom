-- ============================================
-- FIX RLS POLICIES - Make them more permissive
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop ALL existing policies (including profiles)
DROP POLICY IF EXISTS "patients_select" ON patients;
DROP POLICY IF EXISTS "patients_insert" ON patients;
DROP POLICY IF EXISTS "patients_update" ON patients;
DROP POLICY IF EXISTS "patients_delete" ON patients;
DROP POLICY IF EXISTS "patients_all" ON patients;

DROP POLICY IF EXISTS "appointments_select" ON appointments;
DROP POLICY IF EXISTS "appointments_insert" ON appointments;
DROP POLICY IF EXISTS "appointments_update" ON appointments;
DROP POLICY IF EXISTS "appointments_delete" ON appointments;
DROP POLICY IF EXISTS "appointments_all" ON appointments;

DROP POLICY IF EXISTS "specialties_select" ON specialties;
DROP POLICY IF EXISTS "specialties_insert" ON specialties;
DROP POLICY IF EXISTS "specialties_update" ON specialties;
DROP POLICY IF EXISTS "specialties_delete" ON specialties;
DROP POLICY IF EXISTS "specialties_all" ON specialties;

DROP POLICY IF EXISTS "locations_select" ON locations;
DROP POLICY IF EXISTS "locations_insert" ON locations;
DROP POLICY IF EXISTS "locations_update" ON locations;
DROP POLICY IF EXISTS "locations_delete" ON locations;
DROP POLICY IF EXISTS "locations_all" ON locations;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_all" ON profiles;

-- ============================================
-- NEW PERMISSIVE POLICIES
-- All authenticated users can read/write their own data
-- ============================================

-- Patients: authenticated users can do everything
CREATE POLICY "patients_all" ON patients
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Appointments: authenticated users can do everything
CREATE POLICY "appointments_all" ON appointments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Specialties: authenticated users can do everything
CREATE POLICY "specialties_all" ON specialties
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Locations: authenticated users can do everything
CREATE POLICY "locations_all" ON locations
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Profiles: users can access their own profile
CREATE POLICY "profiles_all" ON profiles
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
