import { Request, Response } from 'express'
import * as s from './contracts.service'

export async function list(req: Request, res: Response) {
  res.json(await s.listContracts(req.user.companyId, req.query as any))
}
export async function create(req: Request, res: Response) {
  const data = s.createContractSchema.parse(req.body)
  res.status(201).json(await s.createContract(req.user.companyId, data))
}
export async function getOne(req: Request, res: Response) {
  res.json(await s.getContract(req.user.companyId, req.params.id))
}
export async function update(req: Request, res: Response) {
  res.json(await s.updateContract(req.user.companyId, req.params.id, req.body))
}
export async function remove(req: Request, res: Response) {
  await s.deleteContract(req.user.companyId, req.params.id)
  res.status(204).send()
}
export async function preview(req: Request, res: Response) {
  const c = await s.getContract(req.user.companyId, req.params.id)
  res.json({ html: c.bodyHtml })
}
export async function sendSignature(req: Request, res: Response) {
  const data = s.sendSignatureSchema.parse(req.body)
  res.status(201).json(await s.sendSignatureService(req.user.companyId, req.params.id, data))
}
export async function listSignatures(req: Request, res: Response) {
  const c = await s.getContract(req.user.companyId, req.params.id)
  res.json(c.signatureRequests)
}
