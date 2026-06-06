import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.store'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ContractsPage } from './pages/contracts/ContractsPage'
import { ContractNewPage } from './pages/contracts/ContractNewPage'
import { ContractDetailPage } from './pages/contracts/ContractDetailPage'
import { TemplatesPage } from './pages/templates/TemplatesPage'
import { SignaturesPage } from './pages/signatures/SignaturesPage'
import { SignPage } from './pages/sign/SignPage'
import { ObrasPage } from './pages/obras/ObrasPage'
import { ObraDetailPage } from './pages/obras/ObraDetailPage'
import { PurchaseOrdersPage } from './pages/purchase-orders/PurchaseOrdersPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.accessToken)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sign/:token" element={<SignPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="contracts/new" element={<ContractNewPage />} />
        <Route path="contracts/:id" element={<ContractDetailPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="signatures" element={<SignaturesPage />} />
        <Route path="obras" element={<ObrasPage />} />
        <Route path="obras/:id" element={<ObraDetailPage />} />
        <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
