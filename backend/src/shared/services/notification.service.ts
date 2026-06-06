/**
 * NotificationService
 *
 * MVP: simula envio logando no console com payload completo.
 *
 * Em produção, substituir os adapters por:
 *   EMAIL    → Nodemailer (SMTP) ou Resend (HTTP API)
 *   WHATSAPP → WhatsApp Business Cloud API (Meta) ou Twilio
 *
 * A interface não muda — apenas a implementação interna dos adapters.
 */

interface SendParams {
  channel: 'EMAIL' | 'WHATSAPP'
  to: string
  partyName: string
  contractTitle: string
  token: string
}

function buildSignatureUrl(token: string): string {
  const base = process.env.FRONTEND_URL ?? 'http://localhost:5173'
  return `${base}/sign/${token}`
}

const emailAdapter = {
  async send(p: SendParams) {
    const url = buildSignatureUrl(p.token)
    console.log('\n📧 [EMAIL SIMULADO] ─────────────────────────────')
    console.log(`   Para    : ${p.to}`)
    console.log(`   Assunto : Assinatura solicitada — ${p.contractTitle}`)
    console.log(`   Link    : ${url}`)
    console.log(`   Token   : ${p.token}`)
    console.log('─────────────────────────────────────────────────\n')
    // PRODUÇÃO: await transporter.sendMail({ to: p.to, subject, html })
  },
}

const whatsappAdapter = {
  async send(p: SendParams) {
    const url = buildSignatureUrl(p.token)
    console.log('\n💬 [WHATSAPP SIMULADO] ───────────────────────────')
    console.log(`   Para    : ${p.to}`)
    console.log(`   Mensagem: Olá ${p.partyName}! Assine "${p.contractTitle}": ${url}`)
    console.log(`   Token   : ${p.token}`)
    console.log('─────────────────────────────────────────────────\n')
    // PRODUÇÃO: await fetch(WHATSAPP_API_URL, { method: 'POST', body: payload })
  },
}

export const notificationService = {
  async send(params: SendParams) {
    if (params.channel === 'EMAIL') return emailAdapter.send(params)
    if (params.channel === 'WHATSAPP') return whatsappAdapter.send(params)
  },
}
