'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type Calendar = {
  id: string
  client_name: string
  created_at: string
}

export default function CalendarsPage() {
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('calendars')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
        return
      }

      setCalendars(data)
    }

    load()
  }, [])

  if (error) return <p>Erro: {error}</p>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Todos os Calendários</h1>
      <ul className="space-y-2">
        {calendars.map(calendar => (
          <li key={calendar.id}>
            <Link
              href={`/calendars/${calendar.id}`}
              className="text-blue-600 hover:underline"
            >
              {calendar.client_name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
