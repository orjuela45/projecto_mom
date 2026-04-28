-- ============================================
-- MomCitas Database Schema
-- All table/column names in English
-- UI labels in Spanish (handled in frontend)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Specialties catalog
CREATE TABLE specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Locations catalog
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  medical_record TEXT,
  phone TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  departure_time TIME,
  patient_id UUID NOT NULL REFERENCES patients(id),
  specialty_id UUID NOT NULL REFERENCES specialties(id),
  location_id UUID REFERENCES locations(id),
  companion TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'rescheduled')),
  medical_record TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- profiles: users own their data
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- specialties: read all (non-deleted), write own
CREATE POLICY "specialties_select" ON specialties FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "specialties_insert" ON specialties FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "specialties_update" ON specialties FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "specialties_delete" ON specialties FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- locations: read all (non-deleted), write own
CREATE POLICY "locations_select" ON locations FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "locations_insert" ON locations FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "locations_update" ON locations FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "locations_delete" ON locations FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- patients: read/write own
CREATE POLICY "patients_select" ON patients FOR SELECT TO authenticated USING (deleted_at IS NULL AND auth.uid() = created_by);
CREATE POLICY "patients_insert" ON patients FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "patients_update" ON patients FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "patients_delete" ON patients FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- appointments: read/write own
CREATE POLICY "appointments_select" ON appointments FOR SELECT TO authenticated USING (deleted_at IS NULL AND auth.uid() = created_by);
CREATE POLICY "appointments_insert" ON appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "appointments_update" ON appointments FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "appointments_delete" ON appointments FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
