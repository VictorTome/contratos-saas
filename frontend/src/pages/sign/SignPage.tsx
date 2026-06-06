import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333',
})

type State = 'loading' | 'ready' | 'signed' | 'expired' | 'error'

export function SignPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<any>(null)
  const [state, setState] = useState<State>('loading')
  const [signing, setSigning] = useState(false)

  useEffect(() => {
    publicApi.get(`/signatures/public/${token}`)
      .then(r => {
        if (r.data.status === 'already_signed') { setState('signed'); return }
        setData(r.data)
        setState('ready')
      })
      .catch(err => {
        setState(err.response?.status === 410 ? 'expired' : 'error')
      })
  }, [token])

  async function handleSign() {
    setSigning(true)
    try {
      await publicApi.post(`/signatures/public/${token}/sign`)
      setState('signed')
    } catch {
      setState('error')
    } finally {
      setSigning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {state === 'loading' && (
          <div className="text-center text-gray-400">
            <p className="text-4xl mb-4">⌛</p>
            <p className="text-sm">Carregando...</p>
          </div>
        )}

        {state === 'signed' && (
          <div className="bg-white rounded-xl border border-green-200 p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-xl font-semibold text-gray-900">Contrato assinado!</h1>
            <p className="text-gray-500 mt-2 text-sm">Este contrato foi assinado com sucesso.</p>
          </div>
        )}

        {state === 'expired' && (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <div className="text-5xl mb-4">⏰</div>
            <h1 className="text-xl font-semibold text-gray-900">Link expirado</h1>
            <p className="text-gray-500 mt-2 text-sm">Este link de assinatura expirou. Solicite um novo envio.</p>
          </div>
        )}

        {state === 'error' && (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-xl font-semibold text-gray-900">Link inválido</h1>
            <p className="text-gray-500 mt-2 text-sm">Este link não existe ou foi cancelado.</p>
          </div>
        )}

        {state === 'ready' && data && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 bg-indigo-50 border-b border-indigo-100">
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">Solicitação de assinatura</p>
              <h1 className="text-lg font-semibold text-gray-900 mt-1">{data.contract?.title}</h1>
              <p className="text-sm text-gray-600 mt-0.5">Para: <strong>{data.partyName}</strong></p>
            </div>

            {data.contract?.bodyHtml && (
              <div
                className="px-6 py-4 text-sm text-gray-700 max-h-72 overflow-y-auto border-b border-gray-100 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.contract.bodyHtml }}
              />
            )}

            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 mb-4">
                Ao clicar em <strong>Assinar contrato</strong>, você confirma que leu e concorda com os termos acima.
              </p>
              <button onClick={handleSign} disabled={signing}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {signing ? 'Processando...' : '✍️ Assinar contrato'}
              </button>
              {data.expiresAt && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  Válido até: {new Date(data.expiresAt).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
