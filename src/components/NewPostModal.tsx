'use client'

import { useState, FormEvent } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

type Props = {
  calendarId: string
  onClose: () => void
}

export function NewPostModal({ calendarId, onClose }: Props) {
  const [content, setContent] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!file) {
      alert('Envie uma imagem.')
      return
    }

    // Envia imagem para o Supabase Storage
    const fileName = `${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('posts')
      .upload(fileName, file)

    if (uploadError) {
      alert('Erro no upload da imagem: ' + uploadError.message)
      setLoading(false)
      return
    }

    // Gera a URL pública da imagem
    const imageUrl = supabase.storage
      .from('posts')
      .getPublicUrl(fileName).data.publicUrl

    // Salva post no banco
    const { error: insertError } = await supabase
      .from('posts')
      .insert({
        calendar_id: calendarId,
        content,
        scheduled_at: scheduledAt,
        image_url: imageUrl,
      })

    if (insertError) {
      alert('Erro ao salvar o post: ' + insertError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
    router.refresh() // Atualiza a lista de posts
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold">Novo Post</h2>

        <input
          type="text"
          placeholder="Texto do post"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
          className="w-full border rounded p-2"
        />

        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={e => setScheduledAt(e.target.value)}
          required
          className="w-full border rounded p-2"
        />

        <input
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
          required
          className="w-full"
        />

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
