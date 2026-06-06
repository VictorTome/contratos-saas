import { z } from 'zod'
import { prisma } from '../../shared/database/prisma'
import { AppError } from '../../shared/errors/AppError'
import { notificationService } from '../../shared/services/notification.service'

export const createContractSchema = z.object({
  templateId: z.string().uuid().optional(),
  title: z.string().min(1),
  type: z.enum(['SERVICE', 'EMPLOYMENT', 'CONSTRUCTION', 'LEASE', 'OTHER']),
  partyName: z.string().min(1),
  partyDoc: z.string().optional(),
  value: z.number().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  fields: z.record(z.string()).default({}),
  bodyHtml: z.string().optional(),
})

export const sendSignatureSchema = z.object({
  channel: z.enum(['EMAIL', 'WHATSAPP', 'BOTH']),
  partyName: z.string().min(1),
  partyContact: z.string().min(1),
  expiresInDays: z.number().int().min(1).max(30).default(7),
})

function renderTemplate(html: string, fields: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, k) => fields[k] ?? `{{${k}}}`)
}

export async function listContracts(companyId: string, query: Record<string, string>) {
  const { status, type, search } = query
  return prisma.contract.findMany({
    where: {
      companyId,
      ...(status && { status: status as any }),
      ...(type && { type: type as any }),
      ...(search && { OR: [{ title: { contains: search, mode: 'insensitive' } }, { partyName: { contains: search, mode: 'insensitive' } }] }),
    },
    include: { template: { select: { name: true } }, _count: { select: { signatureRequests: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createContract(companyId: string, data: z.infer<typeof createContractSchema>) {
  let bodyHtml = data.bodyHtml
  if (data.templateId && !bodyHtml) {
    const tpl = await prisma.contractTemplate.findFirst({ where: { id: data.templateId, companyId } })
    if (tpl) bodyHtml = renderTemplate(tpl.bodyHtml, data.fields)
  }
  return prisma.contract.create({
    data: {
      companyId, templateId: data.templateId, title: data.title, type: data.type,
      partyName: data.partyName, partyDoc: data.partyDoc, value: data.value,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      fields: data.fields, bodyHtml, status: 'DRAFT',
    },
    include: { template: { select: { name: true } } },
  })
}

export async function getContract(companyId: string, id: string) {
  const c = await prisma.contract.findFirst({
    where: { id, companyId },
    include: {
      template: { include: { fields: { orderBy: { order: 'asc' } } } },
      signatureRequests: { orderBy: { createdAt: 'desc' } },
      obra: { select: { id: true, name: true, status: true } },
    },
  })
  if (!c) throw new AppError('Contrato não encontrado', 404)
  return c
}

export async function updateContract(companyId: string, id: string, data: any) {
  const c = await prisma.contract.findFirst({ where: { id, companyId } })
  if (!c) throw new AppError('Contrato não encontrado', 404)
  return prisma.contract.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  })
}

export async function deleteContract(companyId: string, id: string) {
  const c = await prisma.contract.findFirst({ where: { id, companyId } })
  if (!c) throw new AppError('Contrato não encontrado', 404)
  if (c.status === 'SIGNED') throw new AppError('Não é possível excluir contratos assinados', 400)
  return prisma.contract.delete({ where: { id } })
}

export async function sendSignatureService(companyId: string, contractId: string, data: z.infer<typeof sendSignatureSchema>) {
  const contract = await prisma.contract.findFirst({ where: { id: contractId, companyId } })
  if (!contract) throw new AppError('Contrato não encontrado', 404)
  if (contract.status === 'SIGNED') throw new AppError('Contrato já assinado', 400)

  const expiresAt = new Date(Date.now() + data.expiresInDays * 86400000)
  const channels = data.channel === 'BOTH' ? ['EMAIL', 'WHATSAPP'] : [data.channel]
  const requests = []

  for (const channel of channels) {
    const req = await prisma.signatureRequest.create({
      data: { contractId, channel: channel as any, status: 'SENT', partyName: data.partyName, partyContact: data.partyContact, sentAt: new Date(), expiresAt },
    })
    await notificationService.send({ channel: channel as any, to: data.partyContact, partyName: data.partyName, contractTitle: contract.title, token: req.token })
    requests.push(req)
  }

  await prisma.contract.update({ where: { id: contractId }, data: { status: 'PENDING_SIGNATURE' } })
  return requests
}
