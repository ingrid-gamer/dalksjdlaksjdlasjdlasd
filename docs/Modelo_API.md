# Documentación de API e Integración — RESENASMIX2

**Versión:** 1.0  
**Fecha:** 20 de noviembre de 2026  
**Estado:** Documentación basada en los controladores y la configuración del repositorio.

## 1. Descripción general
La API REST proporciona autenticación, catálogo de videojuegos, reseñas, usuarios, compras demostrativas y consultas de salud. Está dirigida a desarrolladores frontend, responsables de pruebas y administradores técnicos.

## 2. Información general

| Parámetro | Valor |
|---|---|
| URL base local | `http://localhost:8083` |
| Prefijo de API | `/api/v1` |
| Swagger UI | `http://localhost:8083/swagger-ui/index.html` |
| OpenAPI JSON | `http://localhost:8083/v3/api-docs` |
| Formato | JSON UTF-8 |
| Autenticación | JWT Bearer en rutas protegidas |
| CORS | Orígenes definidos por `APP_CORS_ALLOWED_ORIGINS` |

En producción, reemplaza la URL local por el dominio público real del backend. El dominio de producción debe confirmarse en el panel del proveedor de despliegue.

## 3. Autenticación y roles
Las rutas protegidas requieren `Authorization: Bearer <JWT>`. Añade `Content-Type: application/json` a las solicitudes que incluyan JSON y `Accept: application/json` para indicar el formato esperado.

| Rol | Acceso |
|---|---|
| Sin autenticar | Login, registro, salud y lectura pública del catálogo/reseñas. |
| `ROLE_USER` | Crear reseñas, registrar compras y consultar sus propias boletas. |
| `ROLE_VENDEDOR` | Consultar lista/detalle de productos y lista/detalle de boletas. |
| `ROLE_ADMIN` | CRUD de productos, gestión de usuarios, moderación de reseñas y consulta de boletas. |

El registro público asigna `ROLE_USER`. Usuarios es solo ADMIN. Las boletas globales son VENDEDOR/ADMIN. `GET /api/v1/compras/mis-compras` y `POST /api/v1/compras` son USER/ADMIN.

## 4. Endpoints

### 4.1 Autenticación — `/api/v1/auth`

| Método y ruta | Descripción | Entrada | Respuestas | Acceso |
|---|---|---|---|---|
| `POST /register` | Crea cuenta estándar. | `nombre`, `username`, `email`, `password`. | 201; 400 validación; 409 duplicado. | Público |
| `POST /login` | Autentica y genera JWT. | `username`, `password`. | 200; 400 validación; 401 credenciales incorrectas. | Público |
| `POST /refresh` | Renueva JWT vigente. | Header Bearer. | 200; 401 falta/token inválido/expirado. | Bearer válido |

Registro:
```json
{
  "nombre": "Usuario de prueba",
  "username": "usuario_prueba",
  "email": "prueba@example.com",
  "password": "clave-segura"
}
```

Login:
```json
{
  "username": "usuario_prueba",
  "password": "clave-segura"
}
```

La respuesta de autenticación contiene `token`, `userId`, `username`, `nombre`, `email`, `role` y `expiresInSeconds`.

### 4.2 Productos — `/api/v1/videojuegos`

| Método y ruta | Descripción | Entrada | Respuestas | Acceso |
|---|---|---|---|---|
| `GET /videojuegos` | Lista productos. | Sin body. | 200. | Público |
| `GET /videojuegos/{id}` | Obtiene un producto. | Path `id`. | 200; 404. | Público |
| `POST /videojuegos` | Crea producto. | JSON del producto. | 201; 400; 403. | ADMIN |
| `PUT /videojuegos/{id}` | Actualiza producto. | Path `id` + JSON. | 200; 400; 404; 403. | ADMIN |
| `DELETE /videojuegos/{id}` | Elimina producto. | Path `id`. | 204; 404; 403. | ADMIN |

Ejemplo:
```json
{
  "titulo": "Minecraft",
  "genero": "Sandbox",
  "categoria": "Sandbox",
  "consola": "PC",
  "precio": 19990,
  "precioOferta": null,
  "enOferta": false,
  "imagen": "https://ejemplo.com/imagen.jpg",
  "descripcion": "Descripción del producto",
  "requisitosMinimos": {
    "sistemaOperativo": "Windows 10 de 64 bits",
    "memoria": "8 GB"
  }
}
```
`categoria` se entrega como texto al frontend; MySQL conserva la relación `PRODUCTO.categoria_id` con `CATEGORIA.id`. `genero` se mantiene por compatibilidad con el filtro actual.

### 4.3 Reseñas — `/api/v1/resenas`

| Método y ruta | Descripción | Entrada | Respuestas | Acceso |
|---|---|---|---|---|
| `GET /resenas` | Lista reseñas. | Sin body. | 200. | Público |
| `GET /resenas/{id}` | Obtiene reseña. | Path `id`. | 200; 404. | Público |
| `POST /resenas` | Crea reseña. | `videojuegoId`, `comentario`, `calificacion`. | 201; 400; 401/403. | USER/ADMIN |
| `PUT /resenas/{id}` | Actualiza reseña. | Path y JSON de reseña. | 200; 400; 404; 403. | ADMIN |
| `DELETE /resenas/{id}` | Elimina reseña. | Path `id`. | 204; 404; 403. | ADMIN |

Ejemplo:
```json
{
  "videojuegoId": 1,
  "comentario": "Muy buen juego.",
  "calificacion": 5
}
```
No se envía `usuarioId`: el backend obtiene el autor desde el JWT.

### 4.4 Usuarios — `/api/v1/usuarios`

| Método y ruta | Descripción | Entrada | Respuestas | Acceso |
|---|---|---|---|---|
| `GET /usuarios` | Lista usuarios. | Sin body. | 200. | ADMIN |
| `GET /usuarios/{id}` | Obtiene usuario. | Path `id`. | 200; 404. | ADMIN |
| `POST /usuarios` | Crea usuario mediante operación administrativa. | JSON de usuario. | 201; 400/409. | ADMIN |
| `PUT /usuarios/{id}` | Actualiza nombre/correo. | Path y JSON. | 200; 404. | ADMIN |
| `DELETE /usuarios/{id}` | Elimina usuario. | Path `id`. | 204; 404. | ADMIN |

La lógica de creación fuerza `ROLE_USER` y cifra contraseñas con BCrypt. La modificación de rol no está disponible desde este CRUD.

### 4.5 Boletas — `/api/v1/compras`

| Método y ruta | Descripción | Entrada | Respuestas | Acceso |
|---|---|---|---|---|
| `POST /compras` | Registra compra demostrativa asociada al usuario autenticado. | Datos de checkout e `items`. | 201; 400; 404 producto; 401/403. | USER/ADMIN |
| `GET /compras/mis-compras` | Lista boletas propias. | Sin body. | 200. | USER/ADMIN |
| `GET /compras` | Lista todas las boletas. | Sin body. | 200; 403. | VENDEDOR/ADMIN |
| `GET /compras/{id}` | Obtiene cabecera y líneas de una boleta. | Path `id`. | 200; 404; 403. | VENDEDOR/ADMIN |

Ejemplo de compra:
```json
{
  "nombre": "Usuario de prueba",
  "email": "prueba@example.com",
  "direccion": "Av. Ejemplo 123, Santiago",
  "entrega": "Estándar",
  "items": [
    { "videojuegoId": 1, "cantidad": 2 },
    { "videojuegoId": 3, "cantidad": 1 }
  ]
}
```

La respuesta incluye `id`, `nombre`, `email`, `direccion`, `entrega`, `total`, `estado`, `fechaCreacion` e `items`. Cada línea de `items` contiene `id`, `videojuegoId`, `titulo`, `cantidad`, `precioUnitario` y `subtotal`.

Ejemplo de respuesta ilustrativo:
```json
{
  "id": 12,
  "nombre": "Usuario de prueba",
  "email": "prueba@example.com",
  "direccion": "Av. Ejemplo 123, Santiago",
  "entrega": "Estándar",
  "total": 49980,
  "estado": "SIMULADA",
  "fechaCreacion": "2026-11-20T17:00:00Z",
  "items": [
    {
      "id": 25,
      "videojuegoId": 1,
      "titulo": "GTA V",
      "cantidad": 2,
      "precioUnitario": 24990,
      "subtotal": 49980
    }
  ]
}
```
Los importes y fechas de este ejemplo son ilustrativos. El backend calcula los totales usando los precios de la base de datos. No se procesan pagos reales.

### 4.6 Juegos gratuitos externos — `/api/v1/juegos-gratis`

| Método y ruta | Descripción | Entrada | Respuestas | Acceso |
|---|---|---|---|---|
| `GET /juegos-gratis` | Consulta FreeToGame usando `EXTERNAL_API_BASE_URL`. | Sin body. | 200; error si el proveedor no responde. | Público |

### 4.7 Salud — `/api/v1/health` y Actuator

| Método y ruta | Descripción | Respuestas | Acceso |
|---|---|---|---|
| `GET /api/v1/health/ping` | Confirma respuesta de la API y registra heartbeat. | 200 con status, service y timestamp. | Público |
| `GET /api/v1/health/db` | Ejecuta `SELECT 1` en MySQL. | 200 conectada; 503 desconectada. | Público |
| `GET /actuator/health` | Estado general de Spring Boot. | 200 cuando el estado es UP. | Público |

## 5. Contrato de errores
Los errores de validación/negocio gestionados por `GlobalExceptionHandler` usan:
```json
{
  "timestamp": "2026-11-20T14:00:00",
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "La calificación máxima es 5",
  "path": "/api/v1/resenas"
}
```

| Código | Significado |
|---|---|
| 200 | Consulta/actualización correcta. |
| 201 | Registro creado. |
| 204 | Eliminación correcta sin contenido. |
| 400 | Validación o solicitud incorrecta. |
| 401 | Falta autenticación o JWT inválido/expirado. |
| 403 | Rol sin permisos. |
| 404 | Recurso no encontrado. |
| 409 | Conflicto con registro único/existente. |
| 500 | Error interno no controlado. |
| 503 | Servicio/base de datos no disponible en health check. |

## 6. Integración con React
La integración se centraliza en `frontend/src/services/api.js`:
1. `VITE_API_URL` define el host del backend; por defecto `http://localhost:8083`.
2. `VITE_USE_BACKEND=true` activa peticiones HTTP reales; `false` selecciona datos mock en LocalStorage.
3. `api.js` adjunta `Accept`, `Content-Type` cuando hay body y `Authorization: Bearer <JWT>` si existe token.
4. La respuesta JSON se procesa y los errores conservan el estado HTTP/mensaje.
5. Los errores de red muestran un mensaje explícito indicando que no se pudo conectar con la API.
6. `AuthContext.jsx` persiste token/usuario en LocalStorage y restaura sesión al iniciar.

### Evidencias visuales requeridas
Guarda capturas reales en `docs/capturas/`. Cada captura debe tener encabezado con número/título encima, borde negro de 1 px y una nota explicativa debajo.
- **Figura 1. Consumo exitoso del catálogo:** muestra `GET /api/v1/videojuegos`, HTTP 200 y productos visibles. **Nota:** indicar que el listado procede de la API.
- **Figura 2. Error de conexión visible en React:** detener el backend o configurar temporalmente una URL incorrecta y capturar el mensaje mostrado. Restaurar después la configuración. **Nota:** explicar el tratamiento del error de red.
- **Figura 3. Compra creada:** muestra `POST /api/v1/compras`, HTTP 201 y boleta registrada. Ocultar tokens/datos personales.
- **Figura 4. Lista de boletas para Vendedor:** muestra `GET /api/v1/compras`, HTTP 200.
- **Figura 5. Permisos de rol:** token `ROLE_USER` intenta `GET /api/v1/compras` y recibe 403.

No se incluyen capturas ficticias: deben tomarse en la aplicación final conectada a MySQL.

## 7. Variables de entorno

Frontend (`frontend/.env`):
```env
VITE_USE_BACKEND=true
VITE_API_URL=http://localhost:8083
```

Backend:
| Variable | Uso |
|---|---|
| `SPRING_DATASOURCE_URL` | JDBC URL MySQL. |
| `SPRING_DATASOURCE_USERNAME` | Usuario MySQL. |
| `SPRING_DATASOURCE_PASSWORD` | Contraseña MySQL. |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Estrategia Hibernate; default `update`. |
| `JWT_SECRET` | Clave JWT; reemplazar el valor local en producción. |
| `APP_CORS_ALLOWED_ORIGINS` | Orígenes del frontend separados por coma. |
| `APP_ADMIN_USERNAME`, `APP_ADMIN_PASSWORD`, `APP_ADMIN_NOMBRE`, `APP_ADMIN_EMAIL` | Creación inicial opcional del administrador. |
| `APP_SEED_CATALOG` | Controla carga inicial del catálogo. |
| `EXTERNAL_API_BASE_URL` | URL del proveedor FreeToGame. |

No subir secretos ni `.env` al repositorio.

## 8. Comprobaciones manuales recomendadas
1. Abrir Swagger y ejecutar `GET /api/v1/health/ping`.
2. Ejecutar `GET /api/v1/health/db`.
3. Registrar/iniciar sesión como cliente.
4. Consultar catálogo y detalle de producto.
5. Publicar reseña y comprobar HTTP 201.
6. Registrar compra y comprobar persistencia en `BOLETA` y `DETALLE_BOLETA`.
7. Iniciar sesión como Vendedor y consultar productos/boletas.
8. Con token `ROLE_USER`, ejecutar `GET /api/v1/compras`; debe responder 403.
9. Recargar el frontend con JWT vigente; comprobar persistencia de sesión.
10. Ejecutar las pruebas automatizadas y el build indicados en README.
