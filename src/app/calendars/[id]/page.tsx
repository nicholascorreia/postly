'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

// Tipagem para os dados do calendário
type Calendar = {
  id: string
  client_name: string
  created_at: string
}

// Tipagem para os posts vinculados a esse calendário
type Post = {
  id: string
  calendar_id: string
  text: string
  image_url: string
  scheduled_at: string
  created_at: string
  is_published: boolean
}

export default function CalendarPostsPage() {
  const { id } = useParams()
  const [calendar, setCalendar] = useState<Calendar | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)

  // Função que busca os dados do calendário e os posts
  useEffect(() => {
    const loadPosts = async () => {
      const { data: calendarData, error: calendarError } = await supabase
        .from('calendars')
        .select('*')
        .eq('id', id)
        .single()

      if (calendarError) {
        setError(calendarError.message)
        return
      }

      setCalendar(calendarData)

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('calendar_id', id)
        .order('scheduled_at', { ascending: true })

      if (postsError) {
        setError(postsError.message)
        return
      }

      setPosts(postsData)
    }

    loadPosts()
  }, [id])

  if (error) return <p>Erro: {error}</p>
  if (!calendar) return <p>Carregando...</p>

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="bg-gray-100 p-4 rounded-md">
        <h1 className="text-2xl font-bold">Calendário de {calendar.client_name}</h1>
        <p className="text-sm text-gray-500">Criado em: {new Date(calendar.created_at).toLocaleString()}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Posts Agendados</h2>
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="p-4 border rounded-md">
              {post.image_url && (
                <Image
                  src={post.image_url}
                  alt="Imagem do post"
                  width={600}
                  height={400}
                  className="rounded"
                />
              )}
              <p className="mt-2">{post.text}</p>
              <p className="text-sm text-gray-500">Agendado para: {new Date(post.scheduled_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
