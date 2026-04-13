-- Seed Especialidades
INSERT INTO especialidades (nombre, created_by) VALUES
('Control Prenatal', auth.uid()),
('Cardiología', auth.uid()),
('Dermatología', auth.uid()),
('Endocrinología', auth.uid()),
('Gastroenterología', auth.uid()),
('Ginecología', auth.uid()),
('Medicina General', auth.uid()),
('Neurología', auth.uid()),
('Oftalmología', auth.uid()),
('Ortopedia', auth.uid()),
('Otorrinolaringología', auth.uid()),
('Pediatría', auth.uid()),
('Psiquiatría', auth.uid()),
('Urología', auth.uid())
ON CONFLICT (nombre) DO NOTHING;

-- Seed Lugares (example data)
INSERT INTO lugares (nombre, direccion, created_by) VALUES
('Hospital Universitario San Jose', 'Cra 4 # 36-00, Cali', auth.uid()),
('Clínica Amiga', 'Cra 9 # 10-25, Cali', auth.uid()),
('Centro Médico Valle del Lili', 'Cra 98 # 18-49, Cali', auth.uid()),
('IPS Universidad del Valle', 'Calle 4B # 36-00, Cali', auth.uid()),
('Clínica de la Mujer', 'Cra 5 # 38-20, Cali', auth.uid())
ON CONFLICT DO NOTHING;
