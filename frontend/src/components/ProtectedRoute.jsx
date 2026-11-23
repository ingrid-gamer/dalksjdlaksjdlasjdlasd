import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import Loading from './Loading.jsx'

/** Control de rutas por sesión y rol. */
export default function ProtectedRoute({ children, adminOnly = false, vendedorOnly = false, excludeVendedor = false }) {
  const { user, isAdmin, isVendedor, isLoading } = useAuth()
  if (isLoading) return <div className="container"><Loading /></div>
  if (!user && (adminOnly || vendedorOnly)) return <Navigate to="/login" replace />
  if (!user) return children
  if (adminOnly && !isAdmin) return <Navigate to={isVendedor ? '/vendedor/productos' : '/'} replace />
  if (vendedorOnly && !isVendedor && !isAdmin) return <Navigate to="/" replace />
  if (excludeVendedor && isVendedor) return <Navigate to="/vendedor/productos" replace />
  return children
}
