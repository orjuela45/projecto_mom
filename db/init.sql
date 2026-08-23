-- MomCitas - Database init
-- Runs on first boot

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles (legacy Supabase roles; the app connects as superuser and does not use them).
-- CREATE ROLE has no IF NOT EXISTS, so guard with pg_roles to keep this script re-runnable.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

-- Tables
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

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

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE,
  appointment_time TIME,
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

CREATE TABLE eps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_eps_name ON eps(name);

-- Grants
GRANT SELECT ON specialties, locations, patients, appointments, eps, profiles TO anon;
GRANT ALL ON specialties, locations, patients, appointments, eps, profiles TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE eps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_all" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "specialties_all" ON specialties FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "locations_all" ON locations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "patients_all" ON patients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "appointments_all" ON appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "eps_all" ON eps FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Comments
COMMENT ON COLUMN appointments.date IS 'Fecha de la cita. NULL para citas sin asignar';
COMMENT ON COLUMN appointments.appointment_time IS 'Hora de la cita. NULL para citas sin asignar';

-- ============================================
-- SEED
-- ============================================

-- Default local user (matches DEFAULT_USER.id in src/lib/auth.ts).
-- No password is required because there is no real auth flow.
INSERT INTO profiles (id, email, full_name, role)
VALUES (
'00000000-0000-0000-0000-000000000001',
'admin@momcitas.com',
'Admin',
'admin'
)
ON CONFLICT (id) DO NOTHING;

-- Specialties catalog
INSERT INTO specialties (name, created_by) VALUES
('Prenatal Care',       '00000000-0000-0000-0000-000000000001'),
('Cardiology',          '00000000-0000-0000-0000-000000000001'),
('Dermatology',         '00000000-0000-0000-0000-000000000001'),
('Endocrinology',       '00000000-0000-0000-0000-000000000001'),
('Gastroenterology',    '00000000-0000-0000-0000-000000000001'),
('Gynecology',          '00000000-0000-0000-0000-000000000001'),
('General Medicine',    '00000000-0000-0000-0000-000000000001'),
('Neurology',           '00000000-0000-0000-0000-000000000001'),
('Ophthalmology',       '00000000-0000-0000-0000-000000000001'),
('Orthopedics',         '00000000-0000-0000-0000-000000000001'),
('Otolaryngology',      '00000000-0000-0000-0000-000000000001'),
('Pediatrics',          '00000000-0000-0000-0000-000000000001'),
('Psychiatry',          '00000000-0000-0000-0000-000000000001'),
('Urology',             '00000000-0000-0000-0000-000000000001')
ON CONFLICT (name) DO NOTHING;

-- Locations catalog
INSERT INTO locations (name, address, created_by) VALUES
('Hospital Universitario San Jose',   'Cra 4 # 36-00, Cali', '00000000-0000-0000-0000-000000000001'),
('Clínica Amiga',                      'Cra 9 # 10-25, Cali', '00000000-0000-0000-0000-000000000001'),
('Centro Médico Valle del Lili',       'Cra 98 # 18-49, Cali', '00000000-0000-0000-0000-000000000001'),
('IPS Universidad del Valle',          'Calle 4B # 36-00, Cali', '00000000-0000-0000-0000-000000000001'),
('Clínica de la Mujer',                'Cra 5 # 38-20, Cali', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
