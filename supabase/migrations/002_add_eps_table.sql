-- ============================================
-- EPS Table Migration
-- ============================================

-- EPS catalog
CREATE TABLE IF NOT EXISTS eps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Index for name search
CREATE INDEX IF NOT EXISTS idx_eps_name ON eps(name);

-- Row Level Security
ALTER TABLE eps ENABLE ROW LEVEL SECURITY;

-- EPS: read all (non-deleted), write own
CREATE POLICY "eps_select" ON eps FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "eps_insert" ON eps FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "eps_update" ON eps FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "eps_delete" ON eps FOR DELETE TO authenticated USING (auth.uid() = created_by);
