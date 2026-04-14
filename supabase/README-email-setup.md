# Supabase Setup & Confirmation Email

This document covers **two things**:
1. Running the database schema (required before any admin edits work)
2. Setting up the confirmation email edge function (required for emails)

---

## Part 1 — Database Schema (do this first)

All admin sections (Guests, Schedule, Organisers, Settings, Registrations) require the database tables to exist.  If you see an error like _"Could not find the table 'public.speakers' in the schema cache"_, it means the tables haven't been created yet.

### How to apply the schema

1. Open your [Supabase Dashboard](https://app.supabase.com) → select your project.
2. Go to **SQL Editor** (left sidebar).
3. Click **New query**.
4. Open `supabase/schema.sql` from this repo and paste the **entire file** contents into the editor.
5. Click **Run**.

That's it — all tables, indexes, RLS policies, and default settings are created in one shot.  It is safe to run again (every statement uses `IF NOT EXISTS` or `ON CONFLICT DO NOTHING`).

### Storage bucket (payment screenshots)

The registration form lets users upload a payment screenshot.  To enable this:

1. In your Supabase Dashboard → **Storage** → **New bucket**.
2. Name it exactly `payment-screenshots` and tick **Public bucket**.
3. Click **Save**.

---

## Part 2 — Confirmation Email Setup

After a successful registration, the app automatically sends a branded confirmation email to the registrant using a **Supabase Edge Function** backed by [Resend](https://resend.com).

---

## Prerequisites

- Supabase project linked (`supabase link --project-ref <project-ref>`)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- A free [Resend](https://resend.com) account and API key
- (Production) A verified sending domain in Resend, e.g. `kalamconclave.org`

---

## 1. Get a Resend API Key

1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month, 100/day).
2. In the Resend dashboard → **API Keys** → **Create API Key**.
3. Copy the key — you will only see it once.

---

## 2. Add the Secret to Supabase

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

Verify it was saved:

```bash
supabase secrets list
```

---

## 3. Configure the Sender Address

The function reads `RESEND_FROM_EMAIL` from Supabase secrets.  
If not set, it falls back to `Kalam Conclave 2.0 <onboarding@resend.dev>` (good for quick testing on your Resend account).

For production (recommended):

1. In Resend → **Domains** → **Add Domain** → verify DNS records for your domain (e.g. `kalamconclave.org`).
2. Set sender secret:

```bash
supabase secrets set RESEND_FROM_EMAIL="Kalam Conclave 2.0 <noreply@kalamconclave.org>"
```

Note: `@resend.dev` sender can only send to the email address that owns the Resend account (testing use only).

---

## 4. Deploy the Edge Function

```bash
# From the repository root
supabase functions deploy send-confirmation --no-verify-jwt
```

The `--no-verify-jwt` flag lets the frontend call this function without a user session token. The function itself does not read or modify database data, so this is safe.

---

## 5. Verify Deployment

```bash
supabase functions list
```

You should see `send-confirmation` with status **ACTIVE**.

---

## How It Works

| Step | What happens |
|------|--------------|
| User submits registration form | Frontend inserts a row into `registrations` table via Supabase JS client |
| Registration saved | Frontend calls `POST {SUPABASE_URL}/functions/v1/send-confirmation` with `{ name, email, reg_id }` |
| Edge Function receives request | Calls Resend API with a branded HTML email |
| Email delivered | Registrant receives confirmation with their Registration ID, event details, and payment-pending notice |
| Email failure (if any) | Registration is **not** rolled back — a toast notifies the user to contact organizers |

---

## Local Testing

```bash
supabase functions serve send-confirmation --env-file .env.local
```

Create `.env.local` (never commit this file):

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

Then test with curl:

```bash
curl -i -X POST http://localhost:54321/functions/v1/send-confirmation \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"your@email.com","reg_id":"KCC2-TEST"}'
```
