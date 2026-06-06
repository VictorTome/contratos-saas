import { z } from 'zod'
import { prisma } from '../../shared/database/prisma'
import { AppError } from '../../shared/errors/AppError'

export const createObraSchema = z.object({
  contractId: z.string().uuid().optional(),
  name: z.string().min(1),
  address: z.string().optional(),
  budgetPlanned: z.number().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const updateObraSchema = createObraSchema.partial().extend({
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'INSPECTING', 'COMPLETED', 'CANCELLED']).optional(),
})

export const stepSchema = z.object({
  name: z.string().min(1),
  phase: z.enum(['PLANNING', 'EXECUTION', 'DELIVERY']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED']).default('PENDING'),
  dueDate: z.string().optional(),
  order: z.number().int().default(0),
  notes: z.string().optional(),
})

export const vistoriaSchema = z.object({
  type: z.enum(['INITIAL', 'PROGRESS', 'FINAL']),
  description: z.string().optional(),
  photoUrls: z.array(z.string()).default([]),
})

export const custoSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().optional(),
})

async function findObra(companyId: string, id: string) {
  const obra = await prisma.obra.findFirst({ where: { id, companyId } })
  if (!obra) throw new AppError('Obra não encontrada', 404)
  return obra
}

export async function listObras(companyId: string, query: Record<string, string>) {
  return prisma.obra.findMany({
    where: { companyId, ...(query.status && { status: query.status as any }) },
    include: { contract: { select: { title: true } }, _count: { select: { steps: true, custos: true, purchaseOrders: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createObra(companyId: string, data: z.infer<typeof createObraSchema>) {
  if (data.contractId) {
    const c = await prisma.contract.findFirst({ where: { id: data.contractId, companyId } })
    if (!c) throw new AppError('Contrato não encontrado', 404)
  }
  return prisma.obra.create({
    data: { companyId, ...data, startDate: data.startDate ? new Date(data.startDate) : undefined, endDate: data.endDate ? new Date(data.endDate) : undefined },
    include: { contract: { select: { title: true } } },
  })
}

export async function getObra(companyId: string, id: string) {
  const obra = await prisma.obra.findFirst({
    where: { id, companyId },
    include: {
      contract: { select: { id: true, title: true, status: true } },
      steps: { orderBy: { order: 'asc' } },
      vistorias: { orderBy: { createdAt: 'asc' } },
      custos: { orderBy: { date: 'desc' } },
      purchaseOrders: { orderBy: { createdAt: 'desc' }, select: { id: true, supplier: true, status: true, total: true, issuedAt: true } },
    },
  })
  if (!obra) throw new AppError('Obra não encontrada', 404)
  return obra
}

export async function updateObra(companyId: string, id: string, data: z.infer<typeof updateObraSchema>) {
  await findObra(companyId, id)
  return prisma.obra.update({ where: { id }, data: { ...data, startDate: data.startDate ? new Date(data.startDate) : undefined, endDate: data.endDate ? new Date(data.endDate) : undefined } })
}

export async function addStep(companyId: string, obraId: string, data: z.infer<typeof stepSchema>) {
  await findObra(companyId, obraId)
  return prisma.obraStep.create({ data: { ...data, obraId, dueDate: data.dueDate ? new Date(data.dueDate) : undefined } })
}

export async function updateStep(companyId: string, obraId: string, stepId: string, data: any) {
  await findObra(companyId, obraId)
  return prisma.obraStep.update({ where: { id: stepId }, data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : undefined } })
}

export async function deleteStep(companyId: string, obraId: string, stepId: string) {
  await findObra(companyId, obraId)
  return prisma.obraStep.delete({ where: { id: stepId } })
}

export async function listVistorias(companyId: string, obraId: string) {
  await findObra(companyId, obraId)
  return prisma.obraVistoria.findMany({ where: { obraId }, orderBy: { createdAt: 'asc' } })
}

export async function addVistoria(companyId: string, obraId: string, data: z.infer<typeof vistoriaSchema>) {
  await findObra(companyId, obraId)
  return prisma.obraVistoria.create({ data: { obraId, ...data, photoUrls: JSON.stringify(data.photoUrls) } })
}

export async function listCustos(companyId: string, obraId: string) {
  await findObra(companyId, obraId)
  return prisma.obraCusto.findMany({ where: { obraId }, orderBy: { date: 'desc' } })
}

export async function addCusto(companyId: string, obraId: string, data: z.infer<typeof custoSchema>) {
  await findObra(companyId, obraId)
  const custo = await prisma.obraCusto.create({ data: { obraId, ...data, date: data.date ? new Date(data.date) : new Date() } })
  const agg = await prisma.obraCusto.aggregate({ where: { obraId }, _sum: { amount: true } })
  await prisma.obra.update({ where: { id: obraId }, data: { budgetRealized: agg._sum.amount ?? 0 } })
  return custo
}

export async function deleteCusto(companyId: string, obraId: string, custoId: string) {
  await findObra(companyId, obraId)
  await prisma.obraCusto.delete({ where: { id: custoId } })
  const agg = await prisma.obraCusto.aggregate({ where: { obraId }, _sum: { amount: true } })
  await prisma.obra.update({ where: { id: obraId }, data: { budgetRealized: agg._sum.amount ?? 0 } })
}

export async function getObraSummary(companyId: string, obraId: string) {
  const obra = await getObra(companyId, obraId)
  const totalSteps = obra.steps.length
  const doneSteps = obra.steps.filter((s: any) => s.status === 'DONE').length
  const custosByCategory = obra.custos.reduce<Record<string, number>>((acc, c: any) => {
    acc[c.category] = (acc[c.category] ?? 0) + Number(c.amount)
    return acc
  }, {})
  return {
    progress: totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0,
    totalSteps, doneSteps,
    budgetPlanned: Number(obra.budgetPlanned ?? 0),
    budgetRealized: Number(obra.budgetRealized),
    budgetVariance: Number(obra.budgetPlanned ?? 0) - Number(obra.budgetRealized),
    custosByCategory,
    vistoriasCount: obra.vistorias.length,
    hasInitialVistoria: obra.vistorias.some((v: any) => v.type === 'INITIAL'),
    hasFinalVistoria: obra.vistorias.some((v: any) => v.type === 'FINAL'),
  }
}
