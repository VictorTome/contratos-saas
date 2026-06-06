import clsx from 'clsx'

const CONTRACT: Record<string, { label: string; cls: string }> = {
  DRAFT:             { label: 'Rascunho',              cls: 'bg-gray-100 text-gray-700' },
  PENDING_SIGNATURE: { label: 'Aguardando assinatura', cls: 'bg-yellow-100 text-yellow-800' },
  SIGNED:            { label: 'Assinado',              cls: 'bg-green-100 text-green-800' },
  EXPIRED:           { label: 'Expirado',              cls: 'bg-red-100 text-red-700' },
  CANCELLED:         { label: 'Cancelado',             cls: 'bg-red-100 text-red-700' },
}
const OBRA: Record<string, { label: string; cls: string }> = {
  PLANNING:    { label: 'Planejamento',  cls: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'Em andamento', cls: 'bg-indigo-100 text-indigo-700' },
  INSPECTING:  { label: 'Vistoria',     cls: 'bg-purple-100 text-purple-700' },
  COMPLETED:   { label: 'Concluída',    cls: 'bg-green-100 text-green-800' },
  CANCELLED:   { label: 'Cancelada',    cls: 'bg-red-100 text-red-700' },
}
const PO: Record<string, { label: string; cls: string }> = {
  DRAFT:     { label: 'Rascunho',  cls: 'bg-gray-100 text-gray-700' },
  ISSUED:    { label: 'Emitida',   cls: 'bg-blue-100 text-blue-700' },
  APPROVED:  { label: 'Aprovada',  cls: 'bg-green-100 text-green-800' },
  REJECTED:  { label: 'Recusada', cls: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Cancelada', cls: 'bg-red-100 text-red-700' },
}
const SIG: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: 'Pendente', cls: 'bg-gray-100 text-gray-700' },
  SENT:      { label: 'Enviado',  cls: 'bg-blue-100 text-blue-700' },
  SIGNED:    { label: 'Assinado', cls: 'bg-green-100 text-green-800' },
  EXPIRED:   { label: 'Expirado', cls: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Cancelado',cls: 'bg-red-100 text-red-700' },
}

interface Props {
  status: string
  type?: 'contract' | 'obra' | 'po' | 'signature'
}

export function StatusBadge({ status, type = 'contract' }: Props) {
  const map = type === 'obra' ? OBRA : type === 'po' ? PO : type === 'signature' ? SIG : CONTRACT
  const cfg = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' }
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap', cfg.cls)}>
      {cfg.label}
    </span>
  )
}
