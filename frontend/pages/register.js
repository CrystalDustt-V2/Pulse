import { useRouter } from 'next/router'
import { useState } from 'react'
import axios from '../lib/axios'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function submit(e) {
    e.preventDefault()
    try {
      await axios.post('/api/auth/register', { username, email, password })
      router.push('/')
    } catch (err) {
      alert(err.response?.data?.error || 'Register failed')
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Create an account</h1>
      <form onSubmit={submit} className="space-y-3 card">
        <input className="w-full p-2 rounded bg-bg/30" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="w-full p-2 rounded bg-bg/30" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 rounded bg-bg/30" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-white text-black rounded p-2">Register</button>
      </form>
    </main>
  )
}
