import { Router } from 'express'
import { authenticate } from '../../middlewares/auth'
import { getMetrics } from './dashboard.controller'

export const dashboardRouter = Router()
dashboardRouter.use(authenticate)
dashboardRouter.get('/metrics', getMetrics)
