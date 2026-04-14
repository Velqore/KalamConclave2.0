# 1st Kalam Conclave 2.0 — Event Dashboard

Production-ready event portal built with **React + Vite + TailwindCSS + Supabase**, designed for fast deployment on **Vercel**.

## Features

- Public landing page with hero, countdown, speakers, agenda placeholder, and event details
- Registration page with payment info, UTR capture, mandatory screenshot upload, and confirmation PDF download
- Dedicated speakers and schedule pages driven by editable config arrays
- Admin login (simple credentials, no social auth)
- Admin dashboard with:
  - stats cards
  - attendee table
  - payment verification toggle
  - attendance toggle
  - search/filter
  - CSV export

## Tech Stack

- React + Vite
- TailwindCSS
- React Router DOM
- Supabase JS
- Framer Motion
- React Hot Toast
- jsPDF
- Papa Parse

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_USERNAME=KalamAdmin
VITE_ADMIN_PASSWORD=Kalam21321@
```

3. Start dev server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Supabase Setup

Create a table named `registrations`:

- `id` (uuid, primary key, default: `gen_random_uuid()`)
- `reg_id` (text, unique)
- `full_name` (text)
- `email` (text)
- `phone` (text)
- `college` (text)
- `course` (text)
- `year_of_study` (text)
- `city` (text)
- `heard_from` (text)
- `utr_id` (text)
- `payment_screenshot_url` (text, nullable)
- `payment_status` (text, default: `pending`)
- `attendance` (boolean, default: `false`)
- `created_at` (timestamp, default: `now()`)

Also create a public storage bucket named `payment-screenshots` for payment screenshots.

### Admin-Managed Content Tables

Create these additional tables to enable full admin control over the site content:

**`speakers`** — Displayed on Speakers and Home pages:
- `id` (uuid, primary key, default: `gen_random_uuid()`)
- `name` (text)
- `title` (text)
- `topic` (text)
- `image` (text, URL)
- `sort_order` (integer, default: `0`)

**`schedule`** — Displayed on the Schedule / Events page:
- `id` (uuid, primary key, default: `gen_random_uuid()`)
- `time` (text)
- `title` (text)
- `description` (text)
- `sort_order` (integer, default: `0`)

**`organisers`** — Displayed in the Organisers section on the Home page:
- `id` (uuid, primary key, default: `gen_random_uuid()`)
- `name` (text)
- `role` (text)
- `image` (text, URL, nullable)
- `bio` (text, nullable)
- `sort_order` (integer, default: `0`)

**`app_settings`** — Key-value store for event configuration:
- `key` (text, **primary key**)
- `value` (text)

Supported setting keys and their defaults:

| Key | Default | Description |
|-----|---------|-------------|
| `event_date` | `2026-04-21T10:00:00+05:30` | ISO datetime for countdown timer |
| `event_date_label` | `21st April 2026` | Human-readable date shown on site |
| `event_time_label` | `10:00 AM Onwards` | Time shown on site |
| `event_venue` | MultiPurpose Hall... | Venue shown on site and in PDF |
| `event_short_title` | `1st Kalam Conclave 2.0` | Title used in confirmation PDF |
| `upi_qr_url` | _(empty)_ | Public URL of UPI QR code image |
| `upi_id` | _(empty)_ | UPI ID shown below QR on registration form |
| `ticket_price` | `149` | Registration fee in INR |
| `social_instagram_url` | _(empty)_ | Club Instagram profile URL |
| `social_linkedin_url` | _(empty)_ | Club LinkedIn page URL |
| `social_youtube_url` | _(empty)_ | Club YouTube channel URL |

> If these tables don't exist, the app falls back to the static default values in `src/config/` and `src/context/AppDataContext.jsx`.

## Admin Login

- Username: `KalamAdmin`
- Password: `Kalam21321@`

You can override both using `VITE_ADMIN_USERNAME` and `VITE_ADMIN_PASSWORD`.

## How to Update Content

All site content — speakers, schedule, organisers, event date/venue, UPI QR code, and ticket price — can now be managed directly from the **Admin Dashboard** without touching any code.

Login at `/admin` and use the tabbed dashboard:

| Tab | What you can manage |
|-----|---------------------|
| **Registrations** | Add / edit / delete attendees, toggle payment & attendance, export CSV |
| **Speakers** | Add / edit / delete speaker cards shown on the site |
| **Schedule** | Add / edit / delete agenda/timeline items |
| **Event Settings** | Event date, venue, UPI QR code image URL, UPI ID, ticket price |
| **Organisers** | Add / edit / delete organiser cards shown on the Home page |

> These changes require the four additional Supabase tables described in the Supabase Setup section above.

The static config files (`/src/config/speakers.js`, `/src/config/schedule.js`) still serve as **fallback defaults** when the Supabase tables are empty or unavailable.

## Deploy to Vercel

1. Import this repository in Vercel.
2. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional admin vars).
3. Deploy.

`vercel.json` is included with SPA rewrites for React Router:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Volunteer Portal

Access: `yourdomain.com/volunteer`

### Setup

1. Set `VITE_VOLUNTEER_SECRET_CODE` in Vercel to any code you choose (e.g. `VOLPASS2025`).
2. Optionally set `VITE_EMERGENCY_CONTACTS` as a JSON array, e.g.:
   ```
   [{"name":"Event Head","phone":"9999999999"},{"name":"Security","phone":"8888888888"}]
   ```
3. Share the secret code privately with volunteers before the event (WhatsApp / email).
4. Volunteers open `/volunteer` on their phone, enter their name and the code.
5. They can now scan QR passes, track attendance, and view live stats.

The portal session expires when the browser tab is closed. No Supabase account is needed for volunteers.

### Volunteer Portal Features

| Tab | Function |
|-----|----------|
| **Scanner** | Camera QR scanner with 5 scan states (valid/checked-in/exited/invalid/duplicate), check-in/check-out, sound + vibration feedback |
| **Attendees** | Live participant list with search, filter by status, tap for manual override |
| **Stats** | Live stat cards, attendance % ring, hourly bar chart, last 5 scans, CSV export |
| **Info** | Event details, volunteer guidelines, emergency contacts, session info + logout |

### Required Supabase Table

Create an `attendance` table (see `supabase/schema.sql` for the full schema):

- `id` (uuid, primary key)
- `pass_id` (text) — registration ID from `registrations.reg_id`
- `participant_name`, `participant_id`, `department`, `pass_type` (text)
- `checked_in_at`, `checked_out_at` (timestamptz, nullable)
- `status` (text) — `not_arrived` | `checked_in` | `checked_out`
- `scanned_by` (text) — volunteer name
- `scan_count` (integer)
- `created_at` (timestamptz)

Enable Row Level Security with an open policy (volunteers are not Supabase-authenticated users).
