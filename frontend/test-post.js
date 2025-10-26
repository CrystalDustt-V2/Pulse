import axios from 'axios'
import { wrapper as axiosCookieJarSupport } from 'axios-cookiejar-support'
import FormData from 'form-data'
import tough from 'tough-cookie'

axiosCookieJarSupport(axios)
const jar = new tough.CookieJar()
const client = axios.create({ baseURL: 'http://localhost:4000', withCredentials: true, jar })

async function run() {
  try {
    await client.post('/api/auth/login', { email: 'alice@example.com', password: 'password123' })
    const form = new FormData()
    form.append('content', 'Programmatic post from test script')
    const r = await client.post('/api/posts', form, { headers: form.getHeaders() })
    console.log('Created:', r.data.post)
  } catch (err) {
    console.error(err?.response?.data || err.message)
  }
}

run()
