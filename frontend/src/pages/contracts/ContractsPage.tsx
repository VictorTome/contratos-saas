import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContractsStore } from '../../store/contracts.store'
import { PageHeader, EmptyState } from '../../components/ui/index'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatCurrency, formatDate, daysUntil } from '../../lib/utils'

const STATUS_OPTS = [
  { value: '', label: 'Todos os status' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'PENDING_SIGNATURE', label: 'Aguardando assinatura' },
  { value: 'SIGNED', label: 'Assinado' },
  { value: 'EXPIRED', label: 'Expirado' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

export function ContractsPage() {
  const { contracts, loading, fetch } = useContractsStore()
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params: Record<string, string> = {}
    if (status) params.status = status
    if (search) params.search = search
    fetch(params)
  }, [status, search])

  return (
    <div>
      <PageHeader
        title="Contratos"
        subtitle={`${contracts.length} contrato${contracts.length !== 1 ? 's' : ''} encontrado${contracts.length !== 1 ? 's' : ''}`}
        action={
          <Link to="/contracts/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            + Novo contrato
          </Link>
        }
      />

      <div className="flex gap-3 mb-5">
        <input placeholder="Buscar por título ou parte..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : contracts.length === 0 ? (
        <EmptyState title="Nenhum contrato encontrado"
          action={<Link to="/contracts/new" className="text-indigo-600 text-sm hover:underline">Criar primeiro contrato</Link>} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Título', 'Parte', 'Tipo', 'Valor', 'Encerramento', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contracts.map(c => {
                const days = daysUntil(c.endDate)
                const expiring = days !== null && days <= 30 && days >= 0 && c.status === 'SIGNED'
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{c.title}</td>
                    <td className="px-4 py-3 text-gray-600">{c.partyName}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize text-xs">{c.type.toLowerCase()}</td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(c.value)}</td>
                    <td className="px-4 py-3">
                      <span className="text-gray-500">{formatDate(c.endDate)}</span>
                      {expiring && <span className="ml-2 text-xs text-red-600 font-medium">⚠ {days}d</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      <Link to={`/contracts/${c.id}`} className="text-indigo-600 hover:underline text-xs font-medium">Ver</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
