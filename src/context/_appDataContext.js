import { createContext } from 'react'

export const defaultSettings = {
  event_date: '2026-04-21T10:00:00+05:30',
  event_date_label: '21st April 2026',
  event_time_label: '10:00 AM Onwards',
  event_venue: 'MultiPurpose Hall, A-Block, K.R. Mangalam University',
  event_short_title: '1st Kalam Conclave 2.0',
  upi_qr_url: '',
  upi_id: '',
  ticket_price: '149',
}

export const AppDataContext = createContext(null)
