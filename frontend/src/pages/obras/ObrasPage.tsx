import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useObrasStore } from '../../store/obras.store'
import { PageHeader, EmptyState } from '../../components/ui/index'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatCurrency } from '../../lib/utils'
import { api } from '../../lib/api'

export function ObrasPage() {
  const { obras, loading, fetch, create } = useObrasStore()
  const [showForm, setShowForm] = useState(false)
  const [contracts, setContracts] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', address: '', contractId: '', budgetPlanned: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch()
    api.get('/contracts', { params: { status: 'SIGNED' } }).then(r => setContracts(r.data))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      const obra = await create({
        name: form.name, address: form.address || undefined,
        contractId: form.contractId || undefined,
        budgetPlanned: form.budgetPlanned ? Number(form.budgetPlanned) : undefined,
      })
      setShowForm(false)
      setForm({ name: '', address: '', contractId: '', budgetPlanned: '' })
    } finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader
        title="Obras"
        subtitle={`${obras.length} obra${obras.length !== 1 ? 's' : ''} cadastrada${obras.length !== 1 ? 's' : ''}`}
        action={
          <button onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            + Nova obra
          </button>
        }
      />

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Nova obra</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Endereço</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Orçamento previsto (R$)</label>
                <input type="number" value={form.budgetPlanned} onChange={e => setForm(f => ({ ...f, budgetPlanned: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Vincular contrato</label>
                <select value={form.contractId} onChange={e => setForm(f => ({ ...f, contractId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Sem vínculo</option>
                  {contracts.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Criando...' : 'Criar obra'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : obras.length === 0 ? (
        <EmptyState title="Nenhuma obra cadastrada" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {obras.map(o => {
            const pct = o.budgetPlanned
              ? Math.min(100, Math.round((Number(o.budgetRealized) / Number(o.budgetPlanned)) * 100))
              : 0
            return (
              <Link key={o.id} to={`/obras/${o.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow block">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{o.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{o.address ?? '—'}</p>
                  </div>
                  <div className="ml-3 shrink-0"><StatusBadge status={o.status} type="obra" /></div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Orçamento realizado</span>
                    <span className={pct > 90 ? 'text-red-600 font-medium' : ''}>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${pct > 90 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{formatCurrency(o.budgetRealized)}</span>
                    <span>{formatCurrency(o.budgetPlanned)}</span>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-gray-400 border-t border-gray-100 pt-3">
                  <span>{o._count?.steps ?? 0} etapas</span>
                  <span>{o._count?.custos ?? 0} custos</span>
                  <span>{o._count?.purchaseOrders ?? 0} O.C.</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
