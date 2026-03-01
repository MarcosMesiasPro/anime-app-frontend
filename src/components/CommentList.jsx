import { useState } from 'react';

const CommentList = ({ comments, currentUserId, canInteract, onLike, onDelete, onEdit }) => {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');

  if (!comments.length) {
    return <p className="text-sm text-slate-400">No comments yet.</p>;
  }

  const startEditing = (comment) => {
    setEditingCommentId(comment._id);
    setEditingText(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const saveEdit = async () => {
    if (!editingCommentId || !editingText.trim()) return;
    await onEdit(editingCommentId, editingText.trim());
    cancelEditing();
  };

  return (
    <ul className="space-y-3">
      {comments.map((comment) => {
        const isOwner = currentUserId && comment.user?._id === currentUserId;
        const isEditing = editingCommentId === comment._id;

        return (
          <li key={comment._id} className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-200">{comment.user?.username || 'User'}</p>
              <p className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="min-h-24 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="rounded-md bg-cyan-500 px-2 py-1 text-xs font-medium text-slate-950 hover:bg-cyan-400"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="rounded-md bg-slate-700 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-300">{comment.content}</p>
            )}

            {canInteract && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onLike(comment._id)}
                  className="rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700"
                >
                  Like ({comment.likes?.length || 0})
                </button>

                {isOwner && !isEditing && (
                  <button
                    type="button"
                    onClick={() => startEditing(comment)}
                    className="rounded-md bg-amber-500 px-2 py-1 text-xs font-medium text-slate-950 hover:bg-amber-400"
                  >
                    Edit
                  </button>
                )}

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => onDelete(comment._id)}
                    className="rounded-md bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-500"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default CommentList;
