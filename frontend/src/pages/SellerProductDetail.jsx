import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { readGame } from '../services/api.js'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function SellerProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    readGame(id)
      .then((data) => { if (active) setProduct(data) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  if (loading) return <div className="container"><Loading /></div>
  return (
    <div className="container">
      <Link to="/vendedor/productos" className="btn btn-outline-light btn-sm mb-3">Volver a productos</Link>
      {error && <ErrorMessage message={error} />}
      {!error && !product && <div className="alert alert-secondary">No se encontró el producto solicitado.</div>}
      {product && <article className="hero-panel p-4">
        <div className="row g-4">
          <div className="col-md-5"><img src={product.imagen || '/favicon.svg'} alt={product.titulo} className="w-100 rounded-3" onError={(event) => { event.currentTarget.src = '/favicon.svg' }} /></div>
          <div className="col-md-7">
            <h1 className="page-title h2">{product.titulo}</h1>
            <dl className="row">
              <dt className="col-sm-4">ID</dt><dd className="col-sm-8">{product.id}</dd>
              <dt className="col-sm-4">Categoría</dt><dd className="col-sm-8">{product.categoria || product.genero || '—'}</dd>
              <dt className="col-sm-4">Consola</dt><dd className="col-sm-8">{product.consola}</dd>
              <dt className="col-sm-4">Precio normal</dt><dd className="col-sm-8">${Number(product.precio).toLocaleString('es-CL')}</dd>
              <dt className="col-sm-4">Precio vigente</dt><dd className="col-sm-8">{product.enOferta && product.precioOferta != null ? `$${Number(product.precioOferta).toLocaleString('es-CL')}` : `$${Number(product.precio).toLocaleString('es-CL')}`}</dd>
              <dt className="col-sm-4">Estado</dt><dd className="col-sm-8">{product.enOferta ? 'En oferta' : 'Disponible'}</dd>
            </dl>
            {product.descripcion && <><h2 className="h5">Descripción</h2><p className="text-muted-soft">{product.descripcion}</p></>}
          </div>
        </div>
      </article>}
    </div>
  )
}
