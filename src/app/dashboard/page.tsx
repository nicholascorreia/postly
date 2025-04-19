'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function DashboardPage() {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/login')
    }
  }, [session])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!session) {
    return <p>Verificando sessão...</p>
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Bem-vindo ao Dashboard</h1>
      <p>Logado como: {session.user.email}</p>
      <button onClick={handleLogout} style={{ marginTop: '1rem' }}>
        Sair
      </button>
    </main>
  )
}
