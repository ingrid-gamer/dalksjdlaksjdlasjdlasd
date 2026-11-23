import {
  createGame,
  createReview,
  createUser,
  deleteGame,
  deleteReview,
  getGameById,
  getGames,
  getReviews,
  getUsers,
  getUserByUsername,
  updateGame,
  updateReview,
} from '../data/mockDatabase.js'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8083').replace(/\/$/, '')
export const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true'

async function request(path, options = {}) {
  const token = window.localStorage.getItem('resenasmixx.token')
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    })
  } catch (cause) {
    const error = new Error(`No se pudo conectar con la API (${API_BASE_URL}). Verifica que Spring Boot esté iniciado y que VITE_API_URL sea correcto.`)
    error.cause = cause
    error.status = 0
    throw error
  }

  const bodyText = response.status === 204 ? '' : await response.text()
  let payload = null
  if (bodyText) {
    try { payload = JSON.parse(bodyText) } catch { payload = null }
  }
  if (!response.ok) {
    const message = payload?.message || payload?.error || bodyText || `Error HTTP ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }
  if (!bodyText) return null
  return payload ?? bodyText
}

export async function loginUser(credentials) {
  if (!USE_BACKEND) {
    const user = getUserByUsername(credentials.username)
    if (!user || user.password !== credentials.password) throw new Error('Credenciales incorrectas')
    return {
      token: `mock-token-${user.id}`,
      user: { id: user.id, nombre: user.nombre, username: user.username, email: user.email, role: user.role },
    }
  }

  const data = await request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: credentials.username, password: credentials.password }),
  })
  return {
    token: data.token,
    user: {
      id: data.userId,
      username: data.username,
      nombre: data.nombre,
      email: data.email,
      role: data.role || 'ROLE_USER',
    },
    expiresInSeconds: data.expiresInSeconds,
  }
}

export async function refreshSession() {
  if (!USE_BACKEND) return null
  const data = await request('/api/v1/auth/refresh', { method: 'POST' })
  return {
    token: data.token,
    user: {
      id: data.userId,
      username: data.username,
      nombre: data.nombre,
      email: data.email,
      role: data.role || 'ROLE_USER',
    },
    expiresInSeconds: data.expiresInSeconds,
  }
}

export async function registerUser(userData) {
  if (!USE_BACKEND) return createUser(userData)
  return request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(userData) })
}

// ── Videojuegos (rutas versionadas /api/v1) ──
export async function listGames() {
  return USE_BACKEND
    ? request('/api/v1/videojuegos')
    : getGames()
}

export async function readGame(id) {
  return USE_BACKEND
    ? request(`/api/v1/videojuegos/${id}`)
    : getGameById(id)
}

export async function addGame(data) {
  return USE_BACKEND
    ? request('/api/v1/videojuegos', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    : createGame(data)
}

export async function editGame(id, data) {
  return USE_BACKEND
    ? request(`/api/v1/videojuegos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    : updateGame(id, data)
}

export async function removeGame(id) {
  return USE_BACKEND
    ? request(`/api/v1/videojuegos/${id}`, {
        method: 'DELETE',
      })
    : deleteGame(id)
}

// ── Reseñas (rutas versionadas /api/v1) ──
export async function listReviews() {
  return USE_BACKEND
    ? request('/api/v1/resenas')
    : getReviews()
}

export async function addReview(data) {
  return USE_BACKEND
    ? request('/api/v1/resenas', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    : createReview(data)
}

export async function editReview(id, data) {
  return USE_BACKEND
    ? request(`/api/v1/resenas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    : updateReview(id, data)
}

export async function removeReview(id) {
  return USE_BACKEND
    ? request(`/api/v1/resenas/${id}`, {
        method: 'DELETE',
      })
    : deleteReview(id)
}

// ── Usuarios (solo ADMIN) ──
export async function listUsers() {
  return USE_BACKEND
    ? request('/api/v1/usuarios')
    : getUsers()
}

// ── Juegos gratuitos (integración externa) ──
export async function listFreeGames() {
  if (USE_BACKEND) return request('/api/v1/juegos-gratis')
  return getGames().filter((game) => Number(game.precio) === 0)
}

// ── Compras ──
export async function createPurchase(data) {
  if (!USE_BACKEND) return null
  return request('/api/v1/compras', { method: 'POST', body: JSON.stringify(data) })
}

// Consultas de boletas reservadas al rol VENDEDOR/ADMIN.
export async function listSellerOrders() {
  if (!USE_BACKEND) throw new Error('La consulta de órdenes requiere VITE_USE_BACKEND=true.')
  return request('/api/v1/compras')
}

export async function readSellerOrder(id) {
  if (!USE_BACKEND) throw new Error('El detalle de órdenes requiere VITE_USE_BACKEND=true.')
  return request(`/api/v1/compras/${encodeURIComponent(id)}`)
}
