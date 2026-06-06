import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import clsx from 'clsx'

const nav = [
  { to: '/dashboard',       label: 'Dashboard',        icon: '◈' },
  { to: '/contracts',       label: 'Contratos',         icon: '📄' },
  { to: '/templates',       label: 'Templates',         icon: '🗂️' },
  { to: '/signatures',      label: 'Assinaturas',       icon: '✍️' },
  { to: '/obras',           label: 'Obras',             icon: '🏗️' },
  { to: '/purchase-orders', label: 'Ordens de Compra',  icon: '🧾' },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
          {user?.company.name}
        </p>
        <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{user?.name}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span>→</span> Sair
        </button>
      </div>
    </aside>
  )
}
