import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { PageHeader, EmptyState } from '../../components/ui/index'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatCurrency, formatDate } from '../../lib/utils'

interface POItem { description: string; qty: number; unitPrice: number; total: number }

export function PurchaseOrdersPage() {
  const [pos, setPos] = useState<any[]>([])
  const [obras, setObras] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [form, setForm] = useState({ obraId: '', cnpjPagador: '', supplier: '', notes: '' })
  const [items, setItems] = useState<POItem[]>([{ description: '', qty: 1, unitPrice: 0, total: 0 }])

  const load = async () => {
    const [p, o] = await Promise.all([api.get('/purchase-orders'), api.get('/obras')])
    setPos(p.data); setObras(o.data); setLoading(false)
  }
  useEffect(() => { load() }, [])

  function updateItem(i: number, field: keyof POItem, value: any) {
    setItems(prev => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: value }
      if (field === 'qty' || field === 'unitPrice') {
        next[i].total = Number(next[i].qty) * Number(next[i].unitPrice)
      }
      return next
    })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await api.post('/purchase-orders', { ...form, items })
    setShowForm(false)
    setForm({ obraId: '', cnpjPagador: '', supplier: '', notes: '' })
    setItems([{ description: '', qty: 1, unitPrice: 0, total: 0 }])
    load()
  }

  async function handleStatus(id: string, status: string) {
    await api.patch(`/purchase-orders/${id}/status`, { status })
    load()
  }

  const grandTotal = items.reduce((s, i) => s + i.total, 0)

  return (
    <div>
      <PageHeader
        title="Ordens de Compra"
        subtitle={`${pos.length} ordem${pos.length !== 1 ? 's' : ''}`}
        action={
          <button onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            + Nova O.C.
          </button>
        }
      />

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Nova Ordem de Compra</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Obra *</label>
                <select required value={form.obraId} onChange={e => setForm(f => ({ ...f, obraId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Selecionar obra</option>
                  {obras.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">CNPJ Pagador *</label>
                <input required value={form.cnpjPagador} onChange={e => setForm(f => ({ ...f, cnpjPagador: e.target.value }))}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fornecedor *</label>
              <input required value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-700">Itens *</label>
                <button type="button" onClick={() => setItems(p => [...p, { description: '', qty: 1, unitPrice: 0, total: 0 }])}
                  className="text-xs text-indigo-600 hover:underline">+ Adicionar item</button>
              </div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input placeholder="Descrição" value={item.description}
                      onChange={e => updateItem(i, 'description', e.target.value)}
                      className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="number" placeholder="Qtd" value={item.qty}
                      onChange={e => updateItem(i, 'qty', Number(e.target.value))}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="number" step="0.01" placeholder="Preço unit." value={item.unitPrice}
                      onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))}
                      className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <div className="col-span-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{formatCurrency(item.total)}</span>
                      {items.length > 1 && (
                        <button type="button" onClick={() => setItems(p => p.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600 text-xs ml-1">✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 font-medium text-right mt-2">
                Total: {formatCurrency(grandTotal)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Observações</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                Criar O.C.
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
      ) : pos.length === 0 ? (
        <EmptyState title="Nenhuma O.C. emitida" />
      ) : (
        <div className="space-y-3">
          {pos.map((po: any) => {
            const parsedItems = typeof po.items === 'string' ? JSON.parse(po.items) : po.items
            return (
              <div key={po.id} className="bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-medium text-gray-900">{po.supplier}</p>
                      <StatusBadge status={po.status} type="po" />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Obra: {po.obra?.name ?? '—'} · CNPJ: {po.cnpjPagador}
                      {po.issuedAt && ` · Emitida: ${formatDate(po.issuedAt)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-4 shrink-0">
                    <span className="font-semibold text-gray-900">{formatCurrency(po.total)}</span>
                    <div className="flex gap-2">
                      {po.status === 'DRAFT' && (
                        <button onClick={() => handleStatus(po.id, 'ISSUED')}
                          className="text-xs text-indigo-600 hover:underline font-medium">Emitir</button>
                      )}
                      {po.status === 'ISSUED' && (
                        <>
                          <button onClick={() => handleStatus(po.id, 'APPROVED')}
                            className="text-xs text-green-600 hover:underline font-medium">Aprovar</button>
                          <button onClick={() => handleStatus(po.id, 'REJECTED')}
                            className="text-xs text-red-500 hover:underline font-medium">Recusar</button>
                        </>
                      )}
                      <button onClick={() => setExpanded(expanded === po.id ? null : po.id)}
                        className="text-xs text-gray-400 hover:text-gray-600">
                        {expanded === po.id ? 'ocultar' : 'itens'}
                      </button>
                    </div>
                  </div>
                </div>

                {expanded === po.id && parsedItems?.length > 0 && (
                  <div className="border-t border-gray-100 px-4 pb-4">
                    <table className="w-full text-xs mt-3">
                      <thead>
                        <tr className="text-gray-400">
                          <th className="text-left py-1.5 font-medium">Descrição</th>
                          <th className="text-right py-1.5 font-medium">Qtd</th>
                          <th className="text-right py-1.5 font-medium">Unit.</th>
                          <th className="text-right py-1.5 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {parsedItems.map((item: POItem, i: number) => (
                          <tr key={i}>
                            <td className="py-1.5 text-gray-700">{item.description}</td>
                            <td className="py-1.5 text-right text-gray-600">{item.qty}</td>
                            <td className="py-1.5 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-1.5 text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {po.notes && <p className="text-xs text-gray-500 mt-2 italic">{po.notes}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
