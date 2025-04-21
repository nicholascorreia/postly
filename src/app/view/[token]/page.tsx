import { supabase } from '@/lib/supabaseClient'

interface PageProps {
  params: {
    token: string
  }
}

export default async function ViewCalendarPage({ params }: PageProps) {
  const { token } = params

  // Busca o token válido no banco
  const { data: tokenData, error: tokenError } = await supabase
    .from('tokens')
    .select('calendar_id, expires_at')
    .eq('token', token)
    .single()

  if (tokenError || !tokenData) {
    return (
      <main className="p-6">
        <h1>Link inválido</h1>
        <p>Esse link não existe ou expirou.</p>
      </main>
    )
  }

  // Verifica validade
  if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
    return (
      <main className="p-6">
        <h1>Link expirado</h1>
        <p>Esse link não está mais ativo.</p>
      </main>
    )
  }

  const calendarId = tokenData.calendar_id

  // Busca dados do calendário
  const { data: calendar } = await supabase
    .from('calendars')
    .select('client_name')
    .eq('id', calendarId)
    .single()

  // Busca posts relacionados
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('calendar_id', calendarId)
    .order('scheduled_at', { ascending: true })

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Calendário de {calendar?.client_name}</h1>

      {posts && posts.map(post => (
        <div key={post.id} className="p-4 border rounded space-y-2 bg-white">
          {post.image_url && (
            <img src={post.image_url} alt="Imagem do post" className="rounded w-full" />
          )}
          <p>{post.content}</p>
          <p className="text-sm text-gray-500">
            Agendado para: {new Date(post.scheduled_at).toLocaleString()}
          </p>
        </div>
      ))}
    </main>
  )
}
