import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listSellerOrders } from '../services/api.js'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function SellerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    listSellerOrders()
      .then((data) => { if (active) setOrders(data) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) return <div className="container"><Loading /></div>
  return (
    <div className="container">
      <h1 className="page-title h2">Órdenes</h1>
      <p className="text-muted-soft">Listado de boletas registradas en el sistema.</p>
      {error && <ErrorMessage message={error} />}
      {!error && orders.length === 0 && <div className="alert alert-secondary">Todavía no hay órdenes registradas.</div>}
      {!error && orders.length > 0 && <div className="table-responsive table-dark-panel">
        <table className="table table-dark table-hover align-middle mb-0">
          <thead><tr><th>Boleta</th><th>Fecha</th><th>Cliente</th><th>Productos</th><th>Total</th><th>Estado</th><th /></tr></thead>
          <tbody>{orders.map((order) => <tr key={order.id}>
            <td>#{order.id}</td>
            <td>{order.fechaCreacion ? new Date(order.fechaCreacion).toLocaleString('es-CL') : '—'}</td>
            <td>{order.nombre}</td>
            <td>{order.items?.reduce((total, item) => total + Number(item.cantidad), 0) || 0}</td>
            <td>${Number(order.total).toLocaleString('es-CL')}</td>
            <td>{order.estado}</td>
            <td><Link className="btn btn-outline-info btn-sm" to={`/vendedor/boletas/${order.id}`}>Ver detalle</Link></td>
          </tr>)}</tbody>
        </table>
      </div>}
    </div>
  )
}
