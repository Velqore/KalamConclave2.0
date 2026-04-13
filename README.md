# 1st Kalam Conclave 2.0 — Event Dashboard

Production-ready event portal built with **React + Vite + TailwindCSS + Supabase**, designed for fast deployment on **Vercel**.

## Features

- Public landing page with hero, countdown, speakers, agenda placeholder, and event details
- Registration page with payment info, UTR capture, optional screenshot upload, and confirmation PDF download
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

Also create a public storage bucket named `payment-screenshots` for optional payment screenshots.

## Admin Login

- Username: `KalamAdmin`
- Password: `Kalam21321@`

You can override both using `VITE_ADMIN_USERNAME` and `VITE_ADMIN_PASSWORD`.

## How to Update Speakers and Schedule

- Edit speaker records in:
  - `/src/config/speakers.js`
- Edit agenda items in:
  - `/src/config/schedule.js`

No logic changes required.

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
