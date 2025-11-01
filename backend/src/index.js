import cookie from 'cookie'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import jwt from 'jsonwebtoken'
import path from 'path'
// import { Server as IOServer } from 'socket.io' // Commented out for Genezio serverless
import { addXp } from './controllers/authController.js'
import prisma from './prismaClient.js'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/posts.js'
import searchRouter from './routes/search.js'
import userRoutes from './routes/users.js'

dotenv.config()

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: "10mb" }))
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/users', userRoutes)
app.use('/api/search', searchRouter)

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

const port = process.env.PORT || 4000
const server = app.listen(port, () => {
  console.log(`Pulse backend listening on port ${port}`)
})

// attach socket.io
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'

export const io = new IOServer(server, {
  cors: { origin: true, credentials: true }
})

// Global in-memory metrics for unauthorized socket write attempts
// Structure: { total: 0, bySocket: { [socketId]: 0 }, byIp: { [ip]: 0 } }
const unauthorizedWriteAttempts = { total: 0, bySocket: {}, byIp: {} }

// Permissive socket auth: attach socket.userId when a valid token is present,
// but allow anonymous connections for read-only use (e.g., subscribing to comment updates).
io.use((socket, next) => {
  try {
    // prefer token passed via socket.handshake.auth (socket.io client can
    // provide an auth token per-connection), then fall back to cookies.
    const authToken = socket.handshake.auth && socket.handshake.auth.token
    let token = authToken
    if (!token) {
      const cookieHeader = socket.handshake.headers.cookie || ''
      const parsed = cookie.parse(cookieHeader || '')
      token = parsed.token
    }
    if (!token) return next()
    const decoded = jwt.verify(token, JWT_SECRET)
    socket.userId = decoded.id
    return next()
  } catch (e) {
    console.warn('Socket auth parse/verify failed', e.message || e)
    // treat invalid token as anonymous rather than rejecting connection
    return next()
  }
})

io.on('connection', (socket) => {
  // helper to require authentication for write actions
  function requireSocketAuth() {
    if (!socket.userId) {
      // increment global metric and log
      unauthorizedWriteAttempts.total += 1
      unauthorizedWriteAttempts.bySocket[socket.id] = (unauthorizedWriteAttempts.bySocket[socket.id] || 0) + 1
      const addr = socket.handshake.address || socket.handshake.headers?.['x-forwarded-for'] || 'unknown'
      unauthorizedWriteAttempts.byIp[addr] = (unauthorizedWriteAttempts.byIp[addr] || 0) + 1
      console.warn(`[unauth-write] socket=${socket.id} addr=${addr} time=${new Date().toISOString()}`)
      socket.emit('error', { code: 'UNAUTHORIZED', message: 'Authentication required for this action. Use HTTP endpoints or authenticate first.' })
      return false
    }
    return true
  }


  // join a post room (read-only subscription) — allow anonymous
  socket.on('join:post', (postId) => {
    socket.join(`post:${postId}`)
  })
  socket.on('leave:post', (postId) => {
    socket.leave(`post:${postId}`)
  })

  // example write event handlers — enforce auth and return a clear message
  // Note: the canonical way to create comments/posts remains the HTTP API.
  socket.on('comment:create', async (payload) => {
    if (!requireSocketAuth()) return
    try {
      const { postId, content } = payload || {}
      if (!postId || !content || typeof content !== 'string' || content.trim().length === 0) {
        return socket.emit('error', { code: 'BAD_REQUEST', message: 'postId and non-empty content are required' })
      }
      // ensure post exists
      const post = await prisma.post.findUnique({ where: { id: postId } })
      if (!post) return socket.emit('error', { code: 'NOT_FOUND', message: 'Post not found' })

      // create the comment
      const comment = await prisma.comment.create({ data: { userId: socket.userId, postId, content }, include: { user: true } })

      // award xp
      try { await addXp(socket.userId, 2) } catch (e) { console.warn('addXp failed', e) }

      // emit to post room
      io.to(`post:${postId}`).emit('comment:new', comment)

      // ack to creator
      socket.emit('comment:created', comment)
    } catch (err) {
      console.error('Socket comment:create failed', err)
      socket.emit('error', { code: 'INTERNAL', message: 'Failed to create comment' })
    }
  })
  socket.on('post:create', (payload) => {
    if (!requireSocketAuth()) return
    socket.emit('error', { code: 'NOT_IMPLEMENTED', message: 'Server does not accept post creation over socket. POST to /api/posts instead.' })
  })
})

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please stop the process using that port or set a different PORT in your .env`)
    console.error(`To find the process (PowerShell): netstat -ano | Select-String ':' + port + ''`)
    console.error('Then kill it: Stop-Process -Id <PID> -F  OR: taskkill /PID <PID> /F')
    process.exit(1)
  }
  console.error('Server error:', err)
  process.exit(1)
})

export default app;