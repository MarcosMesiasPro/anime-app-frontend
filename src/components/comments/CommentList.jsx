import { useState, useEffect } from 'react'
import { Heart, Trash2, Edit3, Check, X } from 'lucide-react'
import { getComments, toggleLike, deleteComment, updateComment } from '../../api/commentsApi.js'
import useAuthStore from '../../store/authStore.js'
import useToastStore from '../../store/toastStore.js'
import Spinner from '../ui/Spinner.jsx'
import Button from '../ui/Button.jsx'
import CommentForm from './CommentForm.jsx'

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

const CommentItem = ({ comment, onDelete, onUpdate, onLike }) => {
  const { user, isAuthenticated } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [saving, setSaving] = useState(false)

  const isOwner = user?._id === comment.user?._id || user?.id === comment.user?._id
  const isLiked = comment.likes?.includes(user?.id || user?._id)

  const handleSave = async () => {
    if (!editContent.trim()) return
    setSaving(true)
    await onUpdate(comment._id, editContent.trim())
    setEditing(false)
    setSaving(false)
  }

  return (
    <div className="card p-4 flex gap-3">
      {/* Avatar */}
      <div className="shrink-0">
        {comment.user?.avatar ? (
          <img src={comment.user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <div className="h-9 w-9 rounded-full bg-violet-600/30 flex items-center justify-center text-sm font-semibold text-violet-300">
            {comment.user?.username?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-zinc-200">{comment.user?.username}</span>
          <span className="text-xs text-zinc-600">{timeAgo(comment.createdAt)}</span>
        </div>

        {editing ? (
          <div className="flex gap-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="input-field text-sm resize-none flex-1"
              rows={2}
              maxLength={1000}
              autoFocus
            />
            <div className="flex flex-col gap-1">
              <button onClick={handleSave} disabled={saving} className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/10">
                <Check size={14} />
              </button>
              <button onClick={() => { setEditing(false); setEditContent(comment.content) }} className="p-1.5 rounded text-zinc-500 hover:bg-zinc-800">
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-300 break-words">{comment.content}</p>
        )}

        {/* Acciones */}
        <div className="mt-2 flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={() => onLike(comment._id)}
              className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? 'text-red-400' : 'text-zinc-600 hover:text-red-400'}`}
            >
              <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
              {comment.likes?.length || 0}
            </button>
          )}
          {isOwner && !editing && (
            <>
              <button onClick={() => setEditing(true)} className="text-xs text-zinc-600 hover:text-violet-400 transition-colors">
                <Edit3 size={12} />
              </button>
              <button onClick={() => onDelete(comment._id)} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const CommentList = ({ animeId }) => {
  const { toast } = useToastStore()
  const [comments, setComments] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchComments = async (p = 1) => {
    setLoading(true)
    try {
      const { data } = await getComments(animeId, p)
      const result = data.data
      setComments(p === 1 ? result.comments : (prev) => [...prev, ...result.comments])
      setTotalPages(result.totalPages)
      setPage(result.page)
    } catch {
      toast('Error al cargar comentarios', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchComments(1) }, [animeId])

  const handleCommentAdded = (comment) => setComments((prev) => [comment, ...prev])

  const handleLike = async (id) => {
    try {
      const { data } = await toggleLike(id)
      const { liked, likesCount } = data.data
      const { user } = useAuthStore.getState()
      const userId = user?.id || user?._id
      setComments((prev) =>
        prev.map((c) => {
          if (c._id !== id) return c
          const likes = liked
            ? [...(c.likes || []), userId]
            : (c.likes || []).filter((l) => l !== userId)
          return { ...c, likes }
        })
      )
    } catch {}
  }

  const handleDelete = async (id) => {
    try {
      await deleteComment(id)
      setComments((prev) => prev.filter((c) => c._id !== id))
      toast('Comentario eliminado', 'info')
    } catch (err) {
      toast(err.response?.data?.message || 'Error al eliminar', 'error')
    }
  }

  const handleUpdate = async (id, content) => {
    try {
      const { data } = await updateComment(id, content)
      setComments((prev) => prev.map((c) => (c._id === id ? data.data.comment : c)))
      toast('Comentario actualizado', 'success')
    } catch (err) {
      toast(err.response?.data?.message || 'Error al actualizar', 'error')
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-100">
        Comentarios {comments.length > 0 && <span className="text-zinc-500 text-base">({comments.length})</span>}
      </h2>

      <CommentForm animeId={animeId} onCommentAdded={handleCommentAdded} />

      {loading && !comments.length ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-zinc-600 py-8">Sin comentarios aún. ¡Sé el primero!</p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {comments.map((c) => (
              <CommentItem
                key={c._id}
                comment={c}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onLike={handleLike}
              />
            ))}
          </div>
          {page < totalPages && (
            <Button variant="secondary" onClick={() => fetchComments(page + 1)} loading={loading} className="self-center">
              Cargar más
            </Button>
          )}
        </>
      )}
    </section>
  )
}

export default CommentList
