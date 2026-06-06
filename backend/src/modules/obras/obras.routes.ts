import { Router } from 'express'
import { authenticate } from '../../middlewares/auth'
import * as c from './obras.controller'

export const obrasRouter = Router()
obrasRouter.use(authenticate)

obrasRouter.get('/', c.list)
obrasRouter.post('/', c.create)
obrasRouter.get('/:id', c.getOne)
obrasRouter.patch('/:id', c.update)
obrasRouter.get('/:id/summary', c.getSummary)
obrasRouter.post('/:id/steps', c.addStep)
obrasRouter.patch('/:id/steps/:stepId', c.updateStep)
obrasRouter.delete('/:id/steps/:stepId', c.deleteStep)
obrasRouter.get('/:id/vistorias', c.listVistorias)
obrasRouter.post('/:id/vistorias', c.addVistoria)
obrasRouter.get('/:id/custos', c.listCustos)
obrasRouter.post('/:id/custos', c.addCusto)
obrasRouter.delete('/:id/custos/:custoId', c.deleteCusto)
