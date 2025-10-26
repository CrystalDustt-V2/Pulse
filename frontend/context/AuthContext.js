import { createContext, useContext, useEffect, useState } from 'react'
import axios from '../lib/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function whoami() {
      try {
        // If a per-tab token exists in sessionStorage, attach it to axios
        // so the /me request will be authenticated via Authorization header.
        const sessionToken = typeof window !== 'undefined' ? sessionStorage.getItem('pulse:token') : null
        if (sessionToken) axios.defaults.headers.common['Authorization'] = `Bearer ${sessionToken}`

        const r = await axios.get('/api/auth/me')
        if (mounted) setUser(r.data.user)
      } catch (e) {
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    whoami()
    return () => { mounted = false }
  }, [])

  // perTab: when true, request a token-only login and store token in
  // sessionStorage for this tab. When false (default) rely on httpOnly
  // cookie set by server (shared session across tabs).
  async function signIn(email, password, perTab = false) {
    const r = await axios.post('/api/auth/login', { email, password, perTab })
    // if server returned a token and perTab is used, persist to sessionStorage
    if (perTab && r.data?.token) {
      try { sessionStorage.setItem('pulse:token', r.data.token); axios.defaults.headers.common['Authorization'] = `Bearer ${r.data.token}` } catch (e) {}
    }
    setUser(r.data.user)
    return r.data.user
  }

  async function signOut() {
    try { await axios.post('/api/auth/logout') } catch (e) {}
    // clear per-tab token if present
    try { sessionStorage.removeItem('pulse:token'); delete axios.defaults.headers.common['Authorization'] } catch (e) {}
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
