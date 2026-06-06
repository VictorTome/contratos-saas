import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../shared/errors/AppError'

export interface TokenPayload {
  userId: string
  companyId: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Token não fornecido', 401))
  }
  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
    req.user = payload
    next()
  } catch {
    next(new AppError('Token inválido ou expirado', 401))
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Permissão insuficiente', 403))
    }
    next()
  }
}
