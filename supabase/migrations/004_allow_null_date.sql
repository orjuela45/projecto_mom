-- ============================================
-- Allow NULL dates for follow-up appointments
-- ============================================

-- Remove NOT NULL constraint from date column
ALTER TABLE appointments 
ALTER COLUMN date DROP NOT NULL;

-- Remove NOT NULL constraint from appointment_time column
ALTER TABLE appointments 
ALTER COLUMN appointment_time DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN appointments.date IS 'Fecha de la cita. NULL para citas sin asignar (seguimiento)';
COMMENT ON COLUMN appointments.appointment_time IS 'Hora de la cita. NULL para citas sin asignar (seguimiento)';
