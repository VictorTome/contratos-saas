import { Router } from 'express'
import { authenticate } from '../../middlewares/auth'
import { login, refresh, logout, me } from './auth.controller'

export const authRouter = Router()

authRouter.post('/login', login)
authRouter.post('/refresh', refresh)
authRouter.post('/logout', logout)
authRouter.get('/me', authenticate, me)
