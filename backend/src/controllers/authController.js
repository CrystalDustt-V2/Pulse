import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

function createToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
}

export async function register(req, res) {
  const { username, email, password } = req.body
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' })

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
  if (existing) return res.status(400).json({ error: 'User already exists' })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { username, email, password: hashed } })
  const token = createToken(user)
  // If the client requested a per-tab session, return the token but do not
  // set the httpOnly cookie. Otherwise set the cookie (shared session).
  if (req.body?.perTab) {
    return res.json({ user: { id: user.id, username: user.username, email: user.email }, token })
  }
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  res.json({ user: { id: user.id, username: user.username, email: user.email }, token })
}

export async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(400).json({ error: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' })

  const token = createToken(user)
  // Support per-tab (ephemeral) sessions. If client passes perTab=true we
  // return the token but do not set the httpOnly cookie.
  if (req.body?.perTab) {
    return res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role }, token })
  }
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role }, token })
}

export async function me(req, res) {
  const userId = req.userId
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true, email: true, avatar: true, bio: true, level: true, xp: true, role: true } })
  res.json({ user })
}

export async function logout(req, res) {
  res.clearCookie('token', { sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  res.json({ ok: true })
}

export async function addXp(userId, amount) {
  const user = await prisma.user.update({ where: { id: userId }, data: { xp: { increment: amount } } })
  // level up for each 100 xp
  const newLevel = Math.floor(user.xp / 100) + 1
  if (newLevel > user.level) {
    await prisma.user.update({ where: { id: userId }, data: { level: newLevel } })
  }
  return await prisma.user.findUnique({ where: { id: userId } })
}

export async function updateProfile(req, res) {
  const userId = req.userId;
  const { username, bio, avatar } = req.body;
  const updates = {};
  if (username) {
    // Check if username is taken by another user
    const existing = await prisma.user.findFirst({ where: { username, NOT: { id: userId } } });
    if (existing) return res.status(400).json({ error: "Username already taken" });
    updates.username = username;
  }
  if (bio !== undefined) updates.bio = bio;
  if (avatar !== undefined) updates.avatar = avatar;
  const user = await prisma.user.update({ where: { id: userId }, data: updates });
  res.json({ user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio, level: user.level, xp: user.xp, role: user.role } });
}
