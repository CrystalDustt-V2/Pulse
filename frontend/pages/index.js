import { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import PostForm from '../components/PostForm'
import { useAuth } from '../context/AuthContext'
import axios from '../lib/axios'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get('/api/posts')
        setPosts(res.data.posts || [])
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  // auth state comes from AuthContext (persisted via /api/auth/me on provider mount)

  function handleCreated(post) {
    setPosts(prev => [post, ...prev])
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Your Feed</h1>
      {!user && (
        <div className="mb-4">
          <a href="/login" className="px-3 py-1 rounded bg-white text-black">Log in</a>
        </div>
      )}
      <PostForm onCreated={handleCreated} />
      <div className="space-y-4">
        {posts.map(p => <PostCard key={p.id} post={p} />)}
      </div>
    </main>
  )
}
