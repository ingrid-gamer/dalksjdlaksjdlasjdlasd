# Documento de Integración — RESENASMIX2

**Versión:** 1.0  
**Fecha:** 20 de noviembre de 2026

## 1. Propósito
RESENASMIX2 es una aplicación web para consultar videojuegos, leer/publicar reseñas, administrar el catálogo y registrar compras demostrativas. No cobra dinero ni integra pasarela de pago.

## 2. Arquitectura

| Capa | Tecnología | Responsabilidad |
|---|---|---|
| Interfaz | React 19 + Vite | Páginas, formularios, navegación, estado de sesión y carrito. |
| API | Java 21 + Spring Boot | REST JSON, validación, JWT, autorización y reglas de negocio. |
| Persistencia | MySQL + Spring Data JPA/Hibernate | Datos de usuario, producto, categoría, reseña y boletas. |

Flujo de extremo a extremo:
```text
Navegador React
  → frontend/src/services/api.js
  → HTTP /api/v1 + JSON + Authorization Bearer
  → Spring Security / JwtFilter / CORS
  → Controller
  → Service
  → Repository / Hibernate
  → MySQL
```

## 3. Configuración de conexión

### 3.1 Backend
Archivo: `backend/src/main/resources/application.properties`.

| Propiedad | Variable de entorno | Valor local por defecto |
|---|---|---|
| JDBC URL | `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/resenasmix?...` |
| Usuario MySQL | `SPRING_DATASOURCE_USERNAME` | `root` |
| Contraseña MySQL | `SPRING_DATASOURCE_PASSWORD` | Vacía |
| Puerto HTTP | `PORT` | `8083` |
| DDL Hibernate | `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` |
| Clave JWT | `JWT_SECRET` | Clave local de desarrollo; reemplazar en producción |
| Orígenes CORS | `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` |

### 3.2 Frontend
Archivo: `frontend/.env`.

```env
VITE_USE_BACKEND=true
VITE_API_URL=http://localhost:8083
```

`VITE_USE_BACKEND=true` selecciona Spring Boot. `false` activa `mockDatabase.js` y LocalStorage; no demuestra persistencia en MySQL.

### 3.3 CORS
`SecurityConfig` permite métodos GET, POST, PUT, PATCH, DELETE y OPTIONS; headers Authorization, Content-Type, Accept y Origin. La lista de orígenes permitidos se obtiene desde `APP_CORS_ALLOWED_ORIGINS`. En producción agrega el origen exacto del frontend, sin barra final. El navegador envía preflight OPTIONS antes de determinadas peticiones.

## 4. Flujo de integración

1. La vista React realiza una acción, por ejemplo abrir catálogo o enviar reseña.
2. La vista llama a una función de `frontend/src/services/api.js`.
3. El servicio compone la URL desde `VITE_API_URL` y serializa los cuerpos JSON.
4. Para recursos protegidos, agrega `Authorization: Bearer <token>` desde `resenasmixx.token` en LocalStorage.
5. Spring Security aplica CORS y `JwtFilter` valida firma y expiración con `JwtUtil`.
6. `SecurityConfig` decide acceso según método HTTP y autoridad.
7. El controller recibe el JSON y aplica validación cuando corresponde.
8. El service ejecuta reglas de negocio.
9. Los repositories consultan o escriben entidades JPA en MySQL.
10. Spring devuelve JSON con código HTTP y React actualiza la vista; los errores de red y HTTP se muestran al usuario.

### 4.1 Lectura de catálogo
```text
Games.jsx o SellerProducts.jsx
  → listGames() en services/api.js
  → GET /api/v1/videojuegos
  → VideojuegoController.listar()
  → VideojuegoService.listar()
  → VideojuegoRepository.findAll()
  → MySQL: PRODUCTO + CATEGORIA
  → JSON con categoria como nombre
  → React muestra listado
```

### 4.2 Creación de reseña
```text
Reviews.jsx
  → addReview(datos)
  → POST /api/v1/resenas + Authorization: Bearer <JWT>
  → JwtFilter valida JWT
  → ResenaController.guardar()
  → ResenaService.guardar(dto, authentication.getName())
  → UsuarioRepository + VideojuegoRepository
  → ResenaRepository.save()
  → JSON de respuesta
```
El backend no utiliza un `usuarioId` recibido desde React para identificar al autor; obtiene el nombre de usuario autenticado a partir del JWT.

### 4.3 Compra y normalización de detalle
```text
Checkout.jsx
  → createPurchase(datos)
  → POST /api/v1/compras
  → CompraController.registrar()
  → CompraService.registrar()
  → UsuarioRepository + VideojuegoRepository
  → cálculo del precio/subtotal/total en backend
  → CompraRepository.save(BOLETA + DETALLE_BOLETA)
  → JSON de boleta y líneas
```
El carrito se conserva en el navegador. El backend vuelve a consultar precios en MySQL; no confía en importes del navegador. La boleta inicia con estado `SIMULADA`.

## 5. Modelo de datos
Las entidades principales se mapean a:
- `Usuario` → `USUARIO`.
- `Compra` → `BOLETA`.
- `DetalleBoleta` → `DETALLE_BOLETA`.
- `Videojuego` → `PRODUCTO`.
- `Categoria` → `CATEGORIA`.
- `Resena` → `resenas`.

`PRODUCTO.categoria_id` referencia `CATEGORIA.id`. `DETALLE_BOLETA` referencia `BOLETA` y `PRODUCTO`. La API conserva `categoria` como un nombre de texto para no romper el contrato que consumen las pantallas React.

### Migración desde el esquema antiguo
Si la base ya contiene `usuarios`, `compras` y `videojuegos`, no basta con arrancar Hibernate: `ddl-auto=update` no renombra/migra los datos de forma segura. Detén Spring Boot, respalda MySQL y ejecuta una sola vez `docs/sql/migracion_modelo_comercial.sql`. El script renombra las tablas antiguas, crea `CATEGORIA` y `DETALLE_BOLETA`, asigna categorías con base en `genero` y migra líneas desde `detalle_json`. Conserva `detalle_json` como columna nullable de respaldo histórico.

Para una base nueva, las entidades permiten que Hibernate cree las tablas al arrancar y el inicializador registra el catálogo/categorías de demostración si `PRODUCTO` está vacío.

## 6. JWT, sesión y roles
- `POST /api/v1/auth/register`: crea `ROLE_USER` y cifra contraseña con BCrypt.
- `POST /api/v1/auth/login`: autentica y emite JWT.
- `POST /api/v1/auth/refresh`: renueva un JWT que todavía no expiró; no existe token de renovación independiente de larga duración.
- `JwtFilter`: valida JWT y roles `ROLE_USER`, `ROLE_ADMIN`, `ROLE_VENDEDOR`.
- `SecurityConfig`: CRUD productos, usuarios y moderación de reseñas se restringen por rol; lista/detalle global de boletas solo VENDEDOR/ADMIN.
- `AuthContext.jsx`: guarda token y usuario en LocalStorage, restaura sesión al iniciar y actualiza token con `/refresh`.
- `ProtectedRoute.jsx` + `Navbar.jsx`: limitan vistas/rutas. Vendedor ve solo Productos y Órdenes; su detalle de producto no incluye reseñas, carrito ni acciones de administración.

Para crear un Vendedor de prueba, regístralo en el sitio y, desde MySQL, asigna:
```sql
UPDATE USUARIO SET role = 'ROLE_VENDEDOR' WHERE username = 'usuario_vendedor';
```
Después cierra sesión e inicia nuevamente para recibir un JWT con el rol actualizado.

## 7. Manejo de errores
`api.js` captura errores de red y comunica la URL de API configurada. Para respuestas HTTP no exitosas conserva estado, payload y mensaje. `GlobalExceptionHandler` normaliza validaciones, recursos inexistentes, conflictos y errores internos.

| Código | Uso típico |
|---|---|
| 200 | Consulta/actualización. |
| 201 | Alta/reseña/boleta creada. |
| 204 | Eliminación. |
| 400 | Datos inválidos. |
| 401 | No autenticado/token inválido. |
| 403 | Rol insuficiente. |
| 404 | Recurso no existe. |
| 409 | Dato único duplicado. |
| 500 | Error interno. |
| 503 | MySQL no disponible en endpoint health/db. |

## 8. Ejecución local en Windows

**Requisitos:** JDK 21, Node.js 24.15.0 o superior de la rama 24.x, npm, MySQL 8.x.

### Paso 1 — MySQL
Inicia MySQL y crea la base `resenasmix`, o utiliza Docker Compose (la configuración local de Compose publica MySQL en el puerto 3307).

### Paso 2 — Backend
Abre una terminal PowerShell desde la carpeta del proyecto:

```powershell
cd backend
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/resenasmix?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="TU_CLAVE_MYSQL"
$env:JWT_SECRET="reemplaza-por-una-clave-local-segura-de-al-menos-32-bytes"
.\mvnw.cmd spring-boot:run
```

### Paso 3 — Frontend
En otra terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm ci
npm run dev
```

Abre `http://localhost:5173`; la API debe responder en `http://localhost:8083`.

### Paso 4 — Comprobación de conexión
- `GET http://localhost:8083/api/v1/health/ping`
- `GET http://localhost:8083/api/v1/health/db`
- Swagger: `http://localhost:8083/swagger-ui/index.html`

El segundo endpoint confirma la conexión efectiva a MySQL. El endpoint ping confirma solo disponibilidad de API.

## 9. Despliegue y variables
En Railway/Vercel utiliza las variables descritas en `docs/Despliegue_Railway.md`. El origen Vercel debe coincidir exactamente con `APP_CORS_ALLOWED_ORIGINS`. `VITE_*` se incorpora durante el build y requiere volver a desplegar al modificarse.

## 10. Evidencias de integración
Las capturas no se pueden fabricar desde el código. Incorpora imágenes reales en `docs/capturas/` con:
- número y título encima;
- borde negro de 1 px;
- nota explicativa debajo;
- sin JWT, contraseñas ni información personal visible.

Evidencias recomendadas: catálogo HTTP 200, error de conexión visible en React, compra HTTP 201, listado de boletas para Vendedor HTTP 200 y bloqueo HTTP 403 al probar el listado global con un token USER.
