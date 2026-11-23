import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Games from './pages/Games.jsx'
import GameDetail from './pages/GameDetail.jsx'
import Categories from './pages/Categories.jsx'
import Offers from './pages/Offers.jsx'
import Reviews from './pages/Reviews.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import PurchaseSuccess from './pages/PurchaseSuccess.jsx'
import PurchaseFailure from './pages/PurchaseFailure.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminGames from './pages/AdminGames.jsx'
import AdminReviews from './pages/AdminReviews.jsx'
import VendedorDashboard from './pages/VendedorDashboard.jsx'
import SellerProducts from './pages/SellerProducts.jsx'
import SellerProductDetail from './pages/SellerProductDetail.jsx'
import SellerOrders from './pages/SellerOrders.jsx'
import SellerOrderDetail from './pages/SellerOrderDetail.jsx'
import NotFound from './pages/NotFound.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { CartProvider } from './contexts/CartContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Loading from './components/Loading.jsx'
import { USE_BACKEND } from './services/api.js'

function RoleHome() {
  const { isVendedor, isLoading } = useAuth()
  if (isLoading) return <div className="container"><Loading /></div>
  return isVendedor ? <Navigate to="/vendedor/productos" replace /> : <Home />
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<RoleHome />} />
            <Route path="videojuegos" element={<ProtectedRoute excludeVendedor><Games /></ProtectedRoute>} />
            <Route path="videojuegos/:id" element={<ProtectedRoute excludeVendedor><GameDetail /></ProtectedRoute>} />
            <Route path="categorias" element={<ProtectedRoute excludeVendedor><Categories /></ProtectedRoute>} />
            <Route path="ofertas" element={<ProtectedRoute excludeVendedor><Offers /></ProtectedRoute>} />
            <Route path="resenas" element={<ProtectedRoute excludeVendedor><Reviews /></ProtectedRoute>} />
            <Route path="carrito" element={<ProtectedRoute excludeVendedor><Cart /></ProtectedRoute>} />
            <Route path="checkout" element={USE_BACKEND ? <ProtectedRoute excludeVendedor><ProtectedRoute><Checkout /></ProtectedRoute></ProtectedRoute> : <ProtectedRoute excludeVendedor><Checkout /></ProtectedRoute>} />
            <Route path="compra-exitosa" element={<ProtectedRoute excludeVendedor><PurchaseSuccess /></ProtectedRoute>} />
            <Route path="compra-fallida" element={<ProtectedRoute excludeVendedor><PurchaseFailure /></ProtectedRoute>} />
            <Route path="login" element={<ProtectedRoute excludeVendedor><Login /></ProtectedRoute>} />
            <Route path="registro" element={<ProtectedRoute excludeVendedor><Register /></ProtectedRoute>} />

            <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/videojuegos" element={<ProtectedRoute adminOnly><AdminGames /></ProtectedRoute>} />
            <Route path="admin/resenas" element={<ProtectedRoute adminOnly><AdminReviews /></ProtectedRoute>} />

            <Route path="vendedor" element={<ProtectedRoute vendedorOnly><VendedorDashboard /></ProtectedRoute>} />
            <Route path="vendedor/productos" element={<ProtectedRoute vendedorOnly><SellerProducts /></ProtectedRoute>} />
            <Route path="vendedor/productos/:id" element={<ProtectedRoute vendedorOnly><SellerProductDetail /></ProtectedRoute>} />
            <Route path="vendedor/boletas" element={<ProtectedRoute vendedorOnly><SellerOrders /></ProtectedRoute>} />
            <Route path="vendedor/boletas/:id" element={<ProtectedRoute vendedorOnly><SellerOrderDetail /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}
