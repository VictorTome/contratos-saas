import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { PageHeader } from '../../components/ui/index'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatCurrency, formatDate } from '../../lib/utils'

export function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [contract, setContract] = useState<any>(null)
  const [showSendForm, setShowSendForm] = useState(false)
  const [sigForm, setSigForm] = useState({ channel: 'EMAIL', partyName: '', partyContact: '', expiresInDays: 7 })
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState('')

  const reload = () => api.get(`/contracts/${id}`).then(r => setContract(r.data))
  useEffect(() => { reload() }, [id])

  async function handleSendSignature(e: React.FormEvent) {
    e.preventDefault()
    setSending(true); setSendMsg('')
    try {
      await api.post(`/contracts/${id}/send-signature`, sigForm)
      setSendMsg('Solicitação enviada! Verifique o console do backend para o link de assinatura.')
      await reload()
      setShowSendForm(false)
    } catch (err: any) {
      setSendMsg(err.response?.data?.error ?? 'Erro ao enviar')
    } finally { setSending(false) }
  }

  async function handleStatus(status: string) {
    await api.patch(`/contracts/${id}`, { status })
    reload()
  }

  if (!contract) return <p className="text-gray-400 text-sm">Carregando...</p>

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={contract.title}
        subtitle={`Parte: ${contract.partyName}`}
        action={<StatusBadge status={contract.status} />}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tipo', value: contract.type },
          { label: 'Valor', value: formatCurrency(contract.value) },
          { label: 'Início', value: formatDate(contract.startDate) },
          { label: 'Encerramento', value: formatDate(contract.endDate) },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {contract.status === 'DRAFT' && (
          <button onClick={() => setShowSendForm(!showSendForm)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
            ✍️ Enviar para assinatura
          </button>
        )}
        {contract.status === 'DRAFT' && (
          <button onClick={() => handleStatus('CANCELLED')}
            className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50">
            Cancelar contrato
          </button>
        )}
        {contract.status === 'SIGNED' && (
          <button onClick={() => handleStatus('CANCELLED')}
            className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50">
            Encerrar contrato
          </button>
        )}
        <button onClick={() => navigate('/contracts')}
          className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
          ← Voltar
        </button>
      </div>

      {sendMsg && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">{sendMsg}</div>
      )}

      {showSendForm && (
        <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-indigo-900 mb-4">Enviar para assinatura</h3>
          <form onSubmit={handleSendSignature} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Canal</label>
                <select value={sigForm.channel} onChange={e => setSigForm(f => ({ ...f, channel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="EMAIL">E-mail (simulado)</option>
                  <option value="WHATSAPP">WhatsApp (simulado)</option>
                  <option value="BOTH">Ambos</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Expira em (dias)</label>
                <input type="number" min={1} max={30} value={sigForm.expiresInDays}
                  onChange={e => setSigForm(f => ({ ...f, expiresInDays: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nome da parte</label>
              <input required value={sigForm.partyName} onChange={e => setSigForm(f => ({ ...f, partyName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">E-mail ou telefone</label>
              <input required value={sigForm.partyContact} onChange={e => setSigForm(f => ({ ...f, partyContact: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={sending}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {sending ? 'Enviando...' : 'Confirmar envio'}
              </button>
              <button type="button" onClick={() => setShowSendForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {contract.bodyHtml && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Conteúdo do contrato</h3>
          <div className="prose prose-sm max-w-none text-gray-700 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: contract.bodyHtml }} />
        </div>
      )}

      {contract.signatureRequests?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Histórico de assinaturas</h3>
          <div className="space-y-2">
            {contract.signatureRequests.map((sr: any) => (
              <div key={sr.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm text-gray-900">{sr.partyName} — <span className="text-gray-500 text-xs">{sr.partyContact}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">Canal: {sr.channel} · Enviado: {formatDate(sr.sentAt)}</p>
                  {sr.token && (
                    <p className="text-xs text-indigo-600 mt-0.5 font-mono">
                      Link: /sign/{sr.token.slice(0, 8)}...
                    </p>
                  )}
                </div>
                <StatusBadge status={sr.status} type="signature" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
