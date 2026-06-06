import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const company = await prisma.company.upsert({
    where: { cnpj: '12.345.678/0001-99' },
    update: {},
    create: { name: 'Construtora Demo Ltda', cnpj: '12.345.678/0001-99' },
  })

  const hash = await bcrypt.hash('demo1234', 10)
  await prisma.user.upsert({
    where: { companyId_email: { companyId: company.id, email: 'admin@demo.com' } },
    update: {},
    create: { companyId: company.id, name: 'Admin Demo', email: 'admin@demo.com', passwordHash: hash, role: 'ADMIN' },
  })

  const tplService = await prisma.contractTemplate.upsert({
    where: { id: 'tpl-service-001' },
    update: {},
    create: {
      id: 'tpl-service-001',
      companyId: company.id,
      name: 'Prestação de Serviço',
      type: 'SERVICE',
      isDefault: true,
      bodyHtml: `<h2>Contrato de Prestação de Serviço</h2><p>Entre <strong>{{contratante}}</strong> e <strong>{{contratado}}</strong>.</p><p>Objeto: {{objeto_servico}}</p><p>Valor: R$ {{valor_servico}}</p><p>Vigência: {{data_inicio}} a {{data_fim}}</p>`,
      fields: {
        create: [
          { key: 'contratante', label: 'Nome do Contratante', fieldType: 'TEXT', order: 1 },
          { key: 'contratado', label: 'Nome do Contratado', fieldType: 'TEXT', order: 2 },
          { key: 'objeto_servico', label: 'Objeto do Serviço', fieldType: 'TEXTAREA', order: 3 },
          { key: 'valor_servico', label: 'Valor (R$)', fieldType: 'CURRENCY', order: 4 },
          { key: 'data_inicio', label: 'Data de Início', fieldType: 'DATE', order: 5 },
          { key: 'data_fim', label: 'Data de Encerramento', fieldType: 'DATE', order: 6 },
        ],
      },
    },
  })

  const tplLease = await prisma.contractTemplate.upsert({
    where: { id: 'tpl-lease-001' },
    update: {},
    create: {
      id: 'tpl-lease-001',
      companyId: company.id,
      name: 'Contrato de Locação',
      type: 'LEASE',
      bodyHtml: `<h2>Contrato de Locação</h2><p>Locador: <strong>{{locador}}</strong> | Locatário: <strong>{{locatario}}</strong></p><p>Imóvel: {{endereco_imovel}}</p><p>Aluguel: R$ {{valor_aluguel}}/mês</p><p>Vigência: {{data_inicio}} a {{data_fim}}</p>`,
      fields: {
        create: [
          { key: 'locador', label: 'Nome do Locador', fieldType: 'TEXT', order: 1 },
          { key: 'locatario', label: 'Nome do Locatário', fieldType: 'TEXT', order: 2 },
          { key: 'endereco_imovel', label: 'Endereço do Imóvel', fieldType: 'TEXT', order: 3 },
          { key: 'valor_aluguel', label: 'Valor do Aluguel (R$)', fieldType: 'CURRENCY', order: 4 },
          { key: 'data_inicio', label: 'Início da Vigência', fieldType: 'DATE', order: 5 },
          { key: 'data_fim', label: 'Fim da Vigência', fieldType: 'DATE', order: 6 },
        ],
      },
    },
  })

  const tplConstruction = await prisma.contractTemplate.upsert({
    where: { id: 'tpl-construction-001' },
    update: {},
    create: {
      id: 'tpl-construction-001',
      companyId: company.id,
      name: 'Contrato de Obra',
      type: 'CONSTRUCTION',
      bodyHtml: `<h2>Contrato de Obra</h2><p>Contratante: <strong>{{contratante}}</strong> | Empreiteira: <strong>{{empreiteira}}</strong></p><p>Obra: {{descricao_obra}} — {{endereco_obra}}</p><p>Valor global: R$ {{valor_global}}</p><p>Prazo: {{prazo_execucao}} dias a partir de {{data_inicio}}</p>`,
      fields: {
        create: [
          { key: 'contratante', label: 'Contratante', fieldType: 'TEXT', order: 1 },
          { key: 'empreiteira', label: 'Empreiteira', fieldType: 'TEXT', order: 2 },
          { key: 'descricao_obra', label: 'Descrição da Obra', fieldType: 'TEXTAREA', order: 3 },
          { key: 'endereco_obra', label: 'Endereço da Obra', fieldType: 'TEXT', order: 4 },
          { key: 'valor_global', label: 'Valor Global (R$)', fieldType: 'CURRENCY', order: 5 },
          { key: 'prazo_execucao', label: 'Prazo (dias)', fieldType: 'NUMBER', order: 6 },
          { key: 'data_inicio', label: 'Data de Início', fieldType: 'DATE', order: 7 },
        ],
      },
    },
  })

  const contractSigned = await prisma.contract.create({
    data: {
      companyId: company.id, templateId: tplService.id,
      title: 'Consultoria em TI — TechSolve', type: 'SERVICE', status: 'SIGNED',
      partyName: 'TechSolve Consultoria', partyDoc: '98.765.432/0001-11',
      value: 18000, startDate: new Date('2025-01-01'), endDate: new Date('2025-12-31'),
      fields: { contratante: 'Construtora Demo Ltda', contratado: 'TechSolve Consultoria', objeto_servico: 'Consultoria em TI', valor_servico: '18000', data_inicio: '2025-01-01', data_fim: '2025-12-31' },
    },
  })

  const contractPending = await prisma.contract.create({
    data: {
      companyId: company.id, templateId: tplLease.id,
      title: 'Locação Galpão Industrial — Zona Norte', type: 'LEASE', status: 'PENDING_SIGNATURE',
      partyName: 'Imóveis Norte Ltda', partyDoc: '11.222.333/0001-44',
      value: 8500, startDate: new Date('2025-07-01'), endDate: new Date('2026-06-30'),
      fields: { locador: 'Imóveis Norte Ltda', locatario: 'Construtora Demo Ltda', endereco_imovel: 'Av. Industrial, 1500 — SP', valor_aluguel: '8500', data_inicio: '2025-07-01', data_fim: '2026-06-30' },
    },
  })

  const contractDraft = await prisma.contract.create({
    data: {
      companyId: company.id, templateId: tplConstruction.id,
      title: 'Reforma Sede — Contrato de Obra', type: 'CONSTRUCTION', status: 'DRAFT',
      partyName: 'Reformas Rápidas ME', value: 95000,
      startDate: new Date('2025-08-01'), endDate: new Date('2025-11-30'),
      fields: { contratante: 'Construtora Demo Ltda', empreiteira: 'Reformas Rápidas ME', descricao_obra: 'Reforma completa da sede', endereco_obra: 'Rua das Flores, 200 — SP', valor_global: '95000', prazo_execucao: '120', data_inicio: '2025-08-01' },
    },
  })

  await prisma.contract.create({
    data: {
      companyId: company.id, title: 'Manutenção Preventiva — Equipamentos',
      type: 'SERVICE', status: 'SIGNED', partyName: 'ManutenTech Ltda', value: 3200,
      startDate: new Date('2025-01-01'),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      fields: {},
    },
  })

  await prisma.signatureRequest.create({
    data: {
      contractId: contractPending.id, channel: 'EMAIL', status: 'SENT',
      partyName: 'Carlos Mendes', partyContact: 'carlos@imoveisnorte.com.br',
      sentAt: new Date(), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })
  await prisma.signatureRequest.create({
    data: {
      contractId: contractPending.id, channel: 'WHATSAPP', status: 'PENDING',
      partyName: 'Carlos Mendes', partyContact: '+55 11 99999-0000',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })
  await prisma.signatureRequest.create({
    data: {
      contractId: contractSigned.id, channel: 'EMAIL', status: 'SIGNED',
      partyName: 'Ana Lima', partyContact: 'ana@techsolve.com.br',
      sentAt: new Date('2024-12-28'), signedAt: new Date('2024-12-29'),
    },
  })

  const obra = await prisma.obra.create({
    data: {
      companyId: company.id, contractId: contractDraft.id,
      name: 'Reforma Sede Administrativa',
      address: 'Rua das Flores, 200 — Centro, São Paulo/SP',
      status: 'IN_PROGRESS', budgetPlanned: 95000, budgetRealized: 31500,
      startDate: new Date('2025-08-01'), endDate: new Date('2025-11-30'),
    },
  })

  await prisma.obraStep.createMany({
    data: [
      { obraId: obra.id, name: 'Levantamento e projeto executivo', phase: 'PLANNING', status: 'DONE', order: 1 },
      { obraId: obra.id, name: 'Aprovação de orçamento', phase: 'PLANNING', status: 'DONE', order: 2 },
      { obraId: obra.id, name: 'Demolição e preparação', phase: 'EXECUTION', status: 'DONE', order: 3 },
      { obraId: obra.id, name: 'Alvenaria e estrutura', phase: 'EXECUTION', status: 'IN_PROGRESS', order: 4 },
      { obraId: obra.id, name: 'Instalações elétricas', phase: 'EXECUTION', status: 'PENDING', order: 5 },
      { obraId: obra.id, name: 'Instalações hidráulicas', phase: 'EXECUTION', status: 'PENDING', order: 6 },
      { obraId: obra.id, name: 'Acabamento e pintura', phase: 'EXECUTION', status: 'PENDING', order: 7 },
      { obraId: obra.id, name: 'Vistoria final', phase: 'DELIVERY', status: 'PENDING', order: 8 },
      { obraId: obra.id, name: 'Entrega e habite-se', phase: 'DELIVERY', status: 'PENDING', order: 9 },
    ],
  })

  await prisma.obraVistoria.createMany({
    data: [
      { obraId: obra.id, type: 'INITIAL', description: 'Vistoria inicial. Identificados pontos de umidade no corredor e piso irregular na sala de reuniões.', photoUrls: JSON.stringify([]) },
      { obraId: obra.id, type: 'PROGRESS', description: 'Semana 4 — demolição concluída, estrutura aprovada.', photoUrls: JSON.stringify([]) },
    ],
  })

  await prisma.obraCusto.createMany({
    data: [
      { obraId: obra.id, category: 'Mão de obra', description: 'Equipe de demolição', amount: 8000, date: new Date('2025-08-05') },
      { obraId: obra.id, category: 'Material', description: 'Cimento, areia e brita', amount: 4500, date: new Date('2025-08-10') },
      { obraId: obra.id, category: 'Material', description: 'Blocos cerâmicos', amount: 6200, date: new Date('2025-08-15') },
      { obraId: obra.id, category: 'Equipamento', description: 'Aluguel de andaime', amount: 1800, date: new Date('2025-08-20') },
      { obraId: obra.id, category: 'Mão de obra', description: 'Equipe de alvenaria', amount: 11000, date: new Date('2025-09-01') },
    ],
  })

  await prisma.purchaseOrder.create({
    data: {
      companyId: company.id, obraId: obra.id,
      cnpjPagador: '12.345.678/0001-99', supplier: 'ElétricaMax Distribuidora',
      status: 'ISSUED', total: 14800, issuedAt: new Date(),
      notes: 'Materiais para instalação elétrica — fase 5',
      items: JSON.stringify([
        { description: 'Cabo elétrico 6mm (100m)', qty: 5, unitPrice: 780, total: 3900 },
        { description: 'Disjuntor 30A', qty: 20, unitPrice: 45, total: 900 },
        { description: 'Quadro de distribuição 24 circuitos', qty: 3, unitPrice: 320, total: 960 },
        { description: 'Tomadas e interruptores (kit)', qty: 40, unitPrice: 22.50, total: 900 },
        { description: 'Mão de obra instalação elétrica', qty: 1, unitPrice: 8140, total: 8140 },
      ]),
    },
  })

  console.log('✅ Seed concluído')
  console.log(`   Empresa : ${company.name}`)
  console.log(`   Login   : admin@demo.com / demo1234`)
  console.log(`   Contratos: 4 | Obra: 1 | O.C.: 1`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
