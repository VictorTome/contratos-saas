import { Request, Response } from 'express'
import * as s from './purchase-orders.service'

export async function list(req: Request, res: Response) { res.json(await s.listPOs(req.user.companyId, req.query as any)) }
export async function create(req: Request, res: Response) { res.status(201).json(await s.createPO(req.user.companyId, s.createPOSchema.parse(req.body))) }
export async function getOne(req: Request, res: Response) { res.json(await s.getPO(req.user.companyId, req.params.id)) }
export async function updateStatus(req: Request, res: Response) { res.json(await s.updatePOStatus(req.user.companyId, req.params.id, s.updateStatusSchema.parse(req.body))) }
export async function remove(req: Request, res: Response) { await s.deletePO(req.user.companyId, req.params.id); res.status(204).send() }
