import { useState } from 'react'
import { Send } from 'lucide-react'
import Button from '../ui/Button.jsx'
import useAuthStore from '../../store/authStore.js'
import useToastStore from '../../store/toastStore.js'
import { createComment } from '../../api/commentsApi.js'

const CommentForm = ({ animeId, onCommentAdded }) => {
  const { isAuthenticated } = useAuthStore()
  const { toast } = useToastStore()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="card p-4 text-center text-sm text-zinc-500">
        <a href="/login" className="text-violet-400 hover:text-violet-300">Inicia sesión</a> para comentar
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      const { data } = await createComment({ animeId, content: content.trim() })
      onCommentAdded(data.data.comment)
      setContent('')
      toast('Comentario publicado', 'success')
    } catch (err) {
      toast(err.response?.data?.message || 'Error al publicar el comentario', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe tu comentario..."
        maxLength={1000}
        rows={2}
        className="input-field resize-none flex-1 text-sm"
      />
      <Button type="submit" loading={loading} disabled={!content.trim()} className="self-end">
        <Send size={16} />
      </Button>
    </form>
  )
}

export default CommentForm
