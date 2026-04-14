-- =============================================================
-- Kalam Conclave 2.0 — Full Database Schema
-- Run this entire file in the Supabase SQL Editor to create
-- all required tables.  It is safe to re-run (uses IF NOT EXISTS).
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. speakers  (Guests section)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.speakers (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL DEFAULT '',
  title       text        NOT NULL DEFAULT '',
  topic       text        NOT NULL DEFAULT '',
  image       text                 DEFAULT '',
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read speakers" ON public.speakers;
DROP POLICY IF EXISTS "Public read guests" ON public.speakers;
CREATE POLICY "Public read guests"
  ON public.speakers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all speakers operations" ON public.speakers;
DROP POLICY IF EXISTS "Allow all guests operations" ON public.speakers;
CREATE POLICY "Allow all guests operations"
  ON public.speakers FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 2. schedule  (Event agenda)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.schedule (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  time        text        NOT NULL DEFAULT '',
  title       text        NOT NULL DEFAULT '',
  description text                 DEFAULT '',
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read schedule" ON public.schedule;
CREATE POLICY "Public read schedule"
  ON public.schedule FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all schedule operations" ON public.schedule;
CREATE POLICY "Allow all schedule operations"
  ON public.schedule FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 3. organisers
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organisers (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL DEFAULT '',
  role        text        NOT NULL DEFAULT '',
  image       text                 DEFAULT '',
  bio         text                 DEFAULT '',
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.organisers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read organisers" ON public.organisers;
CREATE POLICY "Public read organisers"
  ON public.organisers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all organisers operations" ON public.organisers;
CREATE POLICY "Allow all organisers operations"
  ON public.organisers FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 4. app_settings  (key/value store for live event config)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_settings (
  key         text        PRIMARY KEY,
  value       text        NOT NULL DEFAULT '',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
CREATE POLICY "Public read app_settings"
  ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all app_settings operations" ON public.app_settings;
CREATE POLICY "Allow all app_settings operations"
  ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- Seed default settings (safe to re-run — upserts on conflict)
INSERT INTO public.app_settings (key, value) VALUES
  ('event_date',        '2026-04-21T10:00:00+05:30'),
  ('event_date_label',  '21st April 2026'),
  ('event_time_label',  '10:00 AM Onwards'),
  ('event_venue',       'MultiPurpose Hall, A-Block, K.R. Mangalam University'),
  ('event_short_title', 'Kalam Conclave 2.0'),
  ('upi_qr_url',        ''),
  ('upi_id',            ''),
  ('ticket_price',      '149'),
  ('social_instagram_url', ''),
  ('social_linkedin_url', ''),
  ('social_youtube_url', '')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 5. registrations
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.registrations (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reg_id                  text        NOT NULL UNIQUE,
  full_name               text        NOT NULL DEFAULT '',
  email                   text        NOT NULL DEFAULT '',
  phone                   text        NOT NULL DEFAULT '',
  college                 text        NOT NULL DEFAULT '',
  course                  text        NOT NULL DEFAULT '',
  year_of_study           text        NOT NULL DEFAULT '1st',
  city                    text        NOT NULL DEFAULT '',
  heard_from              text        NOT NULL DEFAULT 'Instagram',
  utr_id                  text        NOT NULL DEFAULT '',
  payment_screenshot_url  text,
  payment_status          text        NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'verified')),
  verification_email_sent boolean     NOT NULL DEFAULT false,
  verification_email_sent_at timestamptz,
  attendance              boolean     NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Backward compatibility for existing databases created before
-- verification email tracking fields were introduced.
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS verification_email_sent boolean NOT NULL DEFAULT false;
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS verification_email_sent_at timestamptz;

-- Participation mode and team detail columns retained for data compatibility;
-- the main registration UI no longer collects team information (solo-only).
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS participation_mode text NOT NULL DEFAULT 'solo';
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS team_name text;
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS team_members jsonb;

-- Anyone can insert a new registration (public registration form)
DROP POLICY IF EXISTS "Public insert registrations" ON public.registrations;
CREATE POLICY "Public insert registrations"
  ON public.registrations FOR INSERT WITH CHECK (true);

-- Only allow reading all registrations (admin dashboard uses anon key directly;
-- for tighter security add a service-role check here)
DROP POLICY IF EXISTS "Allow all registrations operations" ON public.registrations;
CREATE POLICY "Allow all registrations operations"
  ON public.registrations FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_registrations_reg_id      ON public.registrations(reg_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email       ON public.registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON public.registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_verification_email_sent ON public.registrations(verification_email_sent);

-- ─────────────────────────────────────────────────────────────
-- 6. payment-screenshots storage bucket
--    Run this block once to create the public bucket.
--    (Skip if you already created it in the Supabase dashboard.)
-- ─────────────────────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('payment-screenshots', 'payment-screenshots', true)
-- ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 7. Attendance records table for the Volunteer Portal
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attendance (
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
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all attendance operations" ON public.attendance;
CREATE POLICY "Allow all attendance operations"
  ON public.attendance FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fast lookup index for QR scans
CREATE INDEX IF NOT EXISTS idx_attendance_pass_id ON public.attendance(pass_id);

-- ─────────────────────────────────────────────────────────────
-- 8. sub_event_registrations  (4 sub-event forms)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sub_event_registrations (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id                 text        NOT NULL UNIQUE,
  sub_event_id            text        NOT NULL,
  sub_event_name          text        NOT NULL,
  participant_name        text        NOT NULL,
  participant_roll        text,
  participant_email       text,
  participant_phone       text,
  participant_course      text,
  participant_year        text,
  participant_university  text        DEFAULT 'KR Mangalam University',
  team_name               text,
  team_members            jsonb,
  extra_fields            jsonb,
  pass_type               text        DEFAULT 'Participant',
  created_at              timestamptz DEFAULT now()
);

ALTER TABLE public.sub_event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all sub event operations" ON public.sub_event_registrations;
CREATE POLICY "Allow all sub event operations"
  ON public.sub_event_registrations
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_sub_event_reg_sub_event   ON public.sub_event_registrations(sub_event_id);
CREATE INDEX IF NOT EXISTS idx_sub_event_reg_email        ON public.sub_event_registrations(participant_email);
CREATE INDEX IF NOT EXISTS idx_sub_event_reg_pass_id      ON public.sub_event_registrations(pass_id);

-- ─────────────────────────────────────────────────────────────
-- 9. page_views
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.page_views (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  path        text        NOT NULL,
  viewer_role text        NOT NULL DEFAULT 'viewer'
    CHECK (viewer_role IN ('viewer', 'admin', 'volunteer')),
  visitor_id  text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all page views operations" ON public.page_views;
CREATE POLICY "Allow all page views operations"
  ON public.page_views FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_page_views_path       ON public.page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at);
