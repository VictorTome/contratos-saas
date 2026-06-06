import { z } from 'zod'
import { prisma } from '../../shared/database/prisma'
import { AppError } from '../../shared/errors/AppError'

export const createPOSchema = z.object({
  obraId: z.string().uuid(),
  cnpjPagador: z.string().min(14),
  supplier: z.string().min(1),
  items: z.array(z.object({ description: z.string(), qty: z.number(), unitPrice: z.number(), total: z.number() })).min(1),
  notes: z.string().optional(),
})

export const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ISSUED', 'APPROVED', 'REJECTED', 'CANCELLED']),
})

export async function listPOs(companyId: string, query: Record<string, string>) {
  return prisma.purchaseOrder.findMany({
    where: { companyId, ...(query.obraId && { obraId: query.obraId }), ...(query.status && { status: query.status as any }) },
    include: { obra: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createPO(companyId: string, data: z.infer<typeof createPOSchema>) {
  const obra = await prisma.obra.findFirst({ where: { id: data.obraId, companyId } })
  if (!obra) throw new AppError('Obra não encontrada', 404)
  const total = data.items.reduce((s, i) => s + i.total, 0)
  return prisma.purchaseOrder.create({
    data: { companyId, obraId: data.obraId, cnpjPagador: data.cnpjPagador, supplier: data.supplier, items: JSON.stringify(data.items), total, notes: data.notes, status: 'DRAFT' },
    include: { obra: { select: { name: true } } },
  })
}

export async function getPO(companyId: string, id: string) {
  const po = await prisma.purchaseOrder.findFirst({ where: { id, companyId }, include: { obra: { select: { id: true, name: true } } } })
  if (!po) throw new AppError('O.C. não encontrada', 404)
  return po
}

export async function updatePOStatus(companyId: string, id: string, data: z.infer<typeof updateStatusSchema>) {
  await getPO(companyId, id)
  return prisma.purchaseOrder.update({ where: { id }, data: { status: data.status, issuedAt: data.status === 'ISSUED' ? new Date() : undefined } })
}

export async function deletePO(companyId: string, id: string) {
  const po = await getPO(companyId, id)
  if (!['DRAFT', 'CANCELLED'].includes(po.status)) throw new AppError('Só é possível excluir O.C. em rascunho', 400)
  return prisma.purchaseOrder.delete({ where: { id } })
}
