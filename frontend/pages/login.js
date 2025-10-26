import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const { signIn } = useAuth()
  const [perTab, setPerTab] = useState(false)

  async function submit(e) {
    e.preventDefault()
    try {
      await signIn(email, password, perTab)
      router.push('/')
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3 card">
        <input className="w-full p-2 rounded bg-bg/30" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 rounded bg-bg/30" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={perTab} onChange={e=>setPerTab(e.target.checked)} />
          <span className="text-sm">This tab only (keep other tabs logged out)</span>
        </label>
        <button className="w-full bg-white text-black rounded p-2">Login</button>
      </form>
    </main>
  )
}
