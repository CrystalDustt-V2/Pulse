import { io } from '../index.js'
import prisma from '../middleware/prismaClient.js'
import { addXp } from './authController.js'
async function isAdmin(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return user?.role === 'ADMIN'
}

export async function createPost(req, res) {
  const userId = req.userId
  const { content } = req.body
  const image = req.file ? `/uploads/${req.file.filename}` : null
  const post = await prisma.post.create({ data: { userId, content, image }, include: { user: true, likes: true, comments: true } })
  await addXp(userId, 5)
  res.json({ post })
}

export async function getPost(req, res) {
  const { id } = req.params
  const post = await prisma.post.findUnique({ where: { id }, include: { user: true, likes: true, comments: { include: { user: true } } } })
  res.json({ post })
}

export async function feed(req, res) {
  const userId = req.userId
  const follows = await prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } })
  const followingIds = follows.map(f => f.followingId)
  let posts
  if (!followingIds || followingIds.length === 0) {
    // development convenience: show all posts when user follows nobody
    posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' }, include: { user: true, likes: true, comments: true } })
  } else {
    posts = await prisma.post.findMany({ where: { userId: { in: followingIds } }, orderBy: { createdAt: 'desc' }, include: { user: true, likes: true, comments: true } })
  }
  res.json({ posts })
}

export async function likePost(req, res) {
  const userId = req.userId
  const { postId } = req.params
  const existing = await prisma.like.findFirst({ where: { userId, postId } })
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
    // remove xp? keep simple: subtract 1
    await prisma.user.update({ where: { id: userId }, data: { xp: { decrement: 1 } } })
    return res.json({ liked: false })
  }
  await prisma.like.create({ data: { userId, postId } })
  await addXp(userId, 1)
  res.json({ liked: true })
}

export async function commentPost(req, res) {
  const userId = req.userId
  const { postId } = req.params
  const { content } = req.body
  const comment = await prisma.comment.create({ data: { userId, postId, content }, include: { user: true } })
  await addXp(userId, 2)
  // emit socket event to post room
  try {
    io.to(`post:${postId}`).emit('comment:new', comment)
  } catch (e) {
    console.error('Socket emit failed', e)
  }
  res.json({ comment })
}

export async function followUser(req, res) {
  const followerId = req.userId
  const { userId } = req.params
  if (followerId === userId) return res.status(400).json({ error: 'Cannot follow yourself' })
  try {
    const f = await prisma.follow.create({ data: { followerId, followingId: userId } })
    res.json({ following: true })
  } catch (err) {
    // unique constraint -> unfollow
    if (err?.code === 'P2002') {
      await prisma.follow.deleteMany({ where: { followerId, followingId: userId } })
      res.json({ following: false })
    } else {
      res.status(500).json({ error: 'Server error' })
    }
  }
}

export async function deletePost(req, res) {
  const userId = req.userId
  const { id } = req.params
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return res.status(404).json({ error: 'Post not found' })
  const ownerId = post.userId
  const admin = await isAdmin(userId)
  if (userId !== ownerId && !admin) return res.status(403).json({ error: 'Forbidden' })

  await prisma.comment.deleteMany({ where: { postId: id } })
  await prisma.like.deleteMany({ where: { postId: id } })
  await prisma.post.delete({ where: { id } })

  try { io.emit('post:deleted', { id }) } catch (e) { console.error('Socket emit failed', e) }
  res.json({ deleted: true })
}

export async function deleteComment(req, res) {
  const userId = req.userId
  const { postId, commentId } = req.params
  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment) return res.status(404).json({ error: 'Comment not found' })
  const ownerId = comment.userId
  const admin = await isAdmin(userId)
  if (userId !== ownerId && !admin) return res.status(403).json({ error: 'Forbidden' })

  await prisma.comment.delete({ where: { id: commentId } })
  try { io.to(`post:${postId}`).emit('comment:deleted', { id: commentId }) } catch (e) { console.error('Socket emit failed', e) }
  res.json({ deleted: true })
}

export async function likeComment(req, res) {
  const userId = req.userId
  const { commentId } = req.params
  if (!userId) return res.status(401).json({ error: "Unauthorized" })
  const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { likes: true } })
  if (!comment) return res.status(404).json({ error: "Comment not found" })
  const existing = await prisma.like.findFirst({ where: { userId, commentId } })
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
    return res.json({ liked: false })
  } else {
    await prisma.like.create({ data: { userId, commentId } })
    return res.json({ liked: true })
  }
}

