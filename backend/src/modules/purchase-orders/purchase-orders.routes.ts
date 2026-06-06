import { Router } from 'express'
import { authenticate } from '../../middlewares/auth'
import * as c from './purchase-orders.controller'

export const purchaseOrdersRouter = Router()
purchaseOrdersRouter.use(authenticate)

purchaseOrdersRouter.get('/', c.list)
purchaseOrdersRouter.post('/', c.create)
purchaseOrdersRouter.get('/:id', c.getOne)
purchaseOrdersRouter.patch('/:id/status', c.updateStatus)
purchaseOrdersRouter.delete('/:id', c.remove)
