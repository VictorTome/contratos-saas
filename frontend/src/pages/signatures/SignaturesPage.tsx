import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { PageHeader } from '../../components/ui/index'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatDate } from '../../lib/utils'

export function SignaturesPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/contracts', { params: { status: 'PENDING_SIGNATURE' } })
      .then(r => { setContracts(r.data); setLoading(false) })
  }, [])

  return (
    <div>
      <PageHeader
        title="Fila de assinaturas"
        subtitle={`${contracts.length} contrato${contracts.length !== 1 ? 's' : ''} aguardando`}
      />
      {loading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : contracts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm text-gray-500">Nenhum contrato aguardando assinatura.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-yellow-200 p-5 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{c.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {c.partyName}
                  {c.endDate && <span className="ml-2 text-xs text-gray-400">· vence {formatDate(c.endDate)}</span>}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                <StatusBadge status={c.status} />
                <Link to={`/contracts/${c.id}`}
                  className="text-sm text-indigo-600 hover:underline font-medium">
                  Gerenciar →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
