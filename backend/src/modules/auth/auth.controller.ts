import { Request, Response } from 'express'
import { z } from 'zod'
import { loginService, refreshService } from './auth.service'
import { prisma } from '../../shared/database/prisma'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body)
  const result = await loginService(email, password)
  return res.json(result)
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body)
  const result = await refreshService(refreshToken)
  return res.json(result)
}

export async function logout(_req: Request, res: Response) {
  return res.json({ message: 'Logout realizado' })
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true, name: true, email: true, role: true,
      company: { select: { id: true, name: true, cnpj: true } },
    },
  })
  return res.json(user)
}
