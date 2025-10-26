import axios from 'axios'
import { io as ioClient } from 'socket.io-client'

const BACKEND = 'http://localhost:4000'
const ADMIN = { email: 'crystal6572@gmail.com', password: 'test1234' }

async function run(){
  console.log('E2E smoke test starting...')
  // 1) login
  const loginRes = await axios.post(`${BACKEND}/api/auth/login`, ADMIN, { withCredentials: true })
  console.log('login status', loginRes.status)
  const token = loginRes.data.token
  if(!token) throw new Error('No token returned')

  // prepare cookie header value
  const cookieHeader = `token=${token}`

  // 2) create post
  const postRes = await axios.post(`${BACKEND}/api/posts`, { content: 'E2E test post ' + new Date().toISOString() }, { headers: { cookie: cookieHeader } })
  console.log('create post status', postRes.status)
  const post = postRes.data.post
  console.log('created post id', post.id)

  // 3) connect socket and join post room
  const socket = ioClient(BACKEND, { extraHeaders: { cookie: cookieHeader }, transports: ['websocket'] })

  await new Promise((resolve, reject) => {
    socket.on('connect', () => {
      console.log('socket connected', socket.id)
      socket.emit('join:post', post.id)
      resolve()
    })
    socket.on('connect_error', (err) => { reject(err) })
    setTimeout(()=>reject(new Error('socket connect timeout')), 5000)
  })

  // 4) listen for comment:new
  const got = new Promise((resolve, reject) => {
    socket.on('comment:new', (c) => { console.log('socket received comment:new', c.id); resolve(c) })
    setTimeout(()=>reject(new Error('timeout waiting for comment:new')), 7000)
  })

  // 5) post comment via API (auth via cookie)
  const commentRes = await axios.post(`${BACKEND}/api/posts/${post.id}/comment`, { content: 'E2E live comment' }, { headers: { cookie: cookieHeader } })
  console.log('posted comment status', commentRes.status)

  const comment = await got
  console.log('E2E success: comment received via socket', comment.id)

  socket.disconnect()
  process.exit(0)
}

run().catch(e=>{ console.error('E2E failed', e && e.stack ? e.stack : e); process.exit(1) })
