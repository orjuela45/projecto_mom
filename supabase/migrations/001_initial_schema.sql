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

-- Especialidades catalog
CREATE TABLE especialidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Lugares catalog
CREATE TABLE lugares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  direccion TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Pacientes
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  historia_clinica TEXT,
  telefono TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Citas
CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE NOT NULL,
  hora_cita TIME NOT NULL,
  hora_salida TIME,
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  especialidad_id UUID NOT NULL REFERENCES especialidades(id),
  lugar_id UUID REFERENCES lugares(id),
  acompanante TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'atendido', 'cancelado', 'reprogramado')),
  historia_clinica TEXT,
  observaciones TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_citas_fecha ON citas(fecha);
CREATE INDEX idx_citas_paciente ON citas(paciente_id);
CREATE INDEX idx_citas_estado ON citas(estado);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE lugares ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

-- profiles: users own their data
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- especialidades: read all (non-deleted), write own
CREATE POLICY "especialidades_select" ON especialidades FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "especialidades_insert" ON especialidades FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "especialidades_update" ON especialidades FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "especialidades_delete" ON especialidades FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- lugares: read all (non-deleted), write own
CREATE POLICY "lugares_select" ON lugares FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "lugares_insert" ON lugares FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "lugares_update" ON lugares FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "lugares_delete" ON lugares FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- pacientes: read/write own
CREATE POLICY "pacientes_select" ON pacientes FOR SELECT TO authenticated USING (deleted_at IS NULL AND auth.uid() = created_by);
CREATE POLICY "pacientes_insert" ON pacientes FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "pacientes_update" ON pacientes FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "pacientes_delete" ON pacientes FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- citas: read/write own
CREATE POLICY "citas_select" ON citas FOR SELECT TO authenticated USING (deleted_at IS NULL AND auth.uid() = created_by);
CREATE POLICY "citas_insert" ON citas FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "citas_update" ON citas FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "citas_delete" ON citas FOR DELETE TO authenticated USING (auth.uid() = created_by);

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
