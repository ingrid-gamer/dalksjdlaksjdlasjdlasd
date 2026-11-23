# Manual de Usuario — RESENASMIX2

**Versión:** 1.0  
**Fecha:** 20 de noviembre de 2026  
**Sistema:** Plataforma de catálogo, reseñas y compras demostrativas de videojuegos.

> **Formato obligatorio para las capturas:** cada imagen debe tener encima su número y título (por ejemplo, **Figura 1. Pantalla inicial**), debe mostrar un borde negro sólido de 1 px y debajo debe aparecer una nota que describa los elementos que se visualizan. Los espacios indicados en este manual deben reemplazarse por pantallazos reales de la versión final. No se han inventado capturas ni resultados de ejecución.

## 1. Introducción

Este manual explica cómo iniciar y utilizar RESENASMIX2. El sistema permite explorar videojuegos, revisar detalles, consultar y publicar reseñas, mantener un carrito y registrar compras simuladas. Incluye vistas distintas para Cliente, Vendedor y Administrador.

El contenido se organiza en requisitos del sistema, instalación, acceso y uso de las funciones disponibles según el rol.

## 2. Requisitos del sistema

### 2.1 Requisitos de hardware
- Computador con procesador de doble núcleo o superior.
- 8 GB de RAM recomendados para ejecutar navegador, backend y base de datos local simultáneamente.
- Espacio disponible para JDK, Node.js, dependencias del proyecto y MySQL.
- Conexión a Internet para descargar dependencias y consultar recursos externos.

### 2.2 Requisitos de software
- Windows 10/11 o sistema compatible con Java, Node.js y MySQL.
- Navegador actualizado (Chrome, Edge o Firefox).
- JDK 21.
- Node.js 24.15.0 o superior de la rama 24.x y npm.
- MySQL 8.x.
- Visual Studio Code (recomendado) o IDE Java.
- Git (opcional, para obtener/actualizar el proyecto).

## 3. Instalación y configuración

### 3.1 Obtener y abrir el proyecto
1. Descomprima `RESENASMIX2-main.zip`.
2. Abra la carpeta `RESENASMIX2-main` en Visual Studio Code.
3. Confirme que existe la carpeta `backend/` y la carpeta `frontend/`.
4. No ejecute los comandos Maven desde la raíz: el wrapper `mvnw.cmd` está dentro de `backend/`.

**Figura 1. Estructura del proyecto**  
[Insertar captura de VS Code mostrando las carpetas backend, frontend y docs. Aplicar borde negro de 1 px.]  
**Nota.** La estructura contiene el backend Spring Boot, el frontend React/Vite y los documentos del proyecto.

### 3.2 Configurar la base de datos
1. Inicie MySQL.
2. Cree la base `resenasmix`, o use el servicio MySQL del archivo `docker-compose.yml`.
3. Para una instalación nueva, el backend crea/actualiza las tablas a partir de las entidades.
4. Para una base antigua que contiene `usuarios`, `compras` y `videojuegos`, haga un respaldo y ejecute una sola vez `docs/sql/migracion_modelo_comercial.sql` antes de iniciar Spring Boot. Detenga el backend mientras ejecuta la migración.
5. Confirme que existan las tablas `USUARIO`, `BOLETA`, `DETALLE_BOLETA`, `PRODUCTO` y `CATEGORIA`.

**Figura 2. Base de datos y tablas**  
[Insertar captura de MySQL Workbench mostrando las cinco tablas solicitadas. Aplicar borde negro de 1 px.]  
**Nota.** La imagen debe permitir reconocer los nombres exactos de las tablas creadas en MySQL.

### 3.3 Ejecutar el backend
1. Abra una terminal PowerShell en Visual Studio Code.
2. Ingrese a `backend`.
3. Configure las variables de conexión con los valores correspondientes a su MySQL.
4. Ejecute Spring Boot.

```powershell
cd backend
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/resenasmix?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="TU_CLAVE_MYSQL"
$env:JWT_SECRET="reemplaza-por-una-clave-local-segura-de-al-menos-32-bytes"
.\mvnw.cmd spring-boot:run
```

La consola debe indicar que Spring Boot inició en el puerto 8083. No copies la contraseña real ni el valor secreto en capturas.

**Figura 3. Backend en ejecución**  
[Insertar captura de la terminal con Spring Boot iniciado. Aplicar borde negro de 1 px.]  
**Nota.** Debe apreciarse el inicio de la aplicación y el puerto configurado, sin mostrar secretos.

### 3.4 Ejecutar el frontend
1. Abra una segunda terminal.
2. Ingrese a `frontend`.
3. Copie el archivo de entorno de ejemplo.
4. Instale las dependencias y ejecute Vite.

```powershell
cd frontend
Copy-Item .env.example .env
npm ci
npm run dev
```

Verifique que `frontend/.env` contenga:

```env
VITE_USE_BACKEND=true
VITE_API_URL=http://localhost:8083
```

5. Abra `http://localhost:5173` en el navegador.

**Figura 4. Frontend en ejecución**  
[Insertar captura de la terminal Vite y el navegador abierto en localhost:5173. Aplicar borde negro de 1 px.]  
**Nota.** La aplicación React se comunica con Spring Boot usando la URL configurada en `VITE_API_URL`.

### 3.5 Verificar la conexión
Abra en el navegador:
- `http://localhost:8083/api/v1/health/ping`: confirma que responde la API.
- `http://localhost:8083/api/v1/health/db`: comprueba conexión efectiva con MySQL.
- `http://localhost:8083/swagger-ui/index.html`: documentación interactiva.

**Figura 5. Swagger y estado de la API**  
[Insertar captura de Swagger y/o respuesta de health/db con estado conectado. Aplicar borde negro de 1 px.]  
**Nota.** Esta evidencia demuestra que la API responde y que el endpoint de base de datos confirma la conexión MySQL.

## 4. Comenzando

### 4.1 Pantalla inicial
Al abrir el sistema se muestra la página principal con accesos de navegación. Las opciones visibles dependen del rol después de iniciar sesión.

**Figura 6. Pantalla inicial de RESENASMIX2**  
[Insertar captura real de la página principal. Aplicar borde negro de 1 px.]  
**Nota.** Se deben identificar el nombre del sistema y las principales opciones disponibles para un visitante.

### 4.2 Crear una cuenta
1. Seleccione **Registro**.
2. Ingrese nombre, nombre de usuario, correo y contraseña.
3. La contraseña debe tener al menos 6 caracteres.
4. Presione el botón de registro.
5. Si el usuario o correo ya existen, utilice datos diferentes.
6. El registro público asigna el rol `ROLE_USER`. No se pueden crear administradores ni vendedores desde este formulario.

**Figura 7. Formulario de registro**  
[Insertar captura del formulario completado con datos ficticios. Aplicar borde negro de 1 px.]  
**Nota.** Mostrar los campos requeridos sin revelar contraseñas reales.

### 4.3 Iniciar sesión
1. Seleccione **Login**.
2. Escriba el nombre de usuario y contraseña.
3. Presione **Entrar**.
4. Si las credenciales son correctas, se abre el sitio con las opciones correspondientes al rol.
5. Token JWT y usuario se almacenan en LocalStorage. Al recargar, la sesión se restaura mientras el token anterior siga vigente; si ya expiró, se debe iniciar sesión otra vez.

**Figura 8. Inicio de sesión**  
[Insertar captura del formulario de login y resultado de acceso. Aplicar borde negro de 1 px.]  
**Nota.** No mostrar la contraseña ni copiar el JWT visible desde herramientas de desarrollador.

## 5. Uso del sistema como Visitante o Cliente

### 5.1 Explorar el catálogo
1. Abra **Videojuegos**.
2. Busque por título o filtre por género.
3. Seleccione un juego para abrir su detalle.
4. Revise consola, precio, oferta, descripción y requisitos disponibles.

**Figura 9. Catálogo de videojuegos**  
[Insertar captura del catálogo con varios productos. Aplicar borde negro de 1 px.]  
**Nota.** La vista presenta el listado y los filtros disponibles.

**Figura 10. Detalle del videojuego**  
[Insertar captura de la ficha de un videojuego. Aplicar borde negro de 1 px.]  
**Nota.** Se muestran sus datos, precio, oferta y descripción.

### 5.2 Consultar y publicar reseñas
1. Abra **Reseñas** para leer comentarios de la comunidad.
2. Para publicar, inicie sesión como Cliente.
3. Seleccione el videojuego.
4. Elija una calificación de 1 a 5.
5. Escriba un comentario y presione **Publicar**.
6. Revise el mensaje de confirmación y la reseña agregada.

**Figura 11. Formulario de publicación de reseña**  
[Insertar captura del formulario de reseñas y un mensaje de éxito. Aplicar borde negro de 1 px.]  
**Nota.** La creación requiere sesión; el backend identifica al autor usando el JWT.

### 5.3 Carrito y checkout
1. En el catálogo o ficha de un juego, presione **Agregar al carrito**.
2. Abra **Carrito** para revisar cantidades y total.
3. Ajuste o elimine los productos según corresponda.
4. Presione **Continuar al checkout**.
5. Complete nombre, correo, dirección y tipo de entrega.
6. Presione **Confirmar compra simulada**.

El servidor vuelve a consultar los productos y calcula el total con los precios vigentes de MySQL. La compra se registra con estado `SIMULADA`; no se cobra dinero.

**Figura 12. Carrito de compras**  
[Insertar captura del carrito con productos y total. Aplicar borde negro de 1 px.]  
**Nota.** Se muestra el contenido previo a la confirmación.

**Figura 13. Checkout**  
[Insertar captura del formulario de datos de entrega. Aplicar borde negro de 1 px.]  
**Nota.** Los datos de entrega son enviados al backend junto con los identificadores y cantidades.

**Figura 14. Compra simulada registrada**  
[Insertar captura de la pantalla de compra exitosa y/o boleta creada. Aplicar borde negro de 1 px.]  
**Nota.** La operación genera una boleta de demostración; no representa un pago real.

## 6. Uso del sistema como Vendedor

El rol `ROLE_VENDEDOR` solo dispone de dos secciones en la barra de navegación: **Productos** y **Órdenes**. No se muestran Inicio, Categorías, Ofertas, Reseñas, Carrito, Checkout, Administración ni Registro. Si intenta abrir manualmente una de esas rutas, se redirige a Productos.

### 6.1 Consultar productos
1. Inicie sesión con una cuenta cuyo rol sea `ROLE_VENDEDOR`.
2. Abra **Productos**.
3. Revise identificador, nombre del producto, categoría, consola, precio y estado.
4. Presione **Ver detalle** para abrir la ficha.
5. El Vendedor puede consultar, pero no crear, editar o eliminar productos.

**Figura 15. Lista de productos para Vendedor**  
[Insertar captura del listado de productos con menú limitado. Aplicar borde negro de 1 px.]  
**Nota.** Solo se presentan las opciones Productos y Órdenes en la navegación.

**Figura 16. Detalle de producto para Vendedor**  
[Insertar captura de una ficha de producto. Aplicar borde negro de 1 px.]  
**Nota.** La ficha es de solo lectura y no muestra reseñas ni acciones de administración.

### 6.2 Consultar órdenes
1. Seleccione **Órdenes**.
2. Revise el número de boleta, fecha, cliente, número de unidades, total y estado.
3. Presione **Ver detalle**.
4. Revise dirección, método de entrega y líneas de producto con cantidad, precio unitario y subtotal.

**Figura 17. Lista de órdenes**  
[Insertar captura del listado de boletas. Aplicar borde negro de 1 px.]  
**Nota.** La lista de boletas se consulta desde el endpoint protegido para Vendedor/Administrador.

**Figura 18. Detalle de boleta**  
[Insertar captura del detalle de una boleta. Aplicar borde negro de 1 px.]  
**Nota.** Se muestra la cabecera de compra y cada línea de producto.

## 7. Uso del sistema como Administrador

El rol `ROLE_ADMIN` dispone del menú de administración. Puede gestionar videojuegos y consultar/moderar reseñas; además puede consultar boletas.

### 7.1 Panel de administración
1. Inicie sesión con una cuenta `ROLE_ADMIN`.
2. Abra **Administración**.
3. Revise los indicadores y accesos disponibles.

**Figura 19. Panel de administración**  
[Insertar captura del panel de administración. Aplicar borde negro de 1 px.]  
**Nota.** Deben apreciarse los accesos administrativos y los indicadores disponibles.

### 7.2 Gestión de videojuegos
1. Abra la opción de administración de videojuegos.
2. Para crear, complete título, género, consola, precio y demás datos solicitados.
3. Para modificar, seleccione el producto y guarde sus cambios.
4. Para eliminar, utilice la acción correspondiente y confirme.

**Figura 20. CRUD de productos**  
[Insertar captura del listado/formulario de administración. Aplicar borde negro de 1 px.]  
**Nota.** Las operaciones de escritura del catálogo están reservadas al rol Administrador.

### 7.3 Moderación de reseñas
1. Abra la sección de administración de reseñas.
2. Revise producto, usuario, calificación y comentario.
3. Utilice **Eliminar** cuando corresponda.

**Figura 21. Administración de reseñas**  
[Insertar captura de la vista de reseñas para Administrador. Aplicar borde negro de 1 px.]  
**Nota.** La eliminación requiere autorización administrativa en el backend.

## 8. Cerrar sesión
Presione **Salir** en la barra superior. El sistema elimina el JWT y los datos de usuario guardados en LocalStorage. Para acceder nuevamente a rutas protegidas, se debe iniciar sesión.

**Figura 22. Sesión cerrada**  
[Insertar captura del sistema después de cerrar sesión. Aplicar borde negro de 1 px.]  
**Nota.** La interfaz vuelve a mostrar las opciones de visitante y no conserva la sesión autenticada.

## 9. Problemas frecuentes

| Problema | Posible causa y solución |
|---|---|
| No inicia sesión | Verifique usuario/contraseña. Si el JWT expiró, inicie sesión otra vez. |
| No aparecen productos | Compruebe que Spring Boot inició, que MySQL responde en `/api/v1/health/db` y que la URL de Vite apunta al backend. |
| Error de conexión API | Revise `VITE_API_URL`, el puerto 8083 y que backend esté iniciado. |
| Error CORS | Incluya el origen frontend exacto en `APP_CORS_ALLOWED_ORIGINS` y reinicie backend. |
| No se puede publicar reseña | Inicie sesión como Cliente; compruebe que eligió un videojuego y una calificación entre 1 y 5. |
| No se registra la compra | Compruebe JWT, conexión MySQL y que los productos del carrito existan. |
| Vendedor no ve Órdenes | Confirme que su cuenta tiene rol `ROLE_VENDEDOR`, cierre sesión y vuelva a ingresar para recibir un JWT actualizado. |
| Vendedor puede ver un menú adicional | Cierre sesión y vuelva a iniciar; verifique que el usuario no tenga rol ADMIN además de VENDEDOR. |

## 10. Lista de evidencia visual
- [ ] Estructura del proyecto.
- [ ] Tablas de base de datos.
- [ ] Backend iniciado.
- [ ] Frontend iniciado.
- [ ] Swagger y health check.
- [ ] Inicio.
- [ ] Registro y login.
- [ ] Catálogo y detalle.
- [ ] Reseñas.
- [ ] Carrito, checkout y compra exitosa.
- [ ] Vista Vendedor: lista/detalle de productos.
- [ ] Vista Vendedor: lista/detalle de boletas.
- [ ] Panel Administrador y CRUD.
- [ ] Cierre de sesión.

Todas las capturas deben pertenecer a la versión final. Aplica borde negro de 1 px, número/título encima y nota explicativa debajo. No muestres contraseñas, tokens, secretos o información personal real.
