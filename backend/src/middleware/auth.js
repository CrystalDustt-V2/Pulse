import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'

export default function auth(req, res, next) {
  const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1])
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const data = jwt.verify(token, JWT_SECRET)
    req.userId = data.id
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
