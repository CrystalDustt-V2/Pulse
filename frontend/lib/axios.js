import axios from 'axios'

// Prefer an explicit backend host when provided via NEXT_PUBLIC_API_URL so the
// browser talks directly to the backend (this ensures cookies are scoped to
// the backend host and socket.io can authenticate correctly). If the env
// var is not set, fall back to relative paths so the Next proxy can be used.
const baseURL = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || '') : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')

const instance = axios.create({ baseURL, withCredentials: true })

// Attach token from sessionStorage or cookies to every request
instance.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const sessionToken = sessionStorage.getItem('pulse:token')
    if (sessionToken) {
      config.headers['Authorization'] = `Bearer ${sessionToken}`
    } else {
      // Try to get token from cookies if not in sessionStorage
      const match = document.cookie.match(/(?:^|; )token=([^;]*)/)
      if (match) {
        config.headers['Authorization'] = `Bearer ${match[1]}`
      }
    }
  }
  return config
}, error => Promise.reject(error))

export default instance
