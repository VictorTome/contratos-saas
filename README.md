# Contratos & Obras — MVP Full Stack

Sistema SaaS de controle de contratos e gestão de obras desenvolvido como teste técnico Full Stack.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite + TailwindCSS + Zustand |
| Backend | Node.js + Express + TypeScript |
| Banco | PostgreSQL 14+ + Prisma ORM |
| Auth | JWT (access 15min + refresh 7d) |

## Requisitos

- Node.js 18+
- PostgreSQL 14+ (ou Docker)
- npm 9+

## Subindo em 5 minutos

### 1. Banco de dados

**Opção A — Docker (recomendado)**
```bash
docker run --name contratos-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=contratos_db \
  -p 5432:5432 -d postgres:16
```

**Opção B — PostgreSQL local**
```bash
createdb contratos_db
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # edite DATABASE_URL se necessário
npx prisma migrate dev --name init
npm run db:seed             # carrega dados de demonstração
npm run dev                 # inicia em http://localhost:3333
```

Saída esperada:
```
🚀 Server running on http://localhost:3333
```

### 3. Frontend

```bash
# em outro terminal
cd frontend
npm install
cp .env.example .env
npm run dev                 # inicia em http://localhost:5173
```

Acesse **http://localhost:5173**

**Login:** `admin@demo.com` / `demo1234`

---

## Dados de demonstração

O seed carrega automaticamente:

| Entidade | Quantidade | Detalhes |
|---------|-----------|---------|
| Contratos | 4 | Assinado, aguardando assinatura, rascunho, vencendo em 20 dias |
| Templates | 3 | Prestação de Serviço, Locação, Obra |
| Obra | 1 | Em andamento, 9 etapas, 2 vistorias, 5 custos lançados |
| O.C. | 1 | Emitida — R$ 14.800 |

---

## Fluxo de demonstração sugerido

1. **Login** → Dashboard com KPIs reais do banco
2. **Contratos** → tabela com filtros e badges de status
3. **Contrato "Locação Galpão"** → clicar em "Enviar para assinatura"
4. **Copiar o link** do console do backend (`http://localhost:5173/sign/<token>`)
5. **Abrir em aba anônima** → assinar → status muda para Assinado
6. **Novo contrato** → selecionar template, preencher campos dinâmicos
7. **Obras** → "Reforma Sede" → tabs Roteiro / Custos / Vistorias
8. **Alterar status de etapa** → summary atualiza em tempo real
9. **Ordens de Compra** → Emitir → Aprovar

---

## Arquitetura

```
contratos-saas/
├── backend/
│   ├── prisma/              # schema + seed
│   └── src/
│       ├── modules/         # auth | contracts | templates |
│       │                    # signatures | obras | purchase-orders | dashboard
│       ├── middlewares/     # auth.ts (JWT) + tenant isolation
│       └── shared/          # prisma client | AppError | notification service
└── frontend/
    └── src/
        ├── pages/           # uma pasta por módulo
        ├── store/           # Zustand (auth | contracts | obras)
        ├── components/      # layout (Sidebar, AppLayout) | ui (StatusBadge, etc.)
        └── lib/             # axios client | utils (formatCurrency, formatDate)
```

Padrão de módulo no backend:
```
modules/<modulo>/
  ├── <modulo>.routes.ts      # rotas + middleware
  ├── <modulo>.controller.ts  # parse de request → delega ao service
  └── <modulo>.service.ts     # regras de negócio + Prisma
```

---

## Multi-tenant

Isolamento por `company_id` em todas as tabelas. O middleware de auth injeta `req.user.companyId` em todas as requests — nenhuma query acessa dados de outra empresa.

---

## Decisões técnicas

### O que está implementado

- Auth JWT com access token (15min) + refresh token (7d)
- Isolamento multi-tenant por `company_id`
- CRUD completo de contratos com campos dinâmicos por template
- Fluxo de assinatura: token único → página pública → webhook → status atualizado
- Gestão de obras: fases, etapas, orçamento previsto vs realizado (recalculado a cada lançamento)
- Ordens de Compra com CNPJ pagador e ciclo Rascunho → Emitida → Aprovada/Recusada
- Dashboard com queries reais agregadas no banco
- Validação de entrada com Zod em todos os endpoints

### O que é simulado (decisão de escopo documentada)

| Funcionalidade | MVP | Como seria em produção |
|---------------|-----|----------------------|
| Envio de e-mail | `console.log` com payload completo | Nodemailer ou Resend — interface já isolada no `NotificationService` |
| WhatsApp | `console.log` com mensagem formatada | WhatsApp Business Cloud API (Meta) — mesmo adapter |
| Upload de fotos | URLs em JSON | S3 / Cloudflare R2 via presigned URL |
| Busca semântica | — | pgvector + embeddings |

O `NotificationService` já tem a interface isolada. Em produção, apenas os adapters mudam — nenhum outro arquivo precisa ser alterado.

---

## Comandos úteis

```bash
# Backend
npm run dev          # desenvolvimento com hot reload
npm run db:seed      # recarregar dados de demonstração
npm run db:reset     # resetar banco + seed
npm run db:studio    # Prisma Studio (interface visual do banco)

# Frontend
npm run dev          # desenvolvimento
npm run build        # build de produção
```
