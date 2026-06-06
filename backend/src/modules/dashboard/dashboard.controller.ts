import { Request, Response } from 'express'
import { prisma } from '../../shared/database/prisma'

export async function getMetrics(req: Request, res: Response) {
  const { companyId } = req.user
  const now = new Date()
  const in30days = new Date(now.getTime() + 30 * 86400000)

  const [totalContracts, activeContracts, expiringSoon, pendingSignatures, totalObras, obrasInProgress, totalPOValue, recentContracts, recentObras] =
    await Promise.all([
      prisma.contract.count({ where: { companyId } }),
      prisma.contract.count({ where: { companyId, status: 'SIGNED' } }),
      prisma.contract.count({ where: { companyId, status: 'SIGNED', endDate: { gte: now, lte: in30days } } }),
      prisma.contract.count({ where: { companyId, status: 'PENDING_SIGNATURE' } }),
      prisma.obra.count({ where: { companyId } }),
      prisma.obra.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      prisma.purchaseOrder.aggregate({ where: { companyId, status: { in: ['ISSUED', 'APPROVED'] } }, _sum: { total: true } }),
      prisma.contract.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, title: true, partyName: true, status: true, value: true, endDate: true } }),
      prisma.obra.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, status: true, budgetPlanned: true, budgetRealized: true } }),
    ])

  res.json({
    contracts: { total: totalContracts, active: activeContracts, expiringSoon, pendingSignatures },
    obras: { total: totalObras, inProgress: obrasInProgress },
    financial: { totalPOCommitted: totalPOValue._sum.total ?? 0 },
    recentContracts,
    recentObras,
  })
}
