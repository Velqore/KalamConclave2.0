import { createElement, useEffect, useState } from 'react'
import staticSpeakers from '../config/speakers'
import staticSchedule from '../config/schedule'
import { normalizeEventShortTitle } from '../config/branding'
import { supabase } from '../lib/supabaseClient'
import { AppDataContext, defaultSettings } from './_appDataContext'

export function AppDataProvider({ children }) {
  const [speakers, setSpeakers] = useState(staticSpeakers)
  const [schedule, setSchedule] = useState(staticSchedule)
  const [settings, setSettings] = useState(defaultSettings)
  const [organisers, setOrganisers] = useState([])

  useEffect(() => {
    if (!supabase) return

    const loadSpeakers = async () => {
      const { data } = await supabase.from('speakers').select('*').order('sort_order', { ascending: true })
      if (Array.isArray(data)) setSpeakers(data)
    }

    const loadSchedule = async () => {
      const { data } = await supabase.from('schedule').select('*').order('sort_order', { ascending: true })
      if (Array.isArray(data)) setSchedule(data)
    }

    const loadSettings = async () => {
      const { data } = await supabase.from('app_settings').select('key, value')
      if (data?.length) {
        const obj = Object.fromEntries(data.map(({ key, value }) => [key, value]))
        obj.event_short_title = normalizeEventShortTitle(obj.event_short_title)
        setSettings((prev) => ({ ...prev, ...obj }))
      }
    }

    const loadOrganisers = async () => {
      const { data } = await supabase.from('organisers').select('*').order('sort_order', { ascending: true })
      if (data) setOrganisers(data)
    }

    // Initial load
    Promise.all([loadSpeakers(), loadSchedule(), loadSettings(), loadOrganisers()])

    // Realtime: re-fetch each table whenever admin makes changes
    const channels = [
      supabase.channel('ctx-settings').on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, loadSettings).subscribe(),
      supabase.channel('ctx-schedule').on('postgres_changes', { event: '*', schema: 'public', table: 'schedule' }, loadSchedule).subscribe(),
      supabase.channel('ctx-speakers').on('postgres_changes', { event: '*', schema: 'public', table: 'speakers' }, loadSpeakers).subscribe(),
      supabase.channel('ctx-organisers').on('postgres_changes', { event: '*', schema: 'public', table: 'organisers' }, loadOrganisers).subscribe(),
    ]

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch))
    }
  }, [])

  const value = {
    speakers,
    setSpeakers,
    schedule,
    setSchedule,
    settings,
    setSettings,
    organisers,
    setOrganisers,
  }

  return createElement(AppDataContext.Provider, { value }, children)
}
