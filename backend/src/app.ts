import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './modules/auth/auth.routes'
import { contractsRouter } from './modules/contracts/contracts.routes'
import { templatesRouter } from './modules/templates/templates.routes'
import { signaturesRouter } from './modules/signatures/signatures.routes'
import { obrasRouter } from './modules/obras/obras.routes'
import { purchaseOrdersRouter } from './modules/purchase-orders/purchase-orders.routes'
import { dashboardRouter } from './modules/dashboard/dashboard.routes'
import { errorHandler } from './shared/errors/error-handler'

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }))

app.use('/auth', authRouter)
app.use('/signatures/public', signaturesRouter)
app.use('/contracts', contractsRouter)
app.use('/templates', templatesRouter)
app.use('/obras', obrasRouter)
app.use('/purchase-orders', purchaseOrdersRouter)
app.use('/dashboard', dashboardRouter)

app.use(errorHandler)

export default app
