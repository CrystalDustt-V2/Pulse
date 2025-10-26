import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { io as ioClient } from 'socket.io-client'
import PostCard from '../../components/PostCard'
import { useAuth } from '../../context/AuthContext'
import axios from '../../lib/axios'

export default function PostPage() {
  const router = useRouter()
  const { id } = router.query
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    async function load() {
      try {
        const res = await axios.get(`/api/posts/${id}`)
        setPost(res.data.post)
        setComments(res.data.post?.comments || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // auth state comes from AuthContext (persisted on provider mount)

  // realtime comments via socket.io
  useEffect(() => {
    if (!id) return
  // connect to the backend host when NEXT_PUBLIC_API_URL is configured,
  // otherwise omit host to use same-origin (Next dev proxy).
  const socketHost = process.env.NEXT_PUBLIC_API_URL || undefined
  const sessionToken = typeof window !== 'undefined' ? sessionStorage.getItem('pulse:token') : null
  const socket = ioClient(socketHost, { withCredentials: true, auth: sessionToken ? { token: sessionToken } : undefined })
    socket.emit('join:post', id)

    socket.on('comment:new', (comment) => {
      setComments(prev => {
        // avoid duplicates
        if (prev.some(c => c.id === comment.id)) return prev
        return [...prev, comment]
      })
    })

    // remove deleted comments
    socket.on('comment:deleted', ({ id: deletedId }) => {
      setComments(prev => prev.filter(c => c.id !== deletedId))
    })

    // post-level deletion
    socket.on('post:deleted', ({ id: deletedPostId }) => {
      if (deletedPostId === id) router.push('/')
    })

    return () => {
      socket.emit('leave:post', id)
      socket.disconnect()
    }
  }, [id])

  // quick login removed — use /login page to sign in

  async function submitComment(e) {
    e.preventDefault()
    if (!content) return
    try {
      const res = await axios.post(`/api/posts/${id}/comment`, { content })
      // rely on the server socket emit to propagate the created comment to
      // all tabs (including this one). Avoid appending the same comment here
      // to prevent duplicates if the socket also delivers it. Clear the
      // input and let the 'comment:new' handler update state.
      setContent('')
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Failed to post comment')
    }
  }

  if (loading || !post) return <main className="p-6">Loading...</main>

  return (
    <main className="max-w-2xl mx-auto p-4">
      <button className="mb-4 text-sm text-muted" onClick={() => router.back()}>← Back</button>
      <PostCard post={post} />

      <section className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Comments</h3>

        {!user && (
          <div className="mb-3">
            <a href="/login" className="px-3 py-1 rounded bg-white text-black">Log in to comment</a>
          </div>
        )}

        <form onSubmit={submitComment} className="card mb-4">
          <textarea placeholder={user ? 'Write a comment...' : 'Login to comment...'} value={content} onChange={e=>setContent(e.target.value)} className="w-full p-2 rounded bg-bg/20 min-h-[80px]" disabled={!user} />
          <div className="flex mt-2">
            <button type="submit" disabled={!user || !content} className="ml-auto bg-white text-black px-4 py-2 rounded">Comment</button>
          </div>
        </form>

        <div className="space-y-3">
          {comments.length === 0 && <div className="text-muted">No comments yet</div>}
          {comments.map(c => (
            <div key={c.id} className="card">
              <div className="flex items-center gap-3 mb-2">
                {c.user?.avatar ? (
                  <img src={c.user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover bg-muted" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted" />
                )}
                <div>
                  <div className="font-medium">{c.user?.username || 'Unknown'}</div>
                  <div className="text-xs text-muted">{new Date(c.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div>{c.content}</div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="text-sm text-blue-500" onClick={async ()=>{
                    try {
                      await axios.post(`/api/comments/${c.id}/like`);
                      // Ideally, update local like count here
                    } catch(e) { alert('Like failed'); }
                  }}>Like {c.likes?.length || 0}</button>
                  <button className="text-sm text-green-500" onClick={()=>{
                    const url = `${window.location.origin}/post/${id}#comment-${c.id}`;
                    if (navigator.share) {
                      navigator.share({ url, title: 'Check out this comment!' });
                    } else {
                      navigator.clipboard.writeText(url);
                      alert('Comment link copied!');
                    }
                  }}>Share</button>
                  {(user && (user.id === c.userId || user.role === 'ADMIN')) && (
                    <button onClick={async ()=>{ if(!confirm('Delete comment?')) return; try{ await axios.delete(`/api/posts/${id}/comment/${c.id}`); setComments(prev=>prev.filter(x=>x.id!==c.id)); }catch(e){ alert('Delete failed') } }} className="text-sm text-red-500">Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
