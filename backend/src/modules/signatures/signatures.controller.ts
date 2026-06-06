import { Request, Response } from 'express'
import { prisma } from '../../shared/database/prisma'
import { AppError } from '../../shared/errors/AppError'

export async function getByToken(req: Request, res: Response) {
  const request = await prisma.signatureRequest.findUnique({
    where: { token: req.params.token },
    include: { contract: { select: { title: true, bodyHtml: true, partyName: true, type: true } } },
  })
  if (!request) throw new AppError('Link inválido', 404)
  if (request.status === 'SIGNED') return res.json({ status: 'already_signed', signedAt: request.signedAt })
  if (request.expiresAt && request.expiresAt < new Date()) {
    await prisma.signatureRequest.update({ where: { id: request.id }, data: { status: 'EXPIRED' } })
    throw new AppError('Link de assinatura expirado', 410)
  }
  return res.json(request)
}

export async function sign(req: Request, res: Response) {
  const request = await prisma.signatureRequest.findUnique({ where: { token: req.params.token } })
  if (!request) throw new AppError('Link inválido', 404)
  if (request.status === 'SIGNED') throw new AppError('Já assinado', 400)
  if (request.expiresAt && request.expiresAt < new Date()) throw new AppError('Link expirado', 410)

  await prisma.$transaction([
    prisma.signatureRequest.update({ where: { id: request.id }, data: { status: 'SIGNED', signedAt: new Date(), ipAddress: req.ip } }),
    prisma.contract.update({ where: { id: request.contractId }, data: { status: 'SIGNED' } }),
  ])

  return res.json({ message: 'Contrato assinado com sucesso', signedAt: new Date() })
}
