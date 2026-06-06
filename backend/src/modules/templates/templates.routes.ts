import { Router } from 'express'
import { authenticate } from '../../middlewares/auth'
import * as c from './templates.controller'

export const templatesRouter = Router()
templatesRouter.use(authenticate)

templatesRouter.get('/', c.list)
templatesRouter.post('/', c.create)
templatesRouter.get('/:id', c.getOne)
templatesRouter.patch('/:id', c.update)
templatesRouter.delete('/:id', c.remove)
templatesRouter.get('/:id/fields', c.listFields)
templatesRouter.post('/:id/fields', c.addField)
templatesRouter.delete('/:id/fields/:fieldId', c.removeField)
