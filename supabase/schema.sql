-- Attendance records table for the Volunteer Portal
CREATE TABLE IF NOT EXISTS attendance (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id           text NOT NULL,
  participant_name  text NOT NULL,
  participant_id    text NOT NULL,
  department        text,
  pass_type         text,
  checked_in_at     timestamptz,
  checked_out_at    timestamptz,
  status            text DEFAULT 'not_arrived'
    CHECK (status IN ('not_arrived', 'checked_in', 'checked_out')),
  scanned_by        text,
  scan_count        integer DEFAULT 0,
  created_at        timestamptz DEFAULT now()
);

-- Allow all operations for volunteer portal (no Supabase auth required)
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all attendance operations"
  ON attendance FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fast lookup index for QR scans
CREATE INDEX IF NOT EXISTS idx_attendance_pass_id ON attendance(pass_id);
