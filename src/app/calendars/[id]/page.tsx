'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import { NewPostModal } from '@/components/NewPostModal'

type Calendar = {
  id: string
  client_name: string
  created_at: string
}

type Post = {
  id: string
  calendar_id: string
  content: string
  image_url: string
  scheduled_at: string
  created_at: string
  approved: boolean
}

export default function CalendarPostsPage() {
  const { id } = useParams()
  const [calendar, setCalendar] = useState<Calendar | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [publicLink, setPublicLink] = useState<string | null>(null)
  const [linkLoading, setLinkLoading] = useState(false)

  // 🔁 Carrega o calendário e seus posts
  useEffect(() => {
    const load = async () => {
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

    load()
  }, [id])

  // 🟢 Gera ou reutiliza o link público via token
  const handleGenerateLink = async () => {
    setLinkLoading(true)
    const res = await fetch(`/api/tokens/${id}`, { method: 'POST' })
    const json = await res.json()
    if (json.token) {
      setPublicLink(`${window.location.origin}/view/${json.token}`)
    }
    setLinkLoading(false)
  }

  if (error) return <p>Erro: {error}</p>
  if (!calendar) return <p>Carregando...</p>

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {showModal && (
        <NewPostModal
          calendarId={id as string}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Calendário de {calendar.client_name}</h1>
          <p className="text-sm text-gray-500">
            Criado em: {new Date(calendar.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            + Novo Post
          </button>

          <button
            onClick={handleGenerateLink}
            disabled={linkLoading}
            className="bg-green-600 text-white px-4 py-2 rounded shadow"
          >
            {linkLoading ? 'Gerando...' : 'Gerar link público'}
          </button>
        </div>
      </div>

      {publicLink && (
        <div className="bg-gray-100 p-4 rounded-md flex items-center justify-between">
          <code className="text-sm">{publicLink}</code>
          <button
            onClick={() => navigator.clipboard.writeText(publicLink)}
            className="text-sm text-blue-600 underline ml-4"
          >
            Copiar
          </button>
        </div>
      )}

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
              <p className="mt-2">{post.content}</p>
              <p className="text-sm text-gray-500">
                Agendado para: {new Date(post.scheduled_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
