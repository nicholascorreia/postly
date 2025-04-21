import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { randomUUID } from 'crypto'

export async function POST(_: Request, { params }: { params: { calendarId: string } }) {
  const { calendarId } = params

  // Verifica se já existe token ativo
  const { data: existing } = await supabase
    .from('tokens')
    .select('*')
    .eq('calendar_id', calendarId)
    .limit(1)
    .single()

  if (existing) {
    return NextResponse.json({ token: existing.token })
  }

  // Cria token novo
  const token = randomUUID().replace(/-/g, '').slice(0, 12)

  const { error } = await supabase
    .from('tokens')
    .insert({
      calendar_id: calendarId,
      token,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ token })
}
