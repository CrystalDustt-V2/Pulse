import axios from 'axios'
import { wrapper as axiosCookieJarSupport } from 'axios-cookiejar-support'
import tough from 'tough-cookie'

axiosCookieJarSupport(axios)
const jar = new tough.CookieJar()
const client = axios.create({ baseURL: 'http://localhost:4000', withCredentials: true, jar })

async function run() {
  try {
    const login = await client.post('/api/auth/login', { email: 'alice@example.com', password: 'password123' })
    console.log('Login response:', login.data)
    const cookies = await jar.getCookies('http://localhost:4000')
    console.log('Cookies after login:', cookies.map(c=>c.cookieString()))
    const r = await client.post('/api/posts/post1/comment', { content: 'Test comment from script' })
    console.log('Created comment:', r.data.comment)
  } catch (err) {
    console.error('Error details:')
    if (err.response) console.error('Status', err.response.status, 'Data', err.response.data)
    else console.error(err.stack || err.message)
  }
}

run()
