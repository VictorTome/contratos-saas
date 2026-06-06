import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { PageHeader } from '../../components/ui/index'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatCurrency, formatDate } from '../../lib/utils'

const PHASES = ['PLANNING', 'EXECUTION', 'DELIVERY']
const PHASE_LABELS: Record<string, string> = { PLANNING: 'Planejamento', EXECUTION: 'Execução', DELIVERY: 'Entrega' }
const STEP_STATUS_OPTS = ['PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED']

type Tab = 'roteiro' | 'custos' | 'vistorias' | 'oc'

export function ObraDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [obra, setObra] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [tab, setTab] = useState<Tab>('roteiro')
  const [custoForm, setCustoForm] = useState({ category: '', description: '', amount: '' })
  const [addingCusto, setAddingCusto] = useState(false)

  const reload = async () => {
    const [o, s] = await Promise.all([
      api.get(`/obras/${id}`),
      api.get(`/obras/${id}/summary`),
    ])
    setObra(o.data)
    setSummary(s.data)
  }

  useEffect(() => { reload() }, [id])

  async function handleStepStatus(stepId: string, status: string) {
    await api.patch(`/obras/${id}/steps/${stepId}`, { status })
    reload()
  }

  async function handleAddCusto(e: React.FormEvent) {
    e.preventDefault(); setAddingCusto(true)
    try {
      await api.post(`/obras/${id}/custos`, { ...custoForm, amount: Number(custoForm.amount) })
      setCustoForm({ category: '', description: '', amount: '' })
      reload()
    } finally { setAddingCusto(false) }
  }

  async function handleDeleteCusto(custoId: string) {
    if (!confirm('Remover este custo?')) return
    await api.delete(`/obras/${id}/custos/${custoId}`)
    reload()
  }

  if (!obra) return <p className="text-sm text-gray-400">Carregando...</p>

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={obra.name}
        subtitle={obra.address ?? ''}
        action={<StatusBadge status={obra.status} type="obra" />}
      />

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Progresso', value: `${summary.progress}%`, color: summary.progress === 100 ? 'text-green-600' : 'text-indigo-600' },
            { label: 'Etapas', value: `${summary.doneSteps}/${summary.totalSteps}`, color: 'text-gray-900' },
            { label: 'Orçado', value: formatCurrency(summary.budgetPlanned), color: 'text-gray-900' },
            { label: 'Realizado', value: formatCurrency(summary.budgetRealized), color: summary.budgetVariance < 0 ? 'text-red-600' : 'text-green-600' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className={`text-sm font-semibold mt-0.5 ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-0 mb-5 border-b border-gray-200">
        {(['roteiro', 'custos', 'vistorias', 'oc'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'oc' ? 'Ordens de Compra' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'roteiro' && (
        <div className="space-y-6">
          {PHASES.map(phase => {
            const steps = (obra.steps ?? []).filter((s: any) => s.phase === phase)
            if (!steps.length) return null
            return (
              <div key={phase}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{PHASE_LABELS[phase]}</p>
                <div className="space-y-2">
                  {steps.map((step: any) => (
                    <div key={step.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{step.name}</p>
                        {step.dueDate && <p className="text-xs text-gray-400 mt-0.5">Prazo: {formatDate(step.dueDate)}</p>}
                        {step.notes && <p className="text-xs text-gray-500 mt-0.5 italic">{step.notes}</p>}
                      </div>
                      <select value={step.status}
                        onChange={e => handleStepStatus(step.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                        {STEP_STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {(!obra.steps || obra.steps.length === 0) && (
            <p className="text-sm text-gray-400">Nenhuma etapa cadastrada.</p>
          )}
        </div>
      )}

      {tab === 'custos' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Lançar custo</h3>
            <form onSubmit={handleAddCusto} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input placeholder="Categoria" required value={custoForm.category}
                onChange={e => setCustoForm(f => ({ ...f, category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input placeholder="Descrição" required value={custoForm.description}
                onChange={e => setCustoForm(f => ({ ...f, description: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2" />
              <div className="flex gap-2">
                <input type="number" step="0.01" placeholder="Valor R$" required value={custoForm.amount}
                  onChange={e => setCustoForm(f => ({ ...f, amount: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button type="submit" disabled={addingCusto}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                  +
                </button>
              </div>
            </form>
          </div>

          {obra.custos?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Data', 'Categoria', 'Descrição', 'Valor', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {obra.custos.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(c.date)}</td>
                      <td className="px-4 py-3 text-gray-600">{c.category}</td>
                      <td className="px-4 py-3 text-gray-900">{c.description}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{formatCurrency(c.amount)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDeleteCusto(c.id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-gray-500">Total</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatCurrency(obra.custos.reduce((s: number, c: any) => s + Number(c.amount), 0))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'vistorias' && (
        <div className="space-y-3">
          {(!obra.vistorias || obra.vistorias.length === 0) ? (
            <p className="text-sm text-gray-400">Nenhuma vistoria registrada.</p>
          ) : (
            obra.vistorias.map((v: any) => (
              <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${
                    v.type === 'INITIAL' ? 'bg-blue-100 text-blue-700' :
                    v.type === 'FINAL' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{v.type === 'INITIAL' ? 'Inicial' : v.type === 'FINAL' ? 'Final' : 'Progresso'}</span>
                  <span className="text-xs text-gray-400">{formatDate(v.createdAt)}</span>
                </div>
                {v.description && <p className="text-sm text-gray-700 leading-relaxed">{v.description}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'oc' && (
        <div className="space-y-3">
          {(!obra.purchaseOrders || obra.purchaseOrders.length === 0) ? (
            <p className="text-sm text-gray-400">Nenhuma O.C. vinculada.</p>
          ) : (
            obra.purchaseOrders.map((po: any) => (
              <div key={po.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{po.supplier}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Emitida: {formatDate(po.issuedAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">{formatCurrency(po.total)}</span>
                  <StatusBadge status={po.status} type="po" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-8">
        <button onClick={() => navigate('/obras')} className="text-sm text-gray-500 hover:text-gray-700">← Voltar para obras</button>
      </div>
    </div>
  )
}
