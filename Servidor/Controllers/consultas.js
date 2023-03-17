const consulta1 = `
SELECT h.NOMBRE_HOSPITAL, h.DIRECCION_HOSPITAL, COUNT(v.ID_VICTIMA) AS FALLECIDOS
FROM HOSPITALES h INNER JOIN VICTIMAS v ON h.ID_HOSPITAL  = v.HOSPITALES_ID_HOSPITAL 
WHERE v.ESTATUS_ENFERMEDAD = 'Muerte'  OR v.FECHA_MUERTE IS NOT NULL 
GROUP BY h.NOMBRE_HOSPITAL, h.DIRECCION_HOSPITAL 
ORDER BY h.NOMBRE_HOSPITAL ASC
`;


const consulta2 = `
SELECT  v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA
FROM VICTIMAS v 
INNER JOIN TRATAMIENTOSVICTIMA tv ON v.ID_VICTIMA = tv.VICTIMAS_ID_VICTIMA
INNER JOIN TRATAMIENTOS t ON t.ID_TRATAMIENTO  = tv.TRATAMIENTOS_ID_TRATAMIENTO
WHERE V.ESTATUS_ENFERMEDAD = 'En cuarentena' AND tv.EFECTIVIDAD_EN_VICTIMA > 5
AND t.NOMBRE_TRATAMIENTO  = 'Transfusiones de sangre'
ORDER BY v.NOMBRE_VICTIMA ASC
`;


const consulta3 = `
SELECT nombre_victima, apellido_victima, direccion_victima
FROM victimas
WHERE estatus_enfermedad = 'Muerte' OR FECHA_MUERTE IS NOT NULL
AND id_victima IN (
SELECT victimas_id_victima
FROM victimaallegados
GROUP BY victimas_id_victima
HAVING COUNT(allegados_id_asociado) > 3)
ORDER BY NOMBRE_VICTIMA ASC
`;


const consulta4 = `
SELECT v.nombre_victima, v.apellido_victima
FROM victimas v
INNER JOIN victimaallegados va ON v.id_victima = va.victimas_id_victima
WHERE v.estatus_enfermedad = 'Suspendida'
AND va.tipo_contacto = 'Beso'
GROUP BY v.id_victima, v.nombre_victima, v.apellido_victima
HAVING COUNT(va.allegados_id_asociado) > 2
ORDER BY v.NOMBRE_VICTIMA ASC
`;


const consulta5 = `
SELECT v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA, COUNT(*) AS CANTIDAD_TRATAMIENTOS 
FROM VICTIMAS v
INNER JOIN TRATAMIENTOSVICTIMA tv ON v.ID_VICTIMA = tv.VICTIMAS_ID_VICTIMA 
INNER JOIN TRATAMIENTOS t ON t.ID_TRATAMIENTO  = tv.TRATAMIENTOS_ID_TRATAMIENTO 
WHERE t.NOMBRE_TRATAMIENTO = 'Oxigeno'
GROUP BY v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA 
ORDER BY CANTIDAD_TRATAMIENTOS DESC, v.NOMBRE_VICTIMA ASC
FETCH FIRST 5 ROWS ONLY
`;


const consulta6 = `
SELECT v.nombre_victima, v.apellido_victima, v.fecha_muerte
FROM victimas v
JOIN ubicaciones u ON v.id_victima = u.victimas_id_victima
JOIN tratamientosvictima tv ON v.id_victima = tv.victimas_id_victima
JOIN tratamientos t ON tv.tratamientos_id_tratamiento = t.id_tratamiento
WHERE u.ubicacion = '1987 Delphine Well' 
 AND t.nombre_tratamiento = 'Manejo de la presion arterial'
ORDER BY v.NOMBRE_VICTIMA ASC
`;


const consulta7 = `
SELECT 
v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA, v.DIRECCION_VICTIMA 
FROM VICTIMAS v
INNER JOIN TRATAMIENTOSVICTIMA tv ON tv.VICTIMAS_ID_VICTIMA = v.ID_VICTIMA
INNER JOIN HOSPITALES h ON h.ID_HOSPITAL = v.HOSPITALES_ID_HOSPITAL
INNER JOIN (
    SELECT vl.VICTIMAS_ID_VICTIMA, COUNT(DISTINCT allegados_id_asociado) as num_allegados
    FROM VICTIMAALLEGADOS vl
    GROUP BY vl.VICTIMAS_ID_VICTIMA
    HAVING COUNT(DISTINCT allegados_id_asociado) < 2
) va ON v.id_victima = va.victimas_id_victima
GROUP BY v.id_victima, v.nombre_victima, v.apellido_victima, v.direccion_victima 
HAVING COUNT(tv.tratamientos_id_tratamiento) = 2
ORDER BY v.NOMBRE_VICTIMA
`;


const consulta8 = `

SELECT EXTRACT(MONTH FROM fecha_primera_sospecha) AS num_mes, nombre_victima, apellido_victima, num_tratamientos
FROM (
    SELECT v.id_victima, v.nombre_victima, v.apellido_victima, v.fecha_primera_sospecha, COUNT(tv.tratamientos_id_tratamiento) AS num_tratamientos
    FROM victimas v
    JOIN tratamientosvictima tv ON tv.victimas_id_victima = v.id_victima
    GROUP BY v.id_victima, v.nombre_victima, v.apellido_victima, v.fecha_primera_sospecha
    ORDER BY num_tratamientos DESC
) t1
WHERE ROWNUM <= 5
UNION ALL
SELECT EXTRACT(MONTH FROM fecha_primera_sospecha) AS num_mes, nombre_victima, apellido_victima, num_tratamientos
FROM (
    SELECT v.id_victima, v.nombre_victima, v.apellido_victima, v.fecha_primera_sospecha, COUNT(tv.tratamientos_id_tratamiento) AS num_tratamientos
    FROM victimas v
    JOIN tratamientosvictima tv ON tv.victimas_id_victima = v.id_victima
    GROUP BY v.id_victima, v.nombre_victima, v.apellido_victima, v.fecha_primera_sospecha
    ORDER BY num_tratamientos ASC
) t2
WHERE ROWNUM <= 5
`;


const consulta9 = `
SELECT h.nombre_hospital, 
       COUNT(v.id_victima) * 100 / SUM(COUNT(v.id_victima)) OVER () 
       as porcentaje_victimas
FROM hospitales h
JOIN victimas v ON h.id_hospital = v.hospitales_id_hospital
GROUP BY h.nombre_hospital
ORDER BY porcentaje_victimas DESC
`;


const consulta10= `
SELECT nombre_hospital, tipo_contacto, porcentaje_victimas FROM (
    SELECT 
      h.nombre_hospital, 
      vf.tipo_contacto, 
      COUNT(v.id_victima)*100.0/SUM(COUNT(v.id_victima)) OVER (PARTITION BY h.id_hospital) AS porcentaje_victimas,
      RANK() OVER (PARTITION BY h.id_hospital ORDER BY COUNT(v.id_victima) DESC) AS ranking
    FROM 
      hospitales h 
      JOIN victimas v ON h.id_hospital = v.hospitales_id_hospital 
      JOIN victimaallegados vf ON v.id_victima = vf.victimas_id_victima 
    GROUP BY 
      h.nombre_hospital, 
      vf.tipo_contacto,
      h.id_hospital
  )
  WHERE ranking = 1
`;


const eliminarTemporal = `
DELETE FROM TABLA_TEMPORAL
`;


const eliminarModelo = `
DROP TABLE VICTIMAALLEGADOS;

DROP TABLE ALLEGADOS;

DROP TABLE UBICACIONES;

DROP TABLE TRATAMIENTOSVICTIMA; 

DROP TABLE TRATAMIENTOS;

DROP TABLE VICTIMAS;

DROP TABLE HOSPITALES;
`;


const cargarTemporal = 
`CREATE TABLE tabla_temporal (
    NOMBRE_VICTIMA VARCHAR2(150),  
    APELLIDO_VICTIMA VARCHAR2(150), 
    DIRECCION_VICTIMA VARCHAR2(150),
    FECHA_PRIMERA_SOSPECHA DATE, 
    FECHA_CONFIRMACION DATE, 
    FECHA_MUERTE DATE, 
    ESTADO_VICTIMA VARCHAR2(150), 
    NOMBRE_ASOCIADO VARCHAR2(150), 
    APELLIDO_ASOCIADO VARCHAR2(150), 
    FECHA_CONOCIO DATE,
    CONTACTO_FISICO VARCHAR2(150), 
    FECHA_INICIO_CONTACTO DATE, 
    FECHA_FIN_CONTACTO DATE, 
    NOMBRE_HOSPITAL VARCHAR2(150), 
    DIRECCION_HOSPITAL VARCHAR2(150),
    UBICACION_VICTIMA VARCHAR2(150),
    FECHA_LLEGADA DATE,
    FECHA_RETIRO DATE,
    TRATAMIENTO VARCHAR2(150),
    EFECTIVIDAD INTEGER,
    FECHA_INICIO_TRATAMIENTO DATE,
    FECHA_FIN_TRATAMIENTO DATE,
    EFECTIVIDAD_EN_VICTIMA INTEGER
  )`;

const cargarModelo = 
`CREATE TABLE hospitales (
    id_hospital        INTEGER GENERATED ALWAYS AS IDENTITY,
    direccion_hospital VARCHAR2(50),
    nombre_hospital    VARCHAR2(50)
);
ALTER TABLE hospitales ADD CONSTRAINT hospitales_pk PRIMARY KEY ( id_hospital );
CREATE TABLE victimas (
    id_victima             INTEGER GENERATED ALWAYS AS IDENTITY,
    nombre_victima         VARCHAR2(50),
    apellido_victima       VARCHAR2(50),
    direccion_victima      VARCHAR2(50),
    fecha_muerte           DATE,
    fecha_primera_sospecha DATE,
    fecha_confirmacion DATE,
    estatus_enfermedad     VARCHAR2(50),
    hospitales_id_hospital INTEGER NOT NULL
);
ALTER TABLE victimas ADD CONSTRAINT victimas_pk PRIMARY KEY ( id_victima );
ALTER TABLE victimas
    ADD CONSTRAINT victimas_hospitales_fk FOREIGN KEY ( hospitales_id_hospital )
        REFERENCES hospitales ( id_hospital );  
CREATE TABLE tratamientos (
    id_tratamiento     INTEGER GENERATED ALWAYS AS IDENTITY,
    nombre_tratamiento VARCHAR2(50),
    efectividad        INTEGER
);
ALTER TABLE tratamientos ADD CONSTRAINT tratamientos_pk PRIMARY KEY ( id_tratamiento );   
CREATE TABLE tratamientosvictima (
    id_tratamientos_victima     INTEGER GENERATED ALWAYS AS IDENTITY,
    victimas_id_victima         INTEGER NOT NULL,
    tratamientos_id_tratamiento INTEGER NOT NULL,
    efectividad_en_victima INTEGER,
    fecha_inicio_tratamiento DATE,
    fecha_fin_tratamiento DATE
);
ALTER TABLE tratamientosvictima ADD CONSTRAINT tratamientosvictima_pk PRIMARY KEY ( id_tratamientos_victima );
ALTER TABLE tratamientosvictima
    ADD CONSTRAINT tratvictima_tratamientos_fk FOREIGN KEY ( tratamientos_id_tratamiento )
        REFERENCES tratamientos ( id_tratamiento );
ALTER TABLE tratamientosvictima
    ADD CONSTRAINT tratvictima_victimas_fk FOREIGN KEY ( victimas_id_victima )
        REFERENCES victimas ( id_victima );
CREATE TABLE ubicaciones (
    id_ubicacion        INTEGER GENERATED ALWAYS AS IDENTITY,
    ubicacion           VARCHAR2(50),
    fecha_llegada       DATE,
    fecha_salida        DATE,
    victimas_id_victima INTEGER NOT NULL
);
ALTER TABLE ubicaciones ADD CONSTRAINT ubicaciones_pk PRIMARY KEY ( id_ubicacion );
ALTER TABLE ubicaciones
    ADD CONSTRAINT ubicaciones_victimas_fk FOREIGN KEY ( victimas_id_victima )
        REFERENCES victimas ( id_victima );
CREATE TABLE allegados (
    id_asociado        INTEGER GENERATED ALWAYS AS IDENTITY,
    nombre             VARCHAR2(50),
    apellidos          VARCHAR2(50)
);
ALTER TABLE allegados ADD CONSTRAINT allegados_pk PRIMARY KEY ( id_asociado );
CREATE TABLE victimaallegados (
    tipo_contacto         VARCHAR2(30),
    fecha_conocimiento DATE,
    fecha_inicio_contacto DATE,
    fecha_fin_contacto    DATE,
    allegados_id_asociado INTEGER NOT NULL,
    victimas_id_victima   INTEGER NOT NULL
);
ALTER TABLE victimaallegados
    ADD CONSTRAINT victimaallegados_allegados_fk FOREIGN KEY ( allegados_id_asociado )
        REFERENCES allegados ( id_asociado);
       
       ALTER TABLE victimaallegados
    ADD CONSTRAINT victimaallegados_victimas_fk FOREIGN KEY ( victimas_id_victima )
     REFERENCES victimas ( id_victima );
---Insertar datos hospitales
INSERT INTO hospitales (DIRECCION_HOSPITAL, NOMBRE_HOSPITAL)
SELECT DISTINCT 
    DIRECCION_HOSPITAL,
    NOMBRE_HOSPITAL
FROM tabla_temporal
WHERE DIRECCION_HOSPITAL IS NOT NULL AND NOMBRE_HOSPITAL IS NOT NULL;
-- Insertar datos victimas
INSERT INTO victimas(NOMBRE_VICTIMA, APELLIDO_VICTIMA, DIRECCION_VICTIMA, FECHA_MUERTE,
FECHA_PRIMERA_SOSPECHA , FECHA_CONFIRMACION, ESTATUS_ENFERMEDAD, HOSPITALES_ID_HOSPITAL)
SELECT DISTINCT
	tt.NOMBRE_VICTIMA,
	tt.APELLIDO_VICTIMA,
	tt.DIRECCION_VICTIMA,
	tt.FECHA_MUERTE,
	tt.FECHA_PRIMERA_SOSPECHA,
	tt.FECHA_CONFIRMACION,
	tt.ESTADO_VICTIMA,
	h.ID_HOSPITAL
FROM TABLA_TEMPORAL tt 
INNER JOIN HOSPITALES h ON tt.NOMBRE_HOSPITAL = h.NOMBRE_HOSPITAL  
WHERE tt.NOMBRE_VICTIMA IS NOT NULL AND tt.APELLIDO_VICTIMA IS NOT NULL;
--Insertar datos tratamiento
INSERT INTO TRATAMIENTOS (NOMBRE_TRATAMIENTO, EFECTIVIDAD)
SELECT DISTINCT 
TRATAMIENTO, 
EFECTIVIDAD 
FROM TABLA_TEMPORAL
WHERE TRATAMIENTO IS NOT NULL AND EFECTIVIDAD IS NOT NULL;
--Insertar datos TratamientosVictima
INSERT INTO TRATAMIENTOSVICTIMA(VICTIMAS_ID_VICTIMA, TRATAMIENTOS_ID_TRATAMIENTO, 
EFECTIVIDAD_EN_VICTIMA, FECHA_INICIO_TRATAMIENTO, FECHA_FIN_TRATAMIENTO)
SELECT DISTINCT 
v.ID_VICTIMA, 
t.ID_TRATAMIENTO,
tt.EFECTIVIDAD_EN_VICTIMA, 
tt.FECHA_INICIO_TRATAMIENTO,
tt.FECHA_FIN_TRATAMIENTO
FROM TABLA_TEMPORAL tt 
INNER JOIN VICTIMAS v ON v.NOMBRE_VICTIMA  = tt.NOMBRE_VICTIMA AND v.APELLIDO_VICTIMA = tt.APELLIDO_VICTIMA 
INNER JOIN TRATAMIENTOS t ON t.NOMBRE_TRATAMIENTO  = tt.TRATAMIENTO;
-- Insertar Ubicaciones 
INSERT INTO UBICACIONES(UBICACION, FECHA_LLEGADA, FECHA_SALIDA, VICTIMAS_ID_VICTIMA)
SELECT DISTINCT 
tt.UBICACION_VICTIMA, 
tt.FECHA_LLEGADA,
tt.FECHA_RETIRO,
v.ID_VICTIMA 
FROM TABLA_TEMPORAL tt 
INNER JOIN VICTIMAS v ON v.NOMBRE_VICTIMA = tt.NOMBRE_VICTIMA AND v.APELLIDO_VICTIMA = tt.APELLIDO_VICTIMA 
WHERE tt.UBICACION_VICTIMA IS NOT NULL;
--Insertar Allegados
INSERT INTO ALLEGADOS(NOMBRE, APELLIDOS)
SELECT DISTINCT 
tt.NOMBRE_ASOCIADO,
tt.APELLIDO_ASOCIADO
FROM TABLA_TEMPORAL tt 
WHERE tt.NOMBRE_ASOCIADO IS NOT NULL AND tt.APELLIDO_ASOCIADO IS NOT NULL;
INSERT INTO VICTIMAALLEGADOS(TIPO_CONTACTO, FECHA_CONOCIMIENTO,FECHA_INICIO_CONTACTO,
FECHA_FIN_CONTACTO, ALLEGADOS_ID_ASOCIADO, VICTIMAS_ID_VICTIMA)
SELECT DISTINCT 
tt.CONTACTO_FISICO,
tt.FECHA_CONOCIO,
tt.FECHA_INICIO_CONTACTO,
tt.FECHA_FIN_CONTACTO,
a.ID_ASOCIADO,
v.ID_VICTIMA
FROM TABLA_TEMPORAL tt 
INNER JOIN ALLEGADOS a ON a.NOMBRE = tt.NOMBRE_ASOCIADO AND a.APELLIDOS = tt.APELLIDO_ASOCIADO
INNER JOIN VICTIMAS v ON v.NOMBRE_VICTIMA = tt.NOMBRE_VICTIMA AND V.APELLIDO_VICTIMA = tt.APELLIDO_VICTIMA 
WHERE TT.CONTACTO_FISICO IS NOT NULL`;

module.exports = {
    consulta1,
    consulta2,
    consulta3,
    consulta4,
    consulta5,
    consulta6,
    consulta7,
    consulta8,
    consulta9,
    consulta10,
    eliminarTemporal,
    eliminarModelo,
    cargarTemporal,
    cargarModelo
}