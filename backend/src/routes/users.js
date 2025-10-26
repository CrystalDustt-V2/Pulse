import express from 'express'
import auth from '../middleware/auth.js'
import prisma from '../prismaClient.js'

const router = express.Router()

router.get('/:username', auth, async (req, res) => {
  const { username } = req.params
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true, avatar: true, bio: true, level: true, xp: true } })
  if (!user) return res.status(404).json({ error: 'Not found' })
  const posts = await prisma.post.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
  res.json({ user, posts })
})

router.put('/me', auth, async (req, res) => {
  await import('../controllers/authController.js').then(mod => mod.updateProfile(req, res));
});

export default router
