import { z } from 'zod'
import { prisma } from '../../shared/database/prisma'
import { AppError } from '../../shared/errors/AppError'

export const createTemplateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['SERVICE', 'EMPLOYMENT', 'CONSTRUCTION', 'LEASE', 'OTHER']),
  bodyHtml: z.string().min(1),
  isDefault: z.boolean().default(false),
})

export const addFieldSchema = z.object({
  key: z.string().min(1).regex(/^\w+$/),
  label: z.string().min(1),
  fieldType: z.enum(['TEXT', 'NUMBER', 'DATE', 'TEXTAREA', 'EMAIL', 'CURRENCY']).default('TEXT'),
  required: z.boolean().default(true),
  order: z.number().int().default(0),
})

export async function listTemplates(companyId: string) {
  return prisma.contractTemplate.findMany({
    where: { companyId },
    include: { _count: { select: { fields: true, contracts: true } } },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  })
}

export async function createTemplate(companyId: string, data: z.infer<typeof createTemplateSchema>) {
  return prisma.contractTemplate.create({ data: { ...data, companyId }, include: { fields: { orderBy: { order: 'asc' } } } })
}

export async function getTemplate(companyId: string, id: string) {
  const t = await prisma.contractTemplate.findFirst({ where: { id, companyId }, include: { fields: { orderBy: { order: 'asc' } } } })
  if (!t) throw new AppError('Template não encontrado', 404)
  return t
}

export async function updateTemplate(companyId: string, id: string, data: any) {
  await getTemplate(companyId, id)
  return prisma.contractTemplate.update({ where: { id }, data })
}

export async function deleteTemplate(companyId: string, id: string) {
  await getTemplate(companyId, id)
  const inUse = await prisma.contract.count({ where: { templateId: id } })
  if (inUse > 0) throw new AppError('Template em uso por contratos existentes', 400)
  return prisma.contractTemplate.delete({ where: { id } })
}

export async function addField(companyId: string, templateId: string, data: z.infer<typeof addFieldSchema>) {
  await getTemplate(companyId, templateId)
  const exists = await prisma.contractTemplateField.findFirst({ where: { templateId, key: data.key } })
  if (exists) throw new AppError(`Campo "${data.key}" já existe`, 400)
  return prisma.contractTemplateField.create({ data: { ...data, templateId } })
}

export async function removeField(companyId: string, templateId: string, fieldId: string) {
  await getTemplate(companyId, templateId)
  return prisma.contractTemplateField.delete({ where: { id: fieldId } })
}
