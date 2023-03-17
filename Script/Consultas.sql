-- Consultas

--Consulta 1

SELECT h.NOMBRE_HOSPITAL, h.DIRECCION_HOSPITAL, COUNT(v.ID_VICTIMA) AS FALLECIDOS
FROM HOSPITALES h INNER JOIN VICTIMAS v ON h.ID_HOSPITAL  = v.HOSPITALES_ID_HOSPITAL 
WHERE v.ESTATUS_ENFERMEDAD = 'Muerte'  OR v.FECHA_MUERTE IS NOT NULL 
GROUP BY h.NOMBRE_HOSPITAL, h.DIRECCION_HOSPITAL 
ORDER BY h.NOMBRE_HOSPITAL ASC;

-- Consulta 2

SELECT  v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA
FROM VICTIMAS v 
INNER JOIN TRATAMIENTOSVICTIMA tv ON v.ID_VICTIMA = tv.VICTIMAS_ID_VICTIMA
INNER JOIN TRATAMIENTOS t ON t.ID_TRATAMIENTO  = tv.TRATAMIENTOS_ID_TRATAMIENTO
WHERE V.ESTATUS_ENFERMEDAD = 'En cuarentena' AND tv.EFECTIVIDAD_EN_VICTIMA > 5
AND t.NOMBRE_TRATAMIENTO  = 'Transfusiones de sangre'
ORDER BY v.NOMBRE_VICTIMA ASC;

--Consulta 3

SELECT nombre_victima, apellido_victima, direccion_victima
FROM victimas
WHERE estatus_enfermedad = 'Muerte' OR FECHA_MUERTE IS NOT NULL
AND id_victima IN (
SELECT victimas_id_victima
FROM victimaallegados
GROUP BY victimas_id_victima
HAVING COUNT(allegados_id_asociado) > 3)
ORDER BY NOMBRE_VICTIMA ASC;

--Consulta 4

SELECT v.nombre_victima, v.apellido_victima
FROM victimas v
INNER JOIN victimaallegados va ON v.id_victima = va.victimas_id_victima
WHERE v.estatus_enfermedad = 'Suspendida'
AND va.tipo_contacto = 'Beso'
GROUP BY v.id_victima, v.nombre_victima, v.apellido_victima
HAVING COUNT(va.allegados_id_asociado) > 2
ORDER BY v.NOMBRE_VICTIMA ASC;

--Consulta 5
SELECT v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA, COUNT(*) AS CANTIDAD_TRATAMIENTOS 
FROM VICTIMAS v
INNER JOIN TRATAMIENTOSVICTIMA tv ON v.ID_VICTIMA = tv.VICTIMAS_ID_VICTIMA 
INNER JOIN TRATAMIENTOS t ON t.ID_TRATAMIENTO  = tv.TRATAMIENTOS_ID_TRATAMIENTO 
WHERE t.NOMBRE_TRATAMIENTO = 'Oxigeno'
GROUP BY v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA 
ORDER BY CANTIDAD_TRATAMIENTOS DESC, v.NOMBRE_VICTIMA ASC
FETCH FIRST 5 ROWS ONLY

--Consulta 6

SELECT v.nombre_victima, v.apellido_victima, v.fecha_muerte
FROM victimas v
JOIN ubicaciones u ON v.id_victima = u.victimas_id_victima
JOIN tratamientosvictima tv ON v.id_victima = tv.victimas_id_victima
JOIN tratamientos t ON tv.tratamientos_id_tratamiento = t.id_tratamiento
WHERE u.ubicacion = '1987 Delphine Well' 
 AND t.nombre_tratamiento = 'Manejo de la presion arterial'
ORDER BY v.NOMBRE_VICTIMA ASC;

-- Consulta 7
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
ORDER BY v.NOMBRE_VICTIMA;

--Consulta 8


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

--Consulta 9
SELECT h.nombre_hospital, 
       COUNT(v.id_victima) * 100 / SUM(COUNT(v.id_victima)) OVER () 
       as porcentaje_victimas
FROM hospitales h
JOIN victimas v ON h.id_hospital = v.hospitales_id_hospital
GROUP BY h.nombre_hospital
ORDER BY porcentaje_victimas DESC;
--Consuta  10



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
WHERE ranking = 1;





