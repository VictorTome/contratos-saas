import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../shared/database/prisma'
import { AppError } from '../../shared/errors/AppError'
import { TokenPayload } from '../../middlewares/auth'

export async function loginService(email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { email },
    include: { company: true },
  })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Credenciais inválidas', 401)
  }
  const payload: TokenPayload = { userId: user.id, companyId: user.companyId, role: user.role }
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' } as jwt.SignOptions)
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d' } as jwt.SignOptions)
  return {
    accessToken, refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, company: { id: user.company.id, name: user.company.name } },
  }
}

export async function refreshService(token: string) {
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload
    const accessToken = jwt.sign(
      { userId: payload.userId, companyId: payload.companyId, role: payload.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' } as jwt.SignOptions,
    )
    return { accessToken }
  } catch {
    throw new AppError('Refresh token inválido', 401)
  }
}
