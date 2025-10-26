import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import PostCard from '../../components/PostCard'
import axios from '../../lib/axios'

export default function Profile() {
  const router = useRouter()
  const { username } = router.query
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (!username) return
    async function load() {
      try {
        const res = await axios.get(`/api/users/${username}`)
        setUser(res.data.user)
        setPosts(res.data.posts || [])
      } catch (e) {
        setUser(null)
        setPosts([])
        setError(e.response?.data?.error || "User not found")
      }
    }
    load()
  }, [username])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!user) return <div className="p-6">Loading...</div>

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-4">
        {user.avatar ? (
          <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover bg-muted" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted" />
        )}
        <div>
          <h2 className="text-xl">{user.username}</h2>
          <p className="text-sm text-muted">Level {user.level} • {user.xp} XP</p>
          {user.bio && <p className="text-sm mt-1 text-gray-700">{user.bio}</p>}
        </div>
      </div>
      <div className="space-y-4">
        {posts.map(p => <PostCard key={p.id} post={{...p, user: user}} />)}
      </div>
    </main>
  )
}
