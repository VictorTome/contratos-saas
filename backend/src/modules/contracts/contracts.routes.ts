import { Router } from 'express'
import { authenticate } from '../../middlewares/auth'
import * as c from './contracts.controller'

export const contractsRouter = Router()
contractsRouter.use(authenticate)

contractsRouter.get('/', c.list)
contractsRouter.post('/', c.create)
contractsRouter.get('/:id', c.getOne)
contractsRouter.patch('/:id', c.update)
contractsRouter.delete('/:id', c.remove)
contractsRouter.get('/:id/preview', c.preview)
contractsRouter.post('/:id/send-signature', c.sendSignature)
contractsRouter.get('/:id/signatures', c.listSignatures)
