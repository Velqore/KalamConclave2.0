import { createContext } from 'react'
import { EVENT_LOGO_URL, EVENT_SHORT_TITLE } from '../config/branding'

export const defaultSettings = {
  event_date: '2026-04-21T10:00:00+05:30',
  event_date_label: '21st April 2026',
  event_time_label: '10:00 AM Onwards',
  event_venue: 'MultiPurpose Hall, A-Block, K.R. Mangalam University',
  event_short_title: EVENT_SHORT_TITLE,
  event_logo_url: EVENT_LOGO_URL,
  upi_qr_url: '',
  upi_id: '',
  payment_url: '',
  ticket_price: '149',
  social_instagram_url: '',
  social_linkedin_url: '',
  social_youtube_url: '',
}

export const AppDataContext = createContext(null)
