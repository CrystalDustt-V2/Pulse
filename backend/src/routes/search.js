import express from 'express'
import prisma from '../prismaClient.js'

const router = express.Router()

// Search users by username
router.get('/users', async (req, res) => {
  const q = req.query.q || ''
  if (!q.trim()) return res.json({ users: [] })
  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q
        }
      },
      select: {
        id: true,
        username: true,
        avatar: true
      },
      take: 10
    })
    res.json({ users })
  } catch (err) {
    console.error('User search error:', err)
    res.status(500).json({ error: 'Failed to search users', details: err.message })
  }
})

// Search posts by content
router.get('/posts', async (req, res) => {
  const q = req.query.q || ''
  if (!q.trim()) return res.json({ posts: [] })
  try {
    const posts = await prisma.post.findMany({
      where: {
        content: {
          contains: q
        }
      },
      select: {
        id: true,
        content: true,
        userId: true
      },
      take: 10
    })
    res.json({ posts })
  } catch (err) {
    console.error('Post search error:', err)
    console.error('Full error stack:', err.stack)
    res.status(500).json({ error: 'Failed to search posts', details: err.message, stack: err.stack })
  }
})

export default router