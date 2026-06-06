import { Request, Response, NextFunction } from 'express'
import { AppError } from './AppError'
import { ZodError } from 'zod'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: 'Dados inválidos',
      issues: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    })
  }
  console.error('[ERROR]', err)
  return res.status(500).json({ error: 'Erro interno do servidor' })
}
