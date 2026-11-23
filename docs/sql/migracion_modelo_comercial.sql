-- RESENASMIX2 - migración desde el esquema legado.
-- Ejecutar UNA SOLA VEZ y con respaldo previo de la base `resenasmix`.
-- Requiere MySQL 8.0.4+ por el uso de JSON_TABLE.
-- IMPORTANTE: detener Spring Boot antes de ejecutar este script.

-- 1) Renombrar las tablas existentes conservando sus registros y relaciones.
RENAME TABLE usuarios TO USUARIO,
             videojuegos TO PRODUCTO,
             compras TO BOLETA;

-- 2) Crear el catálogo normalizado de categorías y relacionarlo con PRODUCTO.
CREATE TABLE CATEGORIA (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_categoria_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CATEGORIA (nombre)
SELECT DISTINCT TRIM(genero)
FROM PRODUCTO
WHERE genero IS NOT NULL AND TRIM(genero) <> '';

ALTER TABLE PRODUCTO ADD COLUMN categoria_id BIGINT NULL;
UPDATE PRODUCTO p
JOIN CATEGORIA c ON c.nombre = TRIM(p.genero)
SET p.categoria_id = c.id;

-- Si esta comprobación devuelve filas, asígnales una categoría antes del ALTER final.
SELECT id, titulo, genero FROM PRODUCTO WHERE categoria_id IS NULL;

ALTER TABLE PRODUCTO
    MODIFY categoria_id BIGINT NOT NULL,
    ADD CONSTRAINT fk_producto_categoria
        FOREIGN KEY (categoria_id) REFERENCES CATEGORIA(id);

-- 3) Crear las líneas de cada boleta.
CREATE TABLE DETALLE_BOLETA (
    id BIGINT NOT NULL AUTO_INCREMENT,
    boleta_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_detalle_boleta_boleta FOREIGN KEY (boleta_id) REFERENCES BOLETA(id),
    CONSTRAINT fk_detalle_boleta_producto FOREIGN KEY (producto_id) REFERENCES PRODUCTO(id),
    CONSTRAINT ck_detalle_boleta_cantidad CHECK (cantidad > 0)
) ENGINE=InnoDB;

-- 4) Migrar el JSON histórico a filas relacionales, si hay boletas antiguas.
INSERT INTO DETALLE_BOLETA (boleta_id, producto_id, cantidad, precio_unitario)
SELECT b.id, j.producto_id, j.cantidad, j.precio_unitario
FROM BOLETA b
JOIN JSON_TABLE(
    b.detalle_json,
    '$[*]' COLUMNS (
        producto_id BIGINT PATH '$.videojuegoId',
        cantidad INT PATH '$.cantidad',
        precio_unitario DECIMAL(12,2) PATH '$.precioUnitario'
    )
) AS j;

-- No se elimina detalle_json en esta migración: queda como respaldo histórico.
-- Se permite NULL para que las nuevas inserciones usen DETALLE_BOLETA y no JSON.
ALTER TABLE BOLETA MODIFY detalle_json LONGTEXT NULL;

-- 5) Verificación posterior: las cinco tablas solicitadas deben existir.
SHOW TABLES LIKE 'USUARIO';
SHOW TABLES LIKE 'BOLETA';
SHOW TABLES LIKE 'DETALLE_BOLETA';
SHOW TABLES LIKE 'PRODUCTO';
SHOW TABLES LIKE 'CATEGORIA';

SELECT COUNT(*) AS total_boletas FROM BOLETA;
SELECT COUNT(*) AS total_detalles FROM DETALLE_BOLETA;
SELECT COUNT(*) AS productos_sin_categoria FROM PRODUCTO WHERE categoria_id IS NULL;
