import axios from 'axios'
import { wrapper as axiosCookieJarSupport } from 'axios-cookiejar-support'
import tough from 'tough-cookie'

axiosCookieJarSupport(axios)
const jar = new tough.CookieJar()
const client = axios.create({ baseURL: 'http://localhost:4000', withCredentials: true, jar })

async function run() {
  try {
    const login = await client.post('/api/auth/login', { email: 'alice@example.com', password: 'password123' })
    console.log('Login:', login.data)
    const posts = await client.get('/api/posts')
    console.log('Posts:', posts.data)
  } catch (err) {
    console.error(err?.response?.data || err.message)
  }
}

run()
