import { createElement, useEffect, useState } from 'react'
import staticSpeakers from '../config/speakers'
import staticSchedule from '../config/schedule'
import { supabase } from '../lib/supabaseClient'
import { AppDataContext, defaultSettings } from './_appDataContext'

export function AppDataProvider({ children }) {
  const [speakers, setSpeakers] = useState(staticSpeakers)
  const [schedule, setSchedule] = useState(staticSchedule)
  const [settings, setSettings] = useState(defaultSettings)
  const [organisers, setOrganisers] = useState([])

  useEffect(() => {
    if (!supabase) return

    const loadAll = async () => {
      const results = await Promise.allSettled([
        supabase.from('speakers').select('*').order('sort_order', { ascending: true }),
        supabase.from('schedule').select('*').order('sort_order', { ascending: true }),
        supabase.from('app_settings').select('key, value'),
        supabase.from('organisers').select('*').order('sort_order', { ascending: true }),
      ])

      const [speakersRes, scheduleRes, settingsRes, organisersRes] = results

      if (speakersRes.status === 'fulfilled' && speakersRes.value.data?.length) {
        setSpeakers(speakersRes.value.data)
      }
      if (scheduleRes.status === 'fulfilled' && scheduleRes.value.data?.length) {
        setSchedule(scheduleRes.value.data)
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.length) {
        const obj = Object.fromEntries(
          settingsRes.value.data.map(({ key, value }) => [key, value]),
        )
        setSettings((prev) => ({ ...prev, ...obj }))
      }
      if (organisersRes.status === 'fulfilled' && organisersRes.value.data) {
        setOrganisers(organisersRes.value.data)
      }
    }

    loadAll()
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

