import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listGames } from '../services/api.js'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function SellerProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    listGames()
      .then((data) => { if (active) setProducts(data) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) return <div className="container"><Loading /></div>
  return (
    <div className="container">
      <h1 className="page-title h2">Productos</h1>
      <p className="text-muted-soft">Consulta el catálogo y abre el detalle de cada producto.</p>
      {error && <ErrorMessage message={error} />}
      {!error && products.length === 0 && <div className="alert alert-secondary">No hay productos registrados.</div>}
      {!error && products.length > 0 && (
        <div className="table-responsive table-dark-panel">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead><tr><th>ID</th><th>Producto</th><th>Categoría</th><th>Consola</th><th>Precio</th><th>Estado</th><th /></tr></thead>
            <tbody>{products.map((product) => {
              const price = product.enOferta && product.precioOferta != null ? product.precioOferta : product.precio
              return <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.titulo}</td>
                <td>{product.categoria || product.genero || '—'}</td>
                <td>{product.consola}</td>
                <td>{Number(price) === 0 ? 'Gratis' : `$${Number(price).toLocaleString('es-CL')}`}</td>
                <td>{product.enOferta ? 'En oferta' : 'Disponible'}</td>
                <td><Link className="btn btn-outline-info btn-sm" to={`/vendedor/productos/${product.id}`}>Ver detalle</Link></td>
              </tr>
            })}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
