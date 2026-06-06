import { Request, Response } from 'express'
import * as s from './templates.service'

export async function list(req: Request, res: Response) { res.json(await s.listTemplates(req.user.companyId)) }
export async function create(req: Request, res: Response) { res.status(201).json(await s.createTemplate(req.user.companyId, s.createTemplateSchema.parse(req.body))) }
export async function getOne(req: Request, res: Response) { res.json(await s.getTemplate(req.user.companyId, req.params.id)) }
export async function update(req: Request, res: Response) { res.json(await s.updateTemplate(req.user.companyId, req.params.id, req.body)) }
export async function remove(req: Request, res: Response) { await s.deleteTemplate(req.user.companyId, req.params.id); res.status(204).send() }
export async function listFields(req: Request, res: Response) { const t = await s.getTemplate(req.user.companyId, req.params.id); res.json(t.fields) }
export async function addField(req: Request, res: Response) { res.status(201).json(await s.addField(req.user.companyId, req.params.id, s.addFieldSchema.parse(req.body))) }
export async function removeField(req: Request, res: Response) { await s.removeField(req.user.companyId, req.params.id, req.params.fieldId); res.status(204).send() }
