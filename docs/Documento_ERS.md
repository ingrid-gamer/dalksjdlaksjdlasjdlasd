# Especificación de Requisitos de Software (ERS) — RESENASMIX2

**Versión:** 1.0  
**Fecha:** 20 de noviembre de 2026  
**Proyecto:** RESENASMIX2 — Plataforma de catálogo, reseñas y compras demostrativas de videojuegos  
**Estado:** Especificación basada en el código fuente revisado y en los requisitos incorporados a esta entrega.

## 1. Introducción

### 1.1 Propósito
Este documento especifica los requisitos funcionales y no funcionales de RESENASMIX2. Sirve como referencia para implementar, probar y evaluar la plataforma.

### 1.2 Alcance
RESENASMIX2 es una aplicación web full-stack para consultar un catálogo de videojuegos, visualizar fichas, leer/publicar reseñas, administrar el catálogo y registrar compras demostrativas. La solución se compone de frontend React/Vite, API REST Spring Boot y persistencia MySQL.

La compra registrada es una simulación: **no procesa pagos reales ni integra una pasarela de pago**.

### 1.3 Términos
| Término | Definición |
|---|---|
| JWT | Token firmado que identifica una sesión autenticada. |
| API REST | Interfaz HTTP/JSON expuesta por el backend. |
| Boleta | Cabecera de una compra demostrativa asociada a un usuario. |
| Detalle de boleta | Línea con producto, cantidad y precio unitario. |
| Producto | Videojuego publicado en el catálogo. |
| Rol | Conjunto de permisos asignado a una cuenta. |

## 2. Descripción general

### 2.1 Perspectiva del producto
La aplicación se ejecuta en un navegador. React consume endpoints `/api/v1` de Spring Boot. Spring Security valida JWT y roles. Spring Data JPA/Hibernate persiste información en MySQL. El frontend puede ejecutarse en modo mock local, pero ese modo no demuestra integración con MySQL.

### 2.2 Actores y permisos
| Actor | Permisos |
|---|---|
| Visitante | Consultar catálogo, detalle de videojuegos, categorías, ofertas y reseñas públicas; registrar cuenta e iniciar sesión. |
| Cliente (`ROLE_USER`) | Funciones de visitante; publicar reseñas, registrar compras demostrativas y consultar sus propias compras. |
| Vendedor (`ROLE_VENDEDOR`) | Consultar únicamente lista/detalle de productos y lista/detalle de boletas. No puede gestionar catálogo, usuarios o reseñas ni usar carrito/checkout. |
| Administrador (`ROLE_ADMIN`) | Gestionar productos y usuarios, moderar reseñas y consultar lista/detalle de boletas. Puede acceder a las vistas generales. |

El registro público asigna exclusivamente `ROLE_USER`. Los roles privilegiados no se pueden seleccionar desde el formulario público.

### 2.3 Entorno de ejecución
- Navegador moderno con JavaScript y LocalStorage.
- Backend: JDK 21 y Spring Boot.
- Frontend: Node.js 24.15.0 o superior de la rama 24.x y npm.
- Base de datos: MySQL 8.x.
- Comunicación: HTTP(S), REST y JSON.

## 3. Requisitos funcionales
| Código | Requisito | Actor | Prioridad |
|---|---|---|---|
| RF-01 | Registrar cuenta con nombre, nombre de usuario, correo y contraseña. El registro público asigna `ROLE_USER`. | Visitante | Alta |
| RF-02 | Autenticar credenciales y devolver JWT más datos básicos de cuenta y rol. | Visitante | Alta |
| RF-03 | Guardar sesión en LocalStorage y restaurarla al recargar mientras el JWT sea válido. | Cliente/Vendedor/Admin | Alta |
| RF-04 | Consultar lista y detalle de productos. | Visitante | Alta |
| RF-05 | Consultar categorías, ofertas y reseñas públicas. | Visitante | Media |
| RF-06 | Publicar reseña con videojuego, comentario y calificación de 1 a 5; el autor se obtiene del JWT. | Cliente | Alta |
| RF-07 | Crear, listar, consultar, actualizar y eliminar productos. | Administrador | Alta |
| RF-08 | Consultar y gestionar usuarios mediante endpoints protegidos. | Administrador | Media |
| RF-09 | Consultar y eliminar reseñas. | Administrador | Media |
| RF-10 | Registrar compra demostrativa con datos de entrega y productos/cantidades. | Cliente | Alta |
| RF-11 | Calcular el total en backend con precios persistidos y guardar boleta y detalles relacionales. | Sistema | Alta |
| RF-12 | Consultar boletas propias. | Cliente | Media |
| RF-13 | Consultar lista y detalle de productos. | Vendedor | Alta |
| RF-14 | Consultar lista y detalle de boletas. | Vendedor | Alta |
| RF-15 | Ocultar y bloquear desde el frontend las secciones no permitidas al Vendedor. | Sistema | Alta |
| RF-16 | Devolver códigos HTTP adecuados ante falta de autenticación, permisos o recursos. | Sistema | Alta |
| RF-17 | Exponer endpoints de estado de API y conexión MySQL. | Operador | Media |

## 4. Requisitos no funcionales
| Código | Requisito | Criterio de verificación |
|---|---|---|
| RNF-01 | Seguridad de sesión | Rutas protegidas requieren `Authorization: Bearer <JWT>`; contraseñas usan BCrypt. |
| RNF-02 | Autorización | Spring Security protege endpoints; React protege rutas y menú. |
| RNF-03 | Persistencia | Usuarios, productos, categorías, reseñas, boletas y detalles quedan en MySQL con `VITE_USE_BACKEND=true`. |
| RNF-04 | Compatibilidad | React/Vite, JDK 21 y MySQL 8.x. |
| RNF-05 | Integración | `api.js` centraliza fetch; `VITE_API_URL` configura host; CORS usa `APP_CORS_ALLOWED_ORIGINS`. |
| RNF-06 | Validación | DTO y entidades validan datos; las entradas inválidas responden 400. |
| RNF-07 | Mantenibilidad | API versionada `/api/v1`; capas controller/service/repository/model/DTO. |
| RNF-08 | Observabilidad | Logs de salud y compras; endpoints de health check. |
| RNF-09 | Protección de datos | Las respuestas no exponen contraseña; los secretos no se guardan en Git. |

## 5. Reglas de negocio
1. El registro público genera `ROLE_USER`.
2. Los roles reconocidos por autenticación son `ROLE_USER`, `ROLE_ADMIN` y `ROLE_VENDEDOR`.
3. Solo ADMIN puede crear, actualizar o eliminar productos.
4. Solo ADMIN puede gestionar o consultar usuarios mediante `/api/v1/usuarios`.
5. El autor de una reseña se obtiene del JWT.
6. La calificación de reseña está entre 1 y 5.
7. La cantidad de una línea de boleta es un entero positivo.
8. El backend calcula el precio unitario y total usando precios guardados en MySQL.
9. La boleta se crea con estado `SIMULADA`; no representa una transacción financiera.
10. VENDEDOR tiene acceso de solo lectura a productos y boletas, sin acceso a las otras secciones.

## 6. Modelo de datos
Las cinco tablas exigidas son `USUARIO`, `BOLETA`, `DETALLE_BOLETA`, `PRODUCTO` y `CATEGORIA`. Se mantiene también la tabla `resenas` como funcionalidad propia de la plataforma.

| Tabla | Propósito | Relaciones |
|---|---|---|
| `USUARIO` | Cuentas y roles. | Un usuario puede tener muchas boletas y reseñas. |
| `BOLETA` | Cabecera de compra demostrativa. | Pertenece a un usuario y contiene detalles. |
| `DETALLE_BOLETA` | Producto, cantidad y precio unitario de la boleta. | Referencia una boleta y un producto. |
| `PRODUCTO` | Videojuegos del catálogo. | Referencia una categoría; puede aparecer en reseñas y detalles. |
| `CATEGORIA` | Clasificación de productos. | Una categoría agrupa productos. |
| `resenas` | Comentarios y calificaciones. | Cada reseña referencia usuario y producto. |

La API conserva el contrato JSON que React utiliza: `categoria` se expone como nombre de categoría; JPA persiste la relación mediante `PRODUCTO.categoria_id`.

## 7. Casos de uso

### CU-01 — Registro de cuenta
**Actor:** Visitante. **Precondición:** sin sesión.  
**Flujo:** abre Registro, completa nombre, usuario, correo y contraseña; el sistema valida datos y unicidad, cifra la clave y crea `ROLE_USER`.  
**Resultado:** 201; 400 si hay validación incorrecta; 409 si usuario/correo ya existe.

### CU-02 — Inicio y restauración de sesión
**Actor:** Visitante.  
**Flujo:** envía usuario/contraseña; backend devuelve JWT; React guarda token/usuario en LocalStorage. Al recargar, React solicita `/api/v1/auth/refresh`.  
**Resultado:** sesión restaurada si el JWT anterior sigue vigente; si expiró, se elimina y se solicita login nuevamente.

### CU-03 — Consulta de productos
**Actor:** Visitante o Vendedor.  
**Flujo:** consulta `GET /api/v1/videojuegos` y `GET /api/v1/videojuegos/{id}`.  
**Resultado:** lista y ficha del producto.

### CU-04 — Publicación de reseña
**Actor:** Cliente autenticado.  
**Flujo:** selecciona videojuego, calificación y comentario; backend obtiene autor desde el JWT y valida datos.  
**Resultado:** 201 y reseña persistida.

### CU-05 — Compra demostrativa
**Actor:** Cliente autenticado.  
**Flujo:** agrega productos al carrito, completa entrega y confirma. Backend consulta productos, calcula precios/subtotales y guarda una fila `BOLETA` y varias `DETALLE_BOLETA`.  
**Resultado:** 201 con boleta y detalle; no se realiza cobro.

### CU-06 — Administración
**Actor:** Administrador.  
**Flujo:** gestiona productos, consulta usuarios y modera reseñas. Las operaciones mutadoras requieren `ROLE_ADMIN`.  
**Resultado:** recursos actualizados o error HTTP correspondiente.

### CU-07 — Consulta del Vendedor
**Actor:** Vendedor autenticado.  
**Flujo:** abre Productos para consultar lista/detalle; abre Órdenes para consultar lista/detalle de boletas. El menú y rutas restringen el resto de secciones.  
**Resultado:** acceso limitado de solo lectura a productos y boletas.

## 8. Interfaces externas
- Frontend React/Vite: `VITE_USE_BACKEND`, `VITE_API_URL`.
- Backend Spring Boot: prefijo `/api/v1`.
- MySQL: JDBC y Spring Data JPA.
- FreeToGame: consulta por `GET /api/v1/juegos-gratis`.
- Swagger UI: `/swagger-ui/index.html`; OpenAPI JSON: `/v3/api-docs`.

## 9. Criterios de aceptación
1. MySQL muestra las cinco tablas solicitadas con sus nombres exactos.
2. El registro público crea `ROLE_USER` y no permite autoasignar roles privilegiados.
3. La sesión se mantiene tras F5 mientras el JWT sea válido.
4. La compra genera una cabecera en `BOLETA` y líneas en `DETALLE_BOLETA`.
5. El total se calcula en backend con precios vigentes.
6. El menú Vendedor solo muestra Productos y Órdenes.
7. Vendedor puede consultar listas y detalles de productos/boletas y no puede modificar el catálogo.
8. `ROLE_USER` no puede consultar lista global de boletas ni boletas ajenas.
9. Sin sesión, rutas protegidas responden 401; con rol insuficiente, 403.
10. Swagger y health checks responden correctamente.

## 10. Limitaciones conocidas
- La compra es simulada y no integra pagos en línea.
- El modo mock utiliza LocalStorage y no demuestra persistencia MySQL.
- La restauración renueva un JWT vigente; un token expirado requiere login. No existe refresh token independiente de larga duración.
- La evidencia visual debe capturarse desde la versión final en ejecución.
