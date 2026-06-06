import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useContractsStore } from '../../store/contracts.store'
import { PageHeader } from '../../components/ui/index'

interface TemplateField { key: string; label: string; fieldType: string; required: boolean; order: number }
interface Template { id: string; name: string; type: string }

const TYPE_OPTS = [
  { value: 'SERVICE', label: 'Prestação de Serviço' },
  { value: 'EMPLOYMENT', label: 'Contrato de Trabalho' },
  { value: 'CONSTRUCTION', label: 'Contrato de Obra' },
  { value: 'LEASE', label: 'Locação' },
  { value: 'OTHER', label: 'Outro' },
]

export function ContractNewPage() {
  const navigate = useNavigate()
  const { create } = useContractsStore()
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTpl, setSelectedTpl] = useState<Template | null>(null)
  const [tplFields, setTplFields] = useState<TemplateField[]>([])
  const [loadingFields, setLoadingFields] = useState(false)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ title: '', type: 'SERVICE', partyName: '', partyDoc: '', value: '', startDate: '', endDate: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { api.get('/templates').then(r => setTemplates(r.data)) }, [])

  async function selectTemplate(id: string) {
    if (!id) {
      setSelectedTpl(null)
      setTplFields([])
      setFieldValues({})
      return
    }
    const tpl = templates.find(t => t.id === id) ?? null
    setSelectedTpl(tpl)
    setFieldValues({})
    if (tpl) {
      setForm(f => ({ ...f, title: tpl.name, type: tpl.type }))
      setLoadingFields(true)
      try {
        const { data } = await api.get(`/templates/${tpl.id}/fields`)
        setTplFields(data)
      } catch {
        setTplFields([])
      } finally {
        setLoadingFields(false)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const contract = await create({
        templateId: selectedTpl?.id,
        title: form.title, type: form.type,
        partyName: form.partyName,
        partyDoc: form.partyDoc || undefined,
        value: form.value ? Number(form.value) : undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        fields: fieldValues,
      })
      navigate(`/contracts/${(contract as any).id}`)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erro ao criar contrato')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Novo contrato" subtitle="Preencha os dados do contrato" />
      <form onSubmit={handleSubmit} className="space-y-5">

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">1. Template (opcional)</h2>
          <select onChange={e => selectTemplate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Iniciar sem template</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">2. Dados gerais</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parte relacionada *</label>
            <input required value={form.partyName} onChange={e => setForm(f => ({ ...f, partyName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ / CPF</label>
              <input value={form.partyDoc} onChange={e => setForm(f => ({ ...f, partyDoc: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input type="number" step="0.01" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de início</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de encerramento</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {selectedTpl && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">3. Campos do template</h2>
            {loadingFields ? (
              <p className="text-sm text-gray-400">Carregando campos...</p>
            ) : tplFields.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum campo configurado neste template.</p>
            ) : (
              tplFields.map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  {f.fieldType === 'TEXTAREA' ? (
                    <textarea required={f.required} rows={3}
                      value={fieldValues[f.key] ?? ''}
                      onChange={e => setFieldValues(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  ) : (
                    <input
                      type={f.fieldType === 'DATE' ? 'date' : f.fieldType === 'NUMBER' || f.fieldType === 'CURRENCY' ? 'number' : 'text'}
                      required={f.required}
                      value={fieldValues[f.key] ?? ''}
                      onChange={e => setFieldValues(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {loading ? 'Salvando...' : 'Criar contrato'}
          </button>
        </div>
      </form>
    </div>
  )
}
