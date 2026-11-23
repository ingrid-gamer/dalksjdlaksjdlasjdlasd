# Revisión técnica y estado de la entrega — RESENASMIX2

**Versión:** 1.0  
**Fecha:** 20 de noviembre de 2026

## 1. Alcance de la revisión

Se examinó el ZIP `RESENASMIX2-main(2).zip` y se modificó el código fuente para alinear el modelo de persistencia, la vista Vendedor, los contratos de compra y la documentación con los requisitos transcritos en la solicitud.

La auditoría anterior debe leerse con cautela: no todos sus diagnósticos coincidían con el repositorio. Por ejemplo, `AuthContext.jsx` ya guardaba token y usuario en `localStorage` y restauraba la sesión al iniciar. Esa funcionalidad se conservó; no se afirma que estuviera ausente.

## 2. Cambios implementados

### 2.1 Modelo de datos

- `Usuario` se mapea a `USUARIO`.
- `Videojuego` se mapea a `PRODUCTO`.
- Se incorporó `Categoria`, mapeada a `CATEGORIA`, y la relación `PRODUCTO.categoria_id`.
- `Compra` se mapea a `BOLETA`.
- Se incorporó `DetalleBoleta`, mapeada a `DETALLE_BOLETA`, con producto, cantidad y precio unitario.
- Se mantiene la tabla `resenas` porque forma parte de la funcionalidad original.
- La API sigue exponiendo `categoria` como texto, de modo que el JSON utilizado por React no necesita transformarse en un objeto relacional.

Para bases existentes se incluye `docs/sql/migracion_modelo_comercial.sql`. Este script renombra tablas conservando registros, crea categorías, convierte el JSON histórico de compras en filas relacionales y mantiene la antigua columna `detalle_json` como respaldo nullable. Requiere MySQL 8.0.4 o posterior por `JSON_TABLE`, respaldo previo y ejecución única con Spring Boot detenido.

### 2.2 Vendedor y autorización

- El menú del Vendedor muestra solo Productos y Órdenes.
- Se añadieron vistas de lista/detalle de productos y lista/detalle de boletas.
- `ProtectedRoute` bloquea rutas de otras secciones para el rol Vendedor.
- La API incorpora `GET /api/v1/compras` y `GET /api/v1/compras/{id}` para lectura global de boletas.
- La lectura global de boletas queda reservada a VENDEDOR/ADMIN. La compra y consulta de boletas propias se conserva para USER/ADMIN.
- La gestión y consulta de usuarios se limita a ADMIN.

La lectura pública de catálogo y reseñas sigue existiendo para visitantes y clientes, pero el Vendedor queda fuera de esas pantallas mediante navegación y protección de rutas del frontend. Los permisos definitivos se aplican en backend para las operaciones protegidas.

### 2.3 Sesión y comunicación

- Se conservó la persistencia preexistente de token y usuario en LocalStorage y la restauración mediante `/api/v1/auth/refresh`.
- `api.js` ahora convierte fallos de red en mensajes explícitos que identifican la URL de API y conserva estado/respuesta ante errores HTTP.
- Se añadieron `listSellerOrders` y `readSellerOrder`.
- Se incorporaron `frontend/.env.example` y `frontend/.env.mock.example`.
- `application.properties` toma los datos de MySQL desde variables de entorno, en vez de depender de una contraseña local fija.
- Se corrigieron las instrucciones Maven: el wrapper está dentro de `backend/`, por lo que los comandos deben ejecutarse desde esa carpeta.

## 3. Documentos incluidos

- `docs/Documento_ERS.md`: propósito, alcance, actores, requisitos funcionales/no funcionales, reglas de negocio, modelo de datos y casos de uso.
- `docs/Modelo_API.md`: URL base, Swagger, endpoints, métodos, entradas, respuestas, roles y ejemplos JSON.
- `docs/Documento_Integracion.md`: configuración, CORS, flujo React/API/Spring/JPA/MySQL, JWT, errores y ejecución local.
- `docs/Manual_Usuario.md`: requisitos, instalación, inicio de sesión y procedimientos por rol.
- `docs/sql/migracion_modelo_comercial.sql`: migración de bases antiguas.
- `docs/capturas/README.md`: guía para incorporar evidencias reales.

## 4. Pasos obligatorios antes de ejecutar

### Instalación nueva
1. Crear/iniciar MySQL y la base `resenasmix`.
2. Configurar `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` y `JWT_SECRET`.
3. Desde PowerShell ejecutar `cd backend` y `.\mvnw.cmd spring-boot:run`.
4. En otra terminal, configurar `frontend/.env` a partir de `.env.example` con `VITE_USE_BACKEND=true` y `VITE_API_URL=http://localhost:8083`.
5. Ejecutar `npm ci` y `npm run dev` en `frontend/`.

### Base antigua
1. Hacer respaldo completo de `resenasmix`.
2. Detener Spring Boot.
3. Revisar el script SQL y ejecutarlo una sola vez con MySQL 8.0.4+.
4. Confirmar que no queden productos con `categoria_id` nulo y comprobar las cinco tablas.
5. Iniciar el backend y probar catálogo, autenticación, compra y vistas Vendedor.

**No ejecutes la migración sobre una base nueva ni más de una vez.** El script es una migración de una sola ejecución, no una rutina idempotente.

## 5. Evidencias que todavía debe aportar la ejecución real

No se agregaron capturas ficticias. Para terminar la entrega, iniciar la aplicación con MySQL y registrar capturas reales de:

1. Swagger y endpoint de salud/base de datos.
2. Lista y detalle de productos como Vendedor.
3. Lista y detalle de boletas como Vendedor.
4. Menú Vendedor mostrando únicamente Productos y Órdenes.
5. Intento de acceso del Vendedor a una ruta no permitida, mostrando redirección.
6. Sesión iniciada antes y después de recargar la página.
7. Ejemplo de error de red o HTTP mostrado en la interfaz.

En el Manual de Usuario, cada imagen debe llevar el rótulo «Figura N. Título» sobre la imagen, borde negro de 1 px y una nota bajo la imagen. Los archivos anexos originales de la pauta no se incluyeron en esta revisión; por ello, no es posible garantizar otros detalles de formato que dependan de esos anexos.

## 6. Verificación técnica pendiente

El cambio de código y la documentación no equivalen a una ejecución end-to-end. Antes de presentar, ejecutar al menos:

```powershell
# Backend (desde backend/)
.\mvnw.cmd test

# Frontend (desde frontend/)
npm ci
npm run lint
npm run test:run
npm run build
```

Luego validar en Swagger:
- `POST /api/v1/compras` con un usuario `ROLE_USER`.
- `GET /api/v1/compras/mis-compras` con ese usuario.
- `GET /api/v1/compras` con VENDEDOR (200) y con USER (403).
- `GET /api/v1/compras/{id}` con VENDEDOR.
- `POST/PUT/DELETE /api/v1/videojuegos` con ADMIN y acceso denegado para VENDEDOR.

La matriz anterior identifica pruebas recomendadas; no afirma resultados todavía no ejecutados en tu entorno. Tampoco se puede certificar «100% libre de errores» sin ejecutar estas pruebas contra tu versión de MySQL, Java, Node y datos reales.
