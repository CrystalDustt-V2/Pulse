import express from 'express'
import multer from 'multer'
import path from 'path'
import { commentPost, createPost, deleteComment, deletePost, feed, followUser, getPost, likeComment, likePost } from '../controllers/postController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

const upload = multer({ dest: path.join(process.cwd(), 'uploads') })

 // Public: list and view posts for development convenience
 router.get('/', feed)
 router.get('/:id', getPost)

 // Authenticated actions
 router.post('/', auth, upload.single('image'), createPost)
router.post('/:postId/like', auth, likePost)
router.post('/:postId/comment', auth, commentPost)
router.post('/:userId/follow', auth, followUser)
router.delete('/:id', auth, deletePost)
router.delete('/:postId/comment/:commentId', auth, deleteComment)
router.post('/comments/:commentId/like', auth, likeComment)

export default router
