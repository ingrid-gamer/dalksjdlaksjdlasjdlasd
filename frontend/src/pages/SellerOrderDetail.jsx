import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { readSellerOrder } from '../services/api.js'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function SellerOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    readSellerOrder(id)
      .then((data) => { if (active) setOrder(data) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  if (loading) return <div className="container"><Loading /></div>
  return (
    <div className="container">
      <Link to="/vendedor/boletas" className="btn btn-outline-light btn-sm mb-3">Volver a órdenes</Link>
      {error && <ErrorMessage message={error} />}
      {!error && !order && <div className="alert alert-secondary">No se encontró la boleta solicitada.</div>}
      {order && <section className="hero-panel p-4">
        <h1 className="page-title h2">Boleta #{order.id}</h1>
        <div className="row g-3 mb-4">
          <div className="col-md-6"><strong>Cliente:</strong> {order.nombre}</div>
          <div className="col-md-6"><strong>Correo:</strong> {order.email}</div>
          <div className="col-md-6"><strong>Dirección:</strong> {order.direccion}</div>
          <div className="col-md-6"><strong>Entrega:</strong> {order.entrega}</div>
          <div className="col-md-6"><strong>Fecha:</strong> {order.fechaCreacion ? new Date(order.fechaCreacion).toLocaleString('es-CL') : '—'}</div>
          <div className="col-md-6"><strong>Estado:</strong> {order.estado}</div>
        </div>
        <h2 className="h5">Detalle de productos</h2>
        <div className="table-responsive"><table className="table table-dark align-middle">
          <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr></thead>
          <tbody>{(order.items || []).map((item) => <tr key={item.id}>
            <td>{item.titulo}</td><td>{item.cantidad}</td>
            <td>${Number(item.precioUnitario).toLocaleString('es-CL')}</td>
            <td>${Number(item.subtotal).toLocaleString('es-CL')}</td>
          </tr>)}</tbody>
        </table></div>
        <p className="text-end fs-5 fw-bold text-cyan">Total: ${Number(order.total).toLocaleString('es-CL')}</p>
      </section>}
    </div>
  )
}
