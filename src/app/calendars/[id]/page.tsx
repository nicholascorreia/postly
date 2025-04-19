// src/app/calendars/[id]/page.tsx

// Importa o supabaseClient para fazer a conexão com o banco
import { supabase } from '@/lib/supabaseClient'

// Define o tipo esperado nos parâmetros da URL
interface CalendarPageProps {
  params: {
    id: string // O ID que vem da URL (ex: /calendars/xyz)
  }
}

// Este componente é assíncrono porque faz uma chamada ao banco (await)
export default async function CalendarPage({ params }: CalendarPageProps) {
  const { id } = params // Pega o ID da URL

  // Faz a busca no Supabase: procura um único calendário com esse ID
  const { data, error } = await supabase
    .from('calendars')
    .select('*')       // Seleciona todos os campos
    .eq('id', id)      // Onde o id = o valor da URL
    .single()          // Espera um único resultado

  // Se deu erro ou não encontrou, mostra mensagem de erro
  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Calendário não encontrado</h1>
        <p>Verifique se o link está correto.</p>
      </main>
    )
  }

  // Se encontrou, mostra o nome do cliente e a data
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Calendário de {data.client_name}</h1>
      <p>ID: {data.id}</p>
      <p>Criado em: {new Date(data.created_at).toLocaleDateString()}</p>
    </main>
  )
}
