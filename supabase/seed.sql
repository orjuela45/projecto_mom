-- Seed Specialties
INSERT INTO specialties (name, created_by) VALUES
('Prenatal Care', auth.uid()),
('Cardiology', auth.uid()),
('Dermatology', auth.uid()),
('Endocrinology', auth.uid()),
('Gastroenterology', auth.uid()),
('Gynecology', auth.uid()),
('General Medicine', auth.uid()),
('Neurology', auth.uid()),
('Ophthalmology', auth.uid()),
('Orthopedics', auth.uid()),
('Otolaryngology', auth.uid()),
('Pediatrics', auth.uid()),
('Psychiatry', auth.uid()),
('Urology', auth.uid())
ON CONFLICT (name) DO NOTHING;

-- Seed Locations (example data)
INSERT INTO locations (name, address, created_by) VALUES
('Hospital Universitario San Jose', 'Cra 4 # 36-00, Cali', auth.uid()),
('Clínica Amiga', 'Cra 9 # 10-25, Cali', auth.uid()),
('Centro Médico Valle del Lili', 'Cra 98 # 18-49, Cali', auth.uid()),
('IPS Universidad del Valle', 'Calle 4B # 36-00, Cali', auth.uid()),
('Clínica de la Mujer', 'Cra 5 # 38-20, Cali', auth.uid())
ON CONFLICT DO NOTHING;
