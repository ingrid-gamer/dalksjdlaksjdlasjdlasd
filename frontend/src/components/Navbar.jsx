import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useCart } from '../contexts/CartContext.jsx'

const customerNavItems = [
  ['/', 'Inicio'],
  ['/videojuegos', 'Videojuegos'],
  ['/categorias', 'Categorías'],
  ['/ofertas', 'Ofertas'],
  ['/resenas', 'Reseñas'],
]

export default function Navbar() {
  const { user, isAdmin, isVendedor, isLoading, logout } = useAuth()
  const { count } = useCart()
  const homePath = isVendedor ? '/vendedor/productos' : '/'
  return (
    <nav className="navbar navbar-expand-lg navbar-dark-custom sticky-top">
      <div className="container py-2">
        <Link className="navbar-brand fw-bold text-cyan" to={homePath}>🎮 ResenasMIXX</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal" aria-controls="menuPrincipal" aria-expanded="false" aria-label="Abrir menú">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="menuPrincipal">
          <div className="navbar-nav me-auto">
            {!isLoading && (isVendedor ? (
              <>
                <NavLink to="/vendedor/productos" className="nav-link nav-link-custom">Productos</NavLink>
                <NavLink to="/vendedor/boletas" className="nav-link nav-link-custom">Órdenes</NavLink>
              </>
            ) : (
              <>
                {customerNavItems.map(([to, label]) => (
                  <NavLink key={to} to={to} end={to === '/'} className="nav-link nav-link-custom">{label}</NavLink>
                ))}
                {isAdmin && <NavLink to="/admin" className="nav-link nav-link-custom">Administración</NavLink>}
              </>
            ))}
          </div>
          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {!isLoading && !isVendedor && (
              <Link className="btn btn-outline-info btn-sm" to="/carrito">
                🛒 Carrito <span className="badge text-bg-info ms-1">{count()}</span>
              </Link>
            )}
            {user ? (
              <>
                <span className="small text-muted-soft d-none d-md-inline">
                  Hola, {user.nombre || user.username}
                  {isVendedor && <span className="badge bg-warning text-dark ms-1">Vendedor</span>}
                  {isAdmin && <span className="badge bg-danger ms-1">Admin</span>}
                </span>
                <button className="btn btn-outline-light btn-sm" onClick={logout}>Salir</button>
              </>
            ) : !isLoading ? (
              <>
                <Link className="btn btn-outline-light btn-sm" to="/login">Login</Link>
                <Link className="btn btn-cyan btn-sm" to="/registro">Registro</Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  )
}
