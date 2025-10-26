import express from 'express'
import { login, logout, me, register } from '../controllers/authController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', auth, me)
router.post('/logout', auth, logout)

export default router
