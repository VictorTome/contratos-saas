import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { PageHeader, EmptyState } from '../../components/ui/index'

const TYPE_LABELS: Record<string, string> = {
  SERVICE: 'Prestação de Serviço', EMPLOYMENT: 'Contrato de Trabalho',
  CONSTRUCTION: 'Contrato de Obra', LEASE: 'Locação', OTHER: 'Outro',
}

function TemplateFields({ templateId }: { templateId: string }) {
  const [fields, setFields] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/templates/${templateId}/fields`)
      .then(r => setFields(r.data))
      .finally(() => setLoading(false))
  }, [templateId])

  if (loading) return (
    <div className="px-5 pb-4 border-t border-gray-100 pt-3">
      <p className="text-xs text-gray-400">Carregando campos...</p>
    </div>
  )

  if (fields.length === 0) return (
    <div className="px-5 pb-4 border-t border-gray-100 pt-3">
      <p className="text-xs text-gray-400">Nenhum campo configurado.</p>
    </div>
  )

  return (
    <div className="px-5 pb-5 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide my-3">
        Campos do template
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {fields.map((f: any) => (
          <div key={f.id} className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs font-medium text-gray-700">{f.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {f.fieldType} {f.required ? '· obrigatório' : '· opcional'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    api.get('/templates').then(r => { setTemplates(r.data); setLoading(false) })
  }, [])

  return (
    <div>
      <PageHeader title="Templates" subtitle="Modelos de contratos disponíveis" />
      {loading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : templates.length === 0 ? (
        <EmptyState title="Nenhum template cadastrado" />
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200">
              <button
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{TYPE_LABELS[t.type] ?? t.type}</p>
                  </div>
                  {t.isDefault && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Padrão</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{t._count?.fields ?? 0} campos</span>
                  <span>{t._count?.contracts ?? 0} contratos</span>
                  <span>{expanded === t.id ? '▲' : '▼'}</span>
                </div>
              </button>

              {expanded === t.id && (
                <TemplateFields templateId={t.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
