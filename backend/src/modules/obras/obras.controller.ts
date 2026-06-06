import { Request, Response } from 'express'
import * as s from './obras.service'

export async function list(req: Request, res: Response) { res.json(await s.listObras(req.user.companyId, req.query as any)) }
export async function create(req: Request, res: Response) { res.status(201).json(await s.createObra(req.user.companyId, s.createObraSchema.parse(req.body))) }
export async function getOne(req: Request, res: Response) { res.json(await s.getObra(req.user.companyId, req.params.id)) }
export async function update(req: Request, res: Response) { res.json(await s.updateObra(req.user.companyId, req.params.id, s.updateObraSchema.parse(req.body))) }
export async function getSummary(req: Request, res: Response) { res.json(await s.getObraSummary(req.user.companyId, req.params.id)) }
export async function addStep(req: Request, res: Response) { res.status(201).json(await s.addStep(req.user.companyId, req.params.id, s.stepSchema.parse(req.body))) }
export async function updateStep(req: Request, res: Response) { res.json(await s.updateStep(req.user.companyId, req.params.id, req.params.stepId, req.body)) }
export async function deleteStep(req: Request, res: Response) { await s.deleteStep(req.user.companyId, req.params.id, req.params.stepId); res.status(204).send() }
export async function listVistorias(req: Request, res: Response) { res.json(await s.listVistorias(req.user.companyId, req.params.id)) }
export async function addVistoria(req: Request, res: Response) { res.status(201).json(await s.addVistoria(req.user.companyId, req.params.id, s.vistoriaSchema.parse(req.body))) }
export async function listCustos(req: Request, res: Response) { res.json(await s.listCustos(req.user.companyId, req.params.id)) }
export async function addCusto(req: Request, res: Response) { res.status(201).json(await s.addCusto(req.user.companyId, req.params.id, s.custoSchema.parse(req.body))) }
export async function deleteCusto(req: Request, res: Response) { await s.deleteCusto(req.user.companyId, req.params.id, req.params.custoId); res.status(204).send() }
