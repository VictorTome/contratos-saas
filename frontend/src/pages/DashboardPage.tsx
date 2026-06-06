import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { PageHeader, EmptyState } from '../components/ui/index'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatCurrency, formatDate, daysUntil } from '../lib/utils'

interface Metrics {
  contracts: { total: number; active: number; expiringSoon: number; pendingSignatures: number }
  obras: { total: number; inProgress: number }
  financial: { totalPOCommitted: number }
  recentContracts: any[]
  recentObras: any[]
}

export function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  useEffect(() => { api.get('/dashboard/metrics').then(r => setMetrics(r.data)) }, [])

  if (!metrics) return <div className="text-gray-400 text-sm">Carregando métricas...</div>

  const kpis = [
    { label: 'Contratos ativos',        value: metrics.contracts.active,            color: 'text-green-600' },
    { label: 'Aguardando assinatura',   value: metrics.contracts.pendingSignatures,  color: 'text-yellow-600' },
    { label: 'Vencendo em 30 dias',     value: metrics.contracts.expiringSoon,       color: 'text-red-600' },
    { label: 'Obras em andamento',      value: metrics.obras.inProgress,             color: 'text-indigo-600' },
    { label: 'O.C. empenhadas',         value: formatCurrency(Number(metrics.financial.totalPOCommitted)), color: 'text-gray-900' },
    { label: 'Total de contratos',      value: metrics.contracts.total,              color: 'text-gray-900' },
  ]

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Visão geral do sistema" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium">{k.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Contratos recentes</h2>
            <Link to="/contracts" className="text-xs text-indigo-600 hover:underline">Ver todos</Link>
          </div>
          {metrics.recentContracts.length === 0
            ? <EmptyState title="Nenhum contrato" />
            : (
              <div className="space-y-2">
                {metrics.recentContracts.map((c: any) => {
                  const days = daysUntil(c.endDate)
                  return (
                    <Link key={c.id} to={`/contracts/${c.id}`}
                      className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded px-1 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                        <p className="text-xs text-gray-500">{c.partyName}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        {days !== null && days <= 30 && days >= 0 && (
                          <span className="text-xs text-red-600 font-medium">⚠ {days}d</span>
                        )}
                        <StatusBadge status={c.status} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Obras recentes</h2>
            <Link to="/obras" className="text-xs text-indigo-600 hover:underline">Ver todas</Link>
          </div>
          {metrics.recentObras.length === 0
            ? <EmptyState title="Nenhuma obra" />
            : (
              <div className="space-y-3">
                {metrics.recentObras.map((o: any) => {
                  const pct = o.budgetPlanned
                    ? Math.min(100, Math.round((Number(o.budgetRealized) / Number(o.budgetPlanned)) * 100))
                    : 0
                  return (
                    <Link key={o.id} to={`/obras/${o.id}`}
                      className="block py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded px-1 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-gray-900">{o.name}</p>
                        <StatusBadge status={o.status} type="obra" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${pct > 90 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
