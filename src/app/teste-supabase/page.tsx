// src/app/teste-supabase/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TesteSupabase() {
  const [status, setStatus] = useState('Conectando...')

  useEffect(() => {
    async function testar() {
      const { data, error } = await supabase.from('test').select('*')

      if (error) {
        setStatus(`Erro: ${error.message}`)
      } else {
        setStatus(`Conectado! (${data.length} registros encontrados)`)
      }
    }

    testar()
  }, [])

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Teste de conexão com Supabase</h1>
      <p>{status}</p>
    </main>
  )
}
