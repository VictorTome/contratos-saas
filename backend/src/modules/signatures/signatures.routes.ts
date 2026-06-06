import { Router } from 'express'
import { getByToken, sign } from './signatures.controller'

export const signaturesRouter = Router()

signaturesRouter.get('/:token', getByToken)
signaturesRouter.post('/:token/sign', sign)
