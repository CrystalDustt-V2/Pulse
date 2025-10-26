// Next.js config — rewrite /api/* to backend during development so cookies are same-origin.
const isDev = process.env.NODE_ENV !== 'production'

const rewrites = () => {
  if (isDev) {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*' // Proxy to backend in development
      }
    ]
  }
  // In production, ensure NEXT_PUBLIC_API_URL is set and API calls use the correct backend URL.
  return []
}

module.exports = {
  async rewrites() {
    return rewrites()
  }
}
